import config from '../../../config';

// Parse an Advanced search query into Channel Finder search params:
// an optional PV name pattern first, then property=value pairs and tag names, separated by spaces.
// Tags are a list in params.tag, which becomes tag=a&tag=b in the URL
function parseAdvancedQuery(query) {
    let params = {};
    let tags = [];
    const terms = query.split(/\s+/).filter((term) => term !== "");
    terms.forEach((term, index) => {
        const equalsIndex = term.indexOf("=");
        if (equalsIndex !== -1) {
            const key = term.substring(0, equalsIndex);
            const value = term.substring(equalsIndex + 1);
            // tag=name is the same as the tag name on its own, so params.tag is always a list
            if (key === "tag") {
                tags.push(value);
            } else {
                params[key] = value;
            }
        } else if (index === 0) {
            params["pvName"] = term;
        } else {
            tags.push(term);
        }
    });
    if (tags.length > 0) {
        params["tag"] = tags;
    }
    return params;
}

// Read search params from the URL, with the tags as a list like parseAdvancedQuery.
// Links from before 3.0 numbered the tags tag1=a&tag2=b, read those too so old bookmarks and log entries still work
function readSearchParams(searchParams) {
    let params = {};
    let tags = [];
    searchParams.forEach((val, key) => {
        if (val === "") {
            return;
        }
        if (key === "tag" || /^tag\d+$/.test(key)) {
            tags.push(val);
        } else {
            params[key] = val;
        }
    });
    if (tags.length > 0) {
        params["tag"] = tags;
    }
    return params;
}

// Error message for params from parseAdvancedQuery that can't be searched, or "" if they are fine.
// The most likely mistake is picking a property from the dropdown and not typing a value after the =
function getAdvancedQueryError(params) {
    const emptyProperty = Object.keys(params).find((key) => key !== "pvName" && key !== "tag" && params[key] === "");
    if (emptyProperty !== undefined) {
        return `Enter a value after ${emptyProperty}=, or use ${emptyProperty}=* to match any value`;
    }
    if (params["tag"]?.includes("")) {
        return "Enter a tag name after tag=";
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

export { parseAdvancedQuery, readSearchParams, getAdvancedQueryError, getPropertyLabels };
