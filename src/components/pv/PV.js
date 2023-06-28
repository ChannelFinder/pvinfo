import React, { Fragment, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Checkbox, Grid, Typography, FormControlLabel } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TimelineIcon from '@mui/icons-material/Timeline';
import api from "../../api";
import KeyValuePair from "./KeyValuePair";
import ValueTable from "./valuetable";
import OLOGTable from "./ologtable";
import AlarmLogTable from "./alarmlogtable/AlarmLogTable";
import PropTypes from "prop-types";

const propTypes = {
    handleOpenErrorAlert: PropTypes.func,
    handleErrorMessage: PropTypes.func,
    hanleSeverity: PropTypes.func
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
    const [detailsExpanded, setDetailsExpanded] = useState(true);

    let { handleErrorMessage, handleOpenErrorAlert, handleSeverity } = props;
    const omitVariables = process.env.REACT_APP_DETAILS_PAGE_PROPERTIES_BLOCKLIST ? new Set(process.env.REACT_APP_DETAILS_PAGE_PROPERTIES_BLOCKLIST.split(',').map(item => item.trim())) : new Set();

    const handleDetailExpandedChange = () => (event, isExpanded) => {
        setDetailsExpanded(isExpanded);
    }

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
                handleSeverity("error");
                handleOpenErrorAlert(true);
                setCFPVData(null);
                setIsLoading(false);
            })
    }, [id, handleErrorMessage, handleOpenErrorAlert, handleSeverity]);

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
        if (isLoading || pvData === null) {
            return;
        }
        if (Object.keys(pvData).length !== 0) {
            if (process.env.REACT_APP_DEFAULT_LIVE_MONITORING === "true") {
                setPVMonitoring(true);
            } else {
                setSnapshot(true);
            }
        }
    }, [pvData, isLoading])

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
            <Accordion expanded={false}>
                <AccordionSummary>
                    <Typography variant="subtitle2">Channel Finder Data Loading...</Typography>
                </AccordionSummary>
            </Accordion>
        );
    }
    else if (cfPVData === null) {
        return (
            <Accordion expanded={false}>
                <AccordionSummary>
                    <Typography variant="subtitle2" color="red">Channel Finder Data is NULL!</Typography>
                </AccordionSummary>
            </Accordion>
        );
    }
    else if (cfPVData === {} || Object.keys(cfPVData).length === 0) {
        return (
            <Accordion expanded={false}>
                <AccordionSummary>
                    <Typography variant="subtitle2" color="red">PV {id} does not exist</Typography>
                </AccordionSummary>
            </Accordion>
        );
    }
    else {
        return (
            <Fragment>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="h3" sx={{ fontSize: { xs: 32, sm: 48 } }}>{id}</Typography>
                    {
                        process.env.REACT_APP_USE_AA === "true" ? <Button style={{ marginTop: 10, marginBottom: 10 }} target="_blank" href={pvHTMLString} variant="contained" color="secondary" endIcon={<TimelineIcon />} >Plot This PV</Button> : <div></div>
                    }
                </Box>
                {
                    process.env.REACT_APP_USE_PVWS === "true" ? <FormControlLabel control={<Checkbox color="primary" checked={pvMonitoring} onChange={handlePVMonitoringChange}></Checkbox>} label="Enable Live PV Monitoring" /> : <div></div>
                }
                <Box sx={{ border: 1, borderColor: 'primary.main', borderRadius: 1 }}>
                    <Accordion expanded={detailsExpanded} onChange={handleDetailExpandedChange()}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="details-content" id="details-header">
                            <Typography variant="subtitle2">
                                PV Details
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box sx={{ border: 1, borderColor: 'primary.main', borderRadius: 1, overflow: "hidden" }}>
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
                                                return (null)
                                            })
                                        ) : null
                                    }
                                </Grid>
                                <Grid container sx={{ mt: -0.1, borderTop: 1, borderColor: 'grey.300' }}>
                                    {
                                        process.env.REACT_APP_USE_PVWS === "true" ?
                                            <ValueTable pvData={pvData} pvMonitoring={pvMonitoring}
                                                isLoading={isLoading} pvName={id} snapshot={snapshot}
                                                handleOpenErrorAlert={props.handleOpenErrorAlert} handleErrorMessage={props.handleErrorMessage} handleSeverity={props.handleSeverity} />
                                            : null
                                    }
                                </Grid>
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                    {
                        process.env.REACT_APP_USE_OLOG === "true" ? <OLOGTable pvName={id} /> : <br />
                    }
                    {
                        process.env.REACT_APP_USE_AL === "true" ? <AlarmLogTable pvName={id} /> : <br />
                    }
                </Box>
            </Fragment >
        );
    }
}

PV.propTypes = propTypes;
export default PV;
