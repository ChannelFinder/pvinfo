import React, { useState, useEffect } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Box, Chip, Table, TableBody, TableHead, TableRow, Typography } from "@mui/material";
import { CustomTableContainer, TableBodyCell, TableHeaderCell } from "../customtablecells/CustomTable";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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
    const [noAlarmMessage, setNoAlarmMessage] = useState("No Alarm Log Entries");

    const handleAlarmLogExpandedChange = () => (event, isExpanded) => {
        setAlarmLogExpanded(isExpanded);
    }

    useEffect(() => {
        api.LOG_QUERY(api.LOG_ENUM.ALARM_LOG, props.pvName, '&severity=*?*')
            .then((data) => {
                if (data !== null && data.hitCount !== 0) {
                    setAlarmLogData(data);
                    setIsLoading(false);
                }
                else {
                    setIsLoading(false);
                    setNoAlarmMessage("No Alarm Log Entries");
                    console.log("Null data from Alarm Log api for alarm logs");
                }
            })
            .catch((err) => {
                setIsLoading(false);
                setNoAlarmMessage("Error Fetching Alarm Log Entries");
                console.log(err);
                console.log("error in fetch of alarm log entries");
            })
    }, [props.pvName]);

    if (isLoading) {
        return (
            <Accordion expanded={false}>
                <AccordionSummary>
                    <Typography sx={{ fontSize: 18, fontWeight: "medium" }}>Alarm Log Entries Loading...</Typography>
                </AccordionSummary>
            </Accordion>
        );
    }
    else if (alarmLogData === null || alarmLogData === {} || Object.keys(alarmLogData).length === 0 || alarmLogData.hitCount === 0) {
        return (
            <Accordion expanded={false}>
                <AccordionSummary>
                    <Typography sx={{ fontSize: 18, fontWeight: "medium" }}>{noAlarmMessage}</Typography>
                    {
                        process.env.REACT_APP_AL_START_TIME_DAYS !== '' ?
                            <Typography sx={{ fontSize: 18, fontWeight: "medium" }}>&nbsp;Within {process.env.REACT_APP_AL_START_TIME_DAYS} Days</Typography>
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
                    <Typography sx={{ fontSize: 18, fontWeight: "medium" }}>Alarm Log Entries</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                    <CustomTableContainer component={Box} sx={{ borderTop: 1 }}>
                        <Table stickyHeader={true}>
                            <TableHead>
                                <TableRow>
                                    <TableHeaderCell>Severity</TableHeaderCell>
                                    <TableHeaderCell>Config</TableHeaderCell>
                                    <TableHeaderCell>Message</TableHeaderCell>
                                    <TableHeaderCell>Value</TableHeaderCell>
                                    <TableHeaderCell>Time</TableHeaderCell>
                                    <TableHeaderCell>Message Time</TableHeaderCell>
                                    <TableHeaderCell>Current Severity</TableHeaderCell>
                                    <TableHeaderCell>Current Message</TableHeaderCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    alarmLogData.map((item, i) => {
                                        if (!item) {
                                            return null;
                                        }
                                        const time = item.time ? new Date(item.time).toLocaleString("en-US", dateFormat) : "";
                                        const message_time = item.message_time ? new Date(item.message_time).toLocaleString("en-US", dateFormat) : "";

                                        return (
                                            <TableRow key={i}>
                                                <TableBodyCell >
                                                    {
                                                        item.severity ?
                                                            <Chip label={item.severity} size="small"
                                                                sx={{ ml: 1, fontWeight: "medium", fontSize: 12, color: "#FFFFFF", backgroundColor: colors.SEV_COLORS[item.severity] ? colors.SEV_COLORS[item.severity] : "#424242" }}></Chip>
                                                            : null
                                                    }
                                                </TableBodyCell>
                                                <TableBodyCell>{item.config}</TableBodyCell>
                                                <TableBodyCell>{item.message}</TableBodyCell>
                                                <TableBodyCell>{item.value}</TableBodyCell>
                                                <TableBodyCell>{time}</TableBodyCell>
                                                <TableBodyCell>{message_time}</TableBodyCell>
                                                <TableBodyCell sx={{ color: colors.SEV_COLORS[item.current_severity] ? colors.SEV_COLORS[item.current_severity] : "#000" }}>{item.current_severity}</TableBodyCell>
                                                <TableBodyCell>{item.current_message}</TableBodyCell>
                                            </TableRow>
                                        )
                                    })
                                }
                            </TableBody>
                        </Table>
                    </CustomTableContainer>
                </AccordionDetails>
            </Accordion >
        );
    }

}

AlarmLogTable.propTypes = propTypes;
export default AlarmLogTable;
