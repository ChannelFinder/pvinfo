import React, { Fragment } from 'react';
import { Badge, Tooltip, useMediaQuery } from '@mui/material';
import {
    ColumnsPanelTrigger, FilterPanelTrigger, ToolbarButton,
    useGridApiContext, useGridRootProps, useGridSelector,
    gridFilteredSortedRowEntriesSelector, gridRowSelectionCountSelector
} from '@mui/x-data-grid';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import TimelineIcon from '@mui/icons-material/Timeline';
import config from "../../../../config";
import copyToClipboard from "../../../../clipboard";

// Archiver viewer URL that plots all of the PVs together
function archiverPlotURL(pvNames) {
    return `${config.AA_VIEWER}?${pvNames.map((name) => `pv=${encodeURIComponent(name)}`).join("&")}`;
}

// Toolbar controls for the search results table, passed to the default toolbar as mainControls.
// Keeps the default columns and filter buttons and adds copy PV names and plot selected PVs buttons
function ResultsToolbar(props) {
    const apiRef = useGridApiContext();
    const rootProps = useGridRootProps();
    const selectedCount = useGridSelector(apiRef, gridRowSelectionCountSelector);
    const rowEntries = useGridSelector(apiRef, gridFilteredSortedRowEntriesSelector);
    const maxPlotPVs = config.AA_MAX_PLOT_PVS;
    // rows can't be selected on phones since the checkbox column is hidden, see QueryResults
    const isPhone = useMediaQuery(`(max-width:${config.SM_BREAKPOINT}px)`);

    // selected PV names in the table's current sort order, or every PV that passes the table filters if none are selected
    const getPVNames = (selectedOnly) => {
        const selected = apiRef.current.getSelectedRows();
        return rowEntries
            .filter((entry) => !selectedOnly || selected.has(entry.id))
            .map((entry) => entry.model.name);
    }

    const handleCopy = async () => {
        const pvNames = getPVNames(selectedCount > 0);
        try {
            await copyToClipboard(pvNames.join("\n"));
            props.handleErrorMessage(`Copied ${pvNames.length} PV name${pvNames.length === 1 ? "" : "s"} to the clipboard`);
            props.handleSeverity("success");
        } catch (err) {
            console.log(err);
            props.handleErrorMessage("Error: Could not copy PV names to the clipboard");
            props.handleSeverity("error");
        }
        props.handleOpenErrorAlert(true);
    }

    const handlePlot = () => {
        window.open(archiverPlotURL(getPVNames(true)), "_blank", "noopener");
    }

    const copyTitle = selectedCount > 0
        ? `Copy ${selectedCount} selected PV name${selectedCount === 1 ? "" : "s"}`
        : `Copy all ${rowEntries.length} PV name${rowEntries.length === 1 ? "" : "s"}`;
    const plotDisabled = selectedCount === 0 || selectedCount > maxPlotPVs;
    const plotTitle = selectedCount === 0
        ? "Select PVs to plot them together"
        : selectedCount > maxPlotPVs
            ? `Select at most ${maxPlotPVs} PVs to plot together`
            : `Plot ${selectedCount} selected PV${selectedCount === 1 ? "" : "s"} together`;

    return (
        <Fragment>
            {
                !rootProps.disableColumnSelector &&
                <Tooltip title={apiRef.current.getLocaleText('toolbarColumns')}>
                    <ColumnsPanelTrigger render={<ToolbarButton />}>
                        <rootProps.slots.columnSelectorIcon fontSize="small" />
                    </ColumnsPanelTrigger>
                </Tooltip>
            }
            {
                !rootProps.disableColumnFilter &&
                <Tooltip title={apiRef.current.getLocaleText('toolbarFilters')}>
                    <FilterPanelTrigger
                        render={(triggerProps, state) => (
                            <ToolbarButton {...triggerProps} color={state.filterCount > 0 ? "primary" : "default"}>
                                <Badge badgeContent={state.filterCount} color="primary" variant="dot">
                                    <rootProps.slots.openFilterButtonIcon fontSize="small" />
                                </Badge>
                            </ToolbarButton>
                        )}
                    />
                </Tooltip>
            }
            {
                !isPhone &&
                <Tooltip title={copyTitle}>
                    <ToolbarButton aria-label={copyTitle} onClick={handleCopy} disabled={rowEntries.length === 0}>
                        <ContentCopyIcon fontSize="small" />
                    </ToolbarButton>
                </Tooltip>
            }
            {
                config.USE_AA && !isPhone &&
                <Tooltip title={plotTitle}>
                    {/* span so the tooltip still shows when the button is disabled */}
                    <span>
                        <ToolbarButton aria-label={plotTitle} onClick={handlePlot} disabled={plotDisabled}>
                            <TimelineIcon fontSize="small" />
                        </ToolbarButton>
                    </span>
                </Tooltip>
            }
        </Fragment>
    );
}

export { archiverPlotURL };
export default ResultsToolbar;
