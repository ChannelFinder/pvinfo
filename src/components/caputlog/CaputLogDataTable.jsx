import React, { useState } from "react";
import PropTypes from "prop-types";
import { Table, TableBody, TableCell, TableHead, TableRow, Box } from "@mui/material";
import { CustomTableContainer, TableHeaderCell } from "../pv/customtablecells/CustomTable";

const CaputLogDataTable = ({ results }) => {
  const [sortOrder, setSortOrder] = useState("desc");

  const sortedResults = [...results].sort((a, b) => {
    const dateA = new Date(a.timestamp.raw);
    const dateB = new Date(b.timestamp.raw);
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  };

  return (
    <CustomTableContainer component={Box}>
      <Table stickyHeader = {true}>
        <TableHead>
          <TableRow>
            <TableHeaderCell onClick={toggleSortOrder} style={{ cursor: "pointer" }}>
              Timestamp {sortOrder === "asc" ? "↑" : "↓"}
            </TableHeaderCell>
            <TableHeaderCell>PV</TableHeaderCell>
            <TableHeaderCell>Client</TableHeaderCell>
            <TableHeaderCell>User</TableHeaderCell>
            <TableHeaderCell>New Value</TableHeaderCell>
            <TableHeaderCell>Old Value</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedResults.map((result) => (
            <TableRow key={result.id.raw}>
              <TableCell>{result.timestamp.raw}</TableCell>
              <TableCell>{result.pv.raw}</TableCell>
              <TableCell>{result.client.raw}</TableCell>
              <TableCell>{result.user.raw}</TableCell>
              <TableCell>{result.new.raw}</TableCell>
              <TableCell>{result.old.raw}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CustomTableContainer>
  );
};

CaputLogDataTable.propTypes = {
  results: PropTypes.array.isRequired
};

export default CaputLogDataTable;
