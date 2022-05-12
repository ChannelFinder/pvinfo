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
        </Fragment>
    );  
}

export default Page404;
