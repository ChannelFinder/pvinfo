import React, { Fragment, useState, useEffect } from "react";
import { Typography } from "@mui/material";
import useWebSocket from 'react-use-websocket';
import api from "../../../api";
import PropTypes from "prop-types";
import KeyValuePair from "../KeyValuePair";


const propTypes = {
    pvMonitoring: PropTypes.bool,
    snapshot: PropTypes.bool,
    pvData: PropTypes.object,
    isLoading: PropTypes.bool,
    pvName: PropTypes.string,
    handleOpenErrorAlert: PropTypes.func,
    handleErrorMessage: PropTypes.func,
    handleSeverity: PropTypes.func
}

function ValueTable(props) {
    const [pvValue, setPVValue] = useState(null);
    const [pvUnits, setPVUnits] = useState(null);
    const [pvSeverity, setPVSeverity] = useState(null);
    const [pvPrecision, setPVPrecision] = useState(null);
    const [pvMin, setPVMin] = useState(null);
    const [pvMax, setPVMax] = useState(null);
    const [pvAlarmLow, setPVAlarmLow] = useState(null);
    const [pvAlarmHigh, setPVAlarmHigh] = useState(null);
    const [pvWarnLow, setPVWarnLow] = useState(null);
    const [pvWarnHigh, setPVWarnHigh] = useState(null);
    const [pvTimestamp, setPVTimestamp] = useState(null);
    const [alarmColor, setAlarmColor] = useState("");
    const [snapshot, setSnapshot] = useState(props.snapshot);

    const socketUrl = api.PVWS_URL;
    const { sendJsonMessage, lastJsonMessage } = useWebSocket(socketUrl, {
        onClose: () => {
            if (props.snapshot && !props.pvMonitoring) return;
            setPVValue(null);
            setPVSeverity(null);
            setPVTimestamp(null);
        },
        shouldReconnect: (closeEvent) => true,
    });

    let { handleErrorMessage, handleOpenErrorAlert, handleSeverity } = props;

    useEffect(() => {
        setSnapshot(props.snapshot)
    }, [props.snapshot])

    useEffect(() => {
        if (props.pvMonitoring || snapshot) {
            if (props.pvData === null || props.isLoading) {
                return;
            }
            else if (props.pvData.pvStatus.value === "Inactive") {
                handleErrorMessage("Can't show live PV values - PV is in Inactive state!");
                handleSeverity("error");
                handleOpenErrorAlert(true);
            }
            else if (props.pvData.recordType.value === "waveform") {
                handleErrorMessage("Can't show live PV values - Waveform record type not supported");
                handleSeverity("error");
                handleOpenErrorAlert(true);
            }
            else if (props.pvData.pvStatus.value === "Active") {
                sendJsonMessage({ "type": "subscribe", "pvs": [props.pvName] });
            }
        }
        else {
            sendJsonMessage({ "type": "clear", "pvs": [props.pvName] });
            if (props.snapshot && !props.pvMonitoring) return;
            setPVValue(null);
            setPVSeverity(null);
            setPVTimestamp(null);
        }
    }, [props.pvMonitoring, props.snapshot, snapshot, props.isLoading, props.pvData, props.pvName, handleErrorMessage, handleOpenErrorAlert, sendJsonMessage, handleSeverity]);

    useEffect(() => {
        if (lastJsonMessage !== null) {
            if (!props.pvMonitoring && !snapshot) return;
            const message = lastJsonMessage;
            if (message.type === "update") {
                // pv, severity, value, text, units, precision, labels
                if ("units" in message) {
                    setPVUnits(message.units);
                }
                if ("min" in message) {
                    setPVMin(message.min);
                }
                if ("max" in message) {
                    setPVMax(message.max);
                }
                if ("alarm_low" in message) {
                    setPVAlarmLow(message.alarm_low);
                }
                if ("alarm_high" in message) {
                    setPVAlarmHigh(message.alarm_high);
                }
                if ("warn_low" in message) {
                    setPVWarnLow(message.warn_low);
                }
                if ("warn_high" in message) {
                    setPVWarnHigh(message.warn_high);
                }
                if ("precision" in message) {
                    setPVPrecision(message.precision);
                }
                if ("seconds" in message) {
                    let timestamp = "";
                    if ("nanos" in message) {
                        timestamp = new Date(message.seconds * 1000 + (message.nanos * 1e-6)).toLocaleString();
                    }
                    else {
                        timestamp = new Date(message.seconds * 1000).toLocaleString();
                    }
                    if (!props.snapshot) {
                        setPVTimestamp(timestamp);
                    }
                }
                else {
                    setPVTimestamp(null);
                }
                if ("severity" in message && props.pvMonitoring) {
                    if (message.severity === "NONE") {
                        setAlarmColor("green");
                    }
                    else if (message.severity === "INVALID") {
                        setAlarmColor("#FF00FF");
                    }
                    else if (message.severity === "UNDEFINED") {
                        setAlarmColor("#C800C8");
                    }
                    else if (message.severity === "MAJOR") {
                        setAlarmColor("red");
                    }
                    else if (message.severity === "MINOR") {
                        setAlarmColor("#FF9900");
                    }
                    if (!props.snapshot) {
                        setPVSeverity(message.severity);
                    }
                }
                if ("text" in message) {
                    if (!props.snapshot) {
                        setPVValue(message.text);
                    }
                    setSnapshot(false);

                }
                else if ("value" in message) {
                    if (!props.snapshot) {
                        // if precision was explicitly set (and badly assume 0 is not explicit) then use that
                        if (pvPrecision !== null && pvPrecision !== "" && !isNaN(pvPrecision) && pvPrecision !== 0) {
                            setPVValue((Number(message.value) >= 0.01 || Number(message.value) === 0) ? Number(message.value.toFixed(Number(pvPrecision))) : Number(message.value).toExponential(Number(pvPrecision)));
                        }
                        // otherwise show full value
                        else {
                            setPVValue((Number(message.value) >= 0.01 || Number(message.value) === 0) ? Number(message.value) : Number(message.value).toExponential());
                        }
                    }
                    setSnapshot(false);
                }
            }
            else {
                console.log("Unexpected message type: ", message);
            }
        }
    }, [lastJsonMessage, props.pvMonitoring, props.snapshot, snapshot, pvPrecision]);

    if (props.isLoading) {
        return (
            <Typography variant="h6">OLOG Data Loading...</Typography>
        );
    }
    else {
        return (
            <Fragment>
                <KeyValuePair title="Value" value={pvValue} textColor={alarmColor} />
                <KeyValuePair title="PV Timestamp" value={pvTimestamp} textColor={alarmColor} />
                <KeyValuePair title="Alarm State" value={pvSeverity} textColor={alarmColor} />
                <KeyValuePair title="Units" value={pvUnits} />
                <KeyValuePair title="Alam Low Value" value={pvAlarmLow} />
                <KeyValuePair title="Alarm High Value" value={pvAlarmHigh} />
                <KeyValuePair title="Warn Low Value" value={pvWarnLow} />
                <KeyValuePair title="Warn High Value" value={pvWarnHigh} />
                <KeyValuePair title="Lower Limit" value={pvMin} />
                <KeyValuePair title="Upper Limit" value={pvMax} />
                <KeyValuePair title="Precision" value={pvPrecision} />
            </Fragment>
        );
    }
}

ValueTable.propTypes = propTypes;
export default ValueTable;
