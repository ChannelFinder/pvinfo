import React, { Fragment, useEffect, useState } from 'react';
import { Grid, Button, TextField, MenuItem, Tooltip, Typography } from '@mui/material';
import QueryResults from "./queryresults";
import api from "../../api";
import SearchIcon from '@mui/icons-material/Search';
import Autocomplete from '@mui/material/Autocomplete';
import { useSearchParams } from "react-router-dom";
import ClearIcon from '@mui/icons-material/Clear';

const pvStatusOptions = [
    {
        value: '*',
        label: 'Any'
    },
    {
        value: 'Active',
        label: 'Active'
    },
    {
        value: 'Inactive',
        label: 'Inactive'
    }
]

const pvRecordTypes = ['ao', 'ai', 'bo', 'bi', 'mbbo', 'mbbi', 'longout', 'longin', 'stringout', 'stringin',
    'calc', 'calcout', 'motor', 'seq', 'waveform', 'mbbiDirect', 'mbboDirect', 'sub', 'aSub', 
    'compress', 'dfanout', 'fanout', 'subArray']



function Home() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [cfData, setCFData] = useState(null); //array
    const [pvName, setPVName] = useState(searchParams.get("pvName") || "");
    const [recordDesc, setRecordDesc] = useState(searchParams.get("recordDesc") || "");
    const [aliasOf, setAliasOf] = useState(searchParams.get("alias") || "");
    const [hostName, setHostName] = useState(searchParams.get("hostName") || "");
    const [iocName, setIOCName] = useState(searchParams.get("iocName") || "");
    const [pvStatus, setPVStatus] = useState(searchParams.has("pvStatus") ? searchParams.get("pvStatus") : "*");
    const [recordType, setRecordType] = useState(searchParams.get("recordType") || "");
    const [recordTypeAutocompleteKey, setRecordTypeAutocompleteKey] = useState(-1);
    const [isLoading, setIsLoading] = useState(false);
    
    const handlePVNameChange = (e) => {
        setPVName(e.target.value);
    };
    const handleRecordDescChange = (e) => {
        setRecordDesc(e.target.value);
    };
    const handleHostNameChange = (e) => {
        setHostName(e.target.value);
    };
    const handleIOCNameChange = (e) => {
        setIOCName(e.target.value);
    };
    const handlePVStatusChange = (e) => {
        setPVStatus(e.target.value);
    };
    const handleRecordTypeChange = (e) => {
        setRecordType(e.target.value);
    };
    const handleAliasOfChange = (e) => {
        setAliasOf(e.target.value);
    };

    const queryPVs = (parameters) => {
        api.CF_QUERY(parameters)
        .then((data) => {
            if (data !== null) {
                setCFData(data);
                setIsLoading(false);
            }
            else {
                console.log("data is NULL!")
            }
        })
        .catch((err) => {
            console.log(err);
            console.log("error in fetch of experiments");
        })
    }

    useEffect(() => {
        // If there are search parameters in the URL, query channel finder and show the PV data
        if(searchParams.has("pvName") || searchParams.has("recordDesc") || searchParams.has("iocName") || searchParams.has("hostName") || 
                searchParams.has("pvStatus") || searchParams.has("alias") || searchParams.has("recordType")) {
            let params = {}
            searchParams.forEach((val, key) => {if(val !== "") {params[key] = val} });
            setPVName(searchParams.get("pvName") || "");
            setRecordDesc(searchParams.get("recordDesc") || "");
            setRecordDesc(searchParams.get("recordType") || "");
            setIOCName(searchParams.get("iocName") || "");
            setHostName(searchParams.get("hostName") || "");
            setPVStatus(searchParams.has("pvStatus") ? searchParams.get("pvStatus") : "*");
            setAliasOf(searchParams.get("alias") || "");
            setIsLoading(true);
            queryPVs(params);
        }
        else {
            setPVName("");
            setRecordDesc("");
            setHostName("");
            setIOCName("");
            setPVStatus("*");
            setRecordType("");
            setAliasOf("");
            // https://stackoverflow.com/a/59845474
            setRecordTypeAutocompleteKey(recordTypeAutocompleteKey-1);
            setCFData(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        let params = {}
        if(e.target.pvName.value) {params[e.target.pvName.name] = e.target.pvName.value;}
        if(e.target.hostName.value) {params[e.target.hostName.name] = e.target.hostName.value;}
        if(e.target.iocName.value) {params[e.target.iocName.name] = e.target.iocName.value;}
        if(e.target.pvStatus.value !== "*") {params[e.target.pvStatus.name] = e.target.pvStatus.value;}
        if(process.env.REACT_APP_CF_RECORD_TYPE === "true") {
            if(e.target.recordType.value) {params[e.target.recordType.name] = e.target.recordType.value;}
        }
        if(process.env.REACT_APP_CF_ALIAS === "true") {
            if(e.target.alias.value) {params[e.target.alias.name] = e.target.alias.value;}
        }
        if(process.env.REACT_APP_CF_RECORD_DESC === "true") {
            if(e.target.recordDesc.value) {params[e.target.recordDesc.name] = e.target.recordDesc.value;}
        }
        api.CF_QUERY(params)
            .then((data) => {
                if (data !== null) {
                    setCFData(data);
                    setIsLoading(false);
                }
                else {
                    console.log("data is NULL!")
                }
            })
            .catch((err) => {
                console.log(err);
                console.log("error in fetch of experiments");
            })
        setSearchParams(params);
    }
    const handleClear = (e) => {
        e.preventDefault();
        setPVName("");
        setRecordDesc("");
        setHostName("");
        setIOCName("");
        setPVStatus("*");
        setRecordType("");
        setAliasOf("");
        // https://stackoverflow.com/a/59845474
        setRecordTypeAutocompleteKey(recordTypeAutocompleteKey-1);
    }

    const recordDescSearchRender = () => {
        if(process.env.REACT_APP_CF_RECORD_DESC === "true") {
            return (
                <Tooltip arrow title={<div>* for any # character wildcard<br />? for single character wildcard<br />! at beginning for not equal<br />= at beginning for exactly equal</div>}>
                    <TextField
                        style={{width: "100%"}}
                        id="recordDsec"
                        label="Description"
                        autoComplete="off"
                        name="recordDesc"
                        value={recordDesc}
                        placeholder="Description"
                        type="search"
                        variant="outlined"
                        onChange={handleRecordDescChange}
                    />
                </Tooltip>
            )
        }
    }
    const recordTypeSearchRender = () => {
        if(process.env.REACT_APP_CF_RECORD_TYPE === "true") {
            return (
                <Tooltip arrow title={<div>* for any # character wildcard<br />? for single character wildcard<br />! at beginning for not equal<br />= at beginning for exactly equal</div>}>
                    <Autocomplete
                        freeSolo
                        disableClearable
                        style={{width: "50%"}}
                        options={pvRecordTypes}
                        key={recordTypeAutocompleteKey}
                        value={recordType}
                        renderInput={(params) => 
                            <TextField 
                                id="recordType"
                                {...params}
                                label="Record Type" 
                                name="recordType"
                                placeholder="Record Type"
                                type="search"
                                variant="outlined"
                                onChange={handleRecordTypeChange}
                            />
                        }
                    />
                </Tooltip>
            )
        }
    }
    const aliasOfSearchRender = () => {
        if(process.env.REACT_APP_CF_ALIAS === "true") {
            return (
                <Tooltip arrow title={<div>* for any # character wildcard<br />? for single character wildcard<br />! at beginning for not equal<br />= at beginning for exactly equal</div>}>
                    <TextField
                        style={{width: "70%"}}
                        id="alias"
                        label="Alias Of"
                        autoComplete="off"
                        name="alias"
                        value={aliasOf}
                        placeholder="Alias Of"
                        type="search"
                        variant="outlined"
                        onChange={handleAliasOfChange}
                    />
                </Tooltip>
            )
        }
    }
       
    return (
        <Fragment>
            <form onSubmit={handleSubmit}>
                <Grid item alignItems="center" sx={{ backgroundColor: '#d7e3f5' }} xs={12}>
                    <Typography 
                        style={{marginBottom: 20}}
                        align="center"
                        variant="h6"
                    >
                        PV Info allows you to search and inspect PVs and their meta-data via the EPICS Channel Finder DB
                    </Typography>
                    <Typography 
                        style={{marginBottom: 20}}
                        align="center"
                        variant="subtitle1"
                    >
                        There are integrations with Archiver Appliance, PV Web Socket, and OLOG API
                    </Typography>
                </Grid>
                <Grid item container xs={12}>
                    <Grid item xs={12} sm={12} md={6} lg={2} xl={2} style={{display: "flex"}}>
                        <Tooltip arrow title={<div>* for any # character wildcard<br />? for single character wildcard<br />= at beginning for exactly equal</div>}>
                            <TextField
                                style={{width: "100%"}}
                                id="pvName"
                                label="PV Name"
                                name="pvName"
                                autoComplete="off"
                                value={pvName}
                                placeholder="PV Name"
                                type="search"
                                variant="outlined"
                                onChange={handlePVNameChange}
                            />
                        </Tooltip>
                    </Grid>
                    <Grid item xs={12} sm={12} md={6} lg={2} xl={2} style={{display: "flex"}}>
                        {recordDescSearchRender()}
                    </Grid>
                    <Grid item xs={12} sm={12} md={6} lg={2} xl={2} style={{display: "flex"}}>
                        <Tooltip arrow title={<div>* for any # character wildcard<br />? for single character wildcard<br />! at beginning for not equal<br />= at beginning for exactly equal</div>}>
                            <TextField
                                style={{width: "50%"}}
                                id="hostName"
                                label="Host Name"
                                autoComplete="off"
                                name="hostName"
                                value={hostName}
                                placeholder="Host Name"
                                type="search"
                                variant="outlined"
                                onChange={handleHostNameChange}
                            />
                        </Tooltip>
                        <Tooltip arrow title={<div>* for any # character wildcard<br />? for single character wildcard<br />! at beginning for not equal<br />= at beginning for exactly equal</div>}>
                            <TextField
                                style={{width: "50%"}}
                                id="iocName"
                                label="IOC Name"
                                autoComplete="off"
                                name="iocName"
                                value={iocName}
                                placeholder="IOC Name"
                                type="search"
                                variant="outlined"
                                onChange={handleIOCNameChange}
                            />
                        </Tooltip>
                    </Grid>
                    <Grid item xs={12} sm={12} md={6} lg={2} xl={2} style={{display: "flex"}}>
                        <TextField
                            style={{width: "50%"}}
                            id="pvStatus"
                            name="pvStatus"
                            select
                            value={pvStatus}
                            onChange={handlePVStatusChange}
                            label="Status"
                            variant="outlined"
                        >
                            {pvStatusOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                        {recordTypeSearchRender()}

                    </Grid>
                    <Grid item xs={12} sm={12} md={6} lg={4} xl={4} style={{display: "flex"}}>
                        {aliasOfSearchRender()}
                        <Tooltip arrow title="Search">
                            <Button
                                aria-label="search"
                                variant="contained"
	    			color="info"
                                type="submit"
                                style={{width: "15%"}}>
                                <SearchIcon style={{color: 'black'}} fontSize='large' />
                            </Button>
                        </Tooltip>
                        <Tooltip arrow title="Clear">
                            <Button aria-label="clear"
                                variant="contained"
                                color="secondary"
                                style={{width: "15%"}} 
                                onClick={handleClear} >
                                <ClearIcon style={{color: 'black'}} fontSize='large' />
                            </Button>
                        </Tooltip>
                    </Grid>
                </Grid>
                <Grid container item xs={12} style={{display: "flex"}}>
                    <QueryResults isLoading={isLoading} cfData={cfData} />
                </Grid>
            </form>
        </ Fragment>
    );
}

export default Home;
