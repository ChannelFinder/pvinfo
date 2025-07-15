import React, { useState } from "react";
import { ElasticsearchProvider } from "./ElasticsearchProvider";
import { SearchProvider } from "@elastic/react-search-ui";
import { Accordion, AccordionDetails, AccordionSummary, Typography, Box, TextField, InputAdornment } from "@mui/material";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "@elastic/react-search-ui-views/lib/styles/styles.css";
import moment from "moment";
import PropTypes from "prop-types";
import api from "../../../api";

const propTypes = {
    pvName: PropTypes.string,
}

function CaputLogTable(props) {

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const onDateChange = (dates) => {
        const [start, end] = dates;

        // Set startDate to the beginning of the day
        const adjustedStartDate = start ? moment(start).startOf("day").toDate() : null;

        // Set endDate to the end of the day
        const adjustedEndDate = end ? moment(end).endOf("day").toDate() : null;

        setStartDate(adjustedStartDate);
        setEndDate(adjustedEndDate);
    };
    const [caputLogExpanded, setCaputLogExpanded] = useState(false);
    const handleCaputLogExpandedChange = () => (event, isExpanded) => {
        setCaputLogExpanded(isExpanded);
    }

    const buildFilter = () => {
        if (!startDate || !endDate) return [ {
            field: "pv.keyword",
            values: [props.pvName],
            },];
        const filters = [
            {
                field: "@timestamp",
                values: [{
                    from: startDate.toISOString(),
                    to: endDate.toISOString(),
                    name: "Date Range"
                } ],
            },
            {
                field: "pv.keyword",
                values: [props.pvName],
            },
        ];
        return filters;
    };

    const searchConfig = {
        alwaysSearchOnInitialLoad: true,
        apiConnector: api.CAPUTLOG_CONNECTOR,
        hasA11yNotifications: true,
        trackUrlState: false,
        searchQuery: {
            filters: buildFilter(),
            search_fields: {
                pv: {
                    weight: 3
                },
            },
            result_fields: {
                old: { raw: {} },
                user: { raw: {} },
                message: { raw: {} },
                pv: { raw: {} },
                client: { raw: {} },
                new: { raw: {} },
                "@ioctimestamp": { raw: {} },
                "@timestamp": { raw: {} },
                timestamp: { raw: {} },
                id: { raw: {} }
            },
            facets: {
                "user.keyword": { type: "value", size: 30, sort: "count" },
                "client.keyword": { type: "value", size: 30, sort: "count" },
            }
        },
    };

    return (
        <Accordion expanded={caputLogExpanded} onChange={handleCaputLogExpandedChange()}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="caputLog-content" id="caputLog-header">
                <Typography sx={{ fontSize: 18, fontWeight: "medium" }}>Caput Log Data</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0, }}>
                <Box sx={{
                        width: "100%",
                        maxWidth: "100%",
                        display: "flex",
                        flexDirection: "column",
                    }} >
                        <DatePicker
                            selected={startDate}
                            onChange={onDateChange}
                            startDate={startDate}
                            endDate={endDate}
                            selectsRange={true}
                            showPreviousMonths
                            monthsShown={2}
                            placeholderText="Date Range for Caput Log Data"
                            withPortal
                            customInput={
                                <TextField
                                    fullWidth
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <CalendarMonthIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                    variant="outlined"
                                    size="small"
                                    placeholder="Date Range for Caput Log Data"
                                />
                            }/>
                    <SearchProvider config={searchConfig}>
                        <ElasticsearchProvider />
                    </SearchProvider>
                </Box>
            </AccordionDetails>
        </Accordion>
    );
}

CaputLogTable.propTypes = propTypes;
export default CaputLogTable;
