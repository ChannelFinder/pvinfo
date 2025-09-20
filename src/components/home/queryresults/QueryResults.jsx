import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { Typography, Checkbox, Link, IconButton, Tooltip } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useNavigate, Link as RouterLink } from "react-router-dom";
import TimelineIcon from '@mui/icons-material/Timeline';
import ReadMoreIcon from '@mui/icons-material/ReadMore';
import api from "../../../api";
import ValueCheckbox from './valuecheckbox/ValueCheckbox';
import Value from "./value";
import Logo from "./logo";
import PropTypes from "prop-types";
import config from "../../../config";

const propTypes = {
    isLoading: PropTypes.bool,
    cfData: PropTypes.array,
    handleErrorMessage: PropTypes.func,
    handleOpenErrorAlert: PropTypes.func,
    handleSeverity: PropTypes.func
}

function QueryResults(props) {
    const navigate = useNavigate();
    const pageSizeEnvValue = config.RESULTS_TABLE_SIZE;
    const [pageSize, setPageSize] = useState(pageSizeEnvValue);
    const [pvs, setPVs] = useState([]);
    const defaultTableDensity = config.RESULTS_TABLE_DENSITY;
    let tablePageSizeOptions = config.RESULTS_TABLE_SIZE_OPTIONS;
    if (!tablePageSizeOptions.includes(pageSizeEnvValue)) {
        tablePageSizeOptions.push(pageSizeEnvValue);
        tablePageSizeOptions.sort(function (a, b) { return a - b; });
    }
    const [columnVisibilityModel, setColumnVisibilityModel] = useState();
    const [currentBreakpoint, setCurrentBreakpoint] = useState();
    const [prevBreakpoint, setPrevBreakpoint] = useState();
    const [checked, setChecked] = useState([]);
    const [currentChecked, setCurrentChecked] = useState(new Set());
    const [monitorAllChecked, setMonitorAllChecked] = useState(false);
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

    const handleMonitorSelectAll = useCallback((firstRow, lastRow) => (event) => {
        setMonitorAllChecked(event.target.checked);

        if (!firstRow && !lastRow) {
            const rowsString = document.getElementsByClassName('MuiTablePagination-displayedRows')[0].innerHTML;
            const [start, end] = rowsString.split('\u2013').map(s => s.trim().replace(" of", ""));
            [firstRow, lastRow] = [parseInt(start) - 1, parseInt(end) - 1];
        }
        for (let i = firstRow; i <= lastRow; ++i) {
            // only check mark active PVs, unless we are ignoring CF PV status
            // matters now that we show "Disconnected" for PVs that are not connected to their IOC
            if (config.PVWS_IGNORE_CF_PVSTATUS || pvs[i].pvStatus === "Active") {
                updateCurrentChecked(i, event.target.checked);
            }
        }
        return
    }, [updateCurrentChecked])

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
                        <Checkbox checked={monitorAllChecked} onChange={handleMonitorSelectAll()} sx={{ ml: ".5rem" }}></Checkbox>
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
        { field: "name", headerName: 'PV Name', flex: 15, minWidth: 175, maxWidth: 300, renderCell: renderPVNameLink }
    ]
    if (config.CF_RECORD_DESC) {
        columns.push({ field: "recordDesc", headerName: 'Description', flex: 18, minWidth: 175, maxWidth: 300 })
    }
    columns.push(
        { field: "hostName", headerName: 'Host', flex: 8.5, minWidth: 125, maxWidth: 170 },
        { field: "iocName", headerName: 'IOC', flex: 8.5, minWidth: 125, maxWidth: 170, renderCell: renderIOCLink },
        { field: "pvStatus", headerName: 'Status', flex: 7.5, minWidth: 125, maxWidth: 170 }
    )
    if (config.CF_RECORD_TYPE) {
        columns.push({ field: "recordType", headerName: 'Type', flex: 7.5, minWidth: 125, maxWidth: 170 })
    }
    if (config.EXTRA_PROP_SHOW_IN_RESULTS && config.EXTRA_PROP) {
        columns.push({ field: config.EXTRA_PROP, headerName: config.EXTRA_PROP_LABEL, flex: 7.5, minWidth: 125, maxWidth: 170 })
    }
    if (config.SECOND_EXTRA_PROP_SHOW_IN_RESULTS && config.SECOND_EXTRA_PROP) {
        columns.push({ field: config.SECOND_EXTRA_PROP, headerName: config.SECOND_EXTRA_PROP_LABEL, flex: 7.5, minWidth: 125, maxWidth: 170 })
    }
    if (config.CF_RECORD_ALIAS) {
        columns.push({ field: "alias", headerName: 'Alias Of', flex: 10.5, minWidth: 175, maxWidth: 300, renderCell: renderAliasLink })
    }
    if (config.USE_PVWS) {
        columns.push({ field: "value", headerName: 'Value', flex: 7.5, minWidth: 120, maxWidth: 140, renderCell: renderValue })
    }
    columns.push({ field: "button", headerName: 'Actions', flex: 9.5, minWidth: 160, maxWidth: 200, disableClickEventBubbling: true, renderCell: renderButtons, renderHeader: renderActionsHeader })

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
    }, [props.cfData]);

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
                rows={pvs}
                columns={columns}
                autoHeight={true}
                density={defaultTableDensity}
                onRowDoubleClick={handleRowDoubleClick}
                components={{ Toolbar: GridToolbar }}
                pageSize={pageSize}
                onPageSizeChange={(newPageSize) => {
                    setPageSize(newPageSize)
                    clearMonitoring();
                }}
                onPageChange={() => {
                    clearMonitoring();
                }}
                rowsPerPageOptions={tablePageSizeOptions}
                pagination
                columnVisibilityModel={columnVisibilityModel}
                onColumnVisibilityModelChange={(newModel) =>
                    setColumnVisibilityModel(newModel)
                }
            />
        </ Fragment>
    );
}

QueryResults.propTypes = propTypes;
export default QueryResults;
