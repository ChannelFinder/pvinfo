import React, { Fragment } from "react";
import { Typography, Grid, Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import archivePlotOptions from "../../assets/archive-options.png";


function Help() {

    return (
        <Fragment>
          <Grid item xs={12}>
            <Grid item xs={12} align="center" justifyContent="center">
                <Typography style={{marginBottom: 20}} variant='h4'><strong>PV Info Help</strong></Typography>
            </Grid>
            <Grid item xs={12} justifyContent="flex-end">

              <Typography variant='h6' style={{marginBottom: 10}}><strong>Process Variables Described</strong></Typography>
              <Typography variant='body1' paragraph={true}>
                Process Variable (PV) is the name applied to the Real-Time Database Records that contain control system information. 
                Like most Database records it has a set of fields. Unlike conventional database records, Process Variables are 'connected' to the 'real world', 
                so they reflect or control values in the control system. For example, here is a PV at our facility:  <Link component={RouterLink} to={"/pv/" + process.env.REACT_APP_HELP_EXAMPLE_PV} underline="always">{process.env.REACT_APP_HELP_EXAMPLE_PV}</Link> 
              </Typography>
              <Typography variant='body1' paragraph={true}>
                The Control System is based on the Experimental Physics and Industrial Control System 
                (<Link href="https://epics-controls.org/">EPICS</Link>).
              </Typography>

              <Typography variant='h6' style={{marginTop: 10, marginBottom: 10}}><strong>Using PV Info Search</strong></Typography>
              <Typography variant='body1' paragraph={true}>The application opens initially on the search page with all search fields blank. You may enter search terms under each 
              column heading; after entering the desired terms, press the return key or the search button to execute your search.</Typography>
              <Typography variant='body1' paragraph={true}>Search terms are case-sensitive (for now). Special characters are:</Typography>
              <ul>
                <li>* (asterisk) matches any number of any characters</li>
                <li>? (question mark) matches one of any character</li>
                <li>= (equals sign) at the beginning forces an exact match of the input string</li>
                <li>! (exclamation point) at the beginning is a not equal to search (not available for PV name field)</li>
              </ul>
              <Typography variant='body1' paragraph={true}>Also, if there are no asterisks at the beginning or end of the field search, then partial searches are enabled.
                For example "cmm:" is equivlent to "*cmm:*"</Typography>
              <Typography variant='body1' paragraph={true}>Here are some examples to illustrate the above rules:</Typography>
              <ul>
                <li>cmm: will match any PV name that contains "cmm:" such as "cmm:beam_current". This is equivalent to "*cmm:*"</li>
                <li>"cmm:* would match any PV that begins with cmm:, excluding, for example, testcmm:beam_current</li>
                <li>*beam_current would match any PV that ends with beam_current, excluding, for example, cmm:beamcurrenttest</li>
                <li>cmm:beam_current will match any PV name containing that term; however (as of this writing) there is only one such PV.</li>
                <li>=cmm:beam_current will match cmm:beam_current exactly.</li>
              </ul>
              
              <Typography variant='h6' style={{marginTop: 10, marginBottom: 10}}><strong>Viewing Search Results</strong></Typography>
              <Typography variant='body1' paragraph={true}>The search results display a table with the matching PVs with the following fields:</Typography>
              <ul>
                <li><strong>PV Name</strong></li>
                <ul>
                  <li>The name of the PV. You can click the PV name to go to the PV details page and see more fields. The values listed are retrieved from the PV itself, 
                    so they reflect the current values. A plot icon also appears on the right side; click on this to open the Plotting page with this PV pre-selected.
                  </li>
                  <li>
                    The ALS PV names have been created by many people over many years so there 
                    are serveral different standards. The current naming standard is SystemSubSystem:DeviceSubDevice:SignalType, something like: LNRF:KLY1-FIL:Current which means - 
                    System=LN (Linac), Subsystem=RF, Device=KLY (Klystron), SubDevice=FIL (Filament), SignalType=Current
                  </li>
                </ul>
                <li><strong>Description</strong></li>
                <ul>
                  <li>The PV's description, which may provide a more human-readable view of what the PV is for.</li>
                </ul>
                <li><strong>Host Name</strong></li>
                <ul>
                  <li>For most PVs, this is the hostname of the linux server where the IOC runs. Many IOCs can run on one linux server. For hard IOCs, the field will often reflect the hostname of the hardware, 
                    often the same as the IOC name.
                  </li>
                </ul>
                <li><strong>IOC Name</strong></li>
                <ul>
                  <li>The name of the IOC containing the PV. Clicking on this name will issue a new search for all PVs in the IOC. If you then wish to return to the original search, 
                    use the browser's Back button.
                  </li>
                </ul>
                <li><strong>Status</strong></li>
                <ul>
                  <li>
                    Current status of this PV. Either Active or Inactive. Inactive means the PV is not up and indicates a problem with the IOC. If the PV is inactive then the PV value monitor 
                    checkbox will be disabled.
                  </li>
                </ul>
                <li><strong>Record Type</strong></li>
                <ul>
                  <li>
                    EPICS record type. For instance, ao is analog output. bi is binary input. See <Link href="https://epics.anl.gov/base/R3-15/8-docs/RecordReference.html" target="_blank">the EPICS record reference manual</Link> for more details.
                  </li>
                </ul>
                <li><strong>Alias Of</strong></li>
                <ul>
                  <li>
                    PVs can have alias names. You can click on the alias name to open the details page for the alias (will have the same information as the real PV name).
                  </li>
                </ul>
                {process.env.REACT_APP_EXTRA_PROP.length > 0 &&
                  <div>
                    <li><strong>{process.env.REACT_APP_EXTRA_PROP_LABEL}</strong></li>
                    <ul>
                      <li>
                        {process.env.REACT_APP_EXTRA_PROP_HELP_TEXT}
                      </li>
                    </ul>
                  </div>
                }
                {process.env.REACT_APP_SECOND_EXTRA_PROP.length > 0 &&
                  <div>
                    <li><strong>{process.env.REACT_APP_SECOND_EXTRA_PROP_LABEL}</strong></li>
                    <ul>
                      <li>
                        {process.env.REACT_APP_SECOND_EXTRA_PROP_HELP_TEXT}
                      </li>
                    </ul>
                  </div>
                }
                <li><strong>Value</strong></li>
                <ul>
                  <li>
                    The current value of the PV. Not retrieved initially. See the Monitor check box. Green means the PV is in a NON-ALARM state, Yellow means MINOR-ALARM, and Red means MAJOR-ALARM.
                  </li>
                </ul>
              </ul>

              <Typography variant='h6' style={{marginTop: 10, marginBottom: 10}}><strong>Search Result Options</strong></Typography>
              <ul>
                <li><strong>Columns</strong>: Allows you to select which columns to view</li>
                <li><strong>Filters</strong>: Existing results can be filtered</li>
                <li><strong>Density</strong>: Grid can be made more compact or less if desired</li>
                <li><strong>Export</strong>: Allows you to export to a CSV or print the table</li>
                <li><strong>Column Sorting</strong>: Columns can be sorted ASC or DESC by clicking the arrow next to the column name</li>
              </ul>

              <Typography variant='h6' style={{marginTop: 10, marginBottom: 10}}><strong>PV Details Page</strong></Typography>
              <Typography variant='body1' paragraph={true}>
                When you click on a PV name, the PV details button, or double click on a PV row in the search table, it brings you to the PV details page. 
                The PV details page will show you all the fields in the Channel Finder database for that PV and allows you to check the Monitor PV values button to get live EPICS values.
              </Typography>

              <Typography variant='h6' style={{marginTop: 10, marginBottom: 10}}><strong>Using Archiver Plotting</strong></Typography>
              <img src={archivePlotOptions} style={{width:"75%"}} alt="Archiver Appliance Options" />
              <Typography variant='body1'>Check out the options in the archiver viewer in the <strong>top right corner</strong>. Some important icons listed: </Typography>
              <ul>
                <li>Camera Icon: Download the plot as a PNG file (saves to newplot.png in your Downloads folder)</li>
                <li>Zoom Icon: Zoom in on graph. Double click to zoom out</li>
                <li>Search Icon: Add more PVs on the graph. Open search and search for PV name you want. Then highlight PV row and press add button.</li>
                <li>Download Icon: Download data as a CSV file</li>
                <li>Link Icon: Get URL link to the exact graph you are viewing.</li>
              </ul>
              
              <Typography variant='h6' style={{marginTop: 10, marginBottom: 10}}><strong>IOCs Page</strong></Typography>
              <Typography variant='body1' paragraph={true}>
                The IOCs page lists all the IOCs in alphabetical order. The host where the IOC runs, the engineer in charge of the IOC, 
                the IOC IP address, and the date when the IOC was last connected to recsync (often the IOC reboot time). 
                Double clicking or clicking the IOC name will open the PV search for all the PVs in that IOC.
              </Typography>

            </Grid>
          </Grid>
        </ Fragment>
    );
}

export default Help;
