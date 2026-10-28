import React from 'react';
import { Skeleton, Tooltip } from '@mui/material';

// Placeholder for a monitored PV's live value until PV Web Socket sends it, so a slow connection doesn't look like a
// missing value. The browser can hold a new web socket for several seconds while other tabs connect to the same server
function LiveValueSkeleton(props) {
    const label = props.connecting ? "Connecting to PV Web Socket" : "Waiting for the live value";
    return (
        <Tooltip arrow title={label}>
            <Skeleton animation="wave" width={80} role="progressbar" aria-label={label} />
        </Tooltip>
    );
}

export default LiveValueSkeleton;
