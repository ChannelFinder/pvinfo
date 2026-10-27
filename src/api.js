import { toByteArray } from "base64-js";
import config from "./config";
import { getExactMatchProperties } from "./components/home/propertyValues";

const cfMaxResults = config.CF_MAX_RESULTS;
const ologStartDays = config.OLOG_START_TIME_DAYS !== null
    ? `&start=${config.OLOG_START_TIME_DAYS}days&end=now`
    : "";
const ologMaxResults = config.OLOG_MAX_RESULTS !== null
    ? `&size=${config.OLOG_MAX_RESULTS}`
    : "";
const alarmLogStartDays = config.AL_START_TIME_DAYS !== null
    ? `&start=${config.AL_START_TIME_DAYS}days&end=now`
    : "";
const alarmLogMaxResults = config.AL_MAX_RESULTS !== null
    ? `&size=${config.AL_MAX_RESULTS}`
    : "";

// Channel Finder splits each query value on these characters and ORs the pieces together
const CF_OR_SEPARATORS = /[|,;]/;
// commas are not OR separators for PV names since some sites have commas in their PV names, see handleParams
const PV_NAME_OR_SEPARATORS = /[|;]/;

// Split an OR query like "VVR|TEST" into its patterns and wrap each pattern without a leading or
// trailing * in wildcards for a partial match, i.e. "*VVR*|*TEST*" instead of "*VVR|TEST*"
function addPartialMatchWildcards(value, separators, addWildcards = true) {
    return value.split(separators)
        .map((pattern) => pattern.trim())
        .filter((pattern) => pattern !== "")
        .map((pattern) => {
            if (addWildcards && pattern.charAt(0) !== "*" && pattern.charAt(pattern.length - 1) !== "*") {
                return `*${pattern}*`;
            }
            return pattern;
        })
        .join("|");
}

// Channel Finder ~name patterns for a PV name search, = at the beginning is an exact match
function pvNameQuery(pvName) {
    if (pvName.charAt(0) === "=") {
        return [pvName.substring(1)];
    }
    // PV names can't contain spaces, so space separated words are each sent as a ~name parameter which Channel Finder ANDs together
    const namePatterns = pvName.split(/\s+/)
        .map((word) => addPartialMatchWildcards(word, PV_NAME_OR_SEPARATORS))
        .filter((pattern) => pattern !== "");
    return namePatterns.length === 0 ? ["*"] : namePatterns;
}

function handleParams(params) {
    let urlParams = { "nameQuery": "~name=*", "params": "" };
    if ("pvName" in params && params.pvName !== "") {
        // Channel Finder treats commas as OR separators, replace with the single character wildcard to match PV names with commas
        urlParams.nameQuery = pvNameQuery(params.pvName).map((pattern) => `~name=${encodeURIComponent(pattern.replace(/,/g, '?'))}`).join("&");
    }
    if (params['standardSearch']) {
        urlParams.params = standardParse(params);
    } else {
        urlParams.params = advancedParse(params);
    }

    return urlParams;
}

// Channel Finder operator and pattern for a property search value, used by both search types:
// = at the beginning is an exact match, ! at the beginning is not equal, and partial match wildcards
// are added unless the property has known values, see getExactMatchProperties
function propertyQuery(key, value, exactMatchProperties = getExactMatchProperties()) {
    if (value.charAt(0) === "=") {
        return { operator: "=", pattern: value.substring(1) };
    }
    if (value.charAt(0) === "!") {
        return { operator: "!=", pattern: addPartialMatchWildcards(value.substring(1), CF_OR_SEPARATORS, !exactMatchProperties.has(key)) };
    }
    return { operator: "=", pattern: addPartialMatchWildcards(value, CF_OR_SEPARATORS, !exactMatchProperties.has(key)) };
}

function standardParse(params) {
    const exactMatchProperties = getExactMatchProperties();
    let addOn = "";
    for (let key in params) {
        if (key === 'pvName' || key === "standardSearch") continue;
        const value = params[key];
        if (value === "") {
            addOn = addOn.concat(`&${key}`);
            continue;
        }
        const { operator, pattern } = propertyQuery(key, value, exactMatchProperties);
        if (pattern === "") continue;
        addOn = addOn.concat(`&${key}${operator}${encodeURIComponent(pattern)}`);
    }
    return addOn;
}

function advancedParse(params) {
    const exactMatchProperties = getExactMatchProperties();
    let addOn = "";
    for (let key in params) {
        if (key === 'pvName' || key === 'standardSearch') continue;
        if (key.includes('tag')) {
            addOn = addOn.concat(`&~tag=${encodeURIComponent(params[key])}`)
        } else {
            const { operator, pattern } = propertyQuery(key, params[key], exactMatchProperties);
            addOn = addOn.concat(`&${key}${operator}${encodeURIComponent(pattern)}`);
        }
    }
    return addOn;
}

async function queryChannelFinder(params) {
    let urlParams = handleParams(params);
    let maxResults = cfMaxResults ? `&~size=${cfMaxResults}` : "";
    let requestURI = `${config.CF_URL}/resources/channels?${urlParams.nameQuery}${urlParams.params}${maxResults}`;
    let options = { method: 'GET' }
    if (config.SEND_CREDENTIALS) {
        if (config.IS_PROD) {
            // credentials header would help if CF, AA, etc are behind a SSO
            options['credentials'] = 'include';
        }
    }
    return await standardQuery(requestURI, options);
}

async function queryLog(logType, pvName, extraParams) {
    if (pvName === null) {
        return;
    }

    let requestURI = ""
    if (logType === logEnum.ONLINE_LOG) {
        requestURI = encodeURI(`${config.OLOG_URL}/logs/search?text=${pvName}${ologStartDays}${ologMaxResults}`);
    } else if (logType === logEnum.ALARM_LOG) {
        requestURI = encodeURI(`${config.AL_URL}/search/alarm?pv=${pvName}${alarmLogStartDays}${alarmLogMaxResults}${extraParams}`);
    } else {
        return new Promise((resolve, reject) => {
            reject();
        })
    }
    return await standardQuery(requestURI);
}

async function getQueryHelpers(helperType) {
    let requestURI = ""

    if (helperType === queryHelperEnum.PROPERTIES) {
        requestURI = `${config.CF_URL}/resources/properties`
    } else if (helperType === queryHelperEnum.TAGS) {
        requestURI = `${config.CF_URL}/resources/tags`
    } else {
        return new Promise((resolve, reject) => {
            reject();
        })
    }

    function handleData(data) {
        let props = new Array(data.length)
        for (let i = 0; i < data.length; ++i) {
            props[i] = data[i].name
        }
        return props;
    }

    return await standardQuery(requestURI, null, handleData)
}

async function getCount(params = {}) {
    let urlParams = handleParams(params)
    let requestURI = `${config.CF_URL}/resources/channels/count?${urlParams.nameQuery}${urlParams.params}`;

    return await standardQuery(requestURI);
}

async function getCFInfo() {
    return await standardQuery(config.CF_URL);
}

async function getALInfo() {
    const requestURI = config.AL_URL + "/"
    return await standardQuery(requestURI);
}

async function getOLOGInfo() {
    return await standardQuery(config.OLOG_URL);
}

async function getCaputLogInfo() {
    return await standardQuery(config.CAPUTLOG_URL);
}

async function getPVWSInfo(path) {
    if (config.PVWS_HTTP_URL === "") return;
    if (config.PVWS_HTTP_URL.slice(-1) !== "/") {
        path = "/" + path;
    }
    const requestURI = config.PVWS_HTTP_URL + path;
    return await standardQuery(requestURI);
}

async function standardQuery(requestURI, options = null, handleData = null) {
    let data = {};
    let error = "";
    let errorFlag = false;

    if (config.SEND_CREDENTIALS) {
        if (config.IS_PROD) {
            if (options === null) options = {};
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
            if (handleData) {
                resolve(handleData(data));
            }
            else {
                resolve(data);
            }
        }
    })
}

function parseWebSocketMessage(jsonMessage, fixedPrecision = null) {
    if (jsonMessage === null) {
        return null;
    }
    else if (jsonMessage.type === "update") {
        if (jsonMessage.pv === undefined) {
            console.log("Websocket message without a PV name");
            return null;
        }
        let pvData = jsonMessage;
        if ("alarm_low" in pvData) {
            if (pvData.alarm_low === "NaN" || pvData.alarm_low === "Infinity" || pvData.alarm_low === "-Infinity") {
                pvData.alarm_low = "n/a";
            }
        }
        if ("alarm_high" in pvData) {
            if (pvData.alarm_high === "NaN" || pvData.alarm_high === "Infinity" || pvData.alarm_high === "-Infinity") {
                pvData.alarm_high = "n/a";
            }
        }
        if ("warn_low" in pvData) {
            if (pvData.warn_low === "NaN" || pvData.warn_low === "Infinity" || pvData.warn_low === "-Infinity") {
                pvData.warn_low = "n/a";
            }
        }
        if ("warn_high" in pvData) {
            if (pvData.warn_high === "NaN" || pvData.warn_high === "Infinity" || pvData.warn_high === "-Infinity") {
                pvData.warn_high = "n/a";
            }
        }
        if ("seconds" in pvData) {
            if ("nanos" in pvData) {
                pvData.timestamp = new Date(pvData.seconds * 1000 + (pvData.nanos * 1e-6)).toLocaleString();
            } else {
                pvData.timestamp = new Date(pvData.seconds * 1000).toLocaleString();
            }
        }
        // determine the "pv_value" which will be displayed in the UI
        // see "handleMessage" in https://github.com/ornl-epics/pvws/blob/main/src/main/webapp/js/pvws.js
        if ("text" in pvData) {
            pvData.pv_value = pvData.text;
        } else if ("b64dbl" in pvData) {
            let bytes = toByteArray(pvData.b64dbl);
            let value_array = new Float64Array(bytes.buffer);
            pvData.pv_value = Array.prototype.slice.call(value_array);
        } else if ("b64int" in pvData) {
            let bytes = toByteArray(pvData.b64int);
            let value_array = new Int32Array(bytes.buffer);
            pvData.pv_value = Array.prototype.slice.call(value_array);
        } else if ("b64byt" in pvData) {
            let bytes = toByteArray(pvData.b64byt);
            if (config.PVWS_TREAT_BYTE_ARRAY_AS_STRING) {
                try {
                    const decoder = new TextDecoder('utf-8');
                    pvData.pv_value = decoder.decode(bytes);
                } catch (error) {
                    console.log("Error decoding byte array: ", error.message);
                }
            } else {
                let value_array = new Uint8Array(bytes.buffer);
                pvData.pv_value = Array.prototype.slice.call(value_array);
            }
        } else if ("b64flt" in pvData) {
            let bytes = toByteArray(pvData.b64flt);
            let value_array = new Float32Array(bytes.buffer);
            pvData.pv_value = Array.prototype.slice.call(value_array);
        } else if ("b64srt" in pvData) {
            let bytes = toByteArray(pvData.b64srt);
            let value_array = new Int16Array(bytes.buffer);
            pvData.pv_value = Array.prototype.slice.call(value_array);
        } else if ("value" in pvData) {
            if (fixedPrecision) {
                if ((Number(pvData.value) >= 0.01 && Number(pvData.value) < 1000000000) || (Number(pvData.value) <= -0.01 && Number(pvData.value) > -1000000000) || Number(pvData.value) === 0) {
                    pvData.pv_value = Number(pvData.value.toFixed(Number(fixedPrecision)));
                } else {
                    pvData.pv_value = Number(pvData.value).toExponential(Number(fixedPrecision));
                }
            }
            else {
                // if precision was explicitly set (and badly assume 0 is not explicit) then use that
                if (pvData.precision !== null && pvData.precision !== "" && !isNaN(pvData.precision) && pvData.precision !== 0) {
                    pvData.pv_value = (Number(pvData.value) >= 0.01 || Number(pvData.value) === 0) ? Number(pvData.value.toFixed(Number(pvData.precision))) : Number(pvData.value).toExponential(Number(pvData.precision));
                }
                // otherwise show full value
                else {
                    pvData.pv_value = (Number(pvData.value) >= 0.01 || Number(pvData.value) === 0) ? Number(pvData.value) : Number(pvData.value).toExponential();
                }
            }
        } else {
            pvData.pv_value = null;
        }
        return pvData;
    }
    else {
        console.log("Unknown message type");
        return null;
    }
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
    CFI_QUERY: getCFInfo,
    ALI_QUERY: getALInfo,
    OLI_QUERY: getOLOGInfo,
    CAPUTLOG_QUERY: getCaputLogInfo,
    PVWSI_QUERY: getPVWSInfo,
    LOG_ENUM: logEnum,
    HELPERS_ENUM: queryHelperEnum,
    PARSE_WEBSOCKET_MSG: parseWebSocketMessage,
    PV_NAME_QUERY: pvNameQuery,
    PROPERTY_QUERY: propertyQuery,
}

export default api;
