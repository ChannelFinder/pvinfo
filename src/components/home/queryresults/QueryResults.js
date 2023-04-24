import React, { Fragment, useEffect, useState } from 'react';
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
    cfData: PropTypes.array
}

function QueryResults(props) {
    const navigate = useNavigate();
    const [pageSize, setPageSize] = useState(20);
    const [pvs, setPVs] = useState([]);
    const [pvValues, setPVValues] = useState({});
    const [pvSeverities, setPVSeverities] = useState({});
    const [pvUnits, setPVUnits] = useState({});
    const [columnVisibilityModel, setColumnVisibilityModel] = useState();

    const socketUrl = api.PVWS_URL;
    const { sendJsonMessage, lastJsonMessage } = useWebSocket(socketUrl, {
        shouldReconnect: (closeEvent) => true,
    });

    // const omitSmall = JSON.parse(process.env.REACT_APP_OMIT_IN_TABLE_SMALL);
    const omitSmall = process.env.REACT_APP_OMIT_IN_TABLE_SMALL.split(',').map(item => item.trim());

    useEffect(() => {
        if (lastJsonMessage !== null) {
            const message = lastJsonMessage;
            if (message.type === "update") {
                if ("severity" in message) {
                    setPVSeverities(prevState => ({ ...prevState, [message.pv]: message.severity }));
                }
                if ("units" in message) {
                    setPVUnits(prevState => ({ ...prevState, [message.pv]: message.units }));
                }
                if ("text" in message) {
                    setPVValues(prevState => ({ ...prevState, [message.pv]: message.text }));
                    return;
                }
                else if ("value" in message) {
                    setPVValues(prevState => ({ ...prevState, [message.pv]: Number(message.value.toFixed(2)) }));
                    return;
                }
            }
            else {
                console.log("Unexpected message type: ", message);
            }
        }
    }, [lastJsonMessage]);

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

    const handleMonitorPVChange = (pvName) => (event) => {
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
                    <Checkbox disabled={params.row.pvStatus === "Inactive" || params.row.recordType === "waveform"} color="primary" onChange={handleMonitorPVChange(params.row.name)} ></Checkbox>
                </Tooltip>
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
    columns.push({ field: "button", headerName: 'Actions', flex: 9.5, minWidth: 160, maxWidth: 200, disableClickEventBubbling: true, renderCell: renderButtons })

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
    }, [props.cfData]);

    useEffect(() => {
        const handleWindowResize = () => {
            const windowWidth = window.innerWidth;
            if (windowWidth < 600) {
                for (let i = 0; i < omitSmall.length; ++i) {
                    toggleColumnVisibility(omitSmall[i], false)
                }
            } else {
                for (let i = 0; i < omitSmall.length; ++i) {
                    toggleColumnVisibility(omitSmall[i], true)
                }
            }
        };
        handleWindowResize(); // Call the function initially
        window.addEventListener('resize', handleWindowResize);
        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    }, [omitSmall]);

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
                onRowDoubleClick={handleRowDoubleClick}
                components={{ Toolbar: GridToolbar }}
                pageSize={pageSize}
                onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                rowsPerPageOptions={[5, 10, 20, 50, 100]}
                pagination
                columnVisibilityModel={columnVisibilityModel}
                onColumnVisibilityModelChange={(newModel) =>
                    setColumnVisibilityModel(newModel)
                }
            />
            {/* <button onClick={() => toggleColumnVisibility('name', false)}>hide name</button> */}
        </ Fragment>
    );
}

QueryResults.propTypes = propTypes;
export default QueryResults;
