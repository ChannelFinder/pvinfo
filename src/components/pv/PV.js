import React, { Fragment, useState, useEffect } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { Box, Button, Grid, Link, Typography, Table, TableCell, TableRow, TableContainer, TableBody, Checkbox, FormControlLabel } from "@mui/material";
import TimelineIcon from '@mui/icons-material/Timeline';
import api from "../../api";
import KeyValuePair from "./KeyValuePair";
import OLOGTable from "./ologtable";
import ValueTable from "./valuetable";
import PropTypes from "prop-types";
import { dataNamesMapping, dataOrder } from "../../config";


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
    const [displayAllVars, setDisplayAllVars] = useState(false);

    let { handleErrorMessage, handleOpenErrorAlert } = props;

    // Get channel finder data for this PV
    useEffect(() => {
        // equal sign is important since CF_QUERY adds asterisks by default to start/end of string
        api.CF_QUERY({ "pvName": `=${id}` })
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
        if (cfPVData === null || cfPVData === {} || Object.keys(cfPVData).length === 0) {
            return;
        }
        let pvObject = {};
        pvObject.pvName = {};
        pvObject.pvName.label = 'PV Name'
        pvObject.pvName.value = cfPVData.name;
        pvObject.owner = {}
        pvObject.owner.label = 'Owner'
        pvObject.owner.value = cfPVData.owner;
        cfPVData.properties.forEach((prop) => {
            pvObject[prop.name] = {}
            pvObject[prop.name].label = dataNamesMapping[prop.name] ? dataNamesMapping[prop.name] : prop.name;
            pvObject[prop.name].value = prop.value
        });
        setPVData(pvObject);
    }, [cfPVData]);

    useEffect(() => {
        if (dataOrder[dataOrder.length - 1] === "*") {
            setDisplayAllVars(true);
            dataOrder.splice((dataOrder.length - 1), 1);
            console.log(dataOrder)
            return;
        }
    }, []);

    const handlePVMonitoringChangle = (e) => {
        if (e.target.checked) {
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
    else if (cfPVData === null) {
        return (
            <Typography variant="h6">Channel Finder Data is NULL!</Typography>
        );
    }
    else if (cfPVData === {} || Object.keys(cfPVData).length === 0) {
        return (
            <Typography variant="h6">PV {id} does not exist</Typography>
        );
    }
    else {
        return (
            <Fragment>
                <Typography variant="h3" sx={{ fontSize: { xs: 32, sm: 48 } }}>{id}</Typography>
                {
                    process.env.REACT_APP_USE_AA === "true" ? <Button style={{ marginTop: 10, marginBottom: 10 }} target="_blank" href={pvHTMLString} variant="contained" color="secondary" endIcon={<TimelineIcon />} >Plot This PV</Button> : <div></div>
                }
                <br />
                {
                    process.env.REACT_APP_USE_PVWS === "true" ? <FormControlLabel control={<Checkbox color="primary" checked={pvMonitoring} onChange={handlePVMonitoringChangle}></Checkbox>} label="Enable Live PV Monitoring" /> : <div></div>
                }
                <Box sx={{ border: 5, borderColor: 'primary.main' }}>
                    <Grid container>
                        {dataOrder.map((item, i) => {
                            return (
                                <KeyValuePair key={i} title={dataNamesMapping[item]} value={pvData[item] ? pvData[item].value : ''} />
                                // <Fragment key={i}>
                                //     <Grid item xs={6} sm={2} sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'grey.300' }}>
                                //         <Typography variant="subtitle2">{dataNamesMapping[item] ? dataNamesMapping[item] : 'hw'}</Typography>
                                //     </Grid>
                                //     <Grid item xs={6} sm={4} sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'grey.300' }}>
                                //         <Typography variant="body2">{pvData[item] ? pvData[item].value : ''}</Typography>
                                //     </Grid>
                                // </Fragment>
                            )
                        })}
                        {displayAllVars ? (
                            Object.keys(pvData).map((key) => {
                                if (!(key in dataNamesMapping)) {

                                    return <KeyValuePair title={pvData[key].label} value={pvData[key].value} />
                                }
                                return (
                                    null
                                )
                            })
                        ) : null
                        }
                        {
                            process.env.REACT_APP_USE_PVWS === "true" ?
                                <ValueTable pvData={pvData} pvMonitoring={pvMonitoring}
                                    isLoading={isLoading} pvName={id}
                                    handleOpenErrorAlert={props.handleOpenErrorAlert} handleErrorMessage={props.handleErrorMessage} />
                                : null
                        }
                    </Grid>
                </Box>
                {/* <TableContainer>
					<Table sx={{ border: 5, borderColor: 'primary.main' }}>
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
				</TableContainer> */}
                {
                    process.env.REACT_APP_USE_OLOG === "true" ? <OLOGTable pvName={id} /> : <br />
                }
            </Fragment>
        );
    }
}

PV.propTypes = propTypes;
export default PV;
