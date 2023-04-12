import React, { Fragment, useState, useEffect } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { Button, Link, Typography, Table, TableCell, TableRow, TableContainer, TableBody, Checkbox, FormControlLabel } from "@mui/material";
import TimelineIcon from '@mui/icons-material/Timeline';
import api from "../../api";
import OLOGTable from "./ologtable";
import ValueTable from "./valuetable";
import PropTypes from "prop-types";


const propTypes = {
  handleOpenErrorAlert: PropTypes.func,
  handleErrorMessage: PropTypes.func,
}

function PV(props) {
    let { id } = useParams();
    const [cfPVData, setCFPVData] = useState(null); //object
    const [pvData, setPVData] = useState({});
    const [pvMonitoring, setPVMonitoring] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const pvHTMLString = encodeURI(`${api.AA_VIEWER}?pv=${id}`);

    let { handleErrorMessage, handleOpenErrorAlert } = props;

    // Get channel finder data for this PV
    useEffect(() => {
      // equal sign is important since CF_QUERY adds asterisks by default to start/end of string
      api.CF_QUERY({"pvName": `=${id}`})
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
          handleOpenErrorAlert(true);
	        setCFPVData(null);
          setIsLoading(false);
      })
    }, [id, handleErrorMessage, handleOpenErrorAlert]);

    // transform PV data from CF into JS object. This should be moved to api.js!
    useEffect(() => {
      if ( cfPVData === null || cfPVData === {} || Object.keys(cfPVData).length === 0) {
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
  else if(cfPVData === {} || Object.keys(cfPVData).length === 0) {
    return (
      <Typography variant="h6">PV {id} does not exist</Typography>
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
              <TableCell variant="head">PV Name</TableCell>
                <TableCell variant="body">{pvData.name}</TableCell>
                <TableCell variant="head">Alias Of</TableCell>
                <TableCell variant="body"><Link component={RouterLink} to={`/?alias=${pvData.alias}`} underline="hover">{pvData.alias}</Link></TableCell>
              </TableRow>
              <TableRow>
                <TableCell variant="head">Description</TableCell>
                <TableCell variant="body">{pvData.recordDesc}</TableCell>
                <TableCell variant="head">Engineer</TableCell>
                <TableCell variant="body">{pvData.Engineer}</TableCell>
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
                <TableCell variant="head">Location</TableCell>
                <TableCell variant="body">{pvData.Location}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell variant="head">IOC IP Address</TableCell>
                <TableCell variant="body">{pvData.iocid}</TableCell>
                <TableCell variant="head">Sync to Recceiver</TableCell>
                <TableCell variant="body">{new Date(pvData.time).toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell variant="head">PV Status</TableCell>
                <TableCell variant="body">{pvData.pvStatus}</TableCell>
              </TableRow>
            </TableBody>
              {
                process.env.REACT_APP_USE_PVWS === "true" ?
                    <ValueTable pvData={pvData} pvMonitoring={pvMonitoring}
                                isLoading={isLoading} pvName={id}
                                handleOpenErrorAlert={props.handleOpenErrorAlert} handleErrorMessage={props.handleErrorMessage} />
                                : null
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

PV.propTypes = propTypes;
export default PV;
