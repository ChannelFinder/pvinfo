import React from "react";
import { Grid, Hidden } from '@mui/material';
import bannerLogo from "../../../../assets/home-banner-logo.png";

function Logo() {

    return (
        <Hidden lgDown>
            <Grid container justifyContent="center" >
                <img src={bannerLogo} style={{ position: "absolute", "marginBottom": "20px", "bottom": 0, height: "10%" }} alt="Banner Logo" />
            </Grid>
        </Hidden>
    )
}

export default Logo;
