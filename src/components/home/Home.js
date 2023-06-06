import React, { Fragment, useEffect, useState } from 'react';
import { Grid, Box, Button, TextField, MenuItem, Tooltip, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import QueryResults from "./queryresults";
import api from "../../api";
import Autocomplete from '@mui/material/Autocomplete';
import { useSearchParams } from "react-router-dom";
import ManageSearchRoundedIcon from '@mui/icons-material/ManageSearchRounded';
import PageviewRoundedIcon from '@mui/icons-material/PageviewRounded';
import PropTypes from "prop-types";

import ParamSearch from './paramsearch';
import FreeSearch from './freesearch';
// is this needed?
import './Home.css';

const propTypes = {
    handleOpenErrorAlert: PropTypes.func,
    handleErrorMessage: PropTypes.func,
}

function Home(props) {
    const [standardSearch, setStandardSearch] = useState(true);
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

    const handleSearchType = (e, newSearchType) => {
        setStandardSearch(newSearchType);
    };
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
                if (data === null) {
                    console.log("Null data from channel finder");
                    setCFData(null);
                    setIsLoading(false);
                }
                else {
                    setCFData(data);
                    setIsLoading(false);
                }
            })
            .catch((err) => {
                console.log("Error in fetch of channel finder data");
                console.log(err);
                props.handleErrorMessage("Error in EPICS Channel Finder query");
                props.handleOpenErrorAlert(true);
                setIsLoading(false);
                setCFData(null);
            })
    }
    useEffect(() => {
        // If there are search parameters in the URL, query channel finder and show the PV data
        if (searchParams.has("pvName") || searchParams.has("recordDesc") || searchParams.has("iocName") ||
            searchParams.has("hostName") || searchParams.has("pvStatus") || searchParams.has("alias") ||
            searchParams.has("recordType") || searchParams.has(extraPropAName) || searchParams.has(extraPropBName)) {
            let params = {}
            searchParams.forEach((val, key) => { if (val !== "") { params[key] = val } });
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
            setRecordTypeAutocompleteKey(recordTypeAutocompleteKey - 1);
            setCFData(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const parseParamSearch = (e) => {
        let params = {}
        if (e.target.pvName.value) { params[e.target.pvName.name] = e.target.pvName.value; }
        if (e.target.hostName.value) { params[e.target.hostName.name] = e.target.hostName.value; }
        if (e.target.iocName.value) { params[e.target.iocName.name] = e.target.iocName.value; }
        if (e.target.pvStatus.value !== "*") { params[e.target.pvStatus.name] = e.target.pvStatus.value; }
        if (process.env.REACT_APP_CF_RECORD_TYPE === "true") {
            if (e.target.recordType.value) { params[e.target.recordType.name] = e.target.recordType.value; }
        }
        if (process.env.REACT_APP_CF_ALIAS === "true") {
            if (e.target.alias.value) { params[e.target.alias.name] = e.target.alias.value; }
        }
        if (process.env.REACT_APP_CF_RECORD_DESC === "true") {
            if (e.target.recordDesc.value) { params[e.target.recordDesc.name] = e.target.recordDesc.value; }
        }
        if (extraPropAName !== null) {
            if (e.target.extraPropA.value) { params[process.env.REACT_APP_EXTRA_PROP] = e.target.extraPropA.value; }
        }
        if (extraPropBName !== null) {
            if (e.target.extraPropB.value) { params[process.env.REACT_APP_SECOND_EXTRA_PROP] = e.target.extraPropB.value; }
        }
        return params;
    }

    const parseFreeformSearch = (e) => {
        console.log(e.target.freeSearch.value)
        let params = {}
        return params;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        let params = {}
        if (standardSearch) {
            params = parseParamSearch(e);
        } else {
            params = parseFreeformSearch(e);
        }
        api.CF_QUERY(params)
            .then((data) => {
                if (data === null) {
                    console.log("Null data from channel finder");
                    setCFData(null);
                    setIsLoading(false);
                }
                else {
                    setCFData(data);
                    setIsLoading(false);
                }
            })
            .catch((err) => {
                console.log("Error in fetch of channel finder data");
                console.log(err);
                props.handleErrorMessage("Error in EPICS Channel Finder query");
                props.handleOpenErrorAlert(true);
                setIsLoading(false);
                setCFData(null);

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
        setRecordTypeAutocompleteKey(recordTypeAutocompleteKey - 1);
    }

    return (
        <Fragment>
            <form onSubmit={handleSubmit}>
                <Grid item alignItems="center" sx={{ backgroundColor: '#d7e3f5' }} xs={12}>
                    <Typography
                        style={{ marginBottom: 20 }}
                        align="center"
                        variant="h6"
                    >
                        {process.env.REACT_APP_HOMEPAGE_HEADER}
                    </Typography>
                    <Typography
                        style={{ marginBottom: 20 }}
                        align="center"
                        variant="subtitle1"
                    >
                        {process.env.REACT_APP_HOMEPAGE_SUBHEADER}
                    </Typography>
                </Grid>
                <ToggleButtonGroup
                    value={standardSearch}
                    exclusive
                    onChange={handleSearchType}
                    aria-label="search type"
                    style={{ marginBottom: 20 }}
                >
                    <ToggleButton value={true} aria-label="param search">
                        <ManageSearchRoundedIcon />
                    </ToggleButton>
                    <ToggleButton value={false} aria-label="free search">
                        <PageviewRoundedIcon />
                    </ToggleButton>
                </ToggleButtonGroup>
                {
                    standardSearch ? (
                        <ParamSearch handleOpenErrorAlert={props.handleOpenErrorAlert} handleErrorMessage={props.handleErrorMessage}
                            pvName={pvName} handlePVNameChange={handlePVNameChange}
                            hostName={hostName} handleHostNameChange={handleHostNameChange}
                            iocName={iocName} handleIOCNameChange={handleIOCNameChange}
                            pvStatus={pvStatus} handlePVStatusChange={handlePVStatusChange}
                            aliasOf={aliasOf} handleAliasOfChange={handleAliasOfChange}
                            recordType={recordType} handleRecordTypeChange={handleRecordTypeChange}
                            recordTypeAutocompleteKey={recordTypeAutocompleteKey}
                            recordDesc={recordDesc} handleRecordDescChange={handleRecordDescChange}
                            extraPropAName={extraPropAName} extraPropBName={extraPropBName}
                            extraPropAValue={extraPropAValue} handleExtraPropAChange={handleExtraPropAChange}
                            extraPropBValue={extraPropBValue} handleExtraPropBChange={handleExtraPropBChange}
                            handleClear={handleClear}
                            setIsLoading={setIsLoading}></ParamSearch>
                    ) : (
                        <FreeSearch handleOpenErrorAlert={props.handleOpenErrorAlert} handleErrorMessage={props.handleErrorMessage} />
                    )
                }
                <Grid container item xs={12} style={{ display: "flex" }}>
                    <QueryResults isLoading={isLoading} cfData={cfData} />
                </Grid>
            </form>
        </ Fragment >
    );
}

Home.propTypes = propTypes;
export default Home;
