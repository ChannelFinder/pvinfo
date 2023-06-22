import React, { useState, useEffect } from "react";
import { Typography } from "@mui/material";
import api from "../../../api";
import PropTypes from "prop-types";

const propTypes = {
    pvName: PropTypes.string,
}

function AlarmLogTable(props) {
    const [alarmLogData, setAlarmLogData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

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
            <Typography variant="h6">Alarm Log Data Loading...</Typography>
        );
    }
    else if (alarmLogData === null || alarmLogData === {} || Object.keys(alarmLogData).length === 0 || alarmLogData.hitCount === 0) {
        return (
            <Typography variant="h6">No OLOG Entries for this PV</Typography>
        );
    }
    else {
        return (
            <Typography>{alarmLogData[0].severity}</Typography>
        );
    }

}

AlarmLogTable.propTypes = propTypes;
export default AlarmLogTable;
