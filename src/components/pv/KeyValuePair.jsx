import { Fragment } from "react";
import { Link as RouterLink } from "react-router";
import { Grid, Link, Typography } from "@mui/material";

function KeyValuePair(props) {
    let style = { px: 2, py: 1, borderBottom: 1, borderColor: '#D1D5DB' }

    return (
        <Fragment>
            <Grid
                sx={style}
                style={{ backgroundColor: "#F3F4F6" }}
                size={{
                    xs: 6,
                    sm: 2
                }}>
                <Typography variant="subtitle2">{props.title}</Typography>
            </Grid>
            <Grid
                sx={style}
                size={{
                    xs: 6,
                    sm: 4
                }}>
                <Typography variant="body2" style={{ color: props.textColor }}>
                    {Array.isArray(props.value) && props.title === "Tags" ? (
                        props.value.map((item, i) => (
                            <Fragment key={i}>
                                <Link component={RouterLink} to={`/?pvName=*&tag=${encodeURIComponent(item)}&standardSearch=false`} underline="hover">{item}</Link>
                                {i < props.value.length - 1 && ", "}
                            </Fragment>
                        ))
                    ) : props.url ? (
                        <Link component={RouterLink} to={props.url} underline="hover">{props.value}</Link>
                    ) : Array.isArray(props.value) ? (
                        <Fragment>[{props.value.join(', ')}]</Fragment>
                    ) : (
                        <Fragment>{props.value}</Fragment>
                    )}
                </Typography>
            </Grid>
        </Fragment>
    );
}

export default KeyValuePair;
