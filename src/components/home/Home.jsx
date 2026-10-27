import React, { Fragment, useEffect, useState } from 'react';
import { Box, Grid, ToggleButton, ToggleButtonGroup, Typography, Tooltip } from '@mui/material';
import QueryResults from "./queryresults";
import api from "../../api";
import { useSearchParams } from "react-router";
import ManageSearchRoundedIcon from '@mui/icons-material/ManageSearchRounded';
import PageviewRoundedIcon from '@mui/icons-material/PageviewRounded';
import ParamSearch from './paramsearch';
import AdvancedSearch from './advancedsearch';
import { parseAdvancedQuery, isTagParam, getAdvancedQueryError } from './advancedsearch/advancedQuery';
// is this needed?
import './Home.css';
import config from "../../config";

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
    const [advancedQuery, setAdvancedQuery] = useState("");
    const [advancedQueryError, setAdvancedQueryError] = useState("");
    const extraPropAName = config.EXTRA_PROP === "" || config.EXTRA_PROP === null ? null : config.EXTRA_PROP;
    const extraPropBName = config.SECOND_EXTRA_PROP === "" || config.SECOND_EXTRA_PROP === null ? null : config.SECOND_EXTRA_PROP;

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
    const handleAdvancedChange = (e) => {
        setAdvancedQuery(e.target.value);
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
            // the Advanced query starts with the PV name, so use * when there isn't one or a tag would be read as the PV name
            let advancedQuery = "*"
            if ("pvName" in params) {
                setPVName(params["pvName"]);
                advancedQuery = params["pvName"];
                delete params["pvName"];
            }
            // Populate the stock & extra prop CF property values
            for (const prop in cfProps) {
                if (prop in params) {
                    if (prop === "pvName") continue;
                    cfProps[prop](params[prop]);
                    advancedQuery = advancedQuery.concat(` ${prop}=${params[prop]}`);
                    delete params[prop];
                } else if (prop === "pvStatus") {
                    cfProps[prop]("*");
                }
            }
            // Fill out the advanced query with any extra search props
            for (let key in params) {
                const value = params[key];
                if (isTagParam(key)) {
                    advancedQuery = advancedQuery.concat(` ${value}`);
                } else {
                    advancedQuery = advancedQuery.concat(` ${key}=${value}`);
                }
            }
            setAdvancedQuery(advancedQuery);
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
        if (config.CF_RECORD_TYPE) {
            if (e.target.recordType.value) { params[e.target.recordType.name] = e.target.recordType.value; }
        }
        if (config.CF_RECORD_ALIAS) {
            if (e.target.alias.value) { params[e.target.alias.name] = e.target.alias.value; }
        }
        if (config.CF_RECORD_DESC) {
            if (e.target.recordDesc.value) { params[e.target.recordDesc.name] = e.target.recordDesc.value; }
        }
        if (extraPropAName !== null) {
            if (e.target[extraPropAName].value) { params[config.EXTRA_PROP] = e.target[extraPropAName].value; }
        }
        if (extraPropBName !== null) {
            if (e.target[extraPropBName].value) { params[config.SECOND_EXTRA_PROP] = e.target[extraPropBName].value; }
        }
        return params;
    }

    // the error is for the query that was submitted, clear it when the query is changed
    useEffect(() => {
        setAdvancedQueryError("");
    }, [advancedQuery]);

    const handleSubmit = (e) => {
        e.preventDefault();
        let params = {}
        if (standardSearch) {
            params = parseParamSearch(e);
        } else {
            params = parseAdvancedQuery(advancedQuery);
            const queryError = getAdvancedQueryError(params);
            if (queryError !== "") {
                setAdvancedQueryError(queryError);
                return;
            }
        }
        setIsLoading(true);
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
        setAdvancedQuery("");
        // https://stackoverflow.com/a/59845474
        setRecordTypeAutocompleteKey(recordTypeAutocompleteKey - 1);
    }

    return (
        <Fragment>
            <form onSubmit={handleSubmit}>
                <Grid alignItems="center" sx={{ backgroundColor: '#d7e3f5' }} size={12}>
                    <Typography
                        style={{ marginBottom: 10 }}
                        align="center"
                        variant="h6"
                    >
                        {config.HOMEPAGE_HEADER}
                    </Typography>
                    <Typography
                        style={{ marginBottom: 10 }}
                        align="center"
                        variant="subtitle1"
                    >
                        {config.HOMEPAGE_SUBHEADER}
                    </Typography>
                </Grid>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <Tooltip arrow title="Search Type - Standard / Advanced">
                        <ToggleButtonGroup
                            value={standardSearch}
                            exclusive
                            onChange={handleSearchType}
                            aria-label="search type"
                            style={{ marginBottom: 15 }}
                        >
                            <ToggleButton value={true} aria-label="Standard search">
                                <ManageSearchRoundedIcon />
                                <Box component="span" sx={{ display: { xs: "none", sm: "inline" }, ml: 1 }}>Standard</Box>
                            </ToggleButton>
                            <ToggleButton value={false} aria-label="Advanced search">
                                <PageviewRoundedIcon />
                                <Box component="span" sx={{ display: { xs: "none", sm: "inline" }, ml: 1 }}>Advanced</Box>
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
                        <AdvancedSearch advancedQuery={advancedQuery} setAdvancedQuery={setAdvancedQuery} handleAdvancedChange={handleAdvancedChange}
                            handleClear={handleClear} searchProperties={searchProperties} searchTags={searchTags}
                            showHelp={cfData === null} queryError={advancedQueryError} />
                    )
                }
                <Grid container style={{ display: "flex" }} size={12}>
                    <QueryResults isLoading={isLoading} cfData={cfData} handleErrorMessage={props.handleErrorMessage} handleOpenErrorAlert={props.handleOpenErrorAlert} handleSeverity={props.handleSeverity} />
                </Grid>
            </form>
        </ Fragment >
    );
}

export default Home;
