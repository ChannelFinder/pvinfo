import React, { Fragment, useState, useEffect, useRef } from "react";
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useParams, Link as RouterLink } from "react-router-dom";
import { Button, Link, Typography, Table, TableCell, TableRow, TableContainer, TableBody, Checkbox, FormControlLabel } from "@mui/material";
import TimelineIcon from '@mui/icons-material/Timeline';
import api from "../../api";
import OLOGTable from "./ologtable";

function PV() {
    let { id } = useParams();
    const [cfPVData, setCFPVData] = useState(null); //object
    const [pvData, setPVData] = useState({});
    const [pvValue, setPVValue] = useState(null);
    const [pvUnits, setPVUnits] = useState(null);
    const [pvSeverity, setPVSeverity] = useState(null);
    const [pvPrecision, setPVPrecision] = useState(null);
    const [pvMin, setPVMin] = useState(null);
    const [pvMax, setPVMax] = useState(null);
    const [alarmColor, setAlarmColor] = useState("");
    const [pvMonitoring, setPVMonitoring] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const pvHTMLString = encodeURI(`${api.AA_VIEWER}?pv=${id}`);

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
      if (lastJsonMessage !== null) {
          if (!pvMonitoring) return;
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
    }, [lastJsonMessage, pvMonitoring]);

    // Get channel finder data for this PV
    useEffect(() => {
      // equal sign is important since CF_QUERY adds asterisks by default to start/end of string
      api.CF_QUERY({"pvName": `=${id}`})
      .then((data) => {
          if (data !== null) {
            setIsLoading(false);
            setCFPVData(data[0]);
          }
          else {
            console.log("data is NULL!")
          }
      })
      .catch((err) => {
          console.log(err);
          console.log("error in fetch of experiments");
	  setCFPVData(null);
      })
    }, []);

    // transform PV data from CF into JS object. This should be moved to api.js!
    useEffect(() => {
      if ( cfPVData === null) {
        return;
      }
      let pvObject = {};
      pvObject.name = cfPVData.name;
      pvObject.owner = cfPVData.owner;
      cfPVData.properties.forEach((prop) => {
        pvObject[prop.name] = prop.value;
      });
      setPVData(pvObject);
    }, [cfPVData]);

    const handlePVMonitoringChangle = (e) => {
      if(e.target.checked) { 
        setPVMonitoring(true); 
        if(pvData !== null && !isLoading && pvData.pvStatus === "Active" && pvData.recordType !== "waveform") {
          sendJsonMessage({ "type": "subscribe", "pvs": [ id ] });
        }
      }
      else { 
        setPVMonitoring(false);
        sendJsonMessage({ "type": "clear", "pvs": [ id ] });
        setPVValue(null);
        setPVSeverity(null);
        setPVMin(null);
        setPVMax(null);
        setPVPrecision(null);
        setPVUnits(null);
      }
    }

  if (isLoading) {
    return (
        <Typography variant="h6">Channel Finder Data Loading...</Typography>
    );
  }
  else if(cfPVData === null) {
    return (
      <Typography variant="h6">Channel Finder Data is NULL!</Typography>
    );
  }
  else {
    return (
      <Fragment>
        <Typography variant="h2">{id}</Typography>
        <Button style={{marginTop: 10, marginBottom: 10}} target="_blank" href={pvHTMLString} variant="contained" color="secondary" endIcon={<TimelineIcon />} >Plot This PV</Button>
        <br />
        <FormControlLabel control={<Checkbox color="primary" checked={pvMonitoring} onChange={handlePVMonitoringChangle}></Checkbox>} label="Enable Live PV Monitoring" />
        <TableContainer>
          <Table sx={{border: 5, borderColor: 'primary.main'}}>
            <TableBody>
              <TableRow>
                <TableCell variant="head">Description</TableCell>
                <TableCell variant="body">{pvData.recordDesc}</TableCell>
                <TableCell variant="head">Alias Of</TableCell>
                <TableCell variant="body"><Link component={RouterLink} to={`/?alias=${pvData.alias}`} underline="hover">{pvData.alias}</Link></TableCell>
              </TableRow>
              <TableRow>
                <TableCell variant="head">EPICS Record Type</TableCell>
                <TableCell variant="body">{pvData.recordType}</TableCell>
                <TableCell variant="head">IOC Name</TableCell>
                <TableCell variant="body"><Link component={RouterLink} to={`/?iocName=${pvData.iocName}`} underline="hover">{pvData.iocName}</Link></TableCell>
              </TableRow>
              <TableRow>
                <TableCell variant="head">Host Name</TableCell>
                <TableCell variant="body">{pvData.hostName}</TableCell>
                <TableCell variant="head">Engineer</TableCell>
                <TableCell variant="body">{pvData.owner}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell variant="head">IOC IP Address</TableCell>
                <TableCell variant="body">{pvData.iocid}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell variant="head">PV Status</TableCell>
                <TableCell variant="body">{pvData.pvStatus}</TableCell>
                <TableCell variant="head">Sync to Recceiver</TableCell>
                <TableCell variant="body">{new Date(pvData.time).toLocaleString()}</TableCell>
              </TableRow>
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
          </Table>
        </TableContainer>
        <Typography style={{marginTop: 10}} variant="h4">Recent Online Log Entries</Typography>
        <OLOGTable pvName={id} />
      </Fragment>
    );
  }
}

export default PV;
