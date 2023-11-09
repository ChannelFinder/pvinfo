import React, { Fragment, useEffect, useState } from "react";
import './IOC.css';
import { Typography, Link } from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import api from "../../api";

const renderLink = (params) => {
  return (
      <div>
          <Link component={RouterLink} to={`/?iocName=${params.row.ioc}`} underline="hover">{params.row.ioc}</Link>
      </div>
  )
}

const renderDate = (params) => {
  return (
      <div>
          <p>{new Date(params.row.time).toLocaleString()}</p>
      </div>
  )
}

const columns = [
  { field: "ioc", headerName: 'IOC Name', renderCell: renderLink, flex: 16.5, minWidth: 175, maxWidth: 350 },
  { field: "host", headerName: 'Host', flex: 8.25, minWidth: 150, maxWidth: 275 },
  { field: "owner", headerName: 'Engineer', flex: 8.25, minWidth: 150, maxWidth: 275 },
  { field: "iocid", headerName: 'IP Address', flex: 8.25, minWidth: 150, maxWidth: 275 },
  { field: "time", headerName: 'IOC Reboot Time', flex: 8.25, minWidth: 150, maxWidth: 275, renderCell: renderDate },
]

function IOC() {
  const navigate = useNavigate();
  const [cfPVData, setCFPVData] = useState(null); //object
  const [iocs, setIOCs] = useState([]);
  const [pageSize, setPageSize] = useState(100);
  const [isLoading, setIsLoading] = useState(true);


    // Get channel finder data for this PV
    useEffect(() => {
      api.CF_QUERY({"pvName": "*:ENGINEER"})
      .then((data) => {
          if (data !== null) {
            setIsLoading(false);
            setCFPVData(data);
          }
          else {
            console.log("data is NULL!")
          }
      })
      .catch((err) => {
          console.log(err);
          console.log("error in fetch of experiments");
      })
    }, []);

    // transform PV data from CF into JS object of IOC names and hosts. This should be moved to api.js!
    useEffect(() => {
      if ( cfPVData === null) {
        return;
      }
      setIOCs(cfPVData.map((pv, index) => {
        let iocObject = {};
        //iocObject.id = index;
        iocObject.owner = pv.owner;
        pv.properties.forEach((prop) => {
          if (prop.name === "iocName") {
            iocObject.ioc = prop.value;
            iocObject.id = prop.value.toLowerCase();
          }
          else if (prop.name === "hostName") {
            iocObject.host = prop.value;
          }
          else if (prop.name === "iocid") {
            iocObject.iocid = prop.value;
          }
          else if (prop.name === "time") {
            iocObject.time = prop.value;
          }
        });
        return iocObject;
      }));
    }, [cfPVData]);

    const handleRowDoubleClick = (e) => {
      navigate(`/?iocName=${e.row.ioc}`);
    }

    if (isLoading) {
      return (
          <Typography variant="h6">Data Loading...</Typography>
      );
    }
    else if (cfPVData === null) {
        return (
            <div></div>
        );
    }
    else if (cfPVData.length === 0) {
      return (
          <Fragment>
              <Typography>No IOCs Found (something must be wrong with channel finder)</Typography>
          </Fragment>
      );
    }
    else {
      iocs.sort((a, b) => a.id > b.id ? 1 : -1);
      return (
        <Fragment>
            <DataGrid
                rows={iocs}
                columns={columns}
                autoHeight={true}
                pageSize={pageSize}
                onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                onRowDoubleClick={handleRowDoubleClick}
                rowsPerPageOptions={[5, 10, 20, 50, 100]}
                pagination
                components={{ Toolbar: GridToolbar }}
                density={"compact"}
                initialState={{
                  sorting: {
                    sortModel: [{ field: 'id', sort: 'desc' }],
                  },
                }}
            />
        </ Fragment>
    );
    }
}

export default IOC;
