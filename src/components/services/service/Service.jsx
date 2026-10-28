import { Box, Chip, Grid, Typography } from "@mui/material";
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import SyncRoundedIcon from '@mui/icons-material/SyncRounded';

// connecting is optional, for a service like PV Web Socket that is still being connected to
function statusChip(connected, connecting) {
    if (connected) {
        return <Chip label="Connected" color="success" size="small" icon={<CheckCircleRoundedIcon />} />;
    }
    if (connecting) {
        return <Chip label="Connecting" size="small" icon={<SyncRoundedIcon />} />;
    }
    return <Chip label="Disconnected" color="error" size="small" icon={<ErrorRoundedIcon />} />;
}

function Service(props) {
    return (
        <Grid>
            <Box sx={{ display: "flex", flexDirection: "row", mb: 1, alignItems: "center" }}>
                <Typography variant="h6" sx={{ mr: 4 }}>{props.servName}</Typography>
                {statusChip(props.connected, props.connecting)}
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
    );
}

export default Service;
