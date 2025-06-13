import React, { useState } from "react";
import { ApiProxyConnector } from "@elastic/search-ui-elasticsearch-connector";
import ElasticSearchAPIConnector from "@elastic/search-ui-elasticsearch-connector";
import { ElasticsearchProvider } from "./ElasticsearchProvider";
import { SearchProvider } from "@elastic/react-search-ui";
import { Accordion, AccordionDetails, AccordionSummary, Typography, Box, TextField, InputAdornment } from "@mui/material";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "@elastic/react-search-ui-views/lib/styles/styles.css";
import moment from "moment";

const apiHost = import.meta.env.REACT_APP_CAPUTLOG_URL;
const apikey = import.meta.env.REACT_APP_ELASTICSEARCH_API_KEY || "";
const elasticIndexName = import.meta.env.REACT_APP_ELASTICSEARCH_INDEX_NAME || "";

// Choice to use Elasticsearch directly or an API Proxy
var connector = import.meta.env.REACT_APP_USE_CAPUT_API_PROXY_CONNNECTOR === "true"
    ? new ApiProxyConnector({
            basePath: `${apiHost}`
        })
    : new ElasticSearchAPIConnector({
            host: `${apiHost}`,
            index: `${elasticIndexName}`,
            apiKey: `${apikey}`
        });

export default function CaputLogTable(props) {

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
        console.log("Generated Filters:", filters);
        return filters;
    };
    
    const searchConfig = {
        alwaysSearchOnInitialLoad: true,
        apiConnector: connector,
        hasA11yNotifications: true,
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
                timestamp: { raw: {} }
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
