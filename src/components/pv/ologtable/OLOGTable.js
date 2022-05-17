import React, { useState, useEffect } from "react";
import { Typography, Table, TableCell, TableBody, TableHead, TableRow, TableContainer, Link } from "@mui/material";
import api from "../../../api";
import PropTypes from "prop-types";


const propTypes = {
  pvName: PropTypes.string,
}

function OLOGTable(props) {
  const [ologData, setOLOGData] = useState(null); //object
  const [isLoading, setIsLoading] = useState(true);

  // Get OLOG data for this PV
  useEffect(() => {
    api.OLOG_QUERY(props.pvName)
    .then((data) => {
        if (data !== null) {
          setOLOGData(data);
          setIsLoading(false);
        }
        else {
          console.log("data is NULL!")
        }
    })
    .catch((err) => {
        console.log(err);
        console.log("error in fetch of experiments");
    })
  }, [props.pvName]);

  // https://stackoverflow.com/a/54185014
  const htmlDecode = (content) => {
    let e = document.createElement('div');
    e.innerHTML = content;
    return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
  }

  if (isLoading) {
    return (
      <Typography variant="h6">OLOG Data Loading...</Typography>
    );
  }
  else if (ologData === null || ologData === {} || Object.keys(ologData).length === 0) {
    return (
      <Typography variant="h6">No OLOG Entries for this PV</Typography>
    );
  }
  else {
    return (
      <div>
        <Typography style={{marginTop: 10}} variant="h4">Recent Online Log Entries</Typography>
        <TableContainer>
          <Table sx={{border: 5, borderColor: 'primary.main'}}>
            <TableHead>
              <TableRow>
                <TableCell>Date Time</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Level</TableCell>
                <TableCell>Entry</TableCell>
                <TableCell>Author</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ologData.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell><Link href={`${api.OLOG_URL}?id=${row.id}`} target="_blank" underline="always">{new Date(row.created*1000).toLocaleString()}</Link></TableCell>
                  <TableCell>{row.category}</TableCell>
                  <TableCell>{row.level}</TableCell>
                  <TableCell><strong><u>{row.subject}</u></strong> <br /> <div dangerouslySetInnerHTML={{__html: htmlDecode(row.details)}} /></TableCell>
                  <TableCell> {row.author}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    );
  }
}

OLOGTable.propTypes = propTypes;
export default OLOGTable;
