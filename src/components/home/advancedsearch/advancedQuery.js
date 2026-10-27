import config from '../../../config';

// Parse an Advanced search query into Channel Finder search params:
// an optional PV name pattern first, then property=value pairs and tag names, separated by spaces.
// property==value is an exact match and property!=value is not equal, which become the =value and !value
// used by the Standard search fields
function parseAdvancedQuery(query) {
    let params = {};
    let numTags = 1;
    const terms = query.split(/\s+/).filter((term) => term !== "");
    terms.forEach((term, index) => {
        const equalsIndex = term.indexOf("=");
        if (equalsIndex !== -1) {
            const key = term.substring(0, equalsIndex);
            const value = term.substring(equalsIndex + 1);
            if (key.endsWith("!")) {
                params[key.slice(0, -1)] = "!" + value;
            } else {
                params[key] = value;
            }
        } else if (index === 0) {
            params["pvName"] = term;
        } else {
            params[`tag${numTags}`] = term;
            ++numTags;
        }
    });
    return params;
}

// Error message for params from parseAdvancedQuery that can't be searched, or "" if they are fine.
// The most likely mistake is picking a property from the dropdown and not typing a value after the =
function getAdvancedQueryError(params) {
    // same check for tags as the Channel Finder query, see advancedParse in api.js
    // = and ! are the exact and not equal operators, see parseAdvancedQuery
    const emptyProperty = Object.keys(params).find((key) => key !== "pvName" && !key.includes("tag") && ["", "=", "!"].includes(params[key]));
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

export { parseAdvancedQuery, getAdvancedQueryError, getPropertyLabels };
