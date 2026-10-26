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

export { parseAdvancedQuery, getPropertyLabels };
