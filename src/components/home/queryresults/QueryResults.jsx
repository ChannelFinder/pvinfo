import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { Typography, Link, IconButton, Tooltip, useMediaQuery } from '@mui/material';
import { DataGrid, GRID_CHECKBOX_SELECTION_COL_DEF, GRID_CHECKBOX_SELECTION_FIELD, useGridApiRef, gridPaginatedVisibleSortedGridRowIdsSelector } from '@mui/x-data-grid';
import { useNavigate, Link as RouterLink } from "react-router";
import TimelineIcon from '@mui/icons-material/Timeline';
import ReadMoreIcon from '@mui/icons-material/ReadMore';
import api from "../../../api";
import ValueCheckbox, { monitorDisabledReason } from './valuecheckbox/ValueCheckbox';
import useWebSocket from '../../../useWebSocket';
import Value from "./value";
import Logo from "./logo";
import ResultsToolbar from "./resultstoolbar";
import config from "../../../config";
import csvExportOptions from "../../../csvExportOptions";

function QueryResults(props) {
    const navigate = useNavigate();
    const apiRef = useGridApiRef();
    const pageSizeEnvValue = config.RESULTS_TABLE_SIZE;
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: pageSizeEnvValue });
    const [pvs, setPVs] = useState([]);
    const defaultTableDensity = config.RESULTS_TABLE_DENSITY;
    let tablePageSizeOptions = config.RESULTS_TABLE_SIZE_OPTIONS;
    if (!tablePageSizeOptions.includes(pageSizeEnvValue)) {
        tablePageSizeOptions.push(pageSizeEnvValue);
        tablePageSizeOptions.sort(function (a, b) { return a - b; });
    }
    const [columnVisibilityModel, setColumnVisibilityModel] = useState();
    // widths of columns the user has resized, keyed by field. columns is rebuilt every render,
    // so without this the grid would reset resized columns back to their flex width
    const [columnWidths, setColumnWidths] = useState({});
    const [currentBreakpoint, setCurrentBreakpoint] = useState();
    const [prevBreakpoint, setPrevBreakpoint] = useState();
    // row ids of the monitored PVs
    const [currentChecked, setCurrentChecked] = useState(new Set());
    const [monitorAllChecked, setMonitorAllChecked] = useState(false);
    // set by the page, sort, and filter handlers, see handleVisiblePageChange
    const visiblePageKeepsMonitorAll = useRef(null);
    const [visiblePageChanges, setVisiblePageChanges] = useState(0);
    // PV names subscribed in PV Web Socket, so only the changes are sent when the monitored PVs change
    const subscribedPVs = useRef(new Set());
    const [rowSelectionModel, setRowSelectionModel] = useState({ type: "include", ids: new Set() });
    // same phone cutoff as the toolbar copy and plot buttons, see ResultsToolbar
    const isPhone = useMediaQuery(`(max-width:${config.SM_BREAKPOINT}px)`);
    const liveMonitorMax = config.LIVE_MONITOR_MAX;
    const liveMonitorWarn = config.LIVE_MONITOR_WARN;

    let { handleErrorMessage, handleOpenErrorAlert, handleSeverity } = props;

    // no web socket connection when PV Web Socket is turned off
    const { sendJsonMessage } = useWebSocket(config.USE_PVWS ? config.PVWS_URL : null, {
        share: true,
        filter: () => false,
    });

    // add ids to the monitored PVs, stopping once over the maximum so the error below is shown
    const addWithLimit = useCallback((monitored, ids) => {
        const newMonitored = new Set(monitored);
        for (const id of ids) {
            if (newMonitored.size > liveMonitorMax) {
                break;
            }
            newMonitored.add(id);
        }
        return newMonitored;
    }, [liveMonitorMax]);

    const updateCurrentChecked = useCallback((id, checkedStatus) => {
        setCurrentChecked((prevState) => {
            if (prevState.has(id) === checkedStatus) {
                return prevState;
            }
            if (checkedStatus) {
                return addWithLimit(prevState, [id]);
            }
            const newCurrentChecked = new Set(prevState);
            newCurrentChecked.delete(id);
            return newCurrentChecked;
        });
    }, [addWithLimit]);

    // ids of the PVs that can be monitored on the page the user is looking at. The grid's row ids are used
    // so it is the sorted and filtered page and not just the first rows of the search results
    const visibleMonitorableIds = useCallback(() => {
        if (!apiRef.current) {
            return [];
        }
        return gridPaginatedVisibleSortedGridRowIdsSelector(apiRef).filter((id) => {
            const row = apiRef.current.getRow(id);
            return row && monitorDisabledReason(row.pvStatus, row.recordType) === "";
        });
    }, [apiRef]);

    const handleMonitorSelectAll = (event) => {
        setMonitorAllChecked(event.target.checked);
        setCurrentChecked(event.target.checked ? addWithLimit(currentChecked, visibleMonitorableIds()) : new Set());
    }

    // the visible page changed (new search, page change, sort, filter). The grid hasn't rendered the new page yet,
    // so the monitored PVs are updated in the effect below. A sort or filter can also reset the page,
    // so requests before the effect runs are combined and keeping monitor all wins
    const handleVisiblePageChange = useCallback((keepMonitorAll) => {
        visiblePageKeepsMonitorAll.current = Boolean(visiblePageKeepsMonitorAll.current) || keepMonitorAll;
        setVisiblePageChanges((count) => count + 1);
    }, []);

    // monitor all monitors the new visible page, otherwise only the monitored PVs still on the page stay monitored
    useEffect(() => {
        if (visiblePageKeepsMonitorAll.current === null) {
            return;
        }
        const keepMonitorAll = config.USE_PVWS && visiblePageKeepsMonitorAll.current;
        visiblePageKeepsMonitorAll.current = null;
        setMonitorAllChecked(keepMonitorAll);
        if (keepMonitorAll) {
            setCurrentChecked(addWithLimit(new Set(), visibleMonitorableIds()));
        } else {
            const visibleIds = new Set(apiRef.current ? gridPaginatedVisibleSortedGridRowIdsSelector(apiRef) : []);
            setCurrentChecked((prevState) => new Set([...prevState].filter((id) => visibleIds.has(id))));
        }
    }, [visiblePageChanges, apiRef, addWithLimit, visibleMonitorableIds]);

    // subscribe and clear PVs in PV Web Socket when the monitored PVs change
    useEffect(() => {
        if (!config.USE_PVWS) {
            return;
        }
        const monitoredPVs = new Set([...currentChecked].map((id) => pvs[id]?.name).filter(Boolean));
        const clearPVs = [...subscribedPVs.current].filter((name) => !monitoredPVs.has(name));
        const subscribePVs = [...monitoredPVs].filter((name) => !subscribedPVs.current.has(name));
        if (clearPVs.length > 0) {
            sendJsonMessage({ "type": "clear", "pvs": clearPVs });
        }
        if (subscribePVs.length > 0) {
            sendJsonMessage({ "type": "subscribe", "pvs": subscribePVs });
        }
        subscribedPVs.current = monitoredPVs;
    }, [currentChecked, pvs, sendJsonMessage]);

    // clear the subscriptions when leaving the search results
    useEffect(() => {
        return () => {
            if (subscribedPVs.current.size > 0) {
                sendJsonMessage({ "type": "clear", "pvs": [...subscribedPVs.current] });
                subscribedPVs.current = new Set();
            }
        };
    }, [sendJsonMessage]);

    // Notify user if monitoring over warn or max PVs
    useEffect(() => {
        if (currentChecked.size > liveMonitorMax) {
            handleErrorMessage(`Error: Number of monitored PVs is limited to ${liveMonitorMax}!`);
            handleSeverity("error");
            handleOpenErrorAlert(true);
        }
        else if (currentChecked.size > liveMonitorWarn) {
            handleErrorMessage(`Warning: Monitoring ${currentChecked.size - liveMonitorWarn} PVs over the recommended amount. You may experience performance issues.`);
            handleSeverity("warning");
            handleOpenErrorAlert(true);
        }
    }, [currentChecked, handleErrorMessage, handleOpenErrorAlert, handleSeverity, liveMonitorMax, liveMonitorWarn])

    useEffect(() => {
        if (props.isLoading) {
            setMonitorAllChecked(false);
            setCurrentChecked(new Set());
            // go back to the first page for a new search but keep the user's page size
            setPaginationModel((prev) => ({ ...prev, page: 0 }));
        }
    }, [props.isLoading])

    const handleRowDoubleClick = (e) => {
        navigate(`/pv/${e.row.name}`);
    }

    const toggleColumnVisibility = (field, state) => {
        setColumnVisibilityModel((prevColumnVisibilityModel) => {
            return {
                ...prevColumnVisibilityModel,
                [field]: state,
            };
        });
    };

    const renderButtons = (params) => {
        return (
            <div>
                <Tooltip arrow title={<div>View<br />{params.row.name}</div>}>
                    <IconButton
                        aria-label="details"
                        color="primary"
                        variant="contained"
                        onClick={() => {
                            navigate(`/pv/${params.row.name}`);
                        }}
                        size="large">
                        <ReadMoreIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip arrow title={<div>Plot<br />{params.row.name}</div>}>
                    <IconButton
                        aria-label="plot"
                        color="primary"
                        target="_blank"
                        variant="contained"
                        href={encodeURI(`${config.AA_VIEWER}?pv=${params.row.name}`)}
                        size="large">
                        <TimelineIcon />
                    </IconButton>
                </Tooltip>
                {
                    config.USE_PVWS ? <ValueCheckbox pvName={params.row.name} id={params.row.id}
                        pvStatus={params.row.pvStatus} recordType={params.row.recordType}
                        checked={currentChecked.has(params.row.id)} updateCurrentChecked={updateCurrentChecked} />
                        : <div></div>
                }
            </div>
        );
    }

    const renderIOCLink = (params) => {
        return (
            <div>
                <Link component={RouterLink} to={`/?iocName=${params.row.iocName}`} underline="hover">{params.row.iocName}</Link>
            </div>
        )
    }

    const renderPVNameLink = (params) => {
        return (
            <div>
                <Link component={RouterLink} to={`/pv/${params.row.name}`} underline="hover">{params.row.name}</Link>
            </div>
        )
    }

    const renderAliasLink = (params) => {
        return (
            <div>
                <Link component={RouterLink} to={`/pv/${params.row.alias}`} underline="hover">{params.row.alias}</Link>
            </div>
        )
    }

    const renderValue = (params) => {
        // if PVWS is on, show checkbox for live monitoring, else nothing
        if (config.USE_PVWS) {
            return (
                <Value pvName={params.row.name} id={params.row.id} isChecked={currentChecked.has(params.row.id)} pvRecordType={params.row.recordType} pvStatus={params.row.pvStatus} />
            );
        }
        else {
            return (
                <div></div>
            )
        }
    }

    let columns = [
        // narrower than the default 50px since the selection checkboxes are small
        { ...GRID_CHECKBOX_SELECTION_COL_DEF, width: 34, minWidth: 34 },
        { field: "name", headerName: 'PV Name', flex: 15, minWidth: 175, renderCell: renderPVNameLink }
    ]
    if (config.CF_RECORD_DESC) {
        columns.push({ field: "recordDesc", headerName: 'Description', flex: 18, minWidth: 175 })
    }
    columns.push(
        { field: "hostName", headerName: 'Host', flex: 8.5, minWidth: 125 },
        { field: "iocName", headerName: 'IOC', flex: 8.5, minWidth: 125, renderCell: renderIOCLink },
        { field: "pvStatus", headerName: 'Status', flex: 7.5, minWidth: 125, maxWidth: 170 }
    )
    if (config.CF_RECORD_TYPE) {
        columns.push({ field: "recordType", headerName: 'Type', flex: 7.5, minWidth: 125, maxWidth: 170 })
    }
    if (config.EXTRA_PROP_SHOW_IN_RESULTS && config.EXTRA_PROP) {
        columns.push({ field: config.EXTRA_PROP, headerName: config.EXTRA_PROP_LABEL, flex: 7.5, minWidth: 125 })
    }
    if (config.SECOND_EXTRA_PROP_SHOW_IN_RESULTS && config.SECOND_EXTRA_PROP) {
        columns.push({ field: config.SECOND_EXTRA_PROP, headerName: config.SECOND_EXTRA_PROP_LABEL, flex: 7.5, minWidth: 125 })
    }
    if (config.CF_RECORD_ALIAS) {
        columns.push({ field: "alias", headerName: 'Alias Of', flex: 10.5, minWidth: 175, renderCell: renderAliasLink })
    }
    if (config.USE_PVWS) {
        columns.push({ field: "value", headerName: 'Value', width: 140, resizable: false, renderCell: renderValue })
    }
    columns.push({ field: "button", headerName: 'Actions', width: config.USE_PVWS ? 160 : 120, resizable: false, sortable: false, disableColumnMenu: true, renderCell: renderButtons })
    columns = columns.map((column) =>
        column.field in columnWidths ? { ...column, flex: 0, width: columnWidths[column.field] } : column
    )

    useEffect(() => {
        if (props.cfData === null || Object.keys(props.cfData).length === 0) {
            return;
        }
        setPVs(props.cfData.map((pv, index) => {
            let pvObject = {};
            pvObject.id = index;
            pvObject.name = pv.name;
            pvObject.owner = pv.owner;
            pv.properties.forEach((prop) => {
                pvObject[prop.name] = prop.value;
            });
            return pvObject;
        }));
        // row ids are reused by the next search, so clear the selection and monitored PVs for new results
        setRowSelectionModel({ type: "include", ids: new Set() });
        setCurrentChecked(new Set());
        handleVisiblePageChange(config.DEFAULT_MONITOR_ALL);
    }, [props.cfData, handleVisiblePageChange]);

    // hide the row selection checkboxes on phones, and clear the selection so rows aren't left selected while hidden
    useEffect(() => {
        setColumnVisibilityModel((prevColumnVisibilityModel) => ({ ...prevColumnVisibilityModel, [GRID_CHECKBOX_SELECTION_FIELD]: !isPhone }));
        if (isPhone) {
            setRowSelectionModel({ type: "include", ids: new Set() });
        }
    }, [isPhone]);

    function roundToBreakpoint(width, breakpoints) {
        const smallerBreakpoints = breakpoints.filter((item) => item <= width);
        return smallerBreakpoints[smallerBreakpoints.length - 1]
    }

    useEffect(() => {
        setCurrentBreakpoint(config.LG_BREAKPOINT);
        setPrevBreakpoint(config.LG_BREAKPOINT);
    }, []);

    useEffect(() => {
        const handleWindowResize = () => {
            const windowWidth = window.innerWidth;
            const sm = config.SM_BREAKPOINT;
            const md = config.MD_BREAKPOINT;
            const lg = config.LG_BREAKPOINT;

            const breakpoint = roundToBreakpoint(windowWidth, [0, sm, md, lg]);
            setCurrentBreakpoint(breakpoint);

            if (breakpoint !== prevBreakpoint) {
                setPrevBreakpoint(currentBreakpoint);

                const omitExtraSmall = config.OMIT_IN_TABLE_X_SMALL;
                const omitSmall = config.OMIT_IN_TABLE_SMALL;
                const omitMedium = config.OMIT_IN_TABLE_MEDIUM;

                if (windowWidth <= sm) {
                    for (let i = 0; i < omitExtraSmall.length; ++i) {
                        toggleColumnVisibility(omitExtraSmall[i], false)
                    }
                    for (let i = 0; i < omitSmall.length; ++i) {
                        toggleColumnVisibility(omitSmall[i], false);
                    }
                    for (let i = 0; i < omitMedium.length; ++i) {
                        toggleColumnVisibility(omitMedium[i], false);
                    }
                } else if (windowWidth > sm && windowWidth <= md) {
                    for (let i = 0; i < omitSmall.length; ++i) {
                        toggleColumnVisibility(omitSmall[i], false);
                    }
                    for (let i = 0; i < omitExtraSmall.length; ++i) {
                        toggleColumnVisibility(omitExtraSmall[i], true);
                    }
                    for (let i = 0; i < omitMedium.length; ++i) {
                        toggleColumnVisibility(omitMedium[i], false);
                    }
                } else if (windowWidth > md && windowWidth <= lg) {
                    for (let i = 0; i < omitMedium.length; ++i) {
                        toggleColumnVisibility(omitMedium[i], false);
                    }
                    for (let i = 0; i < omitSmall.length; ++i) {
                        toggleColumnVisibility(omitSmall[i], true);
                    }
                } else {
                    for (let i = 0; i < omitMedium.length; ++i) {
                        toggleColumnVisibility(omitMedium[i], true);
                    }
                }
            }
        };
        window.addEventListener('resize', handleWindowResize);
        handleWindowResize(); // Call the function initially
        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    }, [currentBreakpoint, prevBreakpoint]);

    if (props.isLoading) {
        return (
            <Fragment>
                <Typography variant="h6">Data Loading...</Typography>
                <Logo />
            </Fragment>
        );
    }
    else if (props.cfData === null) {
        return (
            <Fragment>
                <Logo />
            </Fragment>
        );
    }
    else if (props.cfData.length === 0) {
        return (
            <Fragment>
                <Typography>No PVs match your query</Typography>
                <Logo />
            </Fragment>
        );
    }
    return (
        <Fragment>
            <DataGrid
                apiRef={apiRef}
                rows={pvs}
                columns={columns}
                autoHeight={true}
                density={defaultTableDensity}
                onRowDoubleClick={handleRowDoubleClick}
                paginationModel={paginationModel}
                onPaginationModelChange={(newPaginationModel) => {
                    setPaginationModel(newPaginationModel);
                    handleVisiblePageChange(config.DEFAULT_MONITOR_ALL);
                }}
                onSortModelChange={() => handleVisiblePageChange(monitorAllChecked)}
                onFilterModelChange={() => handleVisiblePageChange(monitorAllChecked)}
                pageSizeOptions={tablePageSizeOptions}
                pagination
                columnVisibilityModel={columnVisibilityModel}
                onColumnVisibilityModelChange={(newModel) =>
                    setColumnVisibilityModel(newModel)
                }
                onColumnWidthChange={(params) =>
                    setColumnWidths((prev) => ({ ...prev, [params.colDef.field]: params.width }))
                }
                checkboxSelection
                disableRowSelectionOnClick
                rowSelectionModel={rowSelectionModel}
                onRowSelectionModelChange={(newModel) => setRowSelectionModel(newModel)}
                showToolbar
                label="Search Results"
                // the selection checkboxes are small and grey until checked so they don't distract from the results
                sx={{
                    "& .MuiDataGrid-cellCheckbox .MuiCheckbox-root:not(.Mui-checked), & .MuiDataGrid-columnHeaderCheckbox .MuiCheckbox-root:not(.Mui-checked):not(.MuiCheckbox-indeterminate)": {
                        // lightest grey with the 3:1 contrast on white recommended for controls
                        color: "#8f8f8f",
                    },
                    "& .MuiDataGrid-cellCheckbox .MuiCheckbox-root, & .MuiDataGrid-columnHeaderCheckbox .MuiCheckbox-root": {
                        padding: "4px",
                    },
                    "& .MuiDataGrid-cellCheckbox .MuiSvgIcon-root, & .MuiDataGrid-columnHeaderCheckbox .MuiSvgIcon-root": {
                        fontSize: 18,
                    },
                }}
                slotProps={{
                    baseCheckbox: { size: "small" },
                    toolbar: {
                        csvOptions: csvExportOptions("PVs"),
                        mainControls: <ResultsToolbar handleErrorMessage={handleErrorMessage} handleOpenErrorAlert={handleOpenErrorAlert} handleSeverity={handleSeverity}
                            monitorAllChecked={monitorAllChecked} handleMonitorAll={handleMonitorSelectAll} />
                    }
                }}
            />
        </ Fragment>
    );
}

export default QueryResults;
