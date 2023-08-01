import { useEffect, useState } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Box, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { CustomTableContainer, TableHeaderCell } from "../customtablecells/CustomTable";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import api from "../../../api";
import PropTypes from "prop-types";

const propTypes = {
    pvName: PropTypes.string
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

function AlarmConfigTable(props) {
    const [alarmConfigData, setAlarmConfigData] = useState(null);
    const [alarmConfigExpanded, setAlarmConfigExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [noConfigMessage, setNoConfigMessage] = useState("No Alarm Configuration Entries");

    const handleAlarmConfigExpandedChange = () => (event, isExpanded) => {
        setAlarmConfigExpanded(isExpanded);
    }

    useEffect(() => {
        api.LOG_QUERY(api.LOG_ENUM.ALARM_LOG, props.pvName, '&user=*?*')
            .then((data) => {
                if (data !== null && data.hitCount !== 0) {
                    setAlarmConfigData(data);
                    setIsLoading(false);
                }
                else {
                    setIsLoading(false);
                    setNoConfigMessage("No Alarm Configuration Entries");
                    console.log("Null data from Alarm Log api for alarm configurations");
                }
            })
            .catch((err) => {
                setIsLoading(false);
                setNoConfigMessage("Error Fetching Alarm Config Entries");
                console.log(err);
                console.log("error in fetch of alarm configuration entries");
            })
    }, [props.pvName]);

    if (isLoading) {
        return (
            <Accordion expanded={false}>
                <AccordionSummary>
                    <Typography sx={{ fontSize: 18, fontWeight: "medium" }}>Alarm Configuration Entries Loading...</Typography>
                </AccordionSummary>
            </Accordion>
        );
    }
    else if (alarmConfigData === null || alarmConfigData === {} || Object.keys(alarmConfigData).length === 0 || alarmConfigData.hitCount === 0) {
        return (
            <Accordion expanded={false}>
                <AccordionSummary>
                    <Typography sx={{ fontSize: 18, fontWeight: "medium" }}>{noConfigMessage}</Typography>
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
            <Accordion expanded={alarmConfigExpanded} onChange={handleAlarmConfigExpandedChange()}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="alarmLog-content" id="alarmLog-header">
                    <Typography sx={{ fontSize: 18, fontWeight: "medium" }}>Alarm Configuration Changes</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                    <CustomTableContainer component={Box}>
                        <Table stickyHeader={true}>
                            <TableHead>
                                <TableRow>
                                    <TableHeaderCell>Config</TableHeaderCell>
                                    <TableHeaderCell>Message Time</TableHeaderCell>
                                    <TableHeaderCell>User</TableHeaderCell>
                                    <TableHeaderCell>Host</TableHeaderCell>
                                    <TableHeaderCell>Config Message</TableHeaderCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    alarmConfigData.map((item, i) => {
                                        if (!item) {
                                            return;
                                        }
                                        let prettyConfigMsg = "";
                                        if (item.config_msg) {
                                            prettyConfigMsg = JSON.stringify(JSON.parse(item.config_msg), null, 2);
                                        }
                                        const message_time = item.message_time ? new Date(item.message_time).toLocaleString("en-US", dateFormat) : "";
                                        return (
                                            <TableRow key={i}>
                                                <TableCell>{item.config}</TableCell>
                                                <TableCell>{message_time}</TableCell>
                                                <TableCell>{item.user}</TableCell>
                                                <TableCell>{item.host}</TableCell>
                                                <TableCell>
                                                    <pre>{prettyConfigMsg}</pre>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                }
                            </TableBody>
                        </Table>
                    </CustomTableContainer>
                </AccordionDetails>
            </Accordion>
        );
    }

}

AlarmConfigTable.propTypes = propTypes;
export default AlarmConfigTable;
