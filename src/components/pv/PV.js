import React, { Fragment, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, Button, Checkbox, Grid, Typography, FormControlLabel } from "@mui/material";
import TimelineIcon from '@mui/icons-material/Timeline';
import api from "../../api";
import KeyValuePair from "./KeyValuePair";
import OLOGTable from "./ologtable";
import ValueTable from "./valuetable";
import PropTypes from "prop-types";

const propTypes = {
    handleOpenErrorAlert: PropTypes.func,
    handleErrorMessage: PropTypes.func,
}

function PV(props) {
    let { id } = useParams();
    const [cfPVData, setCFPVData] = useState(null); //object
    const [pvData, setPVData] = useState({});
    const [pvMonitoring, setPVMonitoring] = useState(false);
    const [snapshot, setSnapshot] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const pvHTMLString = encodeURI(`${api.AA_VIEWER}?pv=${id}`);
    const [displayAllVars, setDisplayAllVars] = useState(false);
    const [dataNamesMapping, setDataNamesMapping] = useState({});
    const [dataOrder, setDataOrder] = useState([])

    let { handleErrorMessage, handleOpenErrorAlert } = props;
    const omitVariables = process.env.REACT_APP_DETAILS_PAGE_PROPERTIES_BLOCKLIST ? new Set(process.env.REACT_APP_DETAILS_PAGE_PROPERTIES_BLOCKLIST.split(',').map(item => item.trim())) : new Set();

    // Parse environment variable REACT_APP_DETAILS_PAGE_PROPERTIES to determine what variables to display
    useEffect(() => {
        const dict = {}
        let order = []
        let dataNames = process.env.REACT_APP_DETAILS_PAGE_PROPERTIES ? process.env.REACT_APP_DETAILS_PAGE_PROPERTIES : "";
        dataNames.split(',').forEach((pair) => {
            if (pair === "*") {
                setDisplayAllVars(true);
                return;
            }
            const [key, value] = pair.split(':');
            dict[key] = value
            order.push(key);
        })
        setDataNamesMapping(dict);
        setDataOrder(order);
    }, []);

    // Get channel finder data for this PV
    useEffect(() => {
        // equal sign is important since CF_QUERY adds asterisks by default to start/end of string
        api.CF_QUERY({ "pvName": `=${id}` })
            .then((data) => {
                if (data === null) {
                    console.log("Null data from channel finder");
                    setCFPVData(null);
                    setIsLoading(false);
                }
                else if (data.length === 0) {
                    setCFPVData({});
                    setIsLoading(false);
                }
                else {
                    setCFPVData(data[0]);
                    setIsLoading(false);
                }
            })
            .catch((err) => {
                console.log(err);
                handleErrorMessage("Error in EPICS Channel Finder query");
                handleOpenErrorAlert(true);
                setCFPVData(null);
                setIsLoading(false);
            })
    }, [id, handleErrorMessage, handleOpenErrorAlert]);

    // transform PV data from CF into JS object. This should be moved to api.js!
    useEffect(() => {
        if (cfPVData === null || cfPVData === {} || Object.keys(cfPVData).length === 0) {
            return;
        }
        let pvObject = {};
        pvObject.pvName = {};
        pvObject.pvName.label = 'PV Name'
        pvObject.pvName.value = cfPVData.name;
        pvObject.owner = {}
        pvObject.owner.label = 'Owner'
        pvObject.owner.value = cfPVData.owner;
        cfPVData.properties.forEach((prop) => {
            pvObject[prop.name] = {}
            pvObject[prop.name].label = dataNamesMapping[prop.name] ? dataNamesMapping[prop.name] : prop.name;
            pvObject[prop.name].value = prop.value
            if (prop.name === "alias") {
                pvObject[prop.name].url = `/?alias=${prop.value}`
            } else if (prop.name === "iocName") {
                pvObject[prop.name].url = `/?iocName=${prop.value}`
            }
        });
        setPVData(pvObject);
    }, [cfPVData, dataNamesMapping]);

    useEffect(() => {
        if (Object.keys(pvData).length !== 0) {
            if (process.env.REACT_APP_DEFAULT_LIVE_MONITORING === "true") {
                setPVMonitoring(true);
            } else {
                setSnapshot(true);
            }
        }
    }, [pvData])

    const handlePVMonitoringChange = (e) => {
        if (e.target.checked) {
            setPVMonitoring(true);
            if (snapshot) setSnapshot(false);
        }
        else {
            setPVMonitoring(false);
        }
    }

    if (isLoading) {
        return (
            <Typography variant="h6">Channel Finder Data Loading...</Typography>
        );
    }
    else if (cfPVData === null) {
        return (
            <Typography variant="h6">Channel Finder Data is NULL!</Typography>
        );
    }
    else if (cfPVData === {} || Object.keys(cfPVData).length === 0) {
        return (
            <Typography variant="h6">PV {id} does not exist</Typography>
        );
    }
    else {
        return (
            <Fragment>
                <Typography variant="h3" sx={{ fontSize: { xs: 32, sm: 48 } }}>{id}</Typography>
                {
                    process.env.REACT_APP_USE_AA === "true" ? <Button style={{ marginTop: 10, marginBottom: 10 }} target="_blank" href={pvHTMLString} variant="contained" color="secondary" endIcon={<TimelineIcon />} >Plot This PV</Button> : <div></div>
                }
                <br />
                {
                    process.env.REACT_APP_USE_PVWS === "true" ? <FormControlLabel control={<Checkbox color="primary" checked={pvMonitoring} onChange={handlePVMonitoringChange}></Checkbox>} label="Enable Live PV Monitoring" /> : <div></div>
                }
                <Box sx={{ border: 5, borderColor: 'primary.main' }}>
                    <Grid container>
                        {
                            dataOrder.map((item, i) => {
                                return (
                                    <KeyValuePair key={i} title={dataNamesMapping[item]} value={pvData[item] ? pvData[item].value : ''} url={pvData[item] ? (pvData[item].url ? pvData[item].url : null) : null} />
                                )
                            })
                        }
                        {
                            displayAllVars ? (
                                Object.keys(pvData).map((key, i) => {
                                    if (!(key in dataNamesMapping) && !(omitVariables.has(key))) {
                                        return <KeyValuePair key={i} title={pvData[key].label} value={pvData[key].value} />
                                    }
                                    return (
                                        null
                                    )
                                })
                            ) : null
                        }
                        {
                            process.env.REACT_APP_USE_PVWS === "true" ?
                                <ValueTable pvData={pvData} pvMonitoring={pvMonitoring}
                                    isLoading={isLoading} pvName={id} snapshot={snapshot}
                                    handleOpenErrorAlert={props.handleOpenErrorAlert} handleErrorMessage={props.handleErrorMessage} />
                                : null
                        }
                    </Grid>
                </Box>
                {
                    process.env.REACT_APP_USE_OLOG === "true" ? <OLOGTable pvName={id} /> : <br />
                }
            </Fragment>
        );
    }
}

PV.propTypes = propTypes;
export default PV;
