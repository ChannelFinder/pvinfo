import React, { useEffect, useRef, useState } from 'react';
import useWebSocket from '../../../../useWebSocket';
import { Switch, Tooltip } from '@mui/material';
import api from '../../../../api';
import config from '../../../../config';

function ValueCheckbox(props) {
    // open web socket for sending subscribe/clear messages
    // filter all messages as false since we don't need to read anything in parent component
    // This still is in QueryResults so even with USE_PVWS===false it will try to connect, would be better to move to ValueCheckbox?
    // why live monitoring is not available for this PV, empty if it is available
    const [disabledReason, setDisabledReason] = useState("");
    const enabled = disabledReason === "";
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
            setDisabledReason(`PV status is ${props.pvStatus || "unknown"}`);
        }
        else if (props.recordType === "waveform" && !config.PVWS_ALLOW_WAVEFORMS) {
            setDisabledReason("Waveform monitoring is turned off");
        }
        else {
            setDisabledReason("");
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
        <Tooltip arrow title={enabled ? <div>Monitor<br />{props.pvName}</div> : disabledReason}>
            {/* span so the tooltip still shows when the switch is disabled */}
            <span>
                <Switch
                    size="small"
                    checked={props.checked[props.id] && enabled}
                    disabled={!enabled}
                    // fade disabled switches more than the default so they stand out from switches that are off
                    sx={{ opacity: enabled ? 1 : 0.35 }}
                    slotProps={{ input: { "aria-label": enabled ? `Monitor ${props.pvName}` : `Can't monitor ${props.pvName}, ${disabledReason}` } }}
                    color="primary"
                    onChange={handleMonitorPVChange(props.id)} >
                </Switch>
            </span>
        </Tooltip>
    );
}

export default ValueCheckbox;
