import React, { useEffect, useState } from "react";
import { SearchProvider, useSearch } from "@elastic/react-search-ui";
import { Accordion, AccordionDetails, AccordionSummary, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { getCaputLogSearchConfig } from "../../caputlog/caputlogSearchConfig";
import CaputLogDataTable from "../../caputlog/CaputLogDataTable";
import CaputLogSearchLayout from "../../caputlog/CaputLogSearchLayout";
import "@elastic/react-search-ui-views/lib/styles/styles.css";

// Accordion inside the SearchProvider so the header can use the search state
function CaputLogAccordion(props) {
    const [caputLogExpanded, setCaputLogExpanded] = useState(false);
    // number of caput log entries for this PV from the first search. Later searches from the date range or
    // facet filters don't change it, so the table and its filters stay available when a filter has no results
    const [initialTotal, setInitialTotal] = useState(null);
    const { isLoading, wasSearched, totalResults, error } = useSearch();

    const handleCaputLogExpandedChange = () => (event, isExpanded) => {
        setCaputLogExpanded(isExpanded);
    }

    useEffect(() => {
        if (initialTotal === null && wasSearched && !isLoading && !error) {
            setInitialTotal(totalResults);
        }
    }, [initialTotal, wasSearched, isLoading, totalResults, error]);

    if (error && initialTotal === null) {
        return (
            <Accordion expanded={false}>
                <AccordionSummary>
                    <Typography sx={{ fontSize: 18, fontWeight: "medium" }}>Error Fetching Caput Log Data</Typography>
                </AccordionSummary>
            </Accordion>
        );
    }
    else if (initialTotal === null) {
        return (
            <Accordion expanded={false}>
                <AccordionSummary>
                    <Typography sx={{ fontSize: 18, fontWeight: "medium" }}>Caput Log Data Loading...</Typography>
                </AccordionSummary>
            </Accordion>
        );
    }
    else if (initialTotal === 0) {
        return (
            <Accordion expanded={false}>
                <AccordionSummary>
                    <Typography sx={{ fontSize: 18, fontWeight: "medium" }}>No Caput Log Data</Typography>
                </AccordionSummary>
            </Accordion>
        );
    }
    return (
        <Accordion expanded={caputLogExpanded} onChange={handleCaputLogExpandedChange()}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="caputLog-content" id="caputLog-header">
                <Typography sx={{ fontSize: 18, fontWeight: "medium" }}>Caput Log Data</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
                <CaputLogSearchLayout
                    showSearchBox={false}
                    initialSearchTerm={props.searchTerm}
                    facetFields={[
                        { field: "user.keyword", label: "User" },
                        { field: "client.keyword", label: "Client" },
                    ]}
                >
                    {(results) => <CaputLogDataTable results={results} />}
                </CaputLogSearchLayout>
            </AccordionDetails>
        </Accordion>
    );
}

function CaputLogTable(props) {
    const searchTerm = props.pvName ? `${props.pvName}.*` : "";
    const searchConfig = getCaputLogSearchConfig({
        search_fields: { pv: { weight: 3 } },
        initialState: { searchTerm: searchTerm }
    });

    // the PV details page is reused when going from one PV to another, and SearchProvider only reads its config
    // when it is created, so the key gives each PV a new search and accordion state
    return (
        <SearchProvider key={searchTerm} config={searchConfig} >
            <CaputLogAccordion searchTerm={searchTerm} />
        </SearchProvider>
    );
}

export default CaputLogTable;
