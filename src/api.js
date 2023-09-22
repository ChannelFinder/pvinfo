const channelFinderURL = process.env.NODE_ENV === 'development' ? process.env.REACT_APP_CF_URL_DEV : process.env.REACT_APP_CF_URL;
const ologURL = process.env.NODE_ENV === 'development' ? process.env.REACT_APP_OLOG_URL_DEV : process.env.REACT_APP_OLOG_URL;
const ologWebURL = process.env.NODE_ENV === 'development' ? process.env.REACT_APP_OLOG_WEB_CLIENT_URL_DEV : process.env.REACT_APP_OLOG_WEB_CLIENT_URL;
const aaViewerURL = process.env.NODE_ENV === 'development' ? process.env.REACT_APP_AA_URL_DEV : process.env.REACT_APP_AA_URL;
const pvwsURL = process.env.NODE_ENV === 'development' ? process.env.REACT_APP_PVWS_URL_DEV : process.env.REACT_APP_PVWS_URL;
const serverURL = process.env.NODE_ENV === 'development' ? process.env.REACT_APP_BASE_URL_DEV : process.env.REACT_APP_BASE_URL;
const alarmLogURL = process.env.NODE_ENV === 'development' ? process.env.REACT_APP_AL_URL_DEV : process.env.REACT_APP_AL_URL;
const ologStartDays = process.env.REACT_APP_OLOG_START_TIME_DAYS !== '' ?
    `&start=${process.env.REACT_APP_OLOG_START_TIME_DAYS}days&end=now`
    : "";
const ologMaxResults = process.env.REACT_APP_OLOG_MAX_RESULTS !== '' ?
    `&size=${process.env.REACT_APP_OLOG_MAX_RESULTS}`
    : "";
const alarmLogStartDays = process.env.REACT_APP_AL_START_TIME_DAYS !== '' ?
    `&start=${process.env.REACT_APP_AL_START_TIME_DAYS}days&end=now`
    : "";
const alarmLogMaxResults = process.env.REACT_APP_AL_MAX_RESULTS !== '' ?
    `&size=${process.env.REACT_APP_AL_MAX_RESULTS}`
    : "";

function handleParams(params) {
    let urlParams = { "pvName": "*", "params": "" }

    if ("pvName" in params && params.pvName !== "") {
        if (params.pvName.charAt(0) === "=") {
            urlParams.pvName = params.pvName.substring(1);
        }
        else if (params.pvName.charAt(0) !== "*" && params.pvName.charAt(params.pvName.length - 1) !== "*") {
            urlParams.pvName = `*${params.pvName}*`;
        }
        else {
            urlParams.pvName = params.pvName;
        }
    }
    if (params['standardSearch']) {
        urlParams.params = standardParse(params);
    } else {
        urlParams.params = freeformParse(params);
    }

    return urlParams;
}

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
        if (key.includes('tag')) {
            addOn = addOn.concat(`&~tag=${params[key]}`)
        } else {
            addOn = addOn.concat(`&${key}=${params[key]}`);
        }
    }
    return addOn;
}

async function queryChannelFinder(params) {

    let urlParams = handleParams(params);

    let requestURI = `${channelFinderURL}/resources/channels?~name=${urlParams.pvName}${urlParams.params}`;

    let data = {};
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

async function queryLog(logType, pvName, extraParams) {
    let error = false;
    let data = {};
    if (pvName === null) {
        return;
    }
    let requestURI = ""
    if (logType === logEnum.ONLINE_LOG) {
        requestURI = encodeURI(`${ologURL}/logs/search?text=${pvName}${ologStartDays}${ologMaxResults}`);
    } else if (logType === logEnum.ALARM_LOG) {
        requestURI = encodeURI(`${alarmLogURL}/search/alarm?pv=${pvName}${alarmLogStartDays}${alarmLogMaxResults}${extraParams}`);
    } else {
        return new Promise((resolve, reject) => {
            reject();
        })
    }
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
        .catch(() => {
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

async function getQueryHelpers(helperType) {
    let error = false;
    let data = {};
    let requestURI = ""

    if (helperType === queryHelperEnum.PROPERTIES) {
        requestURI = `${channelFinderURL}/resources/properties`
    } else if (helperType === queryHelperEnum.TAGS) {
        requestURI = `${channelFinderURL}/resources/tags`
    } else {
        return new Promise((resolve, reject) => {
            reject();
        })
    }

    await fetch(requestURI)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error(`Error in ${helperType} fetch!`);
            }
        })
        .then(responseJson => {
            data = responseJson;
        })
        .catch(() => {
            error = true;
        })
    return new Promise((resolve, reject) => {
        if (error) {
            reject();
        } else {
            let props = new Array(data.length)
            for (let i = 0; i < data.length; ++i) {
                props[i] = data[i].name
            }
            resolve(props);
        }
    })
}

async function getCount(params = {}) {
    let urlParams = handleParams(params)

    let requestURI = `${channelFinderURL}/resources/channels/count?~name=${urlParams.pvName}${urlParams.params}`;

    let data = {};
    let error = "";
    let errorFlag = false
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

const logEnum = {
    ONLINE_LOG: "online_log",
    ALARM_LOG: "alarm_log"
}

const queryHelperEnum = {
    PROPERTIES: "properties",
    TAGS: "tags"
}

const api = {
    CF_QUERY: queryChannelFinder,
    LOG_QUERY: queryLog,
    HELPERS_QUERY: getQueryHelpers,
    COUNT_QUERY: getCount,
    CF_URL: channelFinderURL,
    OLOG_URL: ologURL,
    OLOG_WEB_URL: ologWebURL,
    AA_VIEWER: aaViewerURL,
    PVWS_URL: pvwsURL,
    SERVER_URL: serverURL,
    LOG_ENUM: logEnum,
    HELPERS_ENUM: queryHelperEnum,
}

export default api;
