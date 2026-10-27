import config from '../../../config';

// Parse an Advanced search query into Channel Finder search params:
// an optional PV name pattern first, then property=value pairs and tag names, separated by spaces
function parseAdvancedQuery(query) {
    let params = {};
    let numTags = 1;
    const terms = query.split(/\s+/).filter((term) => term !== "");
    terms.forEach((term, index) => {
        const equalsIndex = term.indexOf("=");
        if (equalsIndex !== -1) {
            params[term.substring(0, equalsIndex)] = term.substring(equalsIndex + 1);
        } else if (index === 0) {
            params["pvName"] = term;
        } else {
            params[`tag${numTags}`] = term;
            ++numTags;
        }
    });
    return params;
}

// tags from parseAdvancedQuery are numbered tag1, tag2... so properties like voltage aren't mistaken for tags
function isTagParam(key) {
    return /^tag\d+$/.test(key);
}

// Error message for params from parseAdvancedQuery that can't be searched, or "" if they are fine.
// The most likely mistake is picking a property from the dropdown and not typing a value after the =
function getAdvancedQueryError(params) {
    // same check for tags as the Channel Finder query, see advancedParse in api.js
    const emptyProperty = Object.keys(params).find((key) => key !== "pvName" && !isTagParam(key) && params[key] === "");
    if (emptyProperty !== undefined) {
        return `Enter a value after ${emptyProperty}=, or use ${emptyProperty}=* to match any value`;
    }
    return "";
}

// friendly names for Channel Finder properties, from the PV details page and extra property labels
function getPropertyLabels() {
    let labels = {};
    (config.DETAILS_PAGE_PROPERTIES || "").split(",").forEach((pair) => {
        const [name, label] = pair.split(":");
        if (name && label) {
            labels[name.trim()] = label.trim();
        }
    });
    if (config.EXTRA_PROP && config.EXTRA_PROP_LABEL) {
        labels[config.EXTRA_PROP] = config.EXTRA_PROP_LABEL;
    }
    if (config.SECOND_EXTRA_PROP && config.SECOND_EXTRA_PROP_LABEL) {
        labels[config.SECOND_EXTRA_PROP] = config.SECOND_EXTRA_PROP_LABEL;
    }
    return labels;
}

export { parseAdvancedQuery, isTagParam, getAdvancedQueryError, getPropertyLabels };
