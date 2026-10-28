import React, { Fragment } from "react";
import { Typography, Grid, Box, Link } from "@mui/material";
import config from "../../config";
import { getPropertyValues } from "../home/propertyValues";

// What changed for users in the current release, replace the release and sections for each new release.
// Developer details belong in CHANGELOG.md, which is linked at the bottom of the page
const release = "3.0";
const changelogURL = "https://github.com/ChannelFinder/pvinfo/blob/master/CHANGELOG.md";

const code = (text) => (
    <Box component="code" sx={{ fontFamily: "monospace", backgroundColor: "grey.100", borderRadius: 1, px: 0.5 }}>{text}</Box>
);

// items with show set to false are hidden, for features a site has turned off
function getSections() {
    return [
        {
            title: "Searching",
            items: [
                { text: <Fragment><strong>Search for several words at once.</strong> Type words separated by spaces in the PV name box to find PVs that contain all of them, in any order. For example, {code("beam current")} finds both {code("cmm:beam_current")} and {code("SR:current_beam_avg")}.</Fragment> },
                { text: <Fragment><strong>Search for one thing or another</strong> with {code("|")}. For example, {code("VVR|TEST")} finds PVs containing either word.</Fragment> },
                { text: <Fragment><strong>Advanced search finds partial matches</strong> like the Standard search. For example, {code("recordDesc=temp")} finds descriptions containing "temp". Use {code("recordDesc==temp")} for an exact match, or {code("recordDesc!=temp")} for descriptions not containing it.</Fragment> },
                { text: <Fragment><strong>Search for values with spaces</strong> in Advanced search by putting them in double quotes, like {code('recordDesc=="beam current"')}. Switching from Standard to Advanced search keeps values with spaces and exact PV names the same.</Fragment> },
                { text: <Fragment><strong>Pick property values from a list.</strong> In Advanced search, properties with a › in the Properties list can be clicked to choose from their values instead of typing them.</Fragment>, show: Object.keys(getPropertyValues()).length > 0 },
                { text: <Fragment><strong>See how your Advanced search will be read.</strong> As you type, a "Searching for:" row of chips appears below the box, so you can check your query before you search.</Fragment> },
            ],
        },
        {
            title: "Search Results",
            items: [
                { text: <Fragment><strong>Select PVs</strong> with the checkboxes on the left of the table.</Fragment> },
                { text: <Fragment><strong>Copy PV names</strong> with the copy button in the table toolbar. It copies the PVs you selected, or every PV in the results if none are selected, one name per line.</Fragment> },
                { text: <Fragment><strong>Plot several PVs together</strong> in the archiver viewer. Select up to {config.AA_MAX_PLOT_PVS} PVs and use the plot button in the toolbar.</Fragment>, show: config.USE_AA },
                { text: <Fragment><strong>Live monitoring uses on/off switches</strong> instead of checkboxes. Turn on <strong>Monitor all PVs</strong> on the right of the table toolbar to watch every PV on the page. If a PV can't be monitored, its switch is faded and hovering it tells you why.</Fragment>, show: config.USE_PVWS },
                { text: <Fragment><strong>Resize columns</strong> by dragging the column edges. The widths stay put when the results update.</Fragment> },
                { text: <Fragment><strong>CSV exports</strong> now have the date and time in the file name.</Fragment> },
            ],
        },
        {
            title: "PV Details Page",
            items: [
                { text: <Fragment><strong>Copy the PV name</strong> with the copy button next to it.</Fragment> },
            ],
        },
        {
            title: "IOCs Page",
            items: [
                { text: <Fragment><strong>New columns</strong> for {config.IOC_PAGE_EXTRA_COLUMNS.map((column) => column.split(":").pop()).join(", ")}.</Fragment>, show: config.IOC_PAGE_EXTRA_COLUMNS.length > 0 },
            ],
            show: config.USE_IOC_PAGE,
        },
        {
            title: "On Phones",
            items: [
                { text: <Fragment>The selection checkboxes and the "copy selected"{config.USE_AA && <Fragment> and "plot selected"</Fragment>} buttons are hidden at phone width to keep the table readable. Everything else works as before.</Fragment> },
            ],
        },
        {
            title: "Other Updates",
            items: [
                { text: <Fragment>Security and maintenance updates.</Fragment> },
            ],
        },
    ].filter((section) => section.show !== false)
        .map((section) => ({ ...section, items: section.items.filter((item) => item.show !== false) }))
        .filter((section) => section.items.length > 0);
}

function WhatsNew() {
    return (
        <Grid size={12}>
            <Grid sx={{ textAlign: "center" }} justifyContent="center" size={12}>
                <Typography style={{ marginBottom: 20 }} variant='h4'><strong>What's New in PV Info {release}</strong></Typography>
            </Grid>
            {getSections().map((section) => (
                <Box key={section.title} sx={{ mb: 3 }}>
                    <Typography variant='h6' style={{ marginBottom: 10 }}><strong>{section.title}</strong></Typography>
                    <Box component="ul" sx={{ mt: 0, pl: 3 }}>
                        {section.items.map((item, index) => (
                            <Typography component="li" variant='body1' key={index} sx={{ mb: 1 }}>{item.text}</Typography>
                        ))}
                    </Box>
                </Box>
            ))}
            <Typography variant='body1' sx={{ mb: 2 }}>
                See the <Link href={changelogURL} underline="always">full release history</Link> for earlier versions and developer details.
            </Typography>
        </Grid>
    );
}

export default WhatsNew;
