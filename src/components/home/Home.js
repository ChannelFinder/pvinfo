import React, { Fragment, useEffect, useState } from 'react';
import { Box, Grid, ToggleButton, ToggleButtonGroup, Typography, Tooltip } from '@mui/material';
import QueryResults from "./queryresults";
import api from "../../api";
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
    handleSeverity: PropTypes.func,
}

function Home(props) {
    const [standardSearch, setStandardSearch] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const [cfData, setCFData] = useState(null);
    const [pvCount, setPVCount] = useState(null);
    const [pvName, setPVName] = useState(searchParams.get("pvName") || "");
    const [hostName, setHostName] = useState(searchParams.get("hostName") || "");
    const [iocName, setIOCName] = useState(searchParams.get("iocName") || "");
    const [pvStatus, setPVStatus] = useState(searchParams.has("pvStatus") ? searchParams.get("pvStatus") : "*");
    const [aliasOf, setAliasOf] = useState(searchParams.get("alias") || "");
    const [recordType, setRecordType] = useState(searchParams.get("recordType") || "");
    const [recordTypeAutocompleteKey, setRecordTypeAutocompleteKey] = useState(-1);
    const [recordDesc, setRecordDesc] = useState(searchParams.get("recordDesc") || "");
    const [freeformQuery, setFreeformQuery] = useState("");
    const extraPropAName = process.env.REACT_APP_EXTRA_PROP === "" ? null : process.env.REACT_APP_EXTRA_PROP;
    const extraPropBName = process.env.REACT_APP_SECOND_EXTRA_PROP === "" ? null : process.env.REACT_APP_SECOND_EXTRA_PROP;

    const [extraPropAValue, setExtraPropAValue] = useState(searchParams.get(extraPropAName) || "");
    const [extraPropBValue, setExtraPropBValue] = useState(searchParams.get(extraPropBName) || "");
    const [searchProperties, setSearchProperties] = useState([]);
    const [searchTags, setSearchTags] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const cfProps = {
        "pvName": setPVName,
        "recordDesc": setRecordDesc,
        "recordType": setRecordType,
        "iocName": setIOCName,
        "hostName": setHostName,
        "pvStatus": setPVStatus,
        "alias": setAliasOf,
        [extraPropAName]: setExtraPropAValue,
        [extraPropBName]: setExtraPropBValue,
    }

    const handleSearchType = (e, newSearchType) => {
        if (newSearchType !== null) {
            setStandardSearch(newSearchType);
        }
    };
    const handleInputChange = (e) => {
        cfProps[e.target.name](e.target.value);
    }
    const handleFreeformChange = (e) => {
        setFreeformQuery(e.target.value);
    };

    const fetchData = (apiCall, parameters, setData, dataName, displayError = false, setLoading = false) => {
        apiCall(parameters)
            .then((data) => {
                if (data === null) {
                    console.log(`Null ${dataName} data from Channel Finder`);
                }
                setData(data);
                if (setLoading) setIsLoading(false);
            })
            .catch((err) => {
                console.log(`Error in ${dataName} fetch from Channel Finder`);
                console.log(err);
                if (displayError) {
                    props.handleErrorMessage("Error in EPICS Channel Finder Query");
                    props.handleSeverity("error");
                    props.handleOpenErrorAlert(true);
                }
                setData(null);
                if (setLoading) setIsLoading(false);
            })

    }

    useEffect(() => {
        api.HELPERS_QUERY(api.HELPERS_ENUM.PROPERTIES)
            .then((data) => {
                setSearchProperties(data);
            })
            .catch((err) => {
                console.log("Error fetching search properties");
                console.log(err);
            })

        api.HELPERS_QUERY(api.HELPERS_ENUM.TAGS)
            .then((data) => {
                setSearchTags(data);
            })
            .catch((err) => {
                console.log("Error fetching search tags");
                console.log(err);
            })
    }, [props])

    useEffect(() => {
        // If there are search parameters in the URL, query channel finder and show the PV data
        let params = {}
        searchParams.forEach((val, key) => { if (val !== "") { params[key] = val } });
        let standardSearch = true;
        if ("standardSearch" in params) {
            standardSearch = params["standardSearch"] === "false" ? false : true;
            setStandardSearch(standardSearch);
            delete params["standardSearch"];
        }
        if (Object.keys(params).length > 0) {
            let freeformQuery = ""
            if ("pvName" in params) {
                setPVName(params["pvName"]);
                freeformQuery = params["pvName"];
                delete params["pvName"];
            }
            // Populate the stock & extra prop CF property values
            for (const prop in cfProps) {
                if (prop in params) {
                    if (prop === "pvName") continue;
                    cfProps[prop](params[prop]);
                    freeformQuery = freeformQuery.concat(` ${prop}=${params[prop]}`);
                    delete params[prop];
                } else if (prop === "pvStatus") {
                    cfProps[prop]("*");
                }
            }
            // Fill out the freeform query with any extra search props
            for (let key in params) {
                const value = params[key];
                if (key.includes('tag')) {
                    freeformQuery = freeformQuery.concat(` ${value}`);
                } else {
                    freeformQuery = freeformQuery.concat(` ${key}=${value}`);
                }
            }
            setFreeformQuery(freeformQuery);
            let resetParams = {}
            searchParams.forEach((val, key) => { if (val !== "") { resetParams[key] = val } });
            resetParams["standardSearch"] = standardSearch;
            setIsLoading(true);
            fetchData(api.CF_QUERY, resetParams, setCFData, "PV", true, true);
            fetchData(api.COUNT_QUERY, resetParams, setPVCount, "count");
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
            setPVCount(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, extraPropAName, extraPropBName]);

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
            if (e.target[extraPropAName].value) { params[process.env.REACT_APP_EXTRA_PROP] = e.target[extraPropAName].value; }
        }
        if (extraPropBName !== null) {
            if (e.target[extraPropBName].value) { params[process.env.REACT_APP_SECOND_EXTRA_PROP] = e.target[extraPropBName].value; }
        }
        return params;
    }

    const parseFreeformSearch = (e) => {
        const keyValuePairs = e.target.freeSearch.value.split(' ');
        let params = {};
        let numTags = 1;

        for (let pair of keyValuePairs) {
            const [key, value] = pair.split('=');
            if (key === keyValuePairs[0]) {
                params['pvName'] = key;
            } else if (value !== undefined) {
                params[key] = value;
            } else {
                params[`tag${numTags}`] = key;
                ++numTags;
            }
        }
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
        params['standardSearch'] = standardSearch;
        fetchData(api.CF_QUERY, params, setCFData, "PV", true, true);
        fetchData(api.COUNT_QUERY, params, setPVCount, "count");
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
        setFreeformQuery("");
        // https://stackoverflow.com/a/59845474
        setRecordTypeAutocompleteKey(recordTypeAutocompleteKey - 1);
    }

    return (
        <Fragment>
            <form onSubmit={handleSubmit}>
                <Grid item alignItems="center" sx={{ backgroundColor: '#d7e3f5' }} xs={12}>
                    <Typography
                        style={{ marginBottom: 10 }}
                        align="center"
                        variant="h6"
                    >
                        {process.env.REACT_APP_HOMEPAGE_HEADER}
                    </Typography>
                    <Typography
                        style={{ marginBottom: 10 }}
                        align="center"
                        variant="subtitle1"
                    >
                        {process.env.REACT_APP_HOMEPAGE_SUBHEADER}
                    </Typography>
                </Grid>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <Tooltip arrow title="Search Type - Standard / Free Form">
                        <ToggleButtonGroup
                            value={standardSearch}
                            exclusive
                            onChange={handleSearchType}
                            aria-label="search type"
                            style={{ marginBottom: 15 }}
                        >
                            <ToggleButton value={true} aria-label="param search">
                                <ManageSearchRoundedIcon />
                            </ToggleButton>
                            <ToggleButton value={false} aria-label="free search">
                                <PageviewRoundedIcon />
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Tooltip>
                    {
                        pvCount !== null ? (
                            <Typography sx={{ ml: 2, marginBottom: 2 }}><Box component="span" sx={{ fontWeight: "medium" }}>Results:</Box> {pvCount}</Typography>
                        ) : null
                    }
                </Box>
                {
                    standardSearch ? (
                        <ParamSearch
                            pvName={pvName}
                            hostName={hostName} iocName={iocName}
                            pvStatus={pvStatus} aliasOf={aliasOf}
                            recordType={recordType} recordDesc={recordDesc}
                            recordTypeAutocompleteKey={recordTypeAutocompleteKey}
                            extraPropAName={extraPropAName} extraPropBName={extraPropBName}
                            extraPropAValue={extraPropAValue} extraPropBValue={extraPropBValue}
                            handleInputChange={handleInputChange}
                            handleClear={handleClear}
                            setIsLoading={setIsLoading}
                        ></ParamSearch>
                    ) : (
                        <FreeSearch freeformQuery={freeformQuery} setFreeformQuery={setFreeformQuery} handleFreeformChange={handleFreeformChange}
                            handleClear={handleClear} searchProperties={searchProperties} searchTags={searchTags} />
                    )
                }
                <Grid container item xs={12} style={{ display: "flex" }}>
                    <QueryResults isLoading={isLoading} cfData={cfData} handleErrorMessage={props.handleErrorMessage} handleOpenErrorAlert={props.handleOpenErrorAlert} handleSeverity={props.handleSeverity} />
                </Grid>
            </form>
        </ Fragment >
    );
}

Home.propTypes = propTypes;
export default Home;
