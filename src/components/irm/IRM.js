import React, { Fragment, useEffect, useState } from "react";
import './IRM.css';
import { Button, Typography, Link } from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import irmJson from "./irms.json";
import api from "../../api";

const renderLink = (params) => {
    return (
        <div>
            <Link component={RouterLink} to={`/?irm=${params.row.IRM}`} underline="hover">{params.row.IRM}</Link>
        </div>
    )
  }

const columns = [
  { field: "IRM", headerName: 'IRM', type: "number", renderCell: renderLink, flex: 6.25, minWidth: 100, maxWidth: 200 },
  { field: "Name", headerName: 'Description', flex: 16.5, minWidth: 200, maxWidth: 300 },
  { field: "Rack", headerName: 'Rack', flex: 8.25, minWidth: 150, maxWidth: 275 },
  { field: "Print", headerName: 'Print', flex: 8.25, minWidth: 150, maxWidth: 275 },
  { field: "Status", headerName: 'Status', flex: 8.25, minWidth: 150, maxWidth: 275 },
  { field: "SwitchLocation", headerName: 'Switch Location', flex: 10.25, minWidth: 150, maxWidth: 275 },
]

function IRM() {
    const navigate = useNavigate();
    const handleRowDoubleClick = (e) => {
        navigate(`/?irm=${e.row.IRM}`);
      }

    return (
        <Fragment>
            <DataGrid  
                rows={irmJson}
                columns={columns}
                onRowDoubleClick={handleRowDoubleClick}
                getRowId={(row) => row.IRM}
                autoHeight={true}
                components={{ Toolbar: GridToolbar }}
                density={"compact"}
            />
        </ Fragment>
    );
}

export default IRM;
