import React, { Fragment } from 'react';
import { Grid, TextField, MenuItem, Tooltip } from '@mui/material';
import SearchActions from '../searchactions/SearchActions';
import Autocomplete from '@mui/material/Autocomplete';
import PropTypes from "prop-types";

const propTypes = {
    pvName: PropTypes.string,
    hostName: PropTypes.string,
    iocName: PropTypes.string,
    pvStatus: PropTypes.string,
    aliasOf: PropTypes.string,
    recordType: PropTypes.string,
    recordTypeAutocompleteKey: PropTypes.number,
    recordDesc: PropTypes.string,
    extraPropAName: PropTypes.string,
    extraPropBName: PropTypes.string,
    extraPropAValue: PropTypes.string,
    extraPropBValue: PropTypes.string,
    handleInputChange: PropTypes.func,
    handleClear: PropTypes.func,
    setIsLoading: PropTypes.func
}

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

const pvRecordTypes = ['aai', 'aao', 'ai', 'ao', 'aSub', 'bi', 'bo', 'calcout', 'calc', 'compress', 'dfanout', 'event',
    'fanout', 'histogram', 'int64in', 'int64out', 'longin', 'longout', 'lsi', 'lso', 'mbbi', 'mbbiDirect', 'mbbo', 'mbboDirect',
    'permissive', 'printf', 'sel', 'seq', 'state', 'stringin', 'stringout', 'subArray', 'sub', 'waveform']

function ParamSearch(props) {
    const recordDescSearchRender = () => {
        if (import.meta.env.REACT_APP_CF_RECORD_DESC === "true") {
            return (
                <Tooltip arrow title={<div>* for any # character wildcard<br />? for single character wildcard<br />! at beginning for not equal<br />= at beginning for exactly equal</div>}>
                    <TextField
                        sx={{ display: "flex", flexGrow: 1, minWidth: { xs: '100%', md: '50%', lg: '16%' } }}
                        id="recordDsec"
                        label="Description"
                        autoComplete="off"
                        name="recordDesc"
                        value={props.recordDesc}
                        placeholder="Description"
                        type="search"
                        variant="outlined"
                        onChange={props.handleInputChange}
                    />
                </Tooltip>
            )
        }
    }
    const recordTypeSearchRender = () => {
        if (import.meta.env.REACT_APP_CF_RECORD_TYPE === "true") {
            return (
                // <Box sx={{ display: "flex" }}>
                <Tooltip arrow title={<div>* for any # character wildcard<br />? for single character wildcard<br />! at beginning for not equal<br />= at beginning for exactly equal</div>}>
                    <Autocomplete
                        sx={{ display: "flex", flexGrow: 1, minWidth: { xs: '50%', md: '25%', lg: '8%' } }}
                        freeSolo
                        disableClearable
                        options={pvRecordTypes}
                        key={props.recordTypeAutocompleteKey}
                        value={props.recordType}
                        renderInput={(params) =>
                            <TextField
                                id="recordType"
                                {...params}
                                label="Record Type"
                                name="recordType"
                                placeholder="Record Type"
                                type="search"
                                variant="outlined"
                                onChange={props.handleInputChange}
                            />
                        }
                    />
                </Tooltip>
                // </Box>
            )
        }
    }
    const aliasOfSearchRender = () => {
        if (import.meta.env.REACT_APP_CF_ALIAS === "true") {
            return (
                <Tooltip arrow title={<div>* for any # character wildcard<br />? for single character wildcard<br />! at beginning for not equal<br />= at beginning for exactly equal</div>}>
                    <TextField
                        sx={{ display: "flex", flexGrow: 1, minWidth: { xs: '50%', md: '25%', lg: '8%' } }}
                        id="alias"
                        label="Alias Of"
                        autoComplete="off"
                        name="alias"
                        value={props.aliasOf}
                        placeholder="Alias Of"
                        type="search"
                        variant="outlined"
                        onChange={props.handleInputChange}
                    />
                </Tooltip>
            )
        }
    }
    const extraPropARender = () => {
        if (props.extraPropAName !== null) {
            if (import.meta.env.REACT_APP_EXTRA_PROP_DROPDOWN_LABELS !== "") {
                return (
                    // <Box sx={{ display: "flex" }}>
                    <Tooltip arrow title={<div>* for any # character wildcard<br />? for single character wildcard<br />! at beginning for not equal<br />= at beginning for exactly equal</div>}>
                        <Autocomplete
                            sx={{ display: "flex", flexGrow: 1, minWidth: { xs: '50%', md: '25%', lg: '8%' } }}
                            freeSolo
                            disableClearable
                            options={import.meta.env.REACT_APP_EXTRA_PROP_DROPDOWN_LABELS.split(",")}
                            key={props.recordTypeAutocompleteKey}
                            value={props.extraPropAValue}
                            renderInput={(params) =>
                                <TextField
                                    id={props.extraPropAName}
                                    {...params}
                                    label={import.meta.env.REACT_APP_EXTRA_PROP_LABEL}
                                    name={props.extraPropAName}
                                    placeholder={import.meta.env.REACT_APP_EXTRA_PROP_LABEL}
                                    type="search"
                                    variant="outlined"
                                    onChange={props.handleInputChange}
                                />
                            }
                        />
                    </Tooltip>
                    // </Box>
                )
            }
            else {
                return (
                    <Tooltip arrow title={<div>* for any # character wildcard<br />? for single character wildcard<br />! at beginning for not equal<br />= at beginning for exactly equal</div>}>
                        <TextField
                            sx={{ display: "flex", flexGrow: 1, minWidth: { xs: '50%', md: '25%', lg: '8%' } }}
                            id={props.extraPropAName}
                            label={import.meta.env.REACT_APP_EXTRA_PROP_LABEL}
                            autoComplete="off"
                            name={props.extraPropAName}
                            value={props.extraPropAValue}
                            placeholder={import.meta.env.REACT_APP_EXTRA_PROP_LABEL}
                            type="search"
                            variant="outlined"
                            onChange={props.handleInputChange}
                        />
                    </Tooltip>
                )
            }
        }
    }
    const extraPropBRender = () => {
        if (props.extraPropBName !== null) {
            if (import.meta.env.REACT_APP_SECOND_EXTRA_PROP_DROPDOWN_LABELS !== "") {
                return (
                    // <Box sx={{ display: "flex" }}>
                    <Tooltip arrow title={<div>* for any # character wildcard<br />? for single character wildcard<br />! at beginning for not equal<br />= at beginning for exactly equal</div>}>
                        <Autocomplete
                            sx={{ display: "flex", flexGrow: 1, minWidth: { xs: '50%', md: '25%', lg: '8%' } }}
                            freeSolo
                            disableClearable
                            options={import.meta.env.REACT_APP_SECOND_EXTRA_PROP_DROPDOWN_LABELS.split(",")}
                            key={props.recordTypeAutocompleteKey}
                            value={props.extraPropBValue}
                            renderInput={(params) =>
                                <TextField
                                    id={props.extraPropBName}
                                    {...params}
                                    label={import.meta.env.REACT_APP_SECOND_EXTRA_PROP_LABEL}
                                    name={props.extraPropBName}
                                    placeholder={import.meta.env.REACT_APP_SECOND_EXTRA_PROP_LABEL}
                                    type="search"
                                    variant="outlined"
                                    onChange={props.handleInputChange}
                                />
                            }
                        />
                    </Tooltip>
                    // </Box>
                )
            }
            else {
                return (
                    <Tooltip arrow title={<div>* for any # character wildcard<br />? for single character wildcard<br />! at beginning for not equal<br />= at beginning for exactly equal</div>}>
                        <TextField
                            sx={{ display: "flex", flexGrow: 1, minWidth: { xs: '50%', md: '25%', lg: '8%' } }}
                            id={props.extraPropBName}
                            label={import.meta.env.REACT_APP_SECOND_EXTRA_PROP_LABEL}
                            autoComplete="off"
                            name={props.extraPropBName}
                            value={props.extraPropBValue}
                            placeholder={import.meta.env.REACT_APP_SECOND_EXTRA_PROP_LABEL}
                            type="search"
                            variant="outlined"
                            onChange={props.handleInputChange}
                        />
                    </Tooltip>
                )
            }
        }
    }

    return (
        <Fragment>
            <Grid item container xs={12} sx={{ display: 'flex', flexWrap: { xs: 'wrap', lg: 'nowrap' } }}>
                {/* <Box className="main-query-box" sx={{ flex: 1 }}> */}
                <Tooltip arrow title={<div>* for any # character wildcard<br />? for single character wildcard<br />= at beginning for exactly equal</div>}>
                    <TextField
                        sx={{ display: "flex", flexGrow: 1, minWidth: { xs: '100%', md: '50%', lg: '16%' }, textOverflow: 'ellipsis' }}
                        id="pvName"
                        label="PV Name"
                        name="pvName"
                        autoComplete="off"
                        value={props.pvName}
                        placeholder="PV Name"
                        type="search"
                        variant="outlined"
                        onChange={props.handleInputChange}
                    />
                </Tooltip>
                {recordDescSearchRender()}
                <Tooltip arrow title={<div>* for any # character wildcard<br />? for single character wildcard<br />! at beginning for not equal<br />= at beginning for exactly equal</div>}>
                    <TextField
                        sx={{ display: "flex", flexGrow: 1, minWidth: { xs: '50%', md: '25%', lg: '8%' } }}
                        id="hostName"
                        label="Host Name"
                        autoComplete="off"
                        name="hostName"
                        value={props.hostName}
                        placeholder="Host Name"
                        type="search"
                        variant="outlined"
                        onChange={props.handleInputChange}
                    />
                </Tooltip>
                <Tooltip arrow title={<div>* for any # character wildcard<br />? for single character wildcard<br />! at beginning for not equal<br />= at beginning for exactly equal</div>}>
                    <TextField
                        sx={{ display: "flex", flexGrow: 1, minWidth: { xs: '50%', md: '25%', lg: '8%' } }}
                        id="iocName"
                        label="IOC Name"
                        autoComplete="off"
                        name="iocName"
                        value={props.iocName}
                        placeholder="IOC Name"
                        type="search"
                        variant="outlined"
                        onChange={props.handleInputChange}
                    />
                </Tooltip>
                {/* <Box sx={{ display: "flex", flexGrow: 1, minWidth: 100 }}> */}
                <TextField
                    sx={{ display: "flex", flexGrow: 1, minWidth: { xs: '50%', md: '25%', lg: '8%' } }}
                    id="pvStatus"
                    name="pvStatus"
                    select
                    value={props.pvStatus}
                    onChange={props.handleInputChange}
                    label="Status"
                    variant="outlined"
                >
                    {pvStatusOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value} >
                            {option.label}
                        </MenuItem>
                    ))}
                </TextField>
                {/* </Box> */}
                {recordTypeSearchRender()}
                {/* <Box sx={{ display: 'flex', flexDirection: 'row', flexGrow: 1, flexWrap: { xs: 'wrap', md: 'nowrap' } }}> */}
                {extraPropARender()}
                {extraPropBRender()}
                {aliasOfSearchRender()}
                <SearchActions handleClear={props.handleClear} minWidth={{ xs: '50%', md: '25%', lg: '8%' }} />
                {/* </Box> */}
            </Grid>
        </Fragment>
    );
}

ParamSearch.propTypes = propTypes
export default ParamSearch;
