import React from 'react';
import { Switch, Tooltip } from '@mui/material';
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

// switch to monitor one PV. QueryResults owns the PV Web Socket subscriptions so they don't depend on
// this component, which is removed when the Actions column is hidden
function ValueCheckbox(props) {
    const disabledReason = monitorDisabledReason(props.pvStatus, props.recordType);
    const enabled = disabledReason === "";

    const handleMonitorPVChange = (event) => {
        props.updateCurrentChecked(props.id, event.target.checked);
    }

    return (
        <Tooltip arrow title={enabled ? <div>Monitor<br />{props.pvName}</div> : disabledReason}>
            {/* span so the tooltip still shows when the switch is disabled */}
            <span>
                <Switch
                    size="small"
                    checked={props.checked && enabled}
                    disabled={!enabled}
                    // fade disabled switches more than the default so they stand out from switches that are off
                    sx={{ opacity: enabled ? 1 : 0.35 }}
                    slotProps={{ input: { "aria-label": enabled ? `Monitor ${props.pvName}` : `Can't monitor ${props.pvName}, ${disabledReason}` } }}
                    color="primary"
                    onChange={handleMonitorPVChange} >
                </Switch>
            </span>
        </Tooltip>
    );
}

export { monitorDisabledReason };
export default ValueCheckbox;
