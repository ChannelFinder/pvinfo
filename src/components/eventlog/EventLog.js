import React, { Fragment } from "react";
import './EventLog.css';
import { Typography, Grid, Link } from "@mui/material";
import api from "../../api";


function EventLog() {

  return (
    <Fragment>
        <Grid item xs={12} align="center" >
          <Typography variant='h6'>See <strong><Link href={`${api.SERVER_URL}/evlog`} target="_blank" underline="always">{`${api.SERVER_URL}/evlog`}</Link></strong> for current implementation</Typography>
          <br />
          <Typography variant='subtitle1'>The Event Log has not been implemented with the new archiver yet.</Typography>
        </Grid>
    </ Fragment>
  );
}

export default EventLog;
