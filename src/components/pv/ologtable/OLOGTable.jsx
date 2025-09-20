import React, { useState, useEffect } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography, Table, TableBody, TableHead, TableRow, Link } from "@mui/material";
import { CustomTableContainer, TableBodyCell, TableHeaderCell } from "../customtablecells/CustomTable";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import api from "../../../api";
import PropTypes from "prop-types";
import config from "../../../config";

const propTypes = {
    pvName: PropTypes.string,
}

function OLOGTable(props) {
    const [ologData, setOLOGData] = useState(null);
    const [ologExpanded, setOlogExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [noOlogMessage, setNoOlogMessage] = useState("No Online Log Entries");

    const handleOlogExpandedChange = () => (event, isExpanded) => {
        setOlogExpanded(isExpanded);
    }

    // Get OLOG data for this PV
    useEffect(() => {
        api.LOG_QUERY(api.LOG_ENUM.ONLINE_LOG, props.pvName)
            .then((data) => {
                if (data !== null && data.hitCount !== 0) {
                    setOLOGData(data);
                    setIsLoading(false);
                }
                else {
                    setIsLoading(false);
                    setNoOlogMessage("No Online Log Entries");
                    console.log("Null data from OLOG api");
                }
            })
            .catch((err) => {
                setIsLoading(false);
                setNoOlogMessage("Error Fetching Online Log Entries");
                console.log(err);
                console.log("error in fetch of olog entries");
            })
    }, [props.pvName]);

    if (isLoading) {
        return (
            <Accordion expanded={false}>
                <AccordionSummary>
                    <Typography sx={{ fontSize: 18, fontWeight: "medium" }}>OLOG Data Loading...</Typography>
                </AccordionSummary>
            </Accordion>
        );
    }
    else if (ologData === null || Object.keys(ologData).length === 0 || ologData.hitCount === 0) {
        return (
            <Accordion expanded={false}>
                <AccordionSummary>
                    <Typography sx={{ fontSize: 18, fontWeight: "medium" }}>{noOlogMessage}</Typography>
                    {
                        config.OLOG_START_TIME_DAYS !== null ?
                            <Typography variant="subtitle2">&nbsp;Within {config.OLOG_START_TIME_DAYS} Days</Typography>
                            : null
                    }
                </AccordionSummary>
            </Accordion>
        );
    }
    else {
        return (
            <Accordion expanded={ologExpanded} onChange={handleOlogExpandedChange()} >
                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="olog-content" id="olog-header">
                    <Typography sx={{ fontSize: 18, fontWeight: "medium" }}>Online Log Entries</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                    <CustomTableContainer component={Box} >
                        <Table stickyHeader={true}>
                            <TableHead>
                                <TableRow>
                                    <TableHeaderCell>Date Time</TableHeaderCell>
                                    <TableHeaderCell>Category</TableHeaderCell>
                                    <TableHeaderCell>Level</TableHeaderCell>
                                    <TableHeaderCell>Entry</TableHeaderCell>
                                    <TableHeaderCell>Author</TableHeaderCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {ologData.logs.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableBodyCell><Link href={`${config.OLOG_WEB_URL}/logs/${row.id}`} target="_blank" underline="always">{new Date(row.createdDate).toLocaleString()}</Link></TableBodyCell>
                                        <TableBodyCell>
                                            {
                                                row.tags.map(function (tag, index) {
                                                    if (index === row.tags.length - 1) {
                                                        return `${tag.name}`;
                                                    }
                                                    else {
                                                        return `${tag.name}, `;
                                                    }
                                                })
                                            }
                                        </TableBodyCell>
                                        <TableBodyCell>{row.level}</TableBodyCell>
                                        <TableBodyCell><strong><u>{row.title}</u></strong> <br /> {row.description}</TableBodyCell>
                                        <TableBodyCell> {row.owner}</TableBodyCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CustomTableContainer>
                </AccordionDetails>
            </Accordion>
        );
    }
}

OLOGTable.propTypes = propTypes;
export default OLOGTable;
