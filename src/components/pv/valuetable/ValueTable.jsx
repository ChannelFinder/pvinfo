import React, { Fragment, useState, useEffect, useRef } from "react";
import { Typography } from "@mui/material";
import useWebSocket from '../../../useWebSocket';
import api from "../../../api";
import colors from "../../../colors";
import KeyValuePair from "../KeyValuePair";
import LiveValueSkeleton from "../../livevalueskeleton";
import config from "../../../config";

function ValueTable(props) {
    const [pvValue, setPVValue] = useState(null);
    const [pvUnits, setPVUnits] = useState(null);
    const [pvSeverity, setPVSeverity] = useState(null);
    const [pvPrecision, setPVPrecision] = useState(null);
    const [pvVtype, setPVVtype] = useState(null);
    const [pvMin, setPVMin] = useState(null);
    const [pvMax, setPVMax] = useState(null);
    const [pvAlarmLow, setPVAlarmLow] = useState(null);
    const [pvAlarmHigh, setPVAlarmHigh] = useState(null);
    const [pvWarnLow, setPVWarnLow] = useState(null);
    const [pvWarnHigh, setPVWarnHigh] = useState(null);
    const [pvTimestamp, setPVTimestamp] = useState(null);
    const [pvLabels, setPVLabels] = useState(null);
    const [alarmColor, setAlarmColor] = useState("");
    const [snapshot, setSnapshot] = useState(true);
    const [subscribed, setSubscribed] = useState(false);
    // the last message before the connection closed. It is out of date, so it isn't shown again when other changes
    // re-run the message effect below
    const closedMessage = useRef(null);

    const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(config.PVWS_URL, {
        onClose: () => {
            // PVWS forgets the subscription when the connection closes, subscribe again when it reconnects
            setSubscribed(false);
            closedMessage.current = lastJsonMessage;
            if (props.snapshot && !props.pvMonitoring) return;
            setPVValue(null);
            setPVSeverity(null);
            setPVTimestamp(null);
        },
    });

    let { handleErrorMessage, handleOpenErrorAlert, handleSeverity } = props;

    const pvLoaded = props.pvData !== null && Object.keys(props.pvData).length !== 0 && !props.isLoading;
    const pvStatus = props.pvData?.pvStatus?.value || "Unknown";
    const waveformOff = !config.PVWS_ALLOW_WAVEFORMS && props.pvData?.recordType?.value === "waveform";
    const liveValueAllowed = pvLoaded && !waveformOff && (config.PVWS_IGNORE_CF_PVSTATUS || pvStatus === "Active");

    useEffect(() => {
        setSnapshot(props.snapshot)
    }, [props.snapshot])

    useEffect(() => {
        if (props.pvMonitoring || snapshot) {
            if (!pvLoaded) {
                return;
            }
            if (waveformOff) {
                handleErrorMessage("Can't show live PV values - Waveform record type not supported");
                handleSeverity("warning");
                handleOpenErrorAlert(true);
            }
            else if (!liveValueAllowed) {
                handleErrorMessage(`Can't show live PV values - PV is in ${pvStatus} state`);
                handleSeverity("warning");
                handleOpenErrorAlert(true);
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
    }, [props.pvMonitoring, snapshot, pvLoaded, waveformOff, liveValueAllowed, pvStatus, props.pvName, handleErrorMessage, handleOpenErrorAlert, subscribed, sendJsonMessage, handleSeverity]);

    // subscribe once connected, and again after each reconnect
    useEffect(() => {
        if ((props.pvMonitoring || snapshot) && liveValueAllowed && !subscribed && readyState === WebSocket.OPEN) {
            sendJsonMessage({ "type": "subscribe", "pvs": [props.pvName] });
            setSubscribed(true);
        }
    }, [props.pvMonitoring, snapshot, liveValueAllowed, subscribed, readyState, sendJsonMessage, props.pvName]);

    useEffect(() => {
        if (!props.pvMonitoring && !snapshot) {
            return;
        }
        if (lastJsonMessage === closedMessage.current) {
            return;
        }
        // PV Web Socket only sends the precision and vtype with the first message for a PV, keep them for the updates
        const message = api.PARSE_WEBSOCKET_MSG(lastJsonMessage, { precision: pvPrecision, vtype: pvVtype });
        if (message === null) {
            return; // unable to parse, could be invalid message type, no PV name, null lastJsonMessage
        }
        if ("units" in message) setPVUnits(message.units);
        if ("min" in message) setPVMin(message.min);
        if ("max" in message) setPVMax(message.max);
        if ("alarm_low" in message) setPVAlarmLow(message.alarm_low);
        if ("alarm_high" in message) setPVAlarmHigh(message.alarm_high);
        if ("warn_low" in message) setPVWarnLow(message.warn_low);
        if ("warn_high" in message) setPVWarnHigh(message.warn_high);
        if ("precision" in message) setPVPrecision(message.precision);
        if ("vtype" in message) setPVVtype(message.vtype);
        if ("labels" in message) setPVLabels(message.labels);
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
            setPVSeverity("DISCONNECTED");
            setAlarmColor(colors.SEV_COLORS["UNDEFINED"]);
            return; // only if no text, b64dbl, b64int, ..., value property found
        }
        if (!props.snapshot) {
            setPVValue(message.pv_value);
        }
        if (snapshot) {
            setSnapshot(false);
        }
    }, [lastJsonMessage, props.pvMonitoring, props.snapshot, snapshot, pvPrecision, pvVtype, pvSeverity]);

    // monitored but no value yet: connecting, waiting for PVWS, or reconnecting after the connection closed
    const waitingForValue = props.pvMonitoring && liveValueAllowed && pvValue === null && pvSeverity !== "DISCONNECTED";

    if (props.isLoading) {
        return (
            <Typography variant="h6">OLOG Data Loading...</Typography>
        );
    }
    else {
        return (
            <Fragment>
                <KeyValuePair title="Value" value={waitingForValue ? <LiveValueSkeleton connecting={readyState !== WebSocket.OPEN} /> : pvValue} textColor={alarmColor} />
                <KeyValuePair title="PV Timestamp" value={pvTimestamp} textColor={alarmColor} />
                <KeyValuePair title="Alarm State" value={pvSeverity} textColor={alarmColor} />
                <KeyValuePair title="Units" value={pvUnits} />
                <KeyValuePair title="Alarm Low Value" value={pvAlarmLow} />
                <KeyValuePair title="Alarm High Value" value={pvAlarmHigh} />
                <KeyValuePair title="Warn Low Value" value={pvWarnLow} />
                <KeyValuePair title="Warn High Value" value={pvWarnHigh} />
                <KeyValuePair title="Lower Limit" value={pvMin} />
                <KeyValuePair title="Upper Limit" value={pvMax} />
                <KeyValuePair title="Precision" value={pvPrecision} />
                <KeyValuePair title="Labels" value={pvLabels} />
            </Fragment>
        );
    }
}

export default ValueTable;
