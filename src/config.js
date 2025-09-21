import { ApiProxyConnector } from "@elastic/search-ui-elasticsearch-connector";
import CustomElasticSearchAPIConnector from "./components/caputlog/CustomElasticSearchAPIConnector";

const parseBoolean = (value, defaultValue) => {
    if (value === null || value === undefined || value === "") {
        return defaultValue;
    }
    if (typeof value === "string") {
        return ["true", "1", "yes", "on"].includes(value.trim().toLowerCase());
    }
    return Boolean(value);
};

const parseIntOrDefault = (value, defaultValue) => {
    if (value === null || value === undefined || value === "") {
        return defaultValue;
    }
    const num = parseInt(value.trim(), 10);
    return isNaN(num) ? defaultValue : num;
};

// parse comma-separated list into array
const parseList = (value) => {
    if (value === null || value === undefined || value === "") {
        return [];
    }
    return value.split(",").map((item) => item.trim()).filter(Boolean);
};

const getEnv = (prodKey, devKey) => {
    return import.meta.env.PROD ? import.meta.env[prodKey] : import.meta.env[devKey];
};

// caputlog elasticsearch connector - either direct or via a back-end proxy service
const elasticIndexName = import.meta.env.REACT_APP_ELASTICSEARCH_INDEX_NAME;
const elasticApikey = import.meta.env.REACT_APP_ELASTICSEARCH_API_KEY;
// typo in config name was fixed but this is for backward compatibility
const useProxy = parseBoolean(
    import.meta.env.REACT_APP_USE_CAPUT_API_PROXY_CONNECTOR ??
    import.meta.env.REACT_APP_USE_CAPUT_API_PROXY_CONNNECTOR,
    true
);

const caputlogURL = getEnv("REACT_APP_CAPUTLOG_URL", "REACT_APP_CAPUTLOG_URL_DEV");

const caputLogConnector = useProxy
    ? new ApiProxyConnector({ basePath: caputlogURL })
    : CustomElasticSearchAPIConnector({
        host: caputlogURL,
        index: elasticIndexName,
        apiKey: elasticApikey
    });

// Global config object
const config = {
    // General settings
    WEBSITE_NAME: import.meta.env.REACT_APP_WEBSITE_NAME,
    WEBSITE_DESC: import.meta.env.REACT_APP_WEBSITE_DESC,
    VERSION: import.meta.env.REACT_APP_VERSION,
    ENDPOINT: import.meta.env.REACT_APP_ENDPOINT,
    DOMAIN: import.meta.env.REACT_APP_DOMAIN,
    HTTP_PROTOCOL: import.meta.env.REACT_APP_HTTP_PROTOCOL,
    FULL_URL: getEnv("REACT_APP_FULL_URL", "REACT_APP_FULL_URL_DEV"),
    IS_PROD: import.meta.env.PROD,

    // URLs
    CF_URL: getEnv("REACT_APP_CF_URL", "REACT_APP_CF_URL_DEV"),
    OLOG_URL: getEnv("REACT_APP_OLOG_URL", "REACT_APP_OLOG_URL_DEV"),
    OLOG_WEB_URL: getEnv("REACT_APP_OLOG_WEB_CLIENT_URL", "REACT_APP_OLOG_WEB_CLIENT_URL_DEV"),
    AA_VIEWER: getEnv("REACT_APP_AA_URL", "REACT_APP_AA_URL_DEV"),
    PVWS_URL: getEnv("REACT_APP_PVWS_URL", "REACT_APP_PVWS_URL_DEV"),
    PVWS_HTTP_URL: getEnv("REACT_APP_PVWS_HTTP_URL", "REACT_APP_PVWS_HTTP_URL_DEV"),
    AL_URL: getEnv("REACT_APP_AL_URL", "REACT_APP_AL_URL_DEV"),
    SERVER_URL: getEnv("REACT_APP_BASE_URL", "REACT_APP_BASE_URL_DEV"),
    CAPUTLOG_URL: caputlogURL,

    // Connectors
    CAPUTLOG_CONNECTOR: caputLogConnector,

    // Breakpoints
    SM_BREAKPOINT: parseIntOrDefault(import.meta.env.REACT_APP_SM_BREAKPOINT, 600),
    MD_BREAKPOINT: parseIntOrDefault(import.meta.env.REACT_APP_MD_BREAKPOINT, 900),
    LG_BREAKPOINT: parseIntOrDefault(import.meta.env.REACT_APP_LG_BREAKPOINT, 1536),

    // Table config
    OMIT_IN_TABLE_MEDIUM: parseList(import.meta.env.REACT_APP_OMIT_IN_TABLE_MEDIUM),
    OMIT_IN_TABLE_SMALL: parseList(import.meta.env.REACT_APP_OMIT_IN_TABLE_SMALL),
    OMIT_IN_TABLE_X_SMALL: parseList(import.meta.env.REACT_APP_OMIT_IN_TABLE_X_SMALL),
    RESULTS_TABLE_SIZE: parseIntOrDefault(import.meta.env.REACT_APP_RESULTS_TABLE_SIZE, 50),
    RESULTS_TABLE_SIZE_OPTIONS:
        parseList(import.meta.env.REACT_APP_RESULTS_TABLE_SIZE_OPTIONS).length > 0
        ? parseList(import.meta.env.REACT_APP_RESULTS_TABLE_SIZE_OPTIONS).map(Number)
        : [5, 10, 20, 50, 100],
    RESULTS_TABLE_DENSITY: import.meta.env.REACT_APP_RESULTS_TABLE_DENSITY || "standard",

    // PV Detail Page
    DETAILS_PAGE_PROPERTIES: import.meta.env.REACT_APP_DETAILS_PAGE_PROPERTIES,
    DETAILS_PAGE_PROPERTIES_BLOCKLIST: parseList(import.meta.env.REACT_APP_DETAILS_PAGE_PROPERTIES_BLOCKLIST),
    DEFAULT_LIVE_MONITORING: parseBoolean(import.meta.env.REACT_APP_DEFAULT_LIVE_MONITORING, false),

    // Channel Finder
    CF_MAX_RESULTS: parseIntOrDefault(import.meta.env.REACT_APP_CF_MAX_RESULTS, null), // null means no ~size parameter in queries
    CF_RECORD_TYPE: parseBoolean(import.meta.env.REACT_APP_CF_RECORD_TYPE, false),
    CF_RECORD_DESC: parseBoolean(import.meta.env.REACT_APP_CF_RECORD_DESC, false),
    CF_RECORD_ALIAS: parseBoolean(import.meta.env.REACT_APP_CF_ALIAS, false),

    // CF extra properties for home page
    EXTRA_PROP: import.meta.env.REACT_APP_EXTRA_PROP || null,
    EXTRA_PROP_LABEL: import.meta.env.REACT_APP_EXTRA_PROP_LABEL || "",
    EXTRA_PROP_HELP_TEXT: import.meta.env.REACT_APP_EXTRA_PROP_HELP_TEXT || "",
    EXTRA_PROP_SHOW_IN_RESULTS: parseBoolean(import.meta.env.REACT_APP_EXTRA_PROP_SHOW_IN_RESULTS, false),
    EXTRA_PROP_DROPDOWN_LABELS: parseList(import.meta.env.REACT_APP_EXTRA_PROP_DROPDOWN_LABELS),

    SECOND_EXTRA_PROP: import.meta.env.REACT_APP_SECOND_EXTRA_PROP || null,
    SECOND_EXTRA_PROP_LABEL: import.meta.env.REACT_APP_SECOND_EXTRA_PROP_LABEL || "",
    SECOND_EXTRA_PROP_HELP_TEXT: import.meta.env.REACT_APP_SECOND_EXTRA_PROP_HELP_TEXT || "",
    SECOND_EXTRA_PROP_SHOW_IN_RESULTS: parseBoolean(import.meta.env.REACT_APP_SECOND_EXTRA_PROP_SHOW_IN_RESULTS, false),
    SECOND_EXTRA_PROP_DROPDOWN_LABELS: parseList(import.meta.env.REACT_APP_SECOND_EXTRA_PROP_DROPDOWN_LABELS),

    // PV Web Socket
    USE_PVWS: parseBoolean(import.meta.env.REACT_APP_USE_PVWS, false),
    LIVE_MONITOR_WARN: parseIntOrDefault(import.meta.env.REACT_APP_LIVE_MONITOR_WARN, 50),
    LIVE_MONITOR_MAX: parseIntOrDefault(import.meta.env.REACT_APP_LIVE_MONITOR_MAX, 100),
    PVWS_TREAT_BYTE_ARRAY_AS_STRING: parseBoolean(import.meta.env.REACT_APP_PVWS_TREAT_BYTE_ARRAY_AS_STRING, true),
    PVWS_ALLOW_WAVEFORMS: parseBoolean(import.meta.env.REACT_APP_PVWS_ALLOW_WAVEFORMS, false),
    PVWS_IGNORE_CF_PVSTATUS: parseBoolean(import.meta.env.REACT_APP_PVWS_IGNORE_CF_PVSTATUS, false),
    SHOW_DISCONNECTED: parseBoolean(import.meta.env.REACT_APP_SHOW_DISCONNECTED, true),

    // Archiver
    USE_AA: parseBoolean(import.meta.env.REACT_APP_USE_AA, false),
    AA_POLICIES: parseList(import.meta.env.REACT_APP_AA_POLICIES),

    // OLOG
    USE_OLOG: parseBoolean(import.meta.env.REACT_APP_USE_OLOG, false),
    OLOG_START_TIME_DAYS: parseIntOrDefault(import.meta.env.REACT_APP_OLOG_START_TIME_DAYS, null),
    OLOG_MAX_RESULTS: parseIntOrDefault(import.meta.env.REACT_APP_OLOG_MAX_RESULTS, null),

    // Alarm Logger
    USE_AL: parseBoolean(import.meta.env.REACT_APP_USE_AL, false),
    AL_START_TIME_DAYS: parseIntOrDefault(import.meta.env.REACT_APP_AL_START_TIME_DAYS, null),
    AL_MAX_RESULTS: parseIntOrDefault(import.meta.env.REACT_APP_AL_MAX_RESULTS, null),

    // CaputLog
    USE_CAPUTLOG: parseBoolean(import.meta.env.REACT_APP_USE_CAPUTLOG, false),
    USE_CAPUT_API_PROXY_CONNECTOR: useProxy,

    // Severity colors
    OK_SEVERITY_COLOR: import.meta.env.REACT_APP_OK_SEVERITY_COLOR,
    MINOR_SEVERITY_COLOR: import.meta.env.REACT_APP_MINOR_SEVERITY_COLOR,
    MAJOR_SEVERITY_COLOR: import.meta.env.REACT_APP_MAJOR_SEVERITY_COLOR,
    INVALID_SEVERITY_COLOR: import.meta.env.REACT_APP_INVALID_SEVERITY_COLOR,
    UNDEFINED_SEVERITY_COLOR: import.meta.env.REACT_APP_UNDEFINED_SEVERITY_COLOR,

    // git info from vite build
    GIT_COMMIT_DATE: import.meta.env.REACT_APP_GIT_COMMIT_DATE,
    GIT_SHORT_HASH: import.meta.env.REACT_APP_GIT_SHORT_HASH,

    // Misc
    HELP_EXAMPLE_PV: import.meta.env.REACT_APP_HELP_EXAMPLE_PV,
    HELP_PV_NAMING_CONVENTION: import.meta.env.REACT_APP_HELP_PV_NAMING_CONVENTION,
    HOMEPAGE_HEADER: import.meta.env.REACT_APP_HOMEPAGE_HEADER,
    HOMEPAGE_SUBHEADER: import.meta.env.REACT_APP_HOMEPAGE_SUBHEADER,
    SEND_CREDENTIALS: parseBoolean(import.meta.env.REACT_APP_SEND_CREDENTIALS, false)
};

// freeze the config object to prevent modifications
export default Object.freeze(config);
