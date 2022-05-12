import React, { Fragment, useState, useEffect } from "react";
import { Button, Typography, Table, TableCell, TableBody, TableHead, TableRow, TableContainer, Grid, Hidden, Link } from "@mui/material";
import useWebSocket, { ReadyState } from 'react-use-websocket';
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
  const [alarmColor, setAlarmColor] = useState("");


  const socketUrl = api.PVWS_URL;
  const { sendJsonMessage, lastJsonMessage, 
          readyState, getWebSocket } = useWebSocket(socketUrl, {
            onClose: () => {
              setPVValue(null);
              setPVSeverity(null);
              setPVMin(null);
              setPVMax(null);
              setPVPrecision(null);
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
      setPVPrecision(null);
      setPVUnits(null);
    }
  }, [props.pvMonitoring]);

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
            if ("precision" in message) {
              setPVPrecision(message.precision);
            }
            if ("severity" in message) {
              if (message.severity === "NONE") {
                setAlarmColor("green");
              }
              else if (message.severity === "INVALID" || message.severity === "UNDEFINED" || message.severity === "MAJOR") {
                setAlarmColor("red");
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
          <TableCell variant="head">Units</TableCell>
          <TableCell variant="body">{pvUnits}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell variant="head">Alarm State</TableCell>
          <TableCell style={{color: alarmColor}} variant="body">{pvSeverity}</TableCell>
          <TableCell variant="head">Precision</TableCell>
          <TableCell variant="body">{pvPrecision}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell variant="head">Lower Limit</TableCell>
          <TableCell variant="body">{pvMin}</TableCell>
          <TableCell variant="head">Upper Limit</TableCell>
          <TableCell variant="body">{pvMax}</TableCell>
        </TableRow>
      </TableBody>
    );
  }
}

export default ValueTable;
