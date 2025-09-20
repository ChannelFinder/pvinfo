import React, { Fragment, useCallback, useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import Service from "./service";
import api from "../../api";
import { Box, Grid, Typography } from "@mui/material";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { Table, TableBody, TableCell, TableRow } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import config from "../../config";

function Services() {
    const [pvCount, setPVCount] = useState(null);
    const [cfiData, setCFIData] = useState({});
    const [cfConnected, setCFConnected] = useState(false);
    const [aliData, setALIData] = useState({});
    const [alConnected, setALConnected] = useState(false);
    const [oliData, setOLIData] = useState({});
    const [ologConnected, setOLOGConnected] = useState(false);
    const [pvwsInfo, setPVWSInfo] = useState({});
    const [pvwsSummary, setPVWSSummary] = useState(false);
    const [pvsMonitored, setPVsMonitored] = useState(0);
    const [pvwsConnected, setPVWSConnected] = useState(false);
    const [caputLogConnected, setCaputLogConnected] = useState(false);
    const [caputLogData, setCaputLogData] = useState(false);

    const { sendJsonMessage, lastJsonMessage } = useWebSocket(config.PVWS_URL, {
        shouldReconnect: (closeEvent) => true
    })

    const fetchData = (apiCall, setData, setConnected, servName, parameters = null) => {
        apiCall(parameters)
            .then((data) => {
                if (setConnected) setConnected(true);
                if (data === null) {
                    console.log(`Null data from ${servName}`);
                }
                else {
                    setData(data);
                }
            })
            .catch((err) => {
                if (setConnected) setConnected(false);
                console.log(`Error in ${servName} Fetch`);
                console.log(err);
            })
    }

    const queryCount = useCallback((parameters) => {
        fetchData(api.COUNT_QUERY, setPVCount, null, "Count Endpoint", parameters)
    }, [setPVCount]);

    const queryCF = useCallback(() => {
        fetchData(api.CFI_QUERY, setCFIData, setCFConnected, "CF Info");
    }, [setCFIData, setCFConnected]);

    const queryAL = useCallback(() => {
        fetchData(api.ALI_QUERY, setALIData, setALConnected, "AL Info");
    }, [setALIData, setALConnected]);

    const queryOLOG = useCallback(() => {
        fetchData(api.OLI_QUERY, setOLIData, setOLOGConnected, "OLOG Info");
    }, [setOLIData, setOLOGConnected]);

    const queryPVWSInfo = useCallback(() => {
        fetchData(api.PVWSI_QUERY, setPVWSInfo, null, "PVWS Info", "info");
    }, [setPVWSInfo]);

    const queryPVWSSummary = useCallback(() => {
        fetchData(api.PVWSI_QUERY, setPVWSSummary, null, "PVWS Summary", "summary");
    }, [setPVWSSummary]);

    const queryCaputLog = useCallback(() => {
        fetchData(api.CAPUTLOG_QUERY, setCaputLogData, setCaputLogConnected, "CaputLog Info");
    }, [setCaputLogData, setCaputLogConnected]);

    useEffect(() => {
        queryCount({});
        queryCF();
        queryAL();
        queryOLOG();
        queryCaputLog();
        queryPVWSInfo();
        queryPVWSSummary()
        sendJsonMessage({ "type": "echo", "body": "Hello, PVWS!" })
    }, [queryCount, queryCF, queryAL, queryOLOG, queryCaputLog, queryPVWSInfo, queryPVWSSummary, sendJsonMessage])

    useEffect(() => {
        if (lastJsonMessage !== null) {
            if (lastJsonMessage.type === "echo" && lastJsonMessage.body === "Hello, PVWS!") {
                setPVWSConnected(true);
            } else {
                setPVWSConnected(false);
            }
        } else {
            setPVWSConnected(false);
        }
    }, [lastJsonMessage])

    useEffect(() => {
        const sockets = pvwsSummary?.sockets;
        let count = 0;
        if (sockets?.length > 0) {
            for (let i = 0; i < sockets.length; ++i) {
                count = count + sockets[i].pvs
            }
            setPVsMonitored(count);
        }
    }, [pvwsSummary])

    return (
        <Fragment>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Box sx={{ mb: 2, display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "start", sm: "start" }, justifyContent: "space-between" }}>
                    <Typography variant="h4" sx={{ fontWeight: "medium", mb: { xs: 1, sm: 0 } }}>Services</Typography>
                    <Box>
                        <Typography variant="body1"><Box component="span" sx={{ fontWeight: "medium" }}>PV Info Version:</Box> {config.VERSION}</Typography>
                        <Typography variant="body1"><Box component="span" sx={{ fontWeight: "medium" }}>Commit Hash:</Box> {config.GIT_SHORT_HASH}</Typography>
                        <Typography variant="body1"><Box component="span" sx={{ fontWeight: "medium" }}>Commit Date:</Box> {config.GIT_COMMIT_DATE}</Typography>
                    </Box>
                </Box>
                <Box sx={{ overflow: "auto", border: 1, borderColor: "#D1D5DB", borderRadius: 1, pt: 2, pb: 3, px: 1.5 }}>
                    <Grid container spacing={3} sx={{ display: "flex", flexDirection: "column" }}>
                        <Service servName="Channel Finder" connected={cfConnected}
                            data={{
                                "Version": cfiData?.version,
                                "Elastic Status": cfiData?.elastic?.status,
                                "Elastic Version": cfiData?.elastic?.version,
                                "Total PVs": pvCount
                            }}
                        />
                        {
                            config.USE_AL ? (
                                <Service servName="Alarm Logger" connected={alConnected}
                                    data={{
                                        "Elastic Status": aliData?.elastic?.status,
                                        "Elastic Version": aliData?.elastic?.version
                                    }}
                                />
                            ) : null
                        }
                        {
                            config.USE_OLOG ? (
                                <Service servName="Online Log" connected={ologConnected}
                                    data={{
                                        "Elastic Status": oliData?.elastic?.status,
                                        "Elastic Version": oliData?.elastic?.version
                                    }}
                                />
                            ) : null
                        }
                        {
                            config.USE_PVWS ? (
                                <Service servName="PV Web Socket" connected={pvwsConnected} sockets={pvwsSummary?.sockets}
                                    data={{
                                        "Start Time": pvwsInfo?.start_time,
                                        "JRE": pvwsInfo?.jre,
                                        "Total Clients": pvwsSummary?.sockets?.length,
                                        "Currently Monitored PVs": pvsMonitored
                                    }}
                                />
                            ) : null
                        }
                        {
                            config.USE_CAPUTLOG ? (
                                <Service servName="Caput Log" connected={caputLogConnected}
                                    data={
                                        config.USE_CAPUT_API_PROXY_CONNNECTOR
                                        ? {
                                            "Elastic Status": caputLogData?.elasticsearch?.connection,
                                            "Elastic Health": caputLogData?.elasticsearch?.health?.status,
                                            "Elastic Version": caputLogData?.elasticsearch?.info?.version?.number,
                                            }
                                        : {
                                            "Elastic Status": caputLogData?.elastic?.status,
                                            "Elastic Version": caputLogData?.elastic?.version,
                                            }
                                    }
                                />
                            ) : null
                        }
                    </Grid>
                </Box>
            </Box>
            <Accordion sx={{ border: 1, borderColor: '#D1D5DB', borderRadius: 1, mt: 4, mb: 2, overflow: "hidden" }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="preferences-content" id="preferences-header">
                    <Typography sx={{ fontSize: 18, fontWeight: "medium" }}>Preference Settings</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 1, pb: 1 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        <Typography variant="body2"><strong>PV Web Socket:</strong> {config.USE_PVWS ? "Enabled" : "Disabled"}</Typography>
                        <Typography variant="body2"><strong>Archiver:</strong> {config.USE_AA ? "Enabled" : "Disabled"}</Typography>
                        <Typography variant="body2"><strong>OLOG:</strong> {config.USE_OLOG ? "Enabled" : "Disabled"}</Typography>
                        <Typography variant="body2"><strong>Alarm Logger:</strong> {config.USE_AL ? "Enabled" : "Disabled"}</Typography>
                        <Typography variant="body2"><strong>CaputLog:</strong> {config.USE_CAPUTLOG ? "Enabled" : "Disabled"}</Typography>
                        <Accordion sx={{ boxShadow: "none", border: "1px solid #ddd", mt: 1, '&:before': { display: 'none' } }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 18 }} />}
                                sx={{ minHeight: "32px !important", '& .MuiAccordionSummary-content': { margin: 0 } }}
                            >
                                <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>Page Settings</Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ py: 1 }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>Home Page</Typography>
                                        <Table size="small">
                                            <TableBody>
                                                <TableRow><TableCell>Channel Finder Max Results</TableCell><TableCell>{config.CF_MAX_RESULTS ?? "No Limit"}</TableCell></TableRow>
                                                <TableRow><TableCell>Record Type</TableCell><TableCell>{config.CF_RECORD_TYPE ? "Enabled" : "Disabled"}</TableCell></TableRow>
                                                <TableRow><TableCell>Record Description</TableCell><TableCell>{config.CF_RECORD_DESC ? "Enabled" : "Disabled"}</TableCell></TableRow>
                                                <TableRow><TableCell>PV Alias</TableCell><TableCell>{config.CF_RECORD_ALIAS ? "Enabled" : "Disabled"}</TableCell></TableRow>
                                                <TableRow><TableCell>Extra Property</TableCell><TableCell>{config.EXTRA_PROP || "None"}</TableCell></TableRow>
                                                <TableRow><TableCell>Second Extra Property</TableCell><TableCell>{config.SECOND_EXTRA_PROP || "None"}</TableCell></TableRow>
                                                <TableRow><TableCell>PV Results Table Size</TableCell><TableCell>{config.RESULTS_TABLE_SIZE}</TableCell></TableRow>
                                                <TableRow><TableCell>PV Results Table Density</TableCell><TableCell>{config.RESULTS_TABLE_DENSITY}</TableCell></TableRow>
                                                <TableRow><TableCell>Show Disconnected in Live Value Box</TableCell><TableCell>{config.SHOW_DISCONNECTED ? "Yes" : "No"}</TableCell></TableRow>
                                                <TableRow><TableCell>Monitor All Warning Threshold</TableCell><TableCell>{config.LIVE_MONITOR_WARN}</TableCell></TableRow>
                                                <TableRow><TableCell>Monitor All Maximum</TableCell><TableCell>{config.LIVE_MONITOR_MAX}</TableCell></TableRow>
                                            </TableBody>
                                        </Table>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>PV Details Page</Typography>
                                        <Table size="small">
                                            <TableBody>
                                                <TableRow><TableCell>Enable Live Monitoring by Default</TableCell><TableCell>{config.DEFAULT_LIVE_MONITORING ? "Yes" : "No"}</TableCell></TableRow>
                                                <TableRow><TableCell>Ignore Channel Finder PV Status for Monitoring</TableCell><TableCell>{config.PVWS_IGNORE_CF_PVSTATUS ? "Yes" : "No"}</TableCell></TableRow>
                                                <TableRow><TableCell>Waveform Monitoring</TableCell><TableCell>{config.PVWS_ALLOW_WAVEFORMS ? "Enabled" : "Disabled"}</TableCell></TableRow>
                                                <TableRow><TableCell>Treat Char Waveforms As Strings</TableCell><TableCell>{config.PVWS_TREAT_BYTE_ARRAY_AS_STRING ? "Yes" : "No"}</TableCell></TableRow>
                                                <TableRow><TableCell>Number of Days to Include in Online Log Search</TableCell><TableCell>{config.OLOG_START_TIME_DAYS ?? "No Limit"}</TableCell></TableRow>
                                                <TableRow><TableCell>Online Log Max Results</TableCell><TableCell>{config.OLOG_MAX_RESULTS ?? "No Limit"}</TableCell></TableRow>
                                                <TableRow><TableCell>Number of Days to Include in Alarm Log Search</TableCell><TableCell>{config.AL_START_TIME_DAYS ?? "No Limit"}</TableCell></TableRow>
                                                <TableRow><TableCell>Alarm Log Max Results</TableCell><TableCell>{config.AL_MAX_RESULTS ?? "No Limit"}</TableCell></TableRow>
                                            </TableBody>
                                        </Table>
                                    </Grid>
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    </Box>
                </AccordionDetails>
            </Accordion>
        </Fragment >
    )
}

export default Services;
