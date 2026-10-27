import React, { useEffect, useState } from 'react';
import useWebSocket from '../../../../useWebSocket';
import { Switch, Tooltip } from '@mui/material';
import api from '../../../../api';
import config from '../../../../config';

// why live monitoring is not available for a PV, empty if it is available.
// Also used by monitor all in QueryResults so it skips the same PVs as the switches
function monitorDisabledReason(pvStatus, recordType) {
    if (pvStatus !== "Active" && !config.PVWS_IGNORE_CF_PVSTATUS) {
        return `PV status is ${pvStatus || "unknown"}`;
    }
    if (recordType === "waveform" && !config.PVWS_ALLOW_WAVEFORMS) {
        return "Waveform monitoring is turned off";
    }
    return "";
}

function ValueCheckbox(props) {
    // open web socket for sending subscribe/clear messages
    // filter all messages as false since we don't need to read anything in parent component
    // This still is in QueryResults so even with USE_PVWS===false it will try to connect, would be better to move to ValueCheckbox?
    // why live monitoring is not available for this PV, empty if it is available
    const [disabledReason, setDisabledReason] = useState("");
    const enabled = disabledReason === "";
    const { sendJsonMessage } = useWebSocket(config.PVWS_URL, {
        share: true,
        filter: (message) => false,
    });

    const handleMonitorPVChange = (index) => (event) => {
        props.updateCurrentChecked(index, event.target.checked);
    }

    useEffect(() => {
        setDisabledReason(monitorDisabledReason(props.pvStatus, props.recordType));
    }, [props.pvStatus, props.recordType, props.pvName])

    // watch for changes in checked, if so send a subscribe message
    useEffect(() => {
        if (enabled) {
            if (props.currentChecked.has(props.id)) {
                sendJsonMessage({ "type": "subscribe", "pvs": [props.pvName] });
            } else {
                sendJsonMessage({ "type": "clear", "pvs": [props.pvName] });
            }
        }
    }, [sendJsonMessage, props.currentChecked, props.checked, props.id, props.pvName, enabled])

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

export { monitorDisabledReason };
export default ValueCheckbox;
