import React, { Fragment, useCallback, useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import Service from "./service";
import api from "../../api";
import { Box, Grid, Typography } from "@mui/material";

function Services() {
    const [pvCount, setPVCount] = useState(null);
    const [cfiData, setCFIData] = useState({});
    const [cfConnected, setCFConnected] = useState(false);
    const [aliData, setALIData] = useState({});
    const [alConnected, setALConnected] = useState(false);
    const [oliData, setOLIData] = useState({});
    const [ologConnected, setOLOGConnected] = useState(false);
    const [pvwsiData, setPVWSIData] = useState({});
    const [pvwsConnected, setPVWSConnected] = useState(false);

    const { sendJsonMessage, lastJsonMessage } = useWebSocket(api.PVWS_URL, {
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
    }, [setPVCount])

    const queryCF = useCallback(() => {
        fetchData(api.CFI_QUERY, setCFIData, setCFConnected, "CF Info");
    }, [setCFIData, setCFConnected]);

    const queryAL = useCallback(() => {
        fetchData(api.ALI_QUERY, setALIData, setALConnected, "AL Info");
    }, [setALIData, setALConnected]);

    const queryOLOG = useCallback(() => {
        fetchData(api.OLI_QUERY, setOLIData, setOLOGConnected, "OLOG Info");
    }, [setOLIData, setOLOGConnected]);

    const queryPVWS = useCallback(() => {
        fetchData(api.PVWSI_QUERY, setPVWSIData, null, "PVWS Info");
    }, [setPVWSIData, setPVWSConnected]);

    useEffect(() => {
        queryCount({});
        queryCF();
        queryAL();
        queryOLOG();
        queryPVWS();
        sendJsonMessage({ "type": "echo", "body": "Hello, PVWS!" })
    }, [queryCount, queryCF, queryAL, queryOLOG, queryPVWS, sendJsonMessage])

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

    return (
        <Fragment>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography variant="h4" sx={{ mb: 4, fontWeight: "medium" }}>Services</Typography>
                <Box sx={{ border: 1, borderColor: "#D1D5DB", borderRadius: 1, pt: 2, pb: 3, px: 1.5 }}>
                    <Grid container spacing={3} sx={{ display: "flex", flexDirection: "column" }}>
                        <Service servName="Channel Finder" connected={cfConnected}
                            data={{
                                "Version": cfiData?.version,
                                "Elastic Status": cfiData?.elastic?.status,
                                "Elastic Version": cfiData?.elastic?.version,
                                "Total PVs": pvCount
                            }}
                        />
                        <Service servName="Alarm Logger" connected={alConnected}
                            data={{
                                "Elastic Status": aliData?.elastic?.status,
                                "Elastic Version": aliData?.elastic?.version
                            }}
                        />
                        <Service servName="Online Log" connected={ologConnected}
                            data={{
                                "Elastic Status": oliData?.elastic?.status,
                                "Elastic Version": oliData?.elastic?.version
                            }}
                        />
                        <Service servName="PV Web Socket" connected={pvwsConnected}
                            data={{
                                "Start Time": pvwsiData?.start_time,
                                "JRE": pvwsiData?.jre
                            }}
                        />
                    </Grid>
                </Box>
            </Box>
        </Fragment >
    )
}

export default Services;
