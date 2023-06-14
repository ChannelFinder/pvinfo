import React, { useEffect } from 'react';
import useWebSocket from 'react-use-websocket';
import { Checkbox, Tooltip } from '@mui/material';
import api from '../../../../api';
import PropTypes from "prop-types";

const propTypes = {
    pvName: PropTypes.string,
    id: PropTypes.number,
    pvStatus: PropTypes.string,
    recordType: PropTypes.string,
    checked: PropTypes.array,
    currentChecked: PropTypes.any,
    updateCurrentChecked: PropTypes.func,
}

// TODO - check if these changes make performance better or worse or same
// fix dependency array issues, cleanup
// create PR into current PR branch
// then will need to talk to mitch and get things merged

function ValueCheckbox(props) {
    // open web socket for sending subscribe/clear messages
    // filter all messages as false since we don't need to read anything in parent component
    // This still is in QueryResults so even with USE_PVWS===false it will try to connect, would be better to move to ValueCheckbox?
    const { sendJsonMessage } = useWebSocket(api.PVWS_URL, {
        share: true,
        filter: (message) => false,
    });

    const handleMonitorPVChange = (index) => (event) => {
        props.updateCurrentChecked(index, event.target.checked);
    }

    // watch for changes in checked, if so send a subscribe message
    useEffect(() => {
        if (props.currentChecked.has(props.id)) {
            sendJsonMessage({ "type": "subscribe", "pvs": [props.pvName] });
        } else {
            sendJsonMessage({ "type": "clear", "pvs": [props.pvName] });
        }
    }, [sendJsonMessage, props.currentChecked, props.checked, props.id, props.pvName])

    return (
        <Tooltip arrow title={<div>Monitor PV<br />{props.pvName}</div>}>
            <Checkbox
                checked={props.checked[props.id]}
                disabled={props.pvStatus === "Inactive" || props.recordType === "waveform"}
                color="primary"
                onChange={handleMonitorPVChange(props.id)} >
            </Checkbox>
        </Tooltip>
    );
}

ValueCheckbox.propTypes = propTypes;
export default ValueCheckbox;
