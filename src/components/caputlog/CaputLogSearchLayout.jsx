import React, { useState, useEffect } from "react";
import { Layout } from "@elastic/react-search-ui-views";
import { ErrorBoundary, Facet, PagingInfo, ResultsPerPage, Paging, useSearch, SearchBox } from "@elastic/react-search-ui";
import { Box, Button, TextField, InputAdornment } from "@mui/material";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import './CaputLogSearchLayout.css';
import moment from "moment";
import PropTypes from "prop-types";

const propTypes = {
    showSearchBox: PropTypes.bool,
    facetFields: PropTypes.arrayOf(PropTypes.shape({
        field: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
    })),
    children: PropTypes.func.isRequired,
}

function CaputLogSearchLayout({
    showSearchBox = false,
    facetFields = [],
    children
}) {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const { wasSearched, setFilter, removeFilter, results, setSort } = useSearch();

    // Set initial sort to @timestamp desc on mount
    useEffect(() => {
        setSort("@timestamp", "desc");
    }, [setSort]);

    const onDateChange = (dates) => {
        const [start, end] = dates;
        const adjustedStartDate = start ? moment(start).startOf("day").toDate() : null;
        const adjustedEndDate = end ? moment(end).endOf("day").toDate() : null;
        setStartDate(adjustedStartDate);
        setEndDate(adjustedEndDate);
        if (!adjustedStartDate || !adjustedEndDate) {
            removeFilter("@timestamp");
        } else {
            setFilter("@timestamp", {
                name: "@timestamp",
                from: adjustedStartDate.toISOString(),
                to: adjustedEndDate.toISOString(),
            });
        }
    };

    const clearDateFilters = () => {
        setStartDate(null);
        setEndDate(null);
        removeFilter("@timestamp");
    };

    return (
        <div>
            <ErrorBoundary>
                <Layout
                    header={
                        <Box sx={{
                            width: "100%",
                            maxWidth: "100%",
                            display: "flex",
                            flexDirection: "column",
                        }} >
                            {showSearchBox && (
                                <SearchBox inputProps={{ placeholder: "Search by PV Name, User, or Client" }} />
                            )}
                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, width: '100%' }}>
                                <Box sx={{ flex: 1 }}>
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
                                        }
                                    />
                                </Box>
                                <Button variant="contained" onClick={clearDateFilters}>
                                    Clear
                                </Button>
                            </Box>
                        </Box>
                    }
                    bodyContent={
                        wasSearched ? (
                            children(results)
                        ) : (
                            <p>No results to display.</p>
                        )
                    }
                    sideContent={
                        facetFields.map(facet => (
                            <Facet
                                key={facet.field}
                                field={facet.field}
                                label={facet.label}
                                filterType="any"
                                isFilterable={false}
                            />
                        ))
                    }
                    bodyHeader={
                        <React.Fragment>
                            {wasSearched && <PagingInfo />}
                            {wasSearched && (
                                <div style={{ position: 'relative', zIndex: 20, marginBottom: '10px' }}>
                                    <ResultsPerPage />
                                </div>
                            )}
                        </React.Fragment>
                    }
                    bodyFooter={<Paging />}
                />
            </ErrorBoundary>
        </div>
    );
}

CaputLogSearchLayout.propTypes = propTypes;
export default CaputLogSearchLayout;
