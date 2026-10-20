import React from "react";
import { Grid } from '@mui/material';
import bannerLogo from "../../../../assets/home-banner-logo.png";

function Logo() {

    return (
        <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
            <Grid container justifyContent="center" >
                <img src={bannerLogo} style={{ position: "absolute", "marginBottom": "20px", "bottom": 0, height: "10%" }} alt="Banner Logo" />
            </Grid>
        </Box>
    )
}

export default Logo;
