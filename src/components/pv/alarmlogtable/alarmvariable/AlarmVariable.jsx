import { Box, Typography } from "@mui/material";
import PropTypes from "prop-types";

const propTypes = {
    title: PropTypes.string,
    value: PropTypes.string,
    color: PropTypes.string
}

function AlarmVariable(props) {
    return (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{props.title}</Typography>
            <Typography variant="body2" sx={{ overflow: "hidden", color: props.color }}>{props.value}</Typography>
        </Box>
    )
}

AlarmVariable.propTypes = propTypes;
export default AlarmVariable;
