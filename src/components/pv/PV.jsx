import React, { Fragment, useState, useEffect } from "react";
import { useParams } from "react-router";
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Checkbox, Grid, IconButton, Tooltip, Typography, FormControlLabel } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TimelineIcon from '@mui/icons-material/Timeline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import api from "../../api";
import KeyValuePair from "./KeyValuePair";
import ValueTable from "./valuetable";
import OLOGTable from "./ologtable";
import AlarmLogTable from "./alarmlogtable/AlarmLogTable";
import AlarmConfigTable from "./alarmconfigtable/AlarmConfigTable";
import CaputLogTable from "./caputlogtable/CaputLogTable";
import config from "../../config";
import copyToClipboard from "../../clipboard";

function PV(props) {
    let { id } = useParams();
    const [cfPVData, setCFPVData] = useState(null); //object
    const [pvData, setPVData] = useState({});
    const [pvMonitoring, setPVMonitoring] = useState(false);
    const [snapshot, setSnapshot] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const pvHTMLString = encodeURI(`${config.AA_VIEWER}?pv=${id}`);
    const [displayAllVars, setDisplayAllVars] = useState(false);
    const [dataNamesMapping, setDataNamesMapping] = useState({});
    const [dataOrder, setDataOrder] = useState([])
    const [detailsExpanded, setDetailsExpanded] = useState(true);

    let { handleErrorMessage, handleOpenErrorAlert, handleSeverity } = props;
    const omitVariables = config.DETAILS_PAGE_PROPERTIES_BLOCKLIST ? new Set(config.DETAILS_PAGE_PROPERTIES_BLOCKLIST) : new Set();

    const handleCopyPVName = async () => {
        try {
            await copyToClipboard(id);
            props.handleErrorMessage(`Copied ${id} to the clipboard`);
            props.handleSeverity("success");
        } catch (err) {
            console.log(err);
            props.handleErrorMessage("Error: Could not copy the PV name to the clipboard");
            props.handleSeverity("error");
        }
        props.handleOpenErrorAlert(true);
    }

    const handleDetailExpandedChange = () => (event, isExpanded) => {
        setDetailsExpanded(isExpanded);
    }

    // Parse config.DETAILS_PAGE_PROPERTIES to determine what variables to display
    useEffect(() => {
        const dict = {}
        let order = []
        let dataNames = config.DETAILS_PAGE_PROPERTIES ? config.DETAILS_PAGE_PROPERTIES : "";
        dataNames.split(',').forEach((pair) => {
            pair = pair.trim();
            if (pair === "") {
                return;
            }
            if (pair === "*") {
                setDisplayAllVars(true);
                return;
            }
            const [key, value] = pair.split(':').map((s) => s.trim());
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
        if (cfPVData === null || Object.keys(cfPVData).length === 0) {
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
            // exact match searches, so they don't include IOCs or PVs with similar names
            if (prop.name === "alias") {
                pvObject[prop.name].url = `/?alias==${encodeURIComponent(prop.value)}`
            } else if (prop.name === "iocName") {
                pvObject[prop.name].url = `/?iocName==${encodeURIComponent(prop.value)}`
            }
        });
        pvObject.tags = []
        cfPVData.tags.forEach((tag) => {
            pvObject.tags.push(tag.name)
        });
        setPVData(pvObject);
    }, [cfPVData, dataNamesMapping]);

    useEffect(() => {
        if (isLoading || pvData === null) {
            return;
        }
        if (Object.keys(pvData).length !== 0) {
            if (config.DEFAULT_LIVE_MONITORING) {
                setPVMonitoring(true);
                setSnapshot(false);
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
                    <Typography sx={{ fontSize: 18, fontWeight: "medium" }}>Channel Finder Data Loading...</Typography>
                </AccordionSummary>
            </Accordion>
        );
    }
    else if (cfPVData === null) {
        return (
            <Accordion expanded={false}>
                <AccordionSummary>
                    <Typography sx={{ fontSize: 18, fontWeight: "medium" }} color="red">Channel Finder Data is NULL!</Typography>
                </AccordionSummary>
            </Accordion>
        );
    }
    else if (Object.keys(cfPVData).length === 0) {
        return (
            <Accordion expanded={false}>
                <AccordionSummary>
                    <Typography sx={{ fontSize: 18, fontWeight: "medium" }} color="red">PV {id} does not exist</Typography>
                </AccordionSummary>
            </Accordion>
        );
    }
    else {
        return (
            <Fragment>
                <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between" }}>
                    <Box sx={{ display: "flex", alignItems: "center", minWidth: 0 }}>
                        <Typography variant="h3" sx={{ fontSize: { xs: 32, sm: 48 }, overflowWrap: "anywhere" }}>{id}</Typography>
                        <Tooltip arrow title="Copy PV name">
                            <IconButton aria-label="Copy PV name" color="primary" onClick={handleCopyPVName} sx={{ ml: 1 }}>
                                <ContentCopyIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                    {
                        config.USE_AA ? <Button style={{ marginTop: 10, marginBottom: 10 }} target="_blank" href={pvHTMLString} variant="contained" color="secondary" endIcon={<TimelineIcon />} >Plot This PV</Button> : <div></div>
                    }
                </Box>
                {
                    config.USE_PVWS ?
                        <FormControlLabel
                            control={<Checkbox color="primary" checked={pvMonitoring} onChange={handlePVMonitoringChange}></Checkbox>}
                            disabled={!((config.PVWS_IGNORE_CF_PVSTATUS || pvData?.pvStatus?.value === "Active") && (config.PVWS_ALLOW_WAVEFORMS || pvData?.recordType?.value !== "waveform"))}
                            label="Enable Live PV Monitoring" />
                        :
                        null
                }
                <Box sx={{ border: 1, borderColor: '#D1D5DB', borderRadius: 1, boxShadow: 2, mb: 2, overflow: "hidden" }}>
                    <Accordion expanded={detailsExpanded} onChange={handleDetailExpandedChange()}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="details-content" id="details-header">
                            <Typography sx={{ fontSize: 18, fontWeight: "medium" }}>
                                PV Details
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 0 }}>
                            <Box sx={{ borderTop: 1, borderBottom: 1, borderColor: "#D1D5DB", overflow: "hidden" }}>
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
                                                if (!(key in dataNamesMapping) && !(omitVariables.has(key)) && !(key === "tags")) {
                                                    return <KeyValuePair key={i} title={pvData[key].label} value={pvData[key].value} />
                                                }
                                                return (null)
                                            })
                                        ) : null
                                    }
                                </Grid>
                                {pvData.tags?.length > 0 ? (
                                    <Grid container sx={{ mt: -0.1, mb: -0.1, borderTop: 1, borderColor: 'grey.300' }}>
                                        <KeyValuePair key="key" title="Tags" value={pvData.tags} />
                                    </Grid>
                                ) : (null)}
                                <Grid container sx={{ mt: -0.1, mb: -0.1, borderTop: 1, borderColor: 'grey.300' }}>
                                    {
                                        config.USE_PVWS ?
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
                        config.USE_OLOG ? <OLOGTable pvName={id} /> : null
                    }
                    {
                        config.USE_AL ? <AlarmLogTable pvName={id} /> : null
                    }
                    {
                        config.USE_AL ? <AlarmConfigTable pvName={id} /> : null
                    }
                    {
                        config.USE_CAPUTLOG ? <CaputLogTable pvName={id}/> : null
                    }
                </Box>
            </Fragment >
        );
    }
}

export default PV;
