import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useWebSocket from 'react-use-websocket';
import { Grid, Typography, Checkbox, Link, IconButton, Tooltip, Hidden } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useNavigate, Link as RouterLink } from "react-router-dom";
import TimelineIcon from '@mui/icons-material/Timeline';
import ReadMoreIcon from '@mui/icons-material/ReadMore';
import api from "../../../api";
import bannerLogo from "../../../assets/home-banner-logo.png";
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
    const [pvValues, setPVValues] = useState({});
    const [pvSeverities, setPVSeverities] = useState({});
    const [pvUnits, setPVUnits] = useState({});
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

    const socketUrl = api.PVWS_URL;
    const { sendJsonMessage, lastJsonMessage } = useWebSocket(socketUrl, {
        shouldReconnect: (closeEvent) => true,
    });

    useEffect(() => {
        if (lastJsonMessage !== null) {
            const message = lastJsonMessage;
            if (message.type === "update") {
                if ("severity" in message) {
                    // console.log("severity")
                    setPVSeverities(prevState => ({ ...prevState, [message.pv]: message.severity }));
                }
                if ("units" in message) {
                    // console.log("units")
                    setPVUnits(prevState => ({ ...prevState, [message.pv]: message.units }));
                }
                if ("text" in message) {
                    // console.log("text")
                    setPVValues(prevState => ({ ...prevState, [message.pv]: message.text }));
                    return;
                }
                else if ("value" in message) {
                    // console.log("value")
                    setPVValues(prevState => ({
                        ...prevState, [message.pv]: (((Number(message.value) >= 0.01 && Number(message.value) < 1000000000) ||
                            (Number(message.value) <= -0.01 && Number(message.value) > -1000000000) ||
                            Number(message.value) === 0) ?
                            Number(message.value.toFixed(2)) : Number(message.value).toExponential())
                    }));
                    return;
                }
            }
            else {
                console.log("Unexpected message type: ", message);
            }
        }
    }, [lastJsonMessage]);

    const handleMonitorPVChange = useCallback((pvName, index) => (event) => {
        if (currentChecked.has(index) && event.target.checked) {
            return
        }
        let newChecked = checked;
        newChecked[index] = event.target.checked;
        setChecked(newChecked);
        // let newCurrentChecked = currentChecked;
        // if (event.target.checked) {
        //     newCurrentChecked.add(index);
        //     setCurrentChecked(newCurrentChecked);
        // } else {
        //     console.log(`removing ${index}`)
        //     newCurrentChecked.delete(index);
        //     console.log(newCurrentChecked)
        //     setCurrentChecked(newCurrentChecked);
        // }
        setCurrentChecked(prevState => {
            const newCurrentChecked = new Set(prevState);
            if (event.target.checked) {
                newCurrentChecked.add(index);
            } else {
                newCurrentChecked.delete(index);
            }
            return newCurrentChecked;
        });
        if (event.target.checked) {
            // maybe reopen here if closed
            // if (ws.current.readyState === WebSocket.CLOSED) {
            //     // Do your stuff...
            //  }
            sendJsonMessage({ "type": "subscribe", "pvs": [pvName] });
            setPVValues(prevState => ({ ...prevState, [pvName]: 'obtaining...' }));
        }
        else {
            sendJsonMessage({ "type": "clear", "pvs": [pvName] });
            setPVValues((prevData) => {
                const newData = { ...prevData };
                delete newData[pvName];
                return newData;
            });
            setPVUnits((prevData) => {
                const newData = { ...prevData };
                delete newData[pvName];
                return newData;
            });
            setPVSeverities((prevData) => {
                const newData = { ...prevData };
                delete newData[pvName];
                return newData;
            });
        }
    }, [checked, currentChecked, sendJsonMessage]);


    // Event listeners for page change buttons
    useEffect(() => {
        const nextButton = document.querySelector('[title="Go to next page"]');
        const prevButton = document.querySelector('[title="Go to previous page"]');

        const handlePageChange = (params) => {
            setMonitorAllChecked(false);
            let newCurrentChecked = currentChecked;

            const iterator = newCurrentChecked.values();
            let current = iterator.next();

            while (!current.done) {
                newCurrentChecked.delete(current.value);

                const myEvent = { target: { checked: false } }
                handleMonitorPVChange(pvs[current.value].name, current.value)(myEvent);
                current = iterator.next();
            }
            setCurrentChecked(newCurrentChecked);
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
    }, [pvs, currentChecked, checked, handleMonitorPVChange]);

    useEffect(() => {
        if (currentChecked.size > 100) {
            handleErrorMessage(`Warning: Monitoring ${currentChecked.size} PVs`);
            handleOpenErrorAlert(true);
            handleSeverity("warning")
        }
    }, [currentChecked, handleErrorMessage, handleOpenErrorAlert, handleSeverity])

    /*
    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];
    */

    const handleRowDoubleClick = (e) => {
        navigate(`/pv/${e.row.name}`);
    }

    const handleMonitorSelectAll = () => (event) => {
        setMonitorAllChecked(event.target.checked);
        const rowsString = document.getElementsByClassName('MuiTablePagination-displayedRows')[0].innerHTML;
        const [start, end] = rowsString.split('\u2013').map(s => s.trim().replace(" of", ""));
        const [firstRow, lastRow] = [parseInt(start) - 1, parseInt(end) - 1];
        // const pageSize = lastRow - firstRow + 1;

        // if (checked) {
        //     const newChecked = checked;
        //     newChecked.fill(event.target.checked, firstRow, (lastRow + 1));
        //     setChecked(newChecked);
        // }

        for (let i = firstRow; i <= lastRow; ++i) {
            handleMonitorPVChange(pvs[i].name, i)(event);
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
                <Tooltip arrow title={<div>Monitor PV<br />{params.row.name}</div>}>
                    <Checkbox checked={checked[params.row.id]} disabled={params.row.pvStatus === "Inactive" || params.row.recordType === "waveform"} color="primary" onChange={handleMonitorPVChange(params.row.name, params.row.id)} ></Checkbox>
                </Tooltip>
            </div>
        );
    }

    const renderActionsHeader = () => {
        return (
            <div>
                <Typography display="inline" variant="subtitle2">Actions</Typography>
                <Tooltip arrow title="Monitor All PVs">
                    <Checkbox checked={monitorAllChecked} onChange={handleMonitorSelectAll()} sx={{ ml: "1rem" }}></Checkbox>
                </Tooltip>
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
        let textColor = "black";
        if (params.row.name in pvSeverities) {
            if (pvSeverities[params.row.name] === "INVALID") {
                return (
                    <div style={{ color: "#FF00FF" }}>{pvValues[params.row.name]} ({pvSeverities[params.row.name]})</div>
                );
            }
            else if (pvSeverities[params.row.name] === "UNDEFINED") {
                return (
                    <div style={{ color: "#C800C8" }}>{pvSeverities[params.row.name]}</div>
                );
            }
            else if (pvSeverities[params.row.name] === "NONE") {
                textColor = "green";
            }
            else if (pvSeverities[params.row.name] === "MINOR") {
                textColor = "#FF9900";
            }
            else if (pvSeverities[params.row.name] === "MAJOR") {
                textColor = "red";
            }
        }
        if (params.row.name in pvUnits) {
            return (
                <div style={{ color: textColor }}>{`${pvValues[params.row.name]} ${pvUnits[params.row.name]}`}</div>
            );
        }
        else {
            return (
                <div style={{ color: textColor }}>{pvValues[params.row.name]}</div>
            );
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
            // onPaginationModelChange={console.log("Page change")}
            />
            {/* <button onClick={() => toggleColumnVisibility('name', false)}>hide name</button> */}
        </ Fragment>
    );
}

QueryResults.propTypes = propTypes;
export default QueryResults;
