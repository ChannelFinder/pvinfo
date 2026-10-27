import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { Typography, Switch, Link, IconButton, Tooltip } from '@mui/material';
import { DataGrid, GRID_CHECKBOX_SELECTION_COL_DEF, GRID_CHECKBOX_SELECTION_FIELD, useGridApiRef, gridPaginatedVisibleSortedGridRowIdsSelector } from '@mui/x-data-grid';
import { useNavigate, Link as RouterLink } from "react-router";
import TimelineIcon from '@mui/icons-material/Timeline';
import ReadMoreIcon from '@mui/icons-material/ReadMore';
import api from "../../../api";
import ValueCheckbox from './valuecheckbox/ValueCheckbox';
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
    const [checked, setChecked] = useState([]);
    const [currentChecked, setCurrentChecked] = useState(new Set());
    const [monitorAllChecked, setMonitorAllChecked] = useState(false);
    // set when the visible page changes and monitor all is checked, so the PVs on the new visible page get monitored
    const [monitorVisiblePagePending, setMonitorVisiblePagePending] = useState(false);
    const [rowSelectionModel, setRowSelectionModel] = useState({ type: "include", ids: new Set() });
    const liveMonitorMax = config.LIVE_MONITOR_MAX;
    const liveMonitorWarn = config.LIVE_MONITOR_WARN;

    let { handleErrorMessage, handleOpenErrorAlert, handleSeverity } = props;

    const updateCurrentChecked = useCallback((index, checkedStatus) => {
        if (currentChecked.has(index) && checkedStatus) {
            return
        }
        let newChecked = checked;
        setCurrentChecked(prevState => {
            const newCurrentChecked = new Set(prevState);
            if (newCurrentChecked.size > liveMonitorMax && checkedStatus) {
                return newCurrentChecked;
            }
            if (checkedStatus) {
                newCurrentChecked.add(index);
            } else {
                newCurrentChecked.delete(index);
            }
            newChecked[index] = checkedStatus;
            setChecked(newChecked);
            return newCurrentChecked;
        });
    }, [currentChecked, checked, liveMonitorMax]);

    const clearMonitoring = useCallback(() => {
        setMonitorAllChecked(false);
        let newCurrentChecked = currentChecked;

        const iterator = newCurrentChecked.values();
        let current = iterator.next();

        while (!current.done) {
            newCurrentChecked.delete(current.value);

            const myEvent = { target: { checked: false } }
            updateCurrentChecked(current.value, myEvent.target.checked);
            current = iterator.next();
        }
        setCurrentChecked(newCurrentChecked);
    }, [currentChecked, updateCurrentChecked])

    // check or uncheck every PV on the page the user is looking at. The grid's row ids are used
    // so it is the sorted and filtered page and not just the first rows of the search results
    const monitorVisiblePage = useCallback((checkedStatus) => {
        gridPaginatedVisibleSortedGridRowIdsSelector(apiRef).forEach((id) => {
            const row = apiRef.current.getRow(id);
            // only check mark active PVs, unless we are ignoring CF PV status
            // matters now that we show "Disconnected" for PVs that are not connected to their IOC
            if (row && (config.PVWS_IGNORE_CF_PVSTATUS || row.pvStatus === "Active")) {
                updateCurrentChecked(id, checkedStatus);
            }
        });
    }, [apiRef, updateCurrentChecked])

    const handleMonitorSelectAll = (event) => {
        setMonitorAllChecked(event.target.checked);
        monitorVisiblePage(event.target.checked);
    }

    // the visible page changed (new search, page change, sort, filter), monitor the new page if monitor all should stay checked
    const monitorAllOnNewPage = useCallback((keepMonitorAll) => {
        if (config.USE_PVWS && keepMonitorAll) {
            setMonitorAllChecked(true);
            setMonitorVisiblePagePending(true);
        }
    }, [])

    // runs after the grid has rendered the new page so its sorted and filtered row ids are up to date
    useEffect(() => {
        if (monitorVisiblePagePending) {
            setMonitorVisiblePagePending(false);
            monitorVisiblePage(true);
        }
    }, [monitorVisiblePagePending, monitorVisiblePage])

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
            clearMonitoring();
            // go back to the first page for a new search but keep the user's page size
            setPaginationModel((prev) => ({ ...prev, page: 0 }));
        }
    }, [props.isLoading, clearMonitoring])

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
                        pvStatus={params.row.pvStatus} recordType={params.row.recordType} checked={checked}
                        currentChecked={currentChecked} updateCurrentChecked={updateCurrentChecked} />
                        : <div></div>
                }
            </div>
        );
    }

    const renderActionsHeader = () => {
        return (
            <div>
                <Typography display="inline" variant="subtitle2">Actions</Typography>
                {
                    config.USE_PVWS ? <Tooltip arrow title="Monitor All PVs">
                        <Switch size="small" checked={monitorAllChecked} onChange={handleMonitorSelectAll} sx={{ ml: ".5rem" }}
                            slotProps={{ input: { "aria-label": "Monitor all PVs" } }}></Switch>
                    </Tooltip>
                        : <div></div>
                }
            </div>
        )
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
    columns.push({ field: "button", headerName: 'Actions', width: config.USE_PVWS ? 160 : 120, resizable: false, sortable: false, disableColumnMenu: true, renderCell: renderButtons, renderHeader: renderActionsHeader })
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
        setChecked(new Array(props.cfData.length).fill(false));
        // row ids are reused by the next search, so clear the selection for new results
        setRowSelectionModel({ type: "include", ids: new Set() });
        monitorAllOnNewPage(config.DEFAULT_MONITOR_ALL);
    }, [props.cfData, monitorAllOnNewPage]);

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

                // hide the row selection checkboxes on phones, and clear the selection so rows aren't left selected while hidden
                toggleColumnVisibility(GRID_CHECKBOX_SELECTION_FIELD, windowWidth > sm);
                if (windowWidth <= sm) {
                    setRowSelectionModel({ type: "include", ids: new Set() });
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
                    clearMonitoring();
                    monitorAllOnNewPage(config.DEFAULT_MONITOR_ALL);
                }}
                onSortModelChange={() => {
                    if (monitorAllChecked) {
                        clearMonitoring();
                        monitorAllOnNewPage(true);
                    }
                }}
                onFilterModelChange={() => {
                    if (monitorAllChecked) {
                        clearMonitoring();
                        monitorAllOnNewPage(true);
                    }
                }}
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
                        color: "grey.400",
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
                        mainControls: <ResultsToolbar handleErrorMessage={handleErrorMessage} handleOpenErrorAlert={handleOpenErrorAlert} handleSeverity={handleSeverity} />
                    }
                }}
            />
        </ Fragment>
    );
}

export default QueryResults;
