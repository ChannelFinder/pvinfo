import config from '../../config';

const pvRecordTypes = ['aai', 'aao', 'ai', 'ao', 'aSub', 'bi', 'bo', 'calcout', 'calc', 'compress', 'dfanout', 'event',
    'fanout', 'histogram', 'int64in', 'int64out', 'longin', 'longout', 'lsi', 'lso', 'mbbi', 'mbbiDirect', 'mbbo', 'mbboDirect',
    'permissive', 'printf', 'sel', 'seq', 'state', 'stringin', 'stringout', 'subArray', 'sub', 'waveform'];

// known values for Channel Finder properties, in the order they should be shown:
// record types, the extra property dropdown labels, then PROPERTY_VALUES which wins if a property is listed twice
// In the future CF could handle this natively so we don't have to hard-code via a property
// https://github.com/ChannelFinder/ChannelFinderService/issues/236
function getPropertyValues() {
    let values = {};
    if (config.CF_RECORD_TYPE) {
        values["recordType"] = pvRecordTypes;
    }
    if (config.EXTRA_PROP && config.EXTRA_PROP_DROPDOWN_LABELS?.length > 0) {
        values[config.EXTRA_PROP] = config.EXTRA_PROP_DROPDOWN_LABELS;
    }
    if (config.SECOND_EXTRA_PROP && config.SECOND_EXTRA_PROP_DROPDOWN_LABELS?.length > 0) {
        values[config.SECOND_EXTRA_PROP] = config.SECOND_EXTRA_PROP_DROPDOWN_LABELS;
    }
    // format: property:value1,value2;property2:value1,value2
    (config.PROPERTY_VALUES || "").split(";").forEach((entry) => {
        const colonIndex = entry.indexOf(":");
        if (colonIndex === -1) {
            return;
        }
        const name = entry.substring(0, colonIndex).trim();
        const list = entry.substring(colonIndex + 1).split(",").map((value) => value.trim()).filter(Boolean);
        if (name && list.length > 0) {
            values[name] = list;
        }
    });
    return values;
}

// properties searched exactly instead of with partial match wildcards, since their values are known
function getExactMatchProperties() {
    return new Set(["pvStatus", "recordType", ...Object.keys(getPropertyValues())]);
}

export { pvRecordTypes, getPropertyValues, getExactMatchProperties };
