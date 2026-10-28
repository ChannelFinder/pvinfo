import config from '../../../config';

// Split a query on spaces, except inside double quotes. The quotes are kept so the parser can tell an = inside
// quotes, which is part of the value, from the operator. An unclosed quote runs to the end of the query
function splitTerms(query) {
    return query.match(/(?:[^\s"]+|"[^"]*"?)+/g) || [];
}

// index of the first = outside of quotes, or -1
function operatorIndex(term) {
    let quoted = false;
    for (let i = 0; i < term.length; i++) {
        if (term[i] === '"') {
            quoted = !quoted;
        } else if (term[i] === "=" && !quoted) {
            return i;
        }
    }
    return -1;
}

const unquote = (text) => text.replaceAll('"', "");

function hasUnclosedQuote(query) {
    return (query.match(/"/g) || []).length % 2 === 1;
}

// Parse an Advanced search query into Channel Finder search params:
// an optional PV name pattern first, then property=value pairs and tag names, separated by spaces.
// Values and tags with spaces go in double quotes, like recordDesc=="beam current" or "my tag".
// Tags are a list in params.tag, which becomes tag=a&tag=b in the URL.
// property==value is an exact match and property!=value is not equal, which become the =value and !value
// used by the Standard search fields. =name as the first term is an exact PV name, like the Standard search
function parseAdvancedQuery(query) {
    let params = {};
    let tags = [];
    splitTerms(query).forEach((term, index) => {
        const equalsIndex = operatorIndex(term);
        if (equalsIndex === 0 && index === 0) {
            params["pvName"] = "=" + unquote(term.substring(1));
        } else if (equalsIndex !== -1) {
            const key = unquote(term.substring(0, equalsIndex));
            const rawValue = term.substring(equalsIndex + 1);
            const value = unquote(rawValue);
            // tag=name is the same as the tag name on its own, so params.tag is always a list.
            // Tags are always an exact match so tag==name is the same too, and not equal tags can't be searched.
            // Only an = outside the quotes is the exact operator, so tag="=odd" is the tag =odd like "=odd" on its own
            if (key === "tag") {
                tags.push(rawValue.charAt(0) === "=" ? unquote(rawValue.substring(1)) : value);
            } else if (key === "tag!") {
                params["tag!"] = value;
            } else if (key.endsWith("!")) {
                params[key.slice(0, -1)] = "!" + value;
            } else {
                params[key] = value;
            }
        } else if (index === 0) {
            params["pvName"] = unquote(term);
        } else if (unquote(term) !== "") {
            tags.push(unquote(term));
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
function getAdvancedQueryError(params, query = "") {
    if (hasUnclosedQuote(query)) {
        return 'Add the closing " after the quoted value, or use ? to match a " character';
    }
    if ("" in params) {
        return "Enter a property name before the =";
    }
    // = and ! are the exact and not equal operators, see parseAdvancedQuery
    const emptyProperty = Object.keys(params).find((key) => !["pvName", "tag", "tag!"].includes(key) && ["", "=", "!"].includes(params[key]));
    if (emptyProperty !== undefined) {
        return `Enter a value after ${emptyProperty}=, or use ${emptyProperty}=* to match any value`;
    }
    if (params["tag"]?.includes("")) {
        return "Enter a tag name after tag=";
    }
    if ("tag!" in params) {
        return "Tags can't be searched for not equal, remove tag!= from the query";
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

// The Advanced query has no escape for a double quote, so a literal " becomes the ? single character wildcard,
// which still matches it. Otherwise a Standard search value like 6" would be an unclosed quote
const wildcardQuotes = (text) => text.replaceAll('"', "?");

// Quote a value with spaces so it stays one term. A leading = or ! is the exact or not equal operator,
// so it stays outside the quotes
function quoteValue(value) {
    const operator = /^[=!]/.test(value) ? value.charAt(0) : "";
    const text = wildcardQuotes(value.substring(operator.length));
    return /\s/.test(text) ? `${operator}"${text}"` : operator + text;
}

// Quote a PV name or tag with spaces or an = so it isn't split or read as a property
function quoteTerm(text) {
    const term = wildcardQuotes(text);
    return /[\s=]/.test(term) ? `"${term}"` : term;
}

// The Advanced search query for search params from the URL, which use the Standard search syntax.
// Properties in propertyOrder come first, in that order, then the other properties, then the tags
function toAdvancedQuery(params, propertyOrder = []) {
    // the query starts with the PV name, so use * when there isn't one or a tag would be read as the PV name
    let pvName = "*";
    if ("pvName" in params) {
        // =name is an exact match, the = stays outside the quotes like the Standard search syntax
        pvName = params["pvName"].charAt(0) === "=" ? "=" + quoteTerm(params["pvName"].substring(1)) : quoteTerm(params["pvName"]);
    }
    const rank = (key) => (propertyOrder.includes(key) ? propertyOrder.indexOf(key) : propertyOrder.length);
    const properties = Object.keys(params)
        .filter((key) => !["pvName", "tag", "standardSearch"].includes(key))
        .sort((a, b) => rank(a) - rank(b))
        .map((key) => `${key}=${quoteValue(params[key])}`);
    const tags = (params["tag"] || []).map(quoteTerm);
    return [pvName, ...properties, ...tags].join(" ");
}

export { parseAdvancedQuery, readSearchParams, getAdvancedQueryError, getPropertyLabels, hasUnclosedQuote, quoteValue, quoteTerm, toAdvancedQuery };
