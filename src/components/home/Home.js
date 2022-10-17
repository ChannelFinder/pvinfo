import React, { Fragment, useEffect, useState } from 'react';
import { Grid, Box, Button, TextField, MenuItem, Tooltip, Typography } from '@mui/material';
import QueryResults from "./queryresults";
import api from "../../api";
import SearchIcon from '@mui/icons-material/Search';
import Autocomplete from '@mui/material/Autocomplete';
import { useSearchParams } from "react-router-dom";
import ClearIcon from '@mui/icons-material/Clear';
import './Home.css';

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
    const [hostName, setHostName] = useState(searchParams.get("hostName") || "");
    const [iocName, setIOCName] = useState(searchParams.get("iocName") || "");
    const [pvStatus, setPVStatus] = useState(searchParams.has("pvStatus") ? searchParams.get("pvStatus") : "*");
    const [aliasOf, setAliasOf] = useState(searchParams.get("alias") || "");
    const [recordType, setRecordType] = useState(searchParams.get("recordType") || "");
    const [recordTypeAutocompleteKey, setRecordTypeAutocompleteKey] = useState(-1);
    const [recordDesc, setRecordDesc] = useState(searchParams.get("recordDesc") || "");
    const extraPropAName = process.env.REACT_APP_EXTRA_PROP === "" ? null : process.env.REACT_APP_EXTRA_PROP;
    const extraPropBName = process.env.REACT_APP_SECOND_EXTRA_PROP === "" ? null : process.env.REACT_APP_SECOND_EXTRA_PROP;

    const [extraPropAValue, setExtraPropAValue] = useState(searchParams.get(extraPropAName) || "");
    const [extraPropBValue, setExtraPropBValue] = useState(searchParams.get(extraPropBName) || "");
    const [isLoading, setIsLoading] = useState(false);

    
    const handlePVNameChange = (e) => {
        setPVName(e.target.value);
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
    const handleAliasOfChange = (e) => {
        setAliasOf(e.target.value);
    };
    const handleRecordTypeChange = (e) => {
        setRecordType(e.target.value);
    };
    const handleRecordDescChange = (e) => {
        setRecordDesc(e.target.value);
    };
    const handleExtraPropAChange = (e) => {
        setExtraPropAValue(e.target.value);
    };
    const handleExtraPropBChange = (e) => {
        setExtraPropBValue(e.target.value);
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
        if(searchParams.has("pvName") || searchParams.has("recordDesc") || searchParams.has("iocName") ||
           searchParams.has("hostName") || searchParams.has("pvStatus") || searchParams.has("alias") ||
           searchParams.has("recordType") || searchParams.has(extraPropAName) || searchParams.has(extraPropBName)) {
            let params = {}
            searchParams.forEach((val, key) => {if(val !== "") {params[key] = val} });
            setPVName(searchParams.get("pvName") || "");
            setRecordDesc(searchParams.get("recordDesc") || "");
            setRecordDesc(searchParams.get("recordType") || "");
            setIOCName(searchParams.get("iocName") || "");
            setHostName(searchParams.get("hostName") || "");
            setPVStatus(searchParams.has("pvStatus") ? searchParams.get("pvStatus") : "*");
            setAliasOf(searchParams.get("alias") || "");
            setExtraPropAValue(searchParams.get(extraPropAName) || "");
            setExtraPropBValue(searchParams.get(extraPropBName) || "");
            setIsLoading(true);
            queryPVs(params);
        }
        else {
            setPVName("");
            setHostName("");
            setIOCName("");
            setPVStatus("*");
            setAliasOf("");
            setRecordType("");
            setRecordDesc("");
            setExtraPropAValue("");
            setExtraPropBValue("");
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
        if(extraPropAName !== null) {
            if(e.target.extraPropA.value) {params[process.env.REACT_APP_EXTRA_PROP] = e.target.extraPropA.value;}
        }
        if(extraPropBName !== null) {
            if(e.target.extraPropB.value) {params[process.env.REACT_APP_SECOND_EXTRA_PROP] = e.target.extraPropB.value;}
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
        setHostName("");
        setIOCName("");
        setPVStatus("*");
        setAliasOf("");
        setRecordType("");
        setRecordDesc("");
        setExtraPropAValue("");
        setExtraPropBValue("");
        // https://stackoverflow.com/a/59845474
        setRecordTypeAutocompleteKey(recordTypeAutocompleteKey-1);
    }
    const recordDescSearchRender = () => {
        if(process.env.REACT_APP_CF_RECORD_DESC === "true") {
            return (
                <Tooltip arrow title={<div>* for any # character wildcard<br />? for single character wildcard<br />! at beginning for not equal<br />= at beginning for exactly equal</div>}>
                    <TextField
                        sx={{display: "flex", flexGrow: 4, minWidth: 300}}
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
                <Box sx={{display: "flex"}}>
                    <Tooltip arrow title={<div>* for any # character wildcard<br />? for single character wildcard<br />! at beginning for not equal<br />= at beginning for exactly equal</div>}>
                        <Autocomplete
                            sx={{display: "flex", flexGrow: 2, minWidth: 120}}
                            freeSolo
                            disableClearable
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
                </Box>
            )
        }
    }
    const aliasOfSearchRender = () => {
        if(process.env.REACT_APP_CF_ALIAS === "true") {
            return (
                <Tooltip arrow title={<div>* for any # character wildcard<br />? for single character wildcard<br />! at beginning for not equal<br />= at beginning for exactly equal</div>}>
                    <TextField
                        sx={{display: "flex", flexGrow: 3, minWidth: 175}}
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
    const extraPropARender = () => {
        if(extraPropAName !== null) {
            if(process.env.REACT_APP_EXTRA_PROP_DROPDOWN_LABELS !== ""){
                return (
                    <Box sx={{display: "flex"}}>
                        <Tooltip arrow title={<div>* for any # character wildcard<br />? for single character wildcard<br />! at beginning for not equal<br />= at beginning for exactly equal</div>}>
                            <Autocomplete
                                sx={{display: "flex", flexGrow: 2, minWidth: 120}}
                                freeSolo
                                disableClearable
                                options={process.env.REACT_APP_EXTRA_PROP_DROPDOWN_LABELS.split(",")}
                                key={recordTypeAutocompleteKey}
                                value={extraPropAValue}
                                renderInput={(params) => 
                                    <TextField 
                                        id="extraPropA"
                                        {...params}
                                        label={process.env.REACT_APP_EXTRA_PROP_LABEL} 
                                        name="extraPropA"
                                        placeholder={process.env.REACT_APP_EXTRA_PROP_LABEL}
                                        type="search"
                                        variant="outlined"
                                        onChange={handleExtraPropAChange}
                                    />
                                }
                            />
                        </Tooltip>
                    </Box>                    
                )
            }
            else {
                return (
                    <Tooltip arrow title={<div>* for any # character wildcard<br />? for single character wildcard<br />! at beginning for not equal<br />= at beginning for exactly equal</div>}>
                        <TextField
                            sx={{display: "flex", flexGrow: 2, minWidth: 80}}
                            id="extraPropA"
                            label={process.env.REACT_APP_EXTRA_PROP_LABEL}
                            autoComplete="off"
                            name="extraPropA"
                            value={extraPropAValue}
                            placeholder={process.env.REACT_APP_EXTRA_PROP_LABEL}
                            type="search"
                            variant="outlined"
                            onChange={handleExtraPropAChange}
                        />
                    </Tooltip>
                )                
            }
        }
    }
    const extraPropBRender = () => {
        if(extraPropBName !== null) {
            return (
                <Tooltip arrow title={<div>* for any # character wildcard<br />? for single character wildcard<br />! at beginning for not equal<br />= at beginning for exactly equal</div>}>
                    <TextField
                        sx={{display: "flex", flexGrow: 2, minWidth: 80}}
                        id="extraPropB"
                        label={process.env.REACT_APP_SECOND_EXTRA_PROP_LABEL}
                        autoComplete="off"
                        name="extraPropB"
                        value={extraPropBValue}
                        placeholder={process.env.REACT_APP_SECOND_EXTRA_PROP_LABEL}
                        type="search"
                        variant="outlined"
                        onChange={handleExtraPropBChange}
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
                        {process.env.REACT_APP_HOMEPAGE_HEADER}
                    </Typography>
                    <Typography 
                        style={{marginBottom: 20}}
                        align="center"
                        variant="subtitle1"
                    >
                        {process.env.REACT_APP_HOMEPAGE_SUBHEADER}
                    </Typography>
                </Grid>
                <Grid item container xs={12}>
                    <Box className="main-query-box">
                        <Tooltip arrow title={<div>* for any # character wildcard<br />? for single character wildcard<br />= at beginning for exactly equal</div>}>
                            <TextField
                                sx={{display: "flex", flexGrow: 4, minWidth: 300}}
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
                        {recordDescSearchRender()}
                        <Tooltip arrow title={<div>* for any # character wildcard<br />? for single character wildcard<br />! at beginning for not equal<br />= at beginning for exactly equal</div>}>
                            <TextField
                                sx={{display: "flex", flexGrow: 3, minWidth: 75}}
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
                                sx={{display: "flex", flexGrow: 3, minWidth: 75}}
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
                        <Box sx={{display: "flex", flexGrow: 1, minWidth: 100}}>
                            <TextField
                                sx={{display: "flex", flexGrow: 2}}
                                id="pvStatus"
                                name="pvStatus"
                                select
                                value={pvStatus}
                                onChange={handlePVStatusChange}
                                label="Status"
                                variant="outlined"
                            >
                                {pvStatusOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value} >
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>
                        {recordTypeSearchRender()}
                        {extraPropARender()}
                        {extraPropBRender()}
                        {aliasOfSearchRender()}
                        <Tooltip arrow title="Search">
                            <Button
                                sx={{display: "flex", flexGrow: 1, minWidth: 60, maxWidth: 80}}
                                aria-label="search"
                                variant="contained"
                                color="info"
                                type="submit"
                            >
                                <SearchIcon style={{color: 'black'}} fontSize='large' />
                            </Button>
                        </Tooltip>
                        <Tooltip arrow title="Clear">
                            <Button aria-label="clear"
                                sx={{display: "flex", flexGrow: 1, minWidth: 60, maxWidth: 80}}
                                variant="contained"
                                color="secondary"
                                onClick={handleClear} 
                            >
                                <ClearIcon style={{color: 'black'}} fontSize='large' />
                            </Button>
                        </Tooltip>
                    </Box>
                </Grid>
                <Grid container item xs={12} style={{display: "flex"}}>
                    <QueryResults isLoading={isLoading} cfData={cfData} />
                </Grid>
            </form>
        </ Fragment>
    );
}

export default Home;
