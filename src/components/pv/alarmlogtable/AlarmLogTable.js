import React, { useState, useEffect, Fragment } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Box, Chip, Typography } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AlarmVariable from "./alarmvariable/AlarmVariable";
import api from "../../../api";
import colors from "../../../colors";
import PropTypes from "prop-types";

const propTypes = {
    pvName: PropTypes.string,
}

const dateFormat = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
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
                    <Typography variant="subtitle2">Alarm Log Entries Loading...</Typography>
                </AccordionSummary>
            </Accordion>
        );
    }
    else if (alarmLogData === null || alarmLogData === {} || Object.keys(alarmLogData).length === 0 || alarmLogData.hitCount === 0) {
        return (
            <Accordion expanded={false}>
                <AccordionSummary>
                    <Typography variant="subtitle2">No Alarm Log Entries</Typography>
                    {
                        process.env.REACT_APP_AL_START_TIME_DAYS !== '' ?
                            <Typography variant="subtitle2">&nbsp;within {process.env.REACT_APP_AL_START_TIME_DAYS} days</Typography>
                            : null
                    }
                </AccordionSummary>
            </Accordion>
        );
    }
    else {
        return (
            <Accordion expanded={alarmLogExpanded} onChange={handleAlarmLogExpandedChange()}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="alarmLog-content" id="alarmLog-header">
                    <Typography variant="subtitle2">Alarm Log Entries</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Box sx={{ border: 1, borderColor: 'primary.main', borderRadius: 1 }}>
                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                            {
                                alarmLogData.map((item, i) => {
                                    return (
                                        <Box key={i} id={`alarm-item-${i}`} sx={{ display: "flex", flexDirection: "column", py: 1, borderBottom: 2, borderColor: 'grey.300', '&:last-child': { border: 0 } }}>
                                            <Box id={`alarm-item-${i}-header`} sx={{ display: "flex", flexDirection: "row", alignItems: "center", py: 2, px: 2 }}>
                                                {
                                                    item.severity ?
                                                        <Fragment>
                                                            <Typography sx={{ fontWeight: "medium", fontSize: 14 }}>
                                                                Severity:
                                                            </Typography>
                                                            <Chip label={item.severity} size="small"
                                                                sx={{ ml: 1, fontWeight: "medium", fontSize: 12, color: "#FFFFFF", backgroundColor: colors.SEV_COLORS[item.severity] ? colors.SEV_COLORS[item.severity] : "#424242" }}></Chip>
                                                        </Fragment>
                                                        :
                                                        <Chip label="Configuration Change" size="small"
                                                            sx={{ fontWeight: "medium", fontSize: 12, color: "#FFFFFF", backgroundColor: "#424242" }}></Chip>
                                                }
                                                {/* {
                                                    item.value ?
                                                        <Fragment>
                                                            <Typography sx={{ fontWeight: "medium", fontSize: 14, ml: 3 }}>
                                                                Value:
                                                            </Typography>
                                                            <Typography sx={{ fontSize: 14, ml: 1 }}>
                                                                {item.value}
                                                            </Typography>
                                                        </Fragment>
                                                        :
                                                        <div></div>
                                                } */}
                                            </Box>
                                            <Box id={`alarm-item-${i}-body`} sx={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", gap: 5, flexWrap: "wrap", my: 0.5, py: 1, px: 3, overflow: "auto" }}>
                                                {
                                                    item.config ?
                                                        <AlarmVariable title="Config" value={item.config} />
                                                        : null
                                                }
                                                {/* {
                                                    item.severity ?
                                                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                                                            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                                                                Severity
                                                            </Typography>
                                                            <Chip label={item.severity} size="small"
                                                                    sx={{ fontWeight: "medium", fontSize: 12, color: "#FFFFFF", backgroundColor: colors.SEV_COLORS[item.severity] ? colors.SEV_COLORS[item.severity] : "#424242" }}></Chip>
                                                        </Box>
                                                        : null
                                                } */}
                                                {
                                                    item.message ?
                                                        <AlarmVariable title="Message" value={item.message} />
                                                        : null
                                                }
                                                {
                                                    item.time ?
                                                        <AlarmVariable title="Time" value={new Date(item.time).toLocaleString("en-US", dateFormat)} />
                                                        : null
                                                }
                                                {
                                                    item.message_time ?
                                                        <AlarmVariable title="Message Time" value={new Date(item.message_time).toLocaleString("en-US", dateFormat)} />
                                                        : null
                                                }
                                                {
                                                    item.current_severity ?
                                                        <AlarmVariable title="Current Severity" value={item.current_severity} color={colors.SEV_COLORS[item.current_severity] ? colors.SEV_COLORS[item.current_severity] : "black"} />
                                                        : null
                                                }
                                                {
                                                    item.current_message ?
                                                        <AlarmVariable title="Current Message" value={item.current_message} />
                                                        : null
                                                }

                                                {
                                                    item.value ?
                                                        <AlarmVariable title="Value" value={item.value} />
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
                                        </Box>
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
