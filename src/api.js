import { ApiProxyConnector } from "@elastic/search-ui-elasticsearch-connector";
import ElasticSearchAPIConnector from "@elastic/search-ui-elasticsearch-connector";

const channelFinderURL = import.meta.env.PROD ? import.meta.env.REACT_APP_CF_URL : import.meta.env.REACT_APP_CF_URL_DEV;
const cfMaxResults = parseInt(import.meta.env.REACT_APP_CF_MAX_RESULTS);
const ologURL = import.meta.env.PROD ? import.meta.env.REACT_APP_OLOG_URL : import.meta.env.REACT_APP_OLOG_URL_DEV;
const ologWebURL = import.meta.env.PROD ? import.meta.env.REACT_APP_OLOG_WEB_CLIENT_URL : import.meta.env.REACT_APP_OLOG_WEB_CLIENT_URL_DEV;
const aaViewerURL = import.meta.env.PROD ? import.meta.env.REACT_APP_AA_URL : import.meta.env.REACT_APP_AA_URL_DEV;
const pvwsURL = import.meta.env.PROD ? import.meta.env.REACT_APP_PVWS_URL : import.meta.env.REACT_APP_PVWS_URL_DEV;
const pvwsHTTPURL = import.meta.env.PROD ? import.meta.env.REACT_APP_PVWS_HTTP_URL : import.meta.env.REACT_APP_PVWS_HTTP_URL_DEV;
const serverURL = import.meta.env.PROD ? import.meta.env.REACT_APP_BASE_URL : import.meta.env.REACT_APP_BASE_URL_DEV;
const alarmLogURL = import.meta.env.PROD ? import.meta.env.REACT_APP_AL_URL : import.meta.env.REACT_APP_AL_URL_DEV;
const caputlogURL = import.meta.env.PROD ? import.meta.env.REACT_APP_CAPUTLOG_URL : import.meta.env.REACT_APP_CAPUTLOG_URL_DEV;
const ologStartDays = import.meta.env.REACT_APP_OLOG_START_TIME_DAYS !== '' ?
    `&start=${import.meta.env.REACT_APP_OLOG_START_TIME_DAYS}days&end=now`
    : "";
const ologMaxResults = import.meta.env.REACT_APP_OLOG_MAX_RESULTS !== '' ?
    `&size=${import.meta.env.REACT_APP_OLOG_MAX_RESULTS}`
    : "";
const alarmLogStartDays = import.meta.env.REACT_APP_AL_START_TIME_DAYS !== '' ?
    `&start=${import.meta.env.REACT_APP_AL_START_TIME_DAYS}days&end=now`
    : "";
const alarmLogMaxResults = import.meta.env.REACT_APP_AL_MAX_RESULTS !== '' ?
    `&size=${import.meta.env.REACT_APP_AL_MAX_RESULTS}`
    : "";

const elasticIndexName = import.meta.env.REACT_APP_ELASTICSEARCH_INDEX_NAME;
const elasticApikey = import.meta.env.REACT_APP_ELASTICSEARCH_API_KEY;
// Choice to use Elasticsearch directly or an API Proxy
const caputLogConnector = import.meta.env.REACT_APP_USE_CAPUT_API_PROXY_CONNNECTOR === "true"
    ? new ApiProxyConnector({
            basePath: `${caputlogURL}`
        })
    : new ElasticSearchAPIConnector({
            host: `${caputlogURL}`,
            index: `${elasticIndexName}`,
            apiKey: `${elasticApikey}`
        });

function handleParams(params) {
    let urlParams = { "pvName": "*", "params": "" };
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
        urlParams.pvName = encodeURIComponent(urlParams.pvName.replace(/,/g, '?'));
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
    if (import.meta.env.REACT_APP_EXTRA_PROP && import.meta.env.REACT_APP_EXTRA_PROP_DROPDOWN_LABELS) {
        noWildcard.add(import.meta.env.REACT_APP_EXTRA_PROP);
    }
    if (import.meta.env.REACT_APP_SECOND_EXTRA_PROP && import.meta.env.REACT_APP_SECOND_EXTRA_PROP_DROPDOWN_LABELS) {
        noWildcard.add(import.meta.env.REACT_APP_SECOND_EXTRA_PROP);
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
    let maxResults = cfMaxResults ? `&~size=${cfMaxResults}` : "";
    let requestURI = `${channelFinderURL}/resources/channels?~name=${urlParams.pvName}${urlParams.params}${maxResults}`;
    let options = {};
    options = { method: 'GET' }
    if (import.meta.env.REACT_APP_SEND_CREDENTIALS === "true") {
        if (import.meta.env.PROD) {
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
        requestURI = encodeURI(`${ologURL}/logs/search?text=${pvName}${ologStartDays}${ologMaxResults}`);
    } else if (logType === logEnum.ALARM_LOG) {
        requestURI = encodeURI(`${alarmLogURL}/search/alarm?pv=${pvName}${alarmLogStartDays}${alarmLogMaxResults}${extraParams}`);
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
        requestURI = `${channelFinderURL}/resources/properties`
    } else if (helperType === queryHelperEnum.TAGS) {
        requestURI = `${channelFinderURL}/resources/tags`
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
    let requestURI = `${channelFinderURL}/resources/channels/count?~name=${urlParams.pvName}${urlParams.params}`;

    return await standardQuery(requestURI);
}

async function getCFInfo() {
    return await standardQuery(channelFinderURL);
}

async function getALInfo() {
    const requestURI = alarmLogURL + "/"
    return await standardQuery(requestURI);
}

async function getOLOGInfo() {
    return await standardQuery(ologURL);
}

async function getCaputLogInfo() {
    return await standardQuery(caputlogURL);
}

async function getPVWSInfo(path) {
    if (pvwsHTTPURL === "") return;
    if (pvwsHTTPURL.slice(-1) !== "/") {
        path = "/" + path;
    }
    const requestURI = pvwsHTTPURL + path;
    return await standardQuery(requestURI);
}

async function standardQuery(requestURI, options = null, handleData = null) {
    let data = {};
    let error = "";
    let errorFlag = false;

    if (import.meta.env.REACT_APP_SEND_CREDENTIALS === "true") {
        if (import.meta.env.PROD) {
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
    CF_URL: channelFinderURL,
    OLOG_URL: ologURL,
    OLOG_WEB_URL: ologWebURL,
    AA_VIEWER: aaViewerURL,
    PVWS_URL: pvwsURL,
    SERVER_URL: serverURL,
    LOG_ENUM: logEnum,
    HELPERS_ENUM: queryHelperEnum,
    CAPUTLOG_URL: caputlogURL,
    CAPUTLOG_CONNECTOR: caputLogConnector,
}

export default api;
