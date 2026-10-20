import React from "react";
import { Grid, useMediaQuery } from '@mui/material';
import bannerLogo from "../../../../assets/home-banner-logo.png";

function Logo() {
    const isLgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'), { noSsr: true });

    if (!isLgUp) return null;
    return (
        <Grid container justifyContent="center" sx={{ width: "100%" }}>
            <img src={bannerLogo} style={{ position: "absolute", "marginBottom": "20px", "bottom": 0, height: "10%" }} alt="Banner Logo" />
        </Grid>
    )
}

export default Logo;
