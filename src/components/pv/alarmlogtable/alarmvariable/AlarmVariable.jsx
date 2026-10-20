import { Box, Typography } from "@mui/material";

function AlarmVariable(props) {
    return (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{props.title}</Typography>
            <Typography variant="body2" sx={{ overflow: "hidden", color: props.color }}>{props.value}</Typography>
        </Box>
    )
}

export default AlarmVariable;
