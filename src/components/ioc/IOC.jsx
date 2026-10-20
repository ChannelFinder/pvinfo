import React, { Fragment, useEffect, useMemo, useState } from "react";
import './IOC.css';
import { Typography, Link } from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router";
import { DataGrid } from '@mui/x-data-grid';
import csvExportOptions from "../../csvExportOptions";
import api from "../../api";
import config from "../../config";

const renderLink = (params) => {
  return (
      <div>
          <Link component={RouterLink} to={`/?iocName=${params.row.ioc}`} underline="hover">{params.row.ioc}</Link>
      </div>
  )
}

const renderDate = (params) => {
  return new Date(params.row.time).toLocaleString();
}

const columns = [
  { field: "ioc", headerName: 'IOC Name', renderCell: renderLink, flex: 16.5, minWidth: 175 },
  { field: "host", headerName: 'Host', flex: 8.25, minWidth: 150, maxWidth: 275 },
  { field: "owner", headerName: 'Engineer', flex: 8.25, minWidth: 150, maxWidth: 275 },
  { field: "iocid", headerName: 'IP Address', flex: 8.25, minWidth: 150, maxWidth: 275 },
  { field: "time", headerName: 'Last Recsync Update', flex: 8.25, minWidth: 150, maxWidth: 275, renderCell: renderDate },
]

function IOC() {
  const navigate = useNavigate();
  const [cfPVData, setCFPVData] = useState(null); //object
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 100 });
  const [isLoading, setIsLoading] = useState(true);


    // Get channel finder data for this PV
    useEffect(() => {
      api.CF_QUERY({"pvName": config.IOC_PAGE_PV_PATTERN})
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

    // the PV pattern can match more than one PV per IOC, keep one row per IOC name
    const iocs = useMemo(() => {
      if (cfPVData === null) {
        return [];
      }
      const iocMap = new Map();
      cfPVData.forEach((pv) => {
        const properties = Object.fromEntries(pv.properties.map((prop) => [prop.name, prop.value]));
        if (!properties.iocName) {
          return;
        }
        const id = properties.iocName.toLowerCase();
        if (!iocMap.has(id)) {
          iocMap.set(id, { id, ioc: properties.iocName, owner: pv.owner, host: properties.hostName, iocid: properties.iocid, time: properties.time });
        }
      });
      return [...iocMap.values()].sort((a, b) => a.id > b.id ? 1 : -1);
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
    else if (iocs.length === 0) {
      return (
          <Fragment>
              <Typography variant="h6">No IOCs Found</Typography>
              <Typography>
                The IOC list comes from the PVs in Channel Finder matching <strong>{config.IOC_PAGE_PV_PATTERN}</strong>, which assumes every IOC has a PV
                with that name (for example from iocStats). This pattern can be changed with REACT_APP_IOC_PAGE_PV_PATTERN.
              </Typography>
          </Fragment>
      );
    }
    else {
      return (
        <Fragment>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              IOCs are found from the PVs matching <strong>{config.IOC_PAGE_PV_PATTERN}</strong>
            </Typography>
            <DataGrid
                rows={iocs}
                columns={columns}
                autoHeight={true}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                onRowDoubleClick={handleRowDoubleClick}
                pageSizeOptions={[5, 10, 20, 50, 100]}
                pagination
                showToolbar
                label="IOCs"
                slotProps={{ toolbar: { csvOptions: csvExportOptions("IOCs") } }}
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
