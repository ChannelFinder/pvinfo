import React, { useState, useEffect, useRef } from "react";
import useWebSocket from '../../../../useWebSocket';
import api from '../../../../api';
import config from "../../../../config";
import colors from '../../../../colors';

function Value(props) {
    const [pvValue, setPVValue] = useState(null);
    const [pvSeverity, setPVSeverity] = useState("");
    const [pvUnit, setPVUnit] = useState("");
    // debounce the value display to avoid flashing "Disconnected" since web socket always sends message without value on connect
    const [show, setShow] = useState(false);
    const [startTimer, setStartTimer] = useState(false);
    // PV Web Socket only sends the precision and vtype with the first message for a PV, keep them for the updates.
    // If the cell is remounted after the first message, like when the column is hidden and shown again, they stay unknown
    const valueFormat = useRef({ precision: null, vtype: null });

    // https://github.com/robtaussig/react-use-websocket/issues/40#issuecomment-616676102
    // pattern for sharing web socket among components
    const { lastJsonMessage } = useWebSocket(config.PVWS_URL, {
        share: true,
        filter: message => JSON.parse(message.data).pv === props.pvName,
    });


    useEffect(() => {
        // wait to start timer until we get first message for this PV
        if (!startTimer) {
            return;
        }
        // the debouncing is only useful if we are showing "Disconnected" for non-reachable PVs
        if (!config.SHOW_DISCONNECTED || show) {
            return;
        }
        const timeout = setTimeout(() => {
            setShow(true)
        }, 500)

        return () => clearTimeout(timeout);
    }, [show, startTimer])


    // parse web socket message. filter on useWebSocket above means we only parse messages for this PV
    useEffect(() => {
        // at most 2 decimals in the results table
        const jsonMessage = api.PARSE_WEBSOCKET_MSG(lastJsonMessage, { ...valueFormat.current, maxDecimals: 2 });
        if (jsonMessage === null) {
            return; // unable to parse, could be invalid message type, no PV name, null lastJsonMessage
        }
        if ("precision" in jsonMessage) {
            valueFormat.current.precision = jsonMessage.precision;
        }
        if ("vtype" in jsonMessage) {
            valueFormat.current.vtype = jsonMessage.vtype;
        }
        setStartTimer(true);
        if ("severity" in jsonMessage) {
            setPVSeverity(jsonMessage.severity);
        }
        if ("units" in jsonMessage) {
            setPVUnit(jsonMessage.units);
        }
        if (jsonMessage.pv_value !== null && "pv_value" in jsonMessage) {
            setPVValue(jsonMessage.pv_value);
        }
    }, [lastJsonMessage]);

    // check if the checkbox in MUI is checked, if not ignore updating state and UI
    if (!props.isChecked) {
        return (
            <div></div>
        );
    }
    // otherwise check severity for color, check if units are present, and display value
    else {
        let textColor = "black";
        if (pvSeverity !== undefined) {
            if (pvSeverity === "NONE") {
                textColor = colors.SEV_COLORS["OK"];
            } else {
                textColor = pvSeverity in colors.SEV_COLORS ? colors.SEV_COLORS[pvSeverity] : "#000";
            }
        }

        const severityName = pvSeverity === "UNDEFINED" || pvSeverity === "INVALID" ? ` (${pvSeverity})` : null
        if (pvValue !== undefined && pvValue !== null) {
            if (Array.isArray(pvValue)) {
                return (
                    <div style={{ color: textColor }}>{`[ ${pvValue.join(', ')} ] ${pvUnit}`}{severityName}</div>
                )
            }
            else {
                return (
                    <div style={{ color: textColor }}>{`${pvValue} ${pvUnit}`}{severityName}</div>
                );
            }
        } else {
            if (!config.SHOW_DISCONNECTED) {
                return (
                    <div></div>
                );
            } else {
                // debounce showing "Disconnected" to avoid flashing for PVs that are actually connected
                if (!show) {
                    return (
                        <div></div>
                    );
                }
                textColor = colors.SEV_COLORS["UNDEFINED"];
                return (
                    <div style={{ color: textColor }}>(DISCONNECTED)</div>
                );
            }
        }
    }
}

export default Value;
