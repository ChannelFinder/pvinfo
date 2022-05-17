const channelFinderURL = process.env.NODE_ENV === 'development' ? process.env.REACT_APP_CF_URL_DEV : process.env.REACT_APP_CF_URL;
const ologURL = process.env.NODE_ENV === 'development' ? process.env.REACT_APP_OLOG_URL_DEV : process.env.REACT_APP_OLOG_URL;
const aaViewerURL = process.env.NODE_ENV === 'development' ? process.env.REACT_APP_AA_URL_DEV : process.env.REACT_APP_AA_URL;
const pvwsURL = process.env.NODE_ENV === 'development' ? process.env.REACT_APP_PVWS_URL_DEV : process.env.REACT_APP_PVWS_URL;
const serverURL = process.env.NODE_ENV === 'development' ? process.env.REACT_APP_BASE_URL_DEV : process.env.REACT_APP_BASE_URL;

async function queryChannelFinder(params) {
    let error = false;
    let data = {};

    let pvName = "*";
    if ("pvName" in params && params.pvName !== "") {
        if(params.pvName.charAt(0) === "=") {
            pvName = params.pvName.substring(1);
        }
        else if (params.pvName.charAt(0) !== "*" && params.pvName.charAt(params.pvName.length - 1) !== "*") {
            pvName = `*${params.pvName}*`;
        }
        else {
            pvName = params.pvName;
        }
    }
    let hostName = "=*";
    if ("hostName" in params && params.hostName !== "") {
        if(params.hostName.charAt(0) === "=") {
            hostName = params.hostName;
        }
        else if(params.hostName.charAt(0) === "!") {
            hostName = `!=*${params.hostName.substring(1)}*`;
        }
        else if (params.hostName.charAt(0) !== "*" && params.hostName.charAt(params.hostName.length - 1) !== "*") {
            hostName = `=*${params.hostName}*`;
        }
        else {
            hostName = `=${params.hostName}`;
        }
    }
    let iocName = "=*";
    if ("iocName" in params && params.iocName !== "") {
        if(params.iocName.charAt(0) === "=") {
            iocName = params.iocName;
        }
        else if(params.iocName.charAt(0) === "!") {
            iocName = `!=*${params.iocName.substring(1)}*`;
        }
        else if (params.iocName.charAt(0) !== "*" && params.iocName.charAt(params.iocName.length - 1) !== "*") {
            iocName = `=*${params.iocName}*`;
        }
        else {
            iocName = `=${params.iocName}`;
        }
    }
    let pvStatus = "=*";
    if ("pvStatus" in params && params.pvStatus !== "") {
        if(params.pvStatus.charAt(0) === "=") {
            pvStatus = params.pvStatus;
        }
        else if(params.pvStatus.charAt(0) === "!") {
            pvStatus = `!=*${params.pvStatus.substring(1)}*`;
        }
        else if (params.pvStatus.charAt(0) !== "*" && params.pvStatus.charAt(params.pvStatus.length - 1) !== "*") {
            pvStatus = `=*${params.pvStatus}*`;
        }
        else {
            pvStatus = `=${params.pvStatus}`;
        }
    }
    let recordType = "=*";
    if ("recordType" in params && params.recordType !== "") {
        if(params.recordType.charAt(0) === "=") {
            recordType = params.recordType;
        }
        else if(params.recordType.charAt(0) === "!") {
            recordType = `!=*${params.recordType.substring(1)}*`;
        }
        // don't assume wildcard on dropdowns
        // else if (params.recordType.charAt(0) !== "*" && params.recordType.charAt(params.recordType.length - 1) !== "*") {
        //     recordType = `=*${params.recordType}*`;
        // }
        else {
            recordType = `=${params.recordType}`;
        }
    }

    let requestURI = `${channelFinderURL}?~name=${pvName}&hostName${hostName}&iocName${iocName}&pvStatus${pvStatus}&recordType${recordType}`;
    
    if(process.env.REACT_APP_CF_RECORD_DESC === "true") {
        if ("recordDesc" in params && params.recordDesc !== "") {
            if(params.recordDesc.charAt(0) === "=") {
                requestURI = requestURI + `&recordDesc${params.recordDesc}`;
            }
            else if(params.recordDesc.charAt(0) === "!") {
                requestURI = requestURI + `&recordDesc!=${params.recordDesc.substring(1)}`;
            }
            else if (params.recordDesc.charAt(0) !== "*" && params.recordDesc.charAt(params.recordDesc.length - 1) !== "*") {
                requestURI = requestURI + `&recordDesc=*${params.recordDesc}*`;
            }
            else {
                requestURI = requestURI + `&recordDesc=${params.recordDesc}`;
            }
        }
    }
    if ("alias" in params && params.alias !== "") {
        if(params.alias.charAt(0) === "=") {
            requestURI = requestURI + `&alias${params.alias}`;
        }
        else if(params.alias.charAt(0) === "!") {
            requestURI = requestURI + `&alias!=${params.alias.substring(1)}`;
        }
        else if (params.alias.charAt(0) !== "*" && params.alias.charAt(params.alias.length - 1) !== "*") {
            requestURI = requestURI + `&alias=*${params.alias}*`;
        }
        else {
            requestURI = requestURI + `&alias=${params.alias}`;
        }
    }
    let options = {}
    options = {method: 'GET'}
    if (process.env.NODE_ENV !== 'development') {
        //options['credentials'] = 'include'
    }
    // credentials header would help if CF, AA, etc are behind a SSO
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
        .catch((error) => {
            error = true;
        })
        return new Promise((resolve, reject) => {
            if ( error === true) {
                reject();
            } else {
                resolve(data);
            }
        })
}

async function queryOLOG(pvName) {
    let error = false;
    let data = {};
    if(pvName === null) {
        return;
    }

    // this needs to be updated to the elastic search OLOG
    let requestURI = encodeURI(`${ologURL}/olog-endpoint.js?op=retrieve&start=0&format=json&q=${pvName}`);
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
        if ( error === true) {
            reject();
        } else {
            resolve(data);
        }
    })
}

const aaPolicies = [
    {"policy": "VeryFast", "method": "Monitor", "period": "0.1", "ltsreduce": "10 Seconds",  "control": "None"},
    {"policy": "Fast",     "method": "Monitor", "period": "1",   "ltsreduce": "30 Seconds",  "control": "None"},
    {"policy": "Medium",   "method": "Monitor", "period": "10",  "ltsreduce": "60 Seconds",  "control": "None"},
    {"policy": "Slow",     "method": "Scan",    "period": "60",  "ltsreduce": "180 Seconds", "control": "None"},
    {"policy": "VerySlow", "method": "Scan",    "period": "900", "ltsreduce": "None",        "control": "None"},
    {"policy": "VeryFastControlled", "method": "Monitor", "period": "0.1", "ltsreduce": "10 Seconds",  "control": "Archiver:Enable"},
    {"policy": "FastControlled",     "method": "Monitor", "period": "1",   "ltsreduce": "30 Seconds",  "control": "Archiver:Enable"},
    {"policy": "MediumControlled",   "method": "Monitor", "period": "10",  "ltsreduce": "60 Seconds",  "control": "Archiver:Enable"},
    {"policy": "SlowControlled",     "method": "Scan",    "period": "60",  "ltsreduce": "180 Seconds", "control": "Archiver:Enable"},
    {"policy": "VerySlowControlled", "method": "Scan",    "period": "900", "ltsreduce": "None",        "control": "Archiver:Enable"},

]

const api = {
    CF_QUERY: queryChannelFinder,
    CF_URL: channelFinderURL,
    OLOG_QUERY: queryOLOG,
    OLOG_URL: ologURL,
    AA_VIEWER: aaViewerURL,
    AA_POLICIES: aaPolicies,
    PVWS_URL: pvwsURL,
    SERVER_URL: serverURL,
}

export default api;
