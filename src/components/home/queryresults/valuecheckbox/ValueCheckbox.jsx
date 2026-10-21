import React, { useEffect, useRef, useState } from 'react';
import useWebSocket from '../../../../useWebSocket';
import { Checkbox, Tooltip } from '@mui/material';
import api from '../../../../api';
import config from '../../../../config';

function ValueCheckbox(props) {
    // open web socket for sending subscribe/clear messages
    // filter all messages as false since we don't need to read anything in parent component
    // This still is in QueryResults so even with USE_PVWS===false it will try to connect, would be better to move to ValueCheckbox?
    const [enabled, setEnabled] = useState(true);
    const isSubscribed = useRef(false);
    const { sendJsonMessage } = useWebSocket(config.PVWS_URL, {
        share: true,
        filter: (message) => false,
    });

    const handleMonitorPVChange = (index) => (event) => {
        props.updateCurrentChecked(index, event.target.checked);
    }

    useEffect(() => {
        if (props.pvStatus !== "Active" && !config.PVWS_IGNORE_CF_PVSTATUS) {
            setEnabled(false);
        }
        else if (props.recordType === "waveform" && !config.PVWS_ALLOW_WAVEFORMS) {
            setEnabled(false);
        }
        else {
            setEnabled(true);
        }
    }, [props.pvStatus, props.recordType, props.pvName])

    // watch for changes in checked, if so send a subscribe message
    useEffect(() => {
        if (enabled) {
            if (props.currentChecked.has(props.id)) {
                sendJsonMessage({ "type": "subscribe", "pvs": [props.pvName] });
                isSubscribed.current = true;
            } else {
                sendJsonMessage({ "type": "clear", "pvs": [props.pvName] });
                isSubscribed.current = false;
            }
        }
    }, [sendJsonMessage, props.currentChecked, props.checked, props.id, props.pvName, enabled])

    // the row is removed from the table when the page, sort, or filter changes, clear the subscription
    // since this component is no longer around to see the PV get unchecked
    useEffect(() => {
        return () => {
            if (isSubscribed.current) {
                sendJsonMessage({ "type": "clear", "pvs": [props.pvName] });
                isSubscribed.current = false;
            }
        };
    }, [sendJsonMessage, props.pvName])

    return (
        <Tooltip arrow title={<div>Monitor<br />{props.pvName}</div>}>
            <Checkbox
                checked={props.checked[props.id] && enabled}
                disabled={!enabled}
                color="primary"
                onChange={handleMonitorPVChange(props.id)} >
            </Checkbox>
        </Tooltip>
    );
}

export default ValueCheckbox;
