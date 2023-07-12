import { Fragment, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Grid, Link, Typography } from "@mui/material";
import PropTypes from 'prop-types';

const propTypes = {
    title: PropTypes.string,
    value: PropTypes.any,
}

function KeyValuePair(props) {
    let style = { px: 2, py: 1, borderBottom: 1, borderColor: '#D1D5DB' }

    return (
        <Fragment>
            <Grid item xs={6} sm={2} sx={style} style={{ backgroundColor: "#F3F4F6" }}>
                <Typography variant="subtitle2">{props.title}</Typography>
            </Grid>
            <Grid item xs={6} sm={4} sx={style}>
                <Typography variant="body2" style={{ color: props.textColor }}>
                    {props.url ? (
                        <Link component={RouterLink} to={props.url} underline="hover">{props.value}</Link>
                    ) : (
                        <Fragment>{props.value}</Fragment>
                    )}
                </Typography>
            </Grid>
        </Fragment>
    );
}

KeyValuePair.propTypes = propTypes;
export default KeyValuePair;
