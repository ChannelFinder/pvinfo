import { Box, Chip, Grid, Typography } from "@mui/material";
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import PropTypes from "prop-types";

const propTypes = {
    servName: PropTypes.string,
    connected: PropTypes.bool,
    data: PropTypes.object
}

function Service(props) {
    return (
        <Grid item>
            <Box sx={{ display: "flex", flexDirection: "row", mb: 1, alignItems: "center" }}>
                <Typography variant="h6" sx={{ mr: 4 }}>{props.servName}</Typography>
                <Chip label={props.connected ? "Connected" : "Disconnected"} color={props.connected ? "success" : "error"} size="small" icon={props.connected ? <CheckCircleRoundedIcon /> : <ErrorRoundedIcon />} />
            </Box>
            {
                props.connected ? (
                    Object.keys(props.data).map((key, i) => (
                        <Box key={i} sx={{ display: "flex", flexDirection: "row", ml: 0.5, alignItems: "center" }}>
                            <Typography noWrap variant="subtitle2" sx={{ mr: 2 }}>{key}:</Typography>
                            <Typography noWrap variant="body2">{props.data[key]}</Typography>
                        </Box>
                    ))
                ) : null
            }
        </Grid>
    )
}

Service.propTypes = propTypes;
export default Service;
