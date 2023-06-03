import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { Grid, Typography, Checkbox, Link, IconButton, Tooltip, Hidden } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useNavigate, Link as RouterLink } from "react-router-dom";
import TimelineIcon from '@mui/icons-material/Timeline';
import ReadMoreIcon from '@mui/icons-material/ReadMore';
import api from "../../../api";
import bannerLogo from "../../../assets/home-banner-logo.png";
import ValueCheckbox from './valuecheckbox/ValueCheckbox';
import Value from "./value";
import PropTypes from "prop-types";

const propTypes = {
    isLoading: PropTypes.bool,
    cfData: PropTypes.array,
    handleErrorMessage: PropTypes.func,
    handleOpenErrorAlert: PropTypes.func,
    handleSeverity: PropTypes.func
}

function QueryResults(props) {
    const navigate = useNavigate();
    const pageSizeEnvValue = process.env.REACT_APP_RESULTS_TABLE_SIZE ? parseInt(process.env.REACT_APP_RESULTS_TABLE_SIZE.trim()) : 50;
    const [pageSize, setPageSize] = useState(pageSizeEnvValue);
    const [pvs, setPVs] = useState([]);
    const defaultTableDensity = process.env.REACT_APP_RESULTS_TABLE_DENSITY ? process.env.REACT_APP_RESULTS_TABLE_DENSITY : "standard";
    let tablePageSizeOptions = [5, 10, 20, 50, 100];
    if (process.env.REACT_APP_RESULTS_TABLE_SIZE_OPTIONS) {
        tablePageSizeOptions = process.env.REACT_APP_RESULTS_TABLE_SIZE_OPTIONS.split(',').filter(item => item.trim().length && !isNaN(item)).map(Number);
        if (!tablePageSizeOptions.includes(pageSizeEnvValue)) {
            tablePageSizeOptions.push(pageSizeEnvValue);
        }
        tablePageSizeOptions.sort();
    }
    const [columnVisibilityModel, setColumnVisibilityModel] = useState();
    const [currentBreakpoint, setCurrentBreakpoint] = useState();
    const [prevBreakpoint, setPrevBreakpoint] = useState();
    const [checked, setChecked] = useState([]);
    const [currentChecked, setCurrentChecked] = useState(new Set());
    const [monitorAllChecked, setMonitorAllChecked] = useState(false);

    let { handleErrorMessage, handleOpenErrorAlert, handleSeverity } = props;

    const updateCurrentChecked = useCallback((index, checkedStatus) => {
        if (currentChecked.has(index) && checkedStatus) {
            return
        }
        let newChecked = checked;
        setCurrentChecked(prevState => {
            const newCurrentChecked = new Set(prevState);
            if (newCurrentChecked.size >= 100 && checkedStatus) {
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
    }, [currentChecked, checked]);

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


    // Event listeners for page change buttons
    useEffect(() => {
        const nextButton = document.querySelector('[title="Go to next page"]');
        const prevButton = document.querySelector('[title="Go to previous page"]');

        const handlePageChange = (params) => {
            clearMonitoring();
        }

        if (nextButton) {
            nextButton.addEventListener("click", handlePageChange);
        }

        if (prevButton) {
            prevButton.addEventListener("click", handlePageChange);
        }
        return () => {
            if (nextButton) {
                nextButton.removeEventListener("click", handlePageChange);
            }
            if (prevButton) {
                prevButton.removeEventListener("click", handlePageChange);
            }
        };
    }, [pvs, currentChecked, checked, clearMonitoring]);

    // Notify user if monitoring over 100 pvs
    useEffect(() => {
        if (currentChecked.size > 100) {
            handleErrorMessage(`Warning: Monitoring ${currentChecked.size} PVs`);
            handleSeverity("warning");
            handleOpenErrorAlert(true);
        }
    }, [currentChecked, handleErrorMessage, handleOpenErrorAlert, handleSeverity])

    useEffect(() => {
        if (props.isLoading) {
            clearMonitoring();
        }
    }, [props.isLoading, clearMonitoring])

    const handleRowDoubleClick = (e) => {
        navigate(`/pv/${e.row.name}`);
    }

    const handleMonitorSelectAll = () => (event) => {
        setMonitorAllChecked(event.target.checked);
        const rowsString = document.getElementsByClassName('MuiTablePagination-displayedRows')[0].innerHTML;
        const [start, end] = rowsString.split('\u2013').map(s => s.trim().replace(" of", ""));
        const [firstRow, lastRow] = [parseInt(start) - 1, parseInt(end) - 1];

        for (let i = firstRow; i <= lastRow; ++i) {
            updateCurrentChecked(i, event.target.checked);
        }
        return
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
                <Tooltip arrow title={<div>Details<br />{params.row.name}</div>}>
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
                        aria-label="details"
                        color="primary"
                        target="_blank"
                        variant="contained"
                        href={encodeURI(`${api.AA_VIEWER}?pv=${params.row.name}`)}
                        size="large">
                        <TimelineIcon />
                    </IconButton>
                </Tooltip>
                {
                    // if PVWS is on, show checkbox for live monitoring, else nothing
                    process.env.REACT_APP_USE_PVWS === "true" ? <ValueCheckbox pvName={params.row.name} id={params.row.id}
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
                        process.env.REACT_APP_USE_PVWS === "true" ? <Tooltip arrow title="Monitor All PVs">
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
        if (process.env.REACT_APP_USE_PVWS === "true") {
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
    if (process.env.REACT_APP_CF_RECORD_DESC === "true") {
        columns.push({ field: "recordDesc", headerName: 'Description', flex: 18, minWidth: 175, maxWidth: 300 })
    }
    columns.push(
        { field: "hostName", headerName: 'Host', flex: 8.5, minWidth: 125, maxWidth: 170 },
        { field: "iocName", headerName: 'IOC', flex: 8.5, minWidth: 125, maxWidth: 170, renderCell: renderIOCLink },
        { field: "pvStatus", headerName: 'Status', flex: 7.5, minWidth: 125, maxWidth: 170 }
    )
    if (process.env.REACT_APP_CF_RECORD_TYPE === "true") {
        columns.push({ field: "recordType", headerName: 'Type', flex: 7.5, minWidth: 125, maxWidth: 170 })
    }
    if (process.env.REACT_APP_EXTRA_PROP_SHOW_IN_RESULTS.toLowerCase() === "true" && process.env.REACT_APP_EXTRA_PROP !== "") {
        columns.push({ field: process.env.REACT_APP_EXTRA_PROP, headerName: process.env.REACT_APP_EXTRA_PROP_LABEL, flex: 7.5, minWidth: 125, maxWidth: 170 })
    }
    if (process.env.REACT_APP_SECOND_EXTRA_PROP_SHOW_IN_RESULTS.toLowerCase() === "true" && process.env.REACT_APP_SECOND_EXTRA_PROP !== "") {
        columns.push({ field: process.env.REACT_APP_SECOND_EXTRA_PROP, headerName: process.env.REACT_APP_SECOND_EXTRA_PROP_LABEL, flex: 7.5, minWidth: 125, maxWidth: 170 })
    }
    if (process.env.REACT_APP_CF_ALIAS === "true") {
        columns.push({ field: "alias", headerName: 'Alias Of', flex: 10.5, minWidth: 175, maxWidth: 300, renderCell: renderAliasLink })
    }
    if (process.env.REACT_APP_USE_PVWS === "true") {
        columns.push({ field: "value", headerName: 'Value', flex: 7.5, minWidth: 120, maxWidth: 140, renderCell: renderValue })
    }
    columns.push({ field: "button", headerName: 'Actions', flex: 9.5, minWidth: 160, maxWidth: 200, disableClickEventBubbling: true, renderCell: renderButtons, renderHeader: renderActionsHeader })

    useEffect(() => {
        if (props.cfData === null || props.cfData === {} || Object.keys(props.cfData).length === 0) {
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
        setCurrentBreakpoint(parseInt(process.env.REACT_APP_LG_BREAKPOINT));
        setPrevBreakpoint(parseInt(process.env.REACT_APP_LG_BREAKPOINT));
    }, []);

    useEffect(() => {
        const handleWindowResize = () => {
            const windowWidth = window.innerWidth;
            const sm = process.env.REACT_APP_SM_BREAKPOINT ? parseInt(process.env.REACT_APP_SM_BREAKPOINT) : 600;
            const md = process.env.REACT_APP_MD_BREAKPOINT ? parseInt(process.env.REACT_APP_MD_BREAKPOINT) : 900;
            const lg = process.env.REACT_APP_LG_BREAKPOINT ? parseInt(process.env.REACT_APP_LG_BREAKPOINT) : 1536;

            setCurrentBreakpoint(roundToBreakpoint(windowWidth, [0, sm, md, lg]))

            if (currentBreakpoint !== prevBreakpoint) {
                setPrevBreakpoint(currentBreakpoint);

                const omitExtraSmall = process.env.REACT_APP_OMIT_IN_TABLE_X_SMALL ? process.env.REACT_APP_OMIT_IN_TABLE_X_SMALL.split(',').map(item => item.trim()) : [];
                const omitSmall = process.env.REACT_APP_OMIT_IN_TABLE_SMALL ? process.env.REACT_APP_OMIT_IN_TABLE_SMALL.split(',').map(item => item.trim()) : [];
                const omitMedium = process.env.REACT_APP_OMIT_IN_TABLE_MEDIUM ? process.env.REACT_APP_OMIT_IN_TABLE_MEDIUM.split(',').map(item => item.trim()) : [];

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
                <Hidden lgDown>
                    <Grid container justifyContent="center" >
                        <img src={bannerLogo} style={{ position: "absolute", "marginBottom": "20px", "bottom": 0, width: "25%" }} alt="Banner Logo" />
                    </Grid>
                </Hidden>
            </Fragment>
        );
    }
    else if (props.cfData === null) {
        return (
            <Fragment>
                <Hidden lgDown>
                    <Grid container justifyContent="center" >
                        <img src={bannerLogo} style={{ position: "absolute", "marginBottom": "20px", "bottom": 0, width: "25%" }} alt="Banner Logo" />
                    </Grid>
                </Hidden>
            </Fragment>
        );
    }
    else if (props.cfData.length === 0) {
        return (
            <Fragment>
                <Typography>No PVs match your query</Typography>
                <Hidden lgDown>
                    <Grid container justifyContent="center" >
                        <img src={bannerLogo} style={{ position: "absolute", "marginBottom": "20px", "bottom": 0, width: "25%" }} alt="Banner Logo" />
                    </Grid>
                </Hidden>
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
                onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
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
