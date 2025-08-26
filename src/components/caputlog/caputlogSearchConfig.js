import api from "../../api";

export function getCaputLogSearchConfig({ filters = [], search_fields = {}, facets = {}, initialState = {} } = {}) {
  return {
    alwaysSearchOnInitialLoad: true,
    apiConnector: api.CAPUTLOG_CONNECTOR,
    hasA11yNotifications: true,
    trackUrlState: false,
    searchQuery: {
      filters,
      search_fields: { pv: { weight: 1 }, ...search_fields },
      result_fields: {
        old: { raw: {} },
        user: { raw: {} },
        message: { raw: {} },
        pv: { raw: {} },
        client: { raw: {} },
        new: { raw: {} },
        "@ioctimestamp": { raw: {} },
        "@timestamp": { raw: {} },
        timestamp: { raw: {} },
        id: { raw: {} }
      },
      facets: {
        "user.keyword": { type: "value", size: 30, sort: "count" },
        "client.keyword": { type: "value", size: 30, sort: "count" },
        ...facets
      },
    },
    initialState: { ...initialState }
  };
}
