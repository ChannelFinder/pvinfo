import React, { Fragment, useState, useEffect } from "react";
import { Typography } from "@mui/material";
import useWebSocket from 'react-use-websocket';
import api from "../../../api";
import colors from "../../../colors";
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
    const [snapshot, setSnapshot] = useState(true);
    const [subscribed, setSubscribed] = useState(false);

    const { sendJsonMessage, lastJsonMessage } = useWebSocket(api.PVWS_URL, {
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
            if (props.pvData === null || Object.keys(props.pvData).length === 0 || props.isLoading) {
                return;
            }
            else if (props.pvData.pvStatus?.value === "Inactive") {
                handleErrorMessage("Can't show live PV values - PV is in Inactive state");
                handleSeverity("warning");
                handleOpenErrorAlert(true);
            }
            else if (import.meta.env.REACT_APP_PVWS_ALLOW_WAVEFORMS !== "true" && props.pvData.recordType?.value === "waveform") {
                handleErrorMessage("Can't show live PV values - Waveform record type not supported");
                handleSeverity("warning");
                handleOpenErrorAlert(true);
            }
            else if (props.pvData.pvStatus?.value === "Active") {
                if (!subscribed) {
                    sendJsonMessage({ "type": "subscribe", "pvs": [props.pvName] });
                    setSubscribed(true);
                }
            }
        }
        else {
            if (subscribed) {
                sendJsonMessage({ "type": "clear", "pvs": [props.pvName] });
                setSubscribed(false);
            }
            setPVValue(null);
            setPVSeverity(null);
            setPVTimestamp(null);
        }
    }, [props.pvMonitoring, snapshot, props.isLoading, props.pvData, props.pvName, handleErrorMessage, handleOpenErrorAlert, subscribed, sendJsonMessage, handleSeverity]);

    useEffect(() => {
        if (!props.pvMonitoring && !snapshot) {
            return;
        }
        console.log("WebSocket message received:", lastJsonMessage);
        const message = api.PARSE_WEBSOCKET_MSG(lastJsonMessage);
        if (message === null) {
            return; // unable to parse, could be invalid message type, no PV name, null lastJsonMessage
        }
        console.log("Parsed WebSocket message:", message);
        if ("units" in message) setPVUnits(message.units);
        if ("min" in message) setPVMin(message.min);
        if ("max" in message) setPVMax(message.max);
        if ("alarm_low" in message) setPVAlarmLow(message.alarm_low);
        if ("alarm_high" in message) setPVAlarmHigh(message.alarm_high);
        if ("warn_low" in message) setPVWarnLow(message.warn_low);
        if ("warn_high" in message) setPVWarnHigh(message.warn_high);
        if ("precision" in message) setPVPrecision(message.precision);
        if ("seconds" in message) {
            if (!props.snapshot) {
                if (pvSeverity === "INVALID" || message.severity === "INVALID") {
                    setPVTimestamp(message.timestamp);
                } else if (message.seconds !== 631152000) {
                    setPVTimestamp(message.timestamp);
                }
            }
        } else {
            setPVTimestamp(null);
        }
        if ("severity" in message && props.pvMonitoring) {
            if (message.severity === "NONE") {
                setAlarmColor(colors.SEV_COLORS["OK"]);
            } else if (message.severity !== "") {
                message.severity in colors.SEV_COLORS ? setAlarmColor(colors.SEV_COLORS[message.severity]) : setAlarmColor("#000");
            }
            if (!props.snapshot) {
                setPVSeverity(message.severity);
            }
        }
        if (message.pv_value === null) {
            return; // only if no text, b64dbl, b64int, ..., value property found
        }
        if (!props.snapshot) {
            setPVValue(message.pv_value);
        }
        if (snapshot) {
            setSnapshot(false);
        }
    }, [lastJsonMessage, props.pvMonitoring, props.snapshot, snapshot, pvPrecision, pvSeverity]);

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
