import React, { Fragment } from "react";
import './Plot.css';
import { Button, Typography, Grid } from "@mui/material";
import { Table, TableCell, TableHead, TableBody, TableRow, TableContainer } from "@mui/material";
import TimelineIcon from '@mui/icons-material/Timeline';
import api from "../../api";
import config from "../../config";


function Plot() {
    const getAAPolicies = () => {
        if(config.AA_POLICIES.length <= 0) {
            return [];
        }
        let aaPolicies = [];
        let policyList = config.AA_POLICIES;
        policyList.forEach(policy => {
            let policyDetails = policy.split("|");
            let policyMap = {};
            policyMap["policy"] = policyDetails[0];
            policyMap["period"] = policyDetails[1];
            policyMap["ltsreduce"] = policyDetails[2];
            policyMap["control"] = policyDetails[3];
            aaPolicies.push(policyMap);
        });
        return aaPolicies;
    }

  return (
    <Fragment>
        <Grid item xs={12} style={{display: "flex"}}>
            <Button style={{marginTop: 10, marginBottom: 20}} target="_blank" href={api.AA_VIEWER} variant="contained" color="secondary" endIcon={<TimelineIcon />} >Click Here to Plot PVs</Button>
        </Grid>
        <Grid item xs={12} style={{display: "flex"}}>
            <Typography variant='h4'>Archiver Storage Policies</Typography>
        </Grid>
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell variant="head"><strong>Policy</strong></TableCell>
                        <TableCell variant="head"><strong>Sampling Period (seconds)</strong></TableCell>
                        <TableCell variant="head"><strong>Long Term Reduction (seconds)</strong></TableCell>
                        <TableCell variant="head"><strong>Controlling PV</strong></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                {getAAPolicies().map((row, index) => (
                    <TableRow key={index}>
                        <TableCell>{row.policy}</TableCell>
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
