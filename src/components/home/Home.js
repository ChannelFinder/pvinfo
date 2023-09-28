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

    const handleSearchType = (e, newSearchType) => {
        if (newSearchType !== null) {
            setStandardSearch(newSearchType);
        }
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
    const handleFreeformChange = (e) => {
        setFreeformQuery(e.target.value);
    }
    const queryPVs = (parameters) => {
        api.CF_QUERY(parameters)
            .then((data) => {
                if (data === null) {
                    console.log("Null PV data from Channel Finder");
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
                props.handleSeverity("error");
                props.handleOpenErrorAlert(true);
                setIsLoading(false);
                setCFData(null);
            })
    };

    const queryCount = (parameters) => {
        api.COUNT_QUERY(parameters)
            .then((data) => {
                if (data === null) {
                    console.log("Null count data from Channel Finder");
                    setPVCount(null)
                }
                else {
                    setPVCount(data);
                }
            })
            .catch((err) => {
                console.log("Error in PV count fetch");
                console.log(err);
                setPVCount(null)
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
            if ("recordDesc" in params) {
                setRecordDesc(params["recordDesc"]);
                freeformQuery = freeformQuery.concat(` recordDesc=${params["recordDesc"]}`);
                delete params["recordDesc"];
            }
            if ("recordType" in params) {
                setRecordType(params["recordType"]);
                freeformQuery = freeformQuery.concat(` recordType=${params["recordType"]}`)
                delete params["recordType"];
            }
            if ("iocName" in params) {
                setIOCName(params["iocName"]);
                freeformQuery = freeformQuery.concat(` iocName=${params["iocName"]}`);
                delete params["iocName"];
            }
            if ("hostName" in params) {
                setHostName(params["hostName"]);
                freeformQuery = freeformQuery.concat(` hostName=${params["hostName"]}`);
                delete params["hostName"];
            }
            if ("pvStatus" in params) {
                setPVStatus(params["pvStatus"]);
                freeformQuery = freeformQuery.concat(` pvStatus=${params["pvStatus"]}`);
                delete params["pvStatus"]
            } else {
                setPVStatus("*");
            }
            if ("alias" in params) {
                setAliasOf(params["alias"]);
                freeformQuery = freeformQuery.concat(` alias=${params["alias"]}`);
                delete params["alias"];
            }
            if (extraPropAName in params) {
                setExtraPropAValue(params[extraPropAName]);
                freeformQuery = freeformQuery.concat(` ${extraPropAName}=${params[extraPropAName]}`);
                delete params[extraPropAName];
            }
            if (extraPropBName in params) {
                setExtraPropBValue(params[extraPropBName]);
                freeformQuery = freeformQuery.concat(` ${extraPropBName}=${params[extraPropBName]}`);
                delete params[extraPropBName];
            }
            if (!standardSearch) {
                for (let key in params) {
                    const value = params[key];
                    if (key.includes('tag')) {
                        freeformQuery = freeformQuery.concat(` ${value}`);
                    } else {
                        freeformQuery = freeformQuery.concat(` ${key}=${value}`);
                    }
                }
            }
            setFreeformQuery(freeformQuery);
            let resetParams = {}
            searchParams.forEach((val, key) => { if (val !== "") { resetParams[key] = val } });
            resetParams["standardSearch"] = standardSearch;
            setIsLoading(true);
            queryPVs(resetParams);
            queryCount(resetParams);
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
            if (e.target.extraPropA.value) { params[process.env.REACT_APP_EXTRA_PROP] = e.target.extraPropA.value; }
        }
        if (extraPropBName !== null) {
            if (e.target.extraPropB.value) { params[process.env.REACT_APP_SECOND_EXTRA_PROP] = e.target.extraPropB.value; }
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
        queryCount(params);
        queryPVs(params);
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
                    <Typography sx={{ ml: 4, fontWeight: 'medium', color: 'grey.600' }}>Results: {pvCount ? pvCount : "null"}</Typography>
                </Box>
                {
                    standardSearch ? (
                        <ParamSearch
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
