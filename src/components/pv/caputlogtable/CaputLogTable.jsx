import React, { useState } from "react";
import { SearchProvider } from "@elastic/react-search-ui";
import { Accordion, AccordionDetails, AccordionSummary, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PropTypes from "prop-types";
import { getCaputLogSearchConfig } from "./caputlogSearchConfig";
import CaputLogDataTable from "./CaputLogDataTable";
import CaputLogSearchLayout from "./CaputLogSearchLayout";

const propTypes = {
    pvName: PropTypes.string,
}

function CaputLogTable(props) {

    const [caputLogExpanded, setCaputLogExpanded] = useState(false);
    const handleCaputLogExpandedChange = () => (event, isExpanded) => {
        setCaputLogExpanded(isExpanded);
    }

    const searchConfig = getCaputLogSearchConfig({
        filters: [
            {
                field: "pv.keyword",
                values: [props.pvName],
            },
        ],
        search_fields: { pv: { weight: 3 } },
    });

    return (
        <Accordion expanded={caputLogExpanded} onChange={handleCaputLogExpandedChange()}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="caputLog-content" id="caputLog-header">
                <Typography sx={{ fontSize: 18, fontWeight: "medium" }}>Caput Log Data</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
                <SearchProvider config={searchConfig}>
                    <CaputLogSearchLayout
                        showSearchBox={false}
                        facetFields={[
                            { field: "user.keyword", label: "User" },
                            { field: "client.keyword", label: "Client" },
                        ]}
                    >
                        {(results) => <CaputLogDataTable results={results} />}
                    </CaputLogSearchLayout>
                </SearchProvider>
            </AccordionDetails>
        </Accordion>
    );
}

CaputLogTable.propTypes = propTypes;
export default CaputLogTable;
