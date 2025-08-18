import ElasticSearchAPIConnector from "@elastic/search-ui-elasticsearch-connector";

export default function CustomElasticSearchAPIConnector(config) {
    return new ElasticSearchAPIConnector({
        ...config,
        getQueryFn: (state, queryConfig) => {
            const searchTerm = state.searchTerm;
            // If searchTerm ends with '*', use phrase_prefix for prefix search
            if (searchTerm.includes('*')) {
                const prefix = searchTerm.slice(0, -2);
                const fields = queryConfig?.search_fields ? Object.keys(queryConfig.search_fields) : [];
                if (fields.length > 0) {
                    return {
                        multi_match: {
                            query: prefix,
                            type: "phrase_prefix",
                            fields: fields
                        }
                    };
                }
                return { match_none: {} };
            }
            return {
                multi_match: {
                    query: searchTerm,
                    type: "phrase",
                    fields: ["*"]
                }
            };
        }
    });
}
