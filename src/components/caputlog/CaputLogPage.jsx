import React from "react";
import { SearchProvider } from "@elastic/react-search-ui";
import CaputLogDataTable from "./CaputLogDataTable";
import { getCaputLogSearchConfig } from "./caputlogSearchConfig";
import CaputLogSearchLayout from "./CaputLogSearchLayout";
import "@elastic/react-search-ui-views/lib/styles/styles.css";

function CaputLogPage(props) {
  const searchConfig = getCaputLogSearchConfig({
    search_fields: {
      pv: { weight: 1 },
      user: {},
      client: {}
    },
    facets: {
      "pv.keyword": { type: "value", size: 30, sort: "count" },
    },
  });

  return (
    <SearchProvider config={searchConfig}>
      <CaputLogSearchLayout
        showSearchBox={true}
        facetFields={[
          { field: "pv.keyword", label: "PV Name" },
          { field: "user.keyword", label: "User" },
          { field: "client.keyword", label: "Client" },
        ]}
      >
        {(results) => <CaputLogDataTable results={results} />}
      </CaputLogSearchLayout>
    </SearchProvider>
  );
}

export default CaputLogPage;
