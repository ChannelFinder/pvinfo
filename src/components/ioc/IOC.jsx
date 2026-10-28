import React, { Fragment, useEffect, useMemo, useState } from "react";
import './IOC.css';
import { Typography, Link } from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router";
import { DataGrid } from '@mui/x-data-grid';
import csvExportOptions from "../../csvExportOptions";
import api from "../../api";
import config from "../../config";

// iocName==IOC1 is an exact match, so the search doesn't include IOCs with similar names like IOC10
const iocSearchURL = (iocName) => `/?iocName==${encodeURIComponent(iocName)}`;

const renderLink = (params) => {
  return (
      <div>
          <Link component={RouterLink} to={iocSearchURL(params.row.iocName)} underline="hover">{params.row.iocName}</Link>
      </div>
  )
}

const renderDate = (params) => {
  return new Date(params.row.time).toLocaleString();
}

const getColumns = () => [
  { field: "iocName", headerName: 'IOC Name', renderCell: renderLink, flex: 16.5, minWidth: 175 },
  { field: "hostName", headerName: 'Host', flex: 8.25, minWidth: 150 },
  { field: "owner", headerName: 'Engineer', flex: 8.25, minWidth: 150 },
  ...config.IOC_PAGE_EXTRA_COLUMNS.map((column) => {
    const [field, label] = column.split(':').map((part) => part.trim());
    return { field, headerName: label || field, flex: 6, minWidth: 100 };
  }),
  { field: "time", headerName: 'Last Recsync Update', flex: 8.25, minWidth: 150, renderCell: renderDate },
]

function IOC() {
  const navigate = useNavigate();
  const [cfPVData, setCFPVData] = useState(null); //object
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 100 });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const columns = useMemo(getColumns, []);


    // Get channel finder data for this PV
    useEffect(() => {
      api.CF_QUERY({"pvName": `=${config.IOC_PAGE_PV_PATTERN}`})
      .then((data) => {
          if (Array.isArray(data)) {
            setCFPVData(data);
          }
          else {
            setLoadError(true);
          }
      })
      .catch((err) => {
          console.log(err);
          setLoadError(true);
      })
      .finally(() => {
          setIsLoading(false);
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
          iocMap.set(id, { ...properties, id, owner: pv.owner });
        }
      });
      return [...iocMap.values()].sort((a, b) => a.id > b.id ? 1 : -1);
    }, [cfPVData]);

    const handleRowDoubleClick = (e) => {
      navigate(iocSearchURL(e.row.iocName));
    }

    if (isLoading) {
      return (
          <Typography variant="h6">Data Loading...</Typography>
      );
    }
    else if (loadError || cfPVData === null) {
        return (
            <Fragment>
                <Typography variant="h6">Unable to Load IOCs</Typography>
                <Typography>Check the Services page to see if Channel Finder is reachable.</Typography>
            </Fragment>
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
