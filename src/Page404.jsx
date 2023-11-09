import React, {Fragment} from 'react';
import { Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

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
