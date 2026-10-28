import React, { useEffect, useState } from 'react';
import { Skeleton, Tooltip } from '@mui/material';

// how long the placeholder waits before it shows, so values that arrive quickly don't flash it
const LIVE_VALUE_SKELETON_DELAY_MS = 500;

// Placeholder for a monitored PV's live value until PV Web Socket sends it, so a slow connection doesn't look like a
// missing value. The browser can hold a new web socket for several seconds while other tabs connect to the same server
function LiveValueSkeleton(props) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => setVisible(true), LIVE_VALUE_SKELETON_DELAY_MS);
        return () => clearTimeout(timeout);
    }, []);

    if (!visible) {
        return null;
    }
    const label = props.connecting ? "Connecting to PV Web Socket" : "Waiting for the live value";
    return (
        <Tooltip arrow title={label}>
            <Skeleton animation="wave" width={80} role="progressbar" aria-label={label} />
        </Tooltip>
    );
}

export default LiveValueSkeleton;
