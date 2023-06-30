import { useEffect, useState } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { CustomTableContainer, TableBodyCell, TableHeaderCell } from "../customtablecells/CustomTable";
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

    const handleAlarmConfigExpandedChange = () => (event, isExpanded) => {
        setAlarmConfigExpanded(isExpanded);
    }

    useEffect(() => {
        api.ALARM_QUERY(props.pvName, '&user=*?*')
            .then((data) => {
                if (data !== null && data.hitCount !== 0) {
                    setAlarmConfigData(data);
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
                    <Typography sx={{ fontSize: 18, fontWeight: "medium" }}>Alarm Configuration Entries Loading...</Typography>
                </AccordionSummary>
            </Accordion>
        );
    }
    else if (alarmConfigData === null || alarmConfigData === {} || Object.keys(alarmConfigData).length === 0 || alarmConfigData.hitCount === 0) {
        return (
            <Accordion expanded={false}>
                <AccordionSummary>
                    <Typography sx={{ fontSize: 18, fontWeight: "medium" }}>No Alarm Configuration Entries</Typography>
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
                <AccordionDetails sx={{ px: 0 }}>
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
                                        const prettyConfigMsg = JSON.stringify(JSON.parse(item.config_msg), null, 2);
                                        return (
                                            <TableRow key={i}>
                                                <TableCell>{item.config}</TableCell>
                                                <TableCell>{new Date(item.message_time).toLocaleString("en-US", dateFormat)}</TableCell>
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
                    {/* <Box sx={{ border: 1, borderColor: 'primary.main', borderRadius: 1 }}>
                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                            {
                                alarmConfigData.map((item, i) => {
                                    return (
                                        <Box key={i} id={`alarm-item-${i}`} sx={{ display: "flex", flexDirection: "column", py: 1, borderBottom: 2, borderColor: 'grey.300', '&:last-child': { border: 0 } }}>
                                            <Box id={`alarm-item-${i}-body`} sx={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", gap: 5, flexWrap: "wrap", my: 0.5, py: 1, px: 3, overflow: "auto" }}>
                                                {
                                                    item.config ?
                                                        <AlarmVariable title="Config" value={item.config} />
                                                        : null
                                                }
                                                {
                                                    item.message_time ?
                                                        <AlarmVariable title="Message Time" value={new Date(item.message_time).toLocaleString("en-US", dateFormat)} />
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
                    </Box> */}
                </AccordionDetails>
            </Accordion>
        );
    }

}

AlarmConfigTable.propTypes = propTypes;
export default AlarmConfigTable;
