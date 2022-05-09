import React, {Fragment} from 'react';
import { Typography, Button, Grid, Link } from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import api from "./api";

function Page404 () {
    const navigate = useNavigate();

    return (
        <Fragment>
            <Typography variant="h3">Whoops, this page is not available</Typography>
            <Typography variant="h5">404 Error</Typography>
            <br />
            <Button onClick={() => navigate(-1)} variant="contained" color="secondary">Take Me Back!</Button>
            <br />
            <br />
            <hr />
            <br />
            <Grid item alignItems="center" xs={12}>
                    <Typography 
                        style={{marginBottom: 20}}
                        align="center"
                        variant="h6"
                    >
                        This is the new version of PVInfo. The existing PVInfo2 is available here: <Link href={`${api.SERVER_URL}/pvinfo2`} underline="always">{`${api.SERVER_URL}/pvinfo2`}</Link>
                    </Typography>
                    <Typography 
                        style={{marginBottom: 20}}
                        align="center"
                        variant="subtitle1"
                    >
                        The new site uses the updated EPICS archiver with much faster sampling rates and the EPICS channel finder DB. See known/outstanding issues <Link component={RouterLink} to="/status" underline="always">here</Link>. Please send any bugs/comments/suggestions to tford@lbl.gov.
                    </Typography>
                </Grid>
        </Fragment>
    );  
}

export default Page404;