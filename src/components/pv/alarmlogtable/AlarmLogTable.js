import React, { Fragment, useState, useEffect } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Box, Grid, Typography } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AlarmVariable from "./alarmvariable/AlarmVariable";
import api from "../../../api";
import PropTypes from "prop-types";

const propTypes = {
    pvName: PropTypes.string,
}

const severityColors = {
    NONE: "green",
    OK: "green",
    INVALID: "#FF00FF",
    UNDEFINED: "#C800C8",
    MAJOR: "red",
    MINOR: "#FF9900"
}

function AlarmLogTable(props) {
    const [alarmLogData, setAlarmLogData] = useState(null);
    const [alarmLogExpanded, setAlarmLogExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const handleAlarmLogExpandedChange = () => (event, isExpanded) => {
        setAlarmLogExpanded(isExpanded);
    }

    useEffect(() => {
        api.ALARM_QUERY(props.pvName)
            .then((data) => {
                if (data !== null && data.hitCount !== 0) {
                    setAlarmLogData(data);
                    setIsLoading(false);
                }
                else {
                    setIsLoading(false);
                    console.log("Null data from OLOG api");
                }
            })
            .catch((err) => {
                console.log(err);
                console.log("error in fetch of olog entries");
            })
    }, [props.pvName]);


    if (isLoading) {
        return (
            <Accordion expanded={false}>
                <AccordionSummary>
                    <Typography variant="subtitle2">Alarm Log Data Loading...</Typography>
                </AccordionSummary>
            </Accordion>
        );
    }
    else if (alarmLogData === null || alarmLogData === {} || Object.keys(alarmLogData).length === 0 || alarmLogData.hitCount === 0) {
        return (
            <Accordion expanded={false}>
                <AccordionSummary>
                    <Typography variant="subtitle2">No Alarm Log Entries for this PV</Typography>
                </AccordionSummary>
            </Accordion>
        );
    }
    else {
        return (
            <Accordion expanded={alarmLogExpanded} onChange={handleAlarmLogExpandedChange()}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="alarmLog-content" id="alarmLog-header">
                    <Typography variant="subtitle2">Alarm Log Data</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Box sx={{ border: 1, borderColor: 'primary.main', borderRadius: 1 }}>
                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                            {
                                alarmLogData.map((item, i) => {
                                    return (
                                        <Accordion>
                                            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`"alarm-item-${i}-content"`} id={`alarm-item-${i}-header`}>
                                                <Typography sx={{ fontWeight: "medium", fontSize: 14 }}>
                                                    Message Time:
                                                </Typography>
                                                <Typography sx={{ fontSize: 14, ml: 1 }}>
                                                    {
                                                        item.message_time ?
                                                            new Date(item.message_time).toLocaleString("en-US", {
                                                                year: "numeric",
                                                                month: "2-digit",
                                                                day: "2-digit",
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                                second: "2-digit",
                                                                fractionalSecondDigits: 3,
                                                            })
                                                            : null
                                                    }
                                                </Typography>
                                                <Typography sx={{ fontWeight: "medium", fontSize: 14, ml: 3 }}>
                                                    Severity:
                                                </Typography>
                                                <Typography sx={{ fontSize: 14, color: item.severity ? severityColors[item.severity] : "black", ml: 1 }}>
                                                    {item.severity ? item.severity : "None"}
                                                </Typography>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                <Box key={i} sx={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", gap: 5, flexWrap: "wrap", p: 1, overflow: "auto" }}>
                                                    {
                                                        item.pv ?
                                                            <AlarmVariable title="PV" value={item.pv} />
                                                            : null
                                                    }
                                                    {
                                                        item.severity ?
                                                            <AlarmVariable title="Severity" value={item.severity} />
                                                            : null
                                                    }
                                                    {
                                                        item.message ?
                                                            <AlarmVariable title="Message" value={item.message} />
                                                            : null
                                                    }
                                                    {
                                                        item.value ?
                                                            <AlarmVariable title="Value" value={item.value} />
                                                            : null
                                                    }
                                                    {
                                                        item.time ?
                                                            <AlarmVariable title="Time" value={item.time} />
                                                            : null
                                                    }
                                                    {
                                                        item.config ?
                                                            <AlarmVariable title="Config" value={item.config} />
                                                            : null
                                                    }
                                                    {
                                                        item.user ?
                                                            <AlarmVariable title="User" value={item.user} />
                                                            : null
                                                    }
                                                    {
                                                        item.host ?
                                                            <AlarmVariable title="Host" value={item.host} />
                                                            : null
                                                    }
                                                    {
                                                        item.config_msg ?
                                                            <AlarmVariable title="Config Message" value={item.config_msg} />
                                                            : null
                                                    }
                                                </Box>
                                            </AccordionDetails>
                                        </Accordion>
                                    )
                                })
                            }

                        </Box>
                    </Box>
                </AccordionDetails>
            </Accordion>
        );
    }

}

AlarmLogTable.propTypes = propTypes;
export default AlarmLogTable;
