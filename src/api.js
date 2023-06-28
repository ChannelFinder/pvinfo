const channelFinderURL = process.env.NODE_ENV === 'development' ? process.env.REACT_APP_CF_URL_DEV : process.env.REACT_APP_CF_URL;
const ologURL = process.env.NODE_ENV === 'development' ? process.env.REACT_APP_OLOG_URL_DEV : process.env.REACT_APP_OLOG_URL;
const ologWebURL = process.env.NODE_ENV === 'development' ? process.env.REACT_APP_OLOG_WEB_CLIENT_URL_DEV : process.env.REACT_APP_OLOG_WEB_CLIENT_URL;
const aaViewerURL = process.env.NODE_ENV === 'development' ? process.env.REACT_APP_AA_URL_DEV : process.env.REACT_APP_AA_URL;
const pvwsURL = process.env.NODE_ENV === 'development' ? process.env.REACT_APP_PVWS_URL_DEV : process.env.REACT_APP_PVWS_URL;
const serverURL = process.env.NODE_ENV === 'development' ? process.env.REACT_APP_BASE_URL_DEV : process.env.REACT_APP_BASE_URL;
const alarmLogURL = process.env.NODE_ENV === 'development' ? process.env.REACT_APP_AL_URL_DEV : process.env.REACT_APP_AL_URL;
const ologStartDays = process.env.REACT_APP_OLOG_START_TIME_DAYS != '' ? process.env.REACT_APP_OLOG_START_TIME_DAYS : "7"
const alarmLogStartDays = process.env.REACT_APP_AL_START_TIME_DAYS != '' ? process.env.REACT_APP_AL_START_TIME_DAYS : "7";

function standardParse(params) {
    let noWildcard = new Set(["pvStatus", "recordType"]);
    if (process.env.REACT_APP_EXTRA_PROP && process.env.REACT_APP_EXTRA_PROP_DROPDOWN_LABELS) {
        noWildcard.add(process.env.REACT_APP_EXTRA_PROP);
    }
    if (process.env.REACT_APP_SECOND_EXTRA_PROP && process.env.REACT_APP_SECOND_EXTRA_PROP_DROPDOWN_LABELS) {
        noWildcard.add(process.env.REACT_APP_SECOND_EXTRA_PROP);
    }

    let addOn = "";
    for (let key in params) {
        if (key === 'pvName' || key === "standardSearch") continue;
        const value = params[key];
        let newParam = `&${key}`
        if (value !== "") {
            if (value.charAt(0) === "=") {
                newParam = newParam.concat(value)
            }
            else if (value.charAt(0) === "!") {
                newParam = newParam.concat(`!=*${value.substring(1)}*`);
            }
            else if ((value.charAt(0) !== "*" && value.charAt(value.length - 1) !== "*") && !(noWildcard.has(key))) {
                newParam = newParam.concat(`=*${value}*`);
            }
            else {
                newParam = newParam.concat(`=${value}`);
            }
        }
        addOn = addOn.concat(newParam);
    }
    return addOn;
}

function freeformParse(params) {
    let addOn = "";
    for (let key in params) {
        if (key === 'pvName' || key === 'standardSearch') continue;
        addOn = addOn.concat(`&${key}=${params[key]}`);
    }
    return addOn;
}

async function queryChannelFinder(params) {
    let data = {};
    let urlParams = "";
    let pvName = "*";
    if ("pvName" in params && params.pvName !== "") {
        if (params.pvName.charAt(0) === "=") {
            pvName = params.pvName.substring(1);
        }
        else if (params.pvName.charAt(0) !== "*" && params.pvName.charAt(params.pvName.length - 1) !== "*") {
            pvName = `*${params.pvName}*`;
        }
        else {
            pvName = params.pvName;
        }
    }
    if (params['standardSearch']) {
        urlParams = standardParse(params);
    } else {
        urlParams = freeformParse(params);
    }

    let requestURI = `${channelFinderURL}/resources/channels?~name=${pvName}${urlParams}`;

    let options = {};
    let errorFlag = false;
    let error = "";
    options = { method: 'GET' }
    if (process.env.REACT_APP_SEND_CREDENTIALS === "true") {
        if (process.env.NODE_ENV !== 'development') {
            // credentials header would help if CF, AA, etc are behind a SSO
            options['credentials'] = 'include';
        }
    }

    await fetch(requestURI, options)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error("error in fetch!");
            }
        })
        .then(responseJson => {
            data = responseJson;
        })
        .catch((err) => {
            error = err;
            errorFlag = true;
        })
    return new Promise((resolve, reject) => {
        if (errorFlag === true) {
            reject(error);
        } else {
            resolve(data);
        }
    })
}

async function queryOLOG(pvName) {
    let error = false;
    let data = {};
    if (pvName === null) {
        return;
    }

    let requestURI = encodeURI(`${ologURL}/logs/search?text=${pvName}&start=${ologStartDays}days&end=now`);
    await fetch(requestURI)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error("error in fetch!");
            }
        })
        .then(responseJson => {
            data = responseJson;
        })
        .catch((error) => {
            error = true;
        })
    return new Promise((resolve, reject) => {
        if (error === true) {
            reject();
        } else {
            resolve(data);
        }
    })
}

async function queryAlarmLog(pvName) {
    let error = false;
    let data = {};
    if (pvName === null) {
        return;
    }

    let requestURI = encodeURI(`${alarmLogURL}/search/alarm?pv=${pvName}&start=${alarmLogStartDays}days&end=now`);
    await fetch(requestURI)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error("error in fetch!");
            }
        })
        .then(responseJson => {
            data = responseJson;
        })
        .catch((error) => {
            error = true;
        })
    return new Promise((resolve, reject) => {
        if (error) {
            reject();
        } else {
            resolve(data);
        }
    })
}

const api = {
    CF_QUERY: queryChannelFinder,
    CF_URL: channelFinderURL,
    ALARM_QUERY: queryAlarmLog,
    OLOG_QUERY: queryOLOG,
    OLOG_URL: ologURL,
    OLOG_WEB_URL: ologWebURL,
    AA_VIEWER: aaViewerURL,
    PVWS_URL: pvwsURL,
    SERVER_URL: serverURL,
}

export default api;
