import React, { useState, useEffect } from "react";
import { Typography, TableCell, TableBody, TableRow } from "@mui/material";
import useWebSocket from 'react-use-websocket';
import api from "../../../api";
import PropTypes from "prop-types";


const propTypes = {
  pvMonitoring: PropTypes.bool,
  pvData: PropTypes.object,
  isLoading: PropTypes.bool,
  pvName: PropTypes.string,
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

  const socketUrl = api.PVWS_URL;
  const { sendJsonMessage, lastJsonMessage } = useWebSocket(socketUrl, {
            onClose: () => {
              setPVValue(null);
              setPVSeverity(null);
              setPVMin(null);
              setPVMax(null);
              setPVAlarmLow(null);
              setPVAlarmHigh(null);
              setPVWarnLow(null);
              setPVWarnHigh(null);
              setPVPrecision(null);
              setPVTimestamp(null);
              setPVUnits(null);
            },
            shouldReconnect: (closeEvent) => true,
          });

  useEffect(() => {
    if(props.pvMonitoring) { 
      if(props.pvData !== null && !props.isLoading && props.pvData.pvStatus === "Active" && props.pvData.recordType !== "waveform") {
        sendJsonMessage({ "type": "subscribe", "pvs": [ props.pvName ] });
      }
    }
    else {
      sendJsonMessage({ "type": "clear", "pvs": [ props.pvName ] });
      setPVValue(null);
      setPVSeverity(null);
      setPVMin(null);
      setPVMax(null);
      setPVAlarmLow(null);
      setPVAlarmHigh(null);
      setPVWarnLow(null);
      setPVWarnHigh(null);
      setPVPrecision(null);
      setPVTimestamp(null);
      setPVUnits(null);
    }
  }, [props.pvMonitoring, props.isLoading, props.pvData, props.pvName, sendJsonMessage]);

  useEffect(() => {
    if (lastJsonMessage !== null) {
        if (!props.pvMonitoring) return;
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
                timestamp = new Date(message.seconds*1000 + (message.nanos*1e-6)).toISOString();
              }
              else {
                timestamp = new Date(message.seconds*1000).toISOString();
              }
              setPVTimestamp(timestamp);
            }
            else {
              setPVTimestamp(null);
            }
            if ("severity" in message) {
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
                setAlarmColor("#FF9900");
              }
              else if (message.severity === "MINOR") {
                setAlarmColor("#FF9900");
              }
              setPVSeverity(message.severity);
            }
            if ("text" in message) {
              setPVValue(message.text);
            }
            else if ("value" in message) {
              setPVValue(Number(message.value.toFixed(2)));
            }
        }
        else {
            console.log("Unexpected message type: ", message);
        }
    }
  }, [lastJsonMessage, props.pvMonitoring]);

  if (props.isLoading) {
    return (
      <Typography variant="h6">OLOG Data Loading...</Typography>
    );
  }
  else {
    return (
      <TableBody>
        <TableRow>
          <TableCell variant="head">Value</TableCell>
          <TableCell style={{color: alarmColor}} variant="body">{pvValue}</TableCell>
          <TableCell variant="head">PV Timestamp</TableCell>
          <TableCell style={{color: alarmColor}} variant="body">{pvTimestamp}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell variant="head">Alarm State</TableCell>
          <TableCell style={{color: alarmColor}} variant="body">{pvSeverity}</TableCell>
          <TableCell variant="head">Units</TableCell>
          <TableCell variant="body">{pvUnits}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell variant="head">Alarm Low Value</TableCell>
          <TableCell variant="body">{pvAlarmLow}</TableCell>
          <TableCell variant="head">Alarm High Value</TableCell>
          <TableCell variant="body">{pvAlarmHigh}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell variant="head">Warn Low Value</TableCell>
          <TableCell variant="body">{pvWarnLow}</TableCell>
          <TableCell variant="head">Warn High Value</TableCell>
          <TableCell variant="body">{pvWarnHigh}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell variant="head">Lower Limit</TableCell>
          <TableCell variant="body">{pvMin}</TableCell>
          <TableCell variant="head">Upper Limit</TableCell>
          <TableCell variant="body">{pvMax}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell variant="head">Precision</TableCell>
          <TableCell variant="body">{pvPrecision}</TableCell>
        </TableRow>
      </TableBody>
    );
  }
}

ValueTable.propTypes = propTypes;
export default ValueTable;
