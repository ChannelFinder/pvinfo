import React, { Fragment } from "react";
import { Typography, Grid, List, ListItem, ListItemText } from "@mui/material";

function Status() {

    return (
        <Fragment>
          <Grid item xs={12}>
            <Typography style={{marginBottom: 40}} variant='h6'>Known Issues / Remaining Features</Typography>
          </Grid>
          <hr />
          <Grid item xs={12}>
            <List dense={true}>
              <ListItem>
                <ListItemText
                  primary="Case Insensitive PV Name Searching"
                  secondary="TBD. Requires changes to elastic search DB behind channel finder. Investigation planned for summer shutdown."
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="PV Record Descriptions"
                  secondary="~3000 PVs have descriptions in channel finder. More IOCs being added each MI, expect this to be finished in 1 month."
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Master checkbox for live PV monitoring entire list"
                  secondary="TBD."
                />
              </ListItem>
            </List>
          </Grid>
        </ Fragment>
    );
}

export default Status;
