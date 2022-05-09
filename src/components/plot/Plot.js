import React, { Fragment } from "react";
import './Plot.css';
import { Button, Typography, Grid, Link } from "@mui/material";
import { Table, TableCell, TableHead, TableBody, TableRow, TableContainer } from "@mui/material";
import TimelineIcon from '@mui/icons-material/Timeline';
import api from "../../api";

function Plot() {

  return (
    <Fragment>
        <Grid item xs={12} style={{display: "flex"}}>
            <Typography variant='h6'>Plotting of PVs comes from the ALS Archiver Appliance</Typography>
        </Grid>
        <Grid item xs={12} style={{display: "flex"}}>
            <Button style={{marginTop: 10, marginBottom: 20}} target="_blank" href={api.AA_VIEWER} variant="contained" color="secondary" endIcon={<TimelineIcon />} >Click Here to Plot PVs</Button>
        </Grid>
        <Grid item xs={12} style={{display: "flex"}}>
            <Typography variant='h4'>Archiver Appliance Parition Configuration</Typography>
        </Grid>
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell><strong>Partition</strong></TableCell>
                        <TableCell><strong>Storage Type</strong></TableCell>
                        <TableCell><strong>Storage Length</strong></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell>Short Term</TableCell>
                        <TableCell>RAM</TableCell>
                        <TableCell>1-2 Hours</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Medium Term</TableCell>
                        <TableCell>SSD</TableCell>
                        <TableCell>1-2 Months</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Long Term</TableCell>
                        <TableCell>Filer</TableCell>
                        <TableCell>Forever</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
        <Grid item xs={12} style={{display: "flex"}}>
            <Typography variant='h4'>Archiver Appliance Policies</Typography>
        </Grid>
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell variant="head"><strong>Policy</strong></TableCell>
                        <TableCell variant="head"><strong>Method</strong></TableCell>
                        <TableCell variant="head"><strong>Sampling Period (seconds)</strong></TableCell>
                        <TableCell variant="head"><strong>Long Term Reduction</strong></TableCell>
                        <TableCell variant="head"><strong>Controlling PV</strong></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                {api.AA_POLICIES.map((row, index) => (
                    <TableRow key={index}>
                        <TableCell>{row.policy}</TableCell>
                        <TableCell>{row.method}</TableCell>
                        <TableCell>{row.period}</TableCell>
                        <TableCell>{row.ltsreduce}</TableCell>
                        <TableCell>{row.control}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>

    </ Fragment>
);
}

export default Plot;
