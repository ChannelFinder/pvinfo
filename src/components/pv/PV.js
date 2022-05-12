import React, { Fragment, useState, useEffect, useRef } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { Button, Link, Typography, Table, TableCell, TableRow, TableContainer, TableBody, Checkbox, FormControlLabel } from "@mui/material";
import TimelineIcon from '@mui/icons-material/Timeline';
import api from "../../api";
import OLOGTable from "./ologtable";
import ValueTable from "./valuetable";


function PV() {
    let { id } = useParams();
    const [cfPVData, setCFPVData] = useState(null); //object
    const [pvData, setPVData] = useState({});
    const [pvMonitoring, setPVMonitoring] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const pvHTMLString = encodeURI(`${api.AA_VIEWER}?pv=${id}`);

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
      }
      else {
        setPVMonitoring(false);
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
        {
          process.env.REACT_APP_USE_AA === "true" ? <Button style={{marginTop: 10, marginBottom: 10}} target="_blank" href={pvHTMLString} variant="contained" color="secondary" endIcon={<TimelineIcon />} >Plot This PV</Button> : <div></div>
        }
        <br />
        {
          process.env.REACT_APP_USE_PVWS === "true" ? <FormControlLabel control={<Checkbox color="primary" checked={pvMonitoring} onChange={handlePVMonitoringChangle}></Checkbox>} label="Enable Live PV Monitoring" /> : <div></div>
        }
        
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
            </TableBody>
            {
              process.env.REACT_APP_USE_PVWS === "true" ? <ValueTable pvData={pvData} pvMonitoring={pvMonitoring} isLoading={isLoading} pvName={id} /> : null
            }
          </Table>
        </TableContainer>
        {
          process.env.REACT_APP_USE_OLOG === "true" ? <OLOGTable pvName={id} /> : <br />
        }
      </Fragment>
    );
  }
}

export default PV;
