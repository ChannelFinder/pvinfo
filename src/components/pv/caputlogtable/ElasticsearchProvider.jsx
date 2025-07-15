import React from "react";
import { ErrorBoundary, Facet, PagingInfo, ResultsPerPage, Paging, useSearch } from "@elastic/react-search-ui";
import { Layout } from "@elastic/react-search-ui-views";
import CaputLogDataTable from "./CaputLogDataTable";

export const ElasticsearchProvider = () => {
  const { wasSearched, results } = useSearch();
  return (
    <div>
      <ErrorBoundary>
        <Layout
          bodyContent={
            wasSearched ? (
              <CaputLogDataTable results={results} />
            ) : (
              <p>No results to display.</p>
            )
          }
          sideContent={
            <div>
              {wasSearched}
              <Facet
                field="user.keyword"
                label="User"
                filterType="any"
                isFilterable={false}
              />
              <Facet
                field="client.keyword"
                label="Client"
                filterType="any"
                isFilterable={false}
              />
              </div>
              }
          bodyHeader={
            <React.Fragment>
              {wasSearched && <PagingInfo />}
              {wasSearched && (
                <div style={{ position: 'relative', zIndex: 20, marginBottom: '10px' }}>
                  <ResultsPerPage/>
                </div>
              )}
            </React.Fragment>
          }
          bodyFooter={<Paging />}
        />
      </ErrorBoundary>
    </div>
  );
};
