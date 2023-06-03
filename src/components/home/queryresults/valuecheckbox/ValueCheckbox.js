import React from 'react';
import { Checkbox, Tooltip } from '@mui/material';
import PropTypes from "prop-types";

const propTypes = {
    checked: PropTypes.array,
    pvName: PropTypes.string,
    id: PropTypes.number,
    pvStatus: PropTypes.string,
    recordType: PropTypes.string,
    handleMonitorPVChange: PropTypes.func,
}

function ValueCheckbox(props) {
    return (
        <Tooltip arrow title={<div>Monitor PV<br />{props.pvName}</div>}>
            <Checkbox
                checked={props.checked[props.id]}
                disabled={props.pvStatus === "Inactive" || props.recordType === "waveform"}
                color="primary"
                onChange={props.handleMonitorPVChange(props.pvName, props.id)} >
            </Checkbox>
        </Tooltip>
    );
}

ValueCheckbox.propTypes = propTypes;
export default ValueCheckbox;
