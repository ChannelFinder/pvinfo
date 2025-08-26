import React, { useState, useEffect } from "react";
import useWebSocket from 'react-use-websocket';
import api from '../../../../api';
import colors from '../../../../colors';
import PropTypes from "prop-types";

const propTypes = {
    pvName: PropTypes.string,
    pvRecordType: PropTypes.string,
    pvStatus: PropTypes.string,
    id: PropTypes.number,
    isChecked: PropTypes.bool,
}

function Value(props) {
    const [pvValue, setPVValue] = useState("");
    const [pvSeverity, setPVSeverity] = useState("");
    const [pvUnit, setPVUnit] = useState("");

    // https://github.com/robtaussig/react-use-websocket/issues/40#issuecomment-616676102
    // pattern for sharing web socket among components
    const { lastJsonMessage } = useWebSocket(api.PVWS_URL, {
        share: true,
        filter: message => JSON.parse(message.data).pv === props.pvName,
    });

    // parse web socket message. filter on useWebSocket above means we only parse messages for this PV
    useEffect(() => {
        const jsonMessage = api.PARSE_WEBSOCKET_MSG(lastJsonMessage, 2); // fix precision to 2 on the PV table
        if (jsonMessage === null) {
            return; // unable to parse, could be invalid message type, no PV name, null lastJsonMessage
        }
        if ("severity" in jsonMessage) {
            setPVSeverity(jsonMessage.severity);
        }
        if ("units" in jsonMessage) {
            setPVUnit(jsonMessage.units);
        }
        if ("pv_value" in jsonMessage) {
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
        if (pvValue !== undefined) {
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
        }
        else {
            return (
                null
            );
        }
    }
}

Value.propTypes = propTypes;
export default Value;
