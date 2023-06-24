import React, { useState, useEffect } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Typography, Table, TableCell, TableBody, TableHead, TableRow, TableContainer, Link } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import api from "../../../api";
import PropTypes from "prop-types";


const propTypes = {
    pvName: PropTypes.string,
}

function OLOGTable(props) {
    const [ologData, setOLOGData] = useState(null);
    const [ologExpanded, setOlogExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const handleOlogExpandedChange = () => (event, isExpanded) => {
        setOlogExpanded(isExpanded);
    }

    // Get OLOG data for this PV
    useEffect(() => {
        api.OLOG_QUERY(props.pvName)
            .then((data) => {
                if (data !== null && data.hitCount !== 0) {
                    setOLOGData(data);
                    setIsLoading(false);
                }
                else {
                    setIsLoading(false);
                    console.log("Null data from OLOG api");
                }
            })
            .catch((err) => {
                console.log(err);
                console.log("error in fetch of olog entries");
            })
    }, [props.pvName]);

    if (isLoading) {
        return (
            <Accordion expanded={false}>
                <AccordionSummary>
                    <Typography variant="subtitle2">OLOG Data Loading...</Typography>
                </AccordionSummary>
            </Accordion>
        );
    }
    else if (ologData === null || ologData === {} || Object.keys(ologData).length === 0 || ologData.hitCount === 0) {
        return (
            <Accordion expanded={false}>
                <AccordionSummary>
                    <Typography variant="subtitle2" color="red">No OLOG Entries for this PV</Typography>
                </AccordionSummary>
            </Accordion>
        );
    }
    else {
        return (
            <Accordion expanded={ologExpanded} onChange={handleOlogExpandedChange()} >
                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="olog-content" id="olog-header">
                    <Typography variant="subtitle2">Recent Online Log Entries</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <TableContainer>
                        <Table sx={{ border: 1, borderColor: 'primary.main', borderRadius: 1 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date Time</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Level</TableCell>
                                    <TableCell>Entry</TableCell>
                                    <TableCell>Author</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {ologData.logs.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell><Link href={`${api.OLOG_WEB_URL}/logs/${row.id}`} target="_blank" underline="always">{new Date(row.createdDate).toLocaleString()}</Link></TableCell>
                                        <TableCell>
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
                                        </TableCell>
                                        <TableCell>{row.level}</TableCell>
                                        <TableCell><strong><u>{row.title}</u></strong> <br /> {row.description}</TableCell>
                                        <TableCell> {row.owner}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </AccordionDetails>
            </Accordion>
        );
    }
}

OLOGTable.propTypes = propTypes;
export default OLOGTable;
