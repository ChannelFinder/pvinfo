import { Fragment } from "react";
import { Grid, Typography } from "@mui/material";

function KeyValuePair(props) {
    return (
        <Fragment>
            <Grid item xs={6} sm={2} sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'grey.300' }}>
                <Typography variant="subtitle2">{props.title}</Typography>
            </Grid>
            <Grid item xs={6} sm={4} sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'grey.300' }}>
                <Typography variant="body2" style={{ color: props.textColor }}>{props.value}</Typography>
            </Grid>
        </Fragment>
    );
}

export default KeyValuePair;
