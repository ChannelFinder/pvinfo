import React, { Fragment, useState, useEffect } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Box, Grid, Typography } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AlarmVariable from "./alarmvariable/AlarmVariable";
import api from "../../../api";
import PropTypes from "prop-types";

const propTypes = {
    pvName: PropTypes.string,
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
                    <Typography variant="subtitle2" color="red">No Alarm Log Entries for this PV</Typography>
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
                        <Box sx={{ display: "flex", flexDirection: "column", mx: 2 }}>
                            {
                                alarmLogData.map((item, i) => {
                                    return (
                                        <Box key={i} sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", py: 1, borderBottom: 1, borderColor: 'grey.300', '&:last-child': { border: 0 } }}>
                                            {
                                                item.message_time ?
                                                    <AlarmVariable title="Message Time" value={item.message_time} />
                                                    : null
                                            }
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
                                            {/* {
                                                item.config_msg ?
                                                    <AlarmVariable title="Config Message" value={item.config_msg} />
                                                    : null
                                            } */}
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
