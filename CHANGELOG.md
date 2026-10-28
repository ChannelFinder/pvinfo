# Changelog

All notable changes to PV Info are documented in this file. Dependency security updates from Dependabot are grouped together for each release.

## [3.0.0] - Unreleased

Version 3 updates the libraries and tools PV Info is built on. Node.js >= v22.22 or >= v24.15 is now required (v24 LTS recommended). Delete the node_modules directory and run `npm install` when upgrading.

### Environment Variables

- Added `REACT_APP_USE_IOC_PAGE` (default `true`) to show or hide the IOCs page ([#176](https://github.com/ChannelFinder/pvinfo/pull/176))
- Added `REACT_APP_IOC_PAGE_PV_PATTERN` (default `*:ENGINEER`), the PV name pattern used to find the IOCs listed on the IOCs page. It is used as an exact pattern, no partial match wildcards are added ([#176](https://github.com/ChannelFinder/pvinfo/pull/176))
- Added `REACT_APP_IOC_PAGE_EXTRA_COLUMNS` (default `iocIP:IOC IP,caPort:CA Port,pvaPort:PVA Port`), extra Channel Finder properties shown as columns on the IOCs page. Set it to empty for no extra columns ([#176](https://github.com/ChannelFinder/pvinfo/pull/176))
- Added `REACT_APP_AA_MAX_PLOT_PVS` (default `20`), the most selected PVs that can be plotted together from the search results
- Added `REACT_APP_SHOW_WHATS_NEW` (default `true`) to show a What's New page for the current release, linked from the Help and Services pages. Items for features that are turned off are hidden
- Added `REACT_APP_PROPERTY_VALUES` (default empty), known values for Channel Finder properties in the format `property:value1,value2;property2:value1,value2`. Properties with known values, record types, and extra properties with dropdown labels can be opened in the Advanced search properties list to pick a value
- Changed the default `REACT_APP_DETAILS_PAGE_PROPERTIES` to use `iocIP:IOC IP Address` instead of `iocid:IOC IP Address` ([#176](https://github.com/ChannelFinder/pvinfo/pull/176))
- Fixed `REACT_APP_PVWS_HTTP_URL_DEV` in `.env`, it was set to the web socket URL `${REACT_APP_PVWS_URL}` so the Services page couldn't load PVWS info in dev mode. Change it to `${REACT_APP_PVWS_HTTP_URL}` in copies of `.env`

### Changed

- Update React from v18 to v19, MUI from v5 to v7, MUI X Data Grid from v5 to v9, react-router-dom v6 to react-router v7, tss-react from v3 to v4, and Vite from v7 to v8 ([#173](https://github.com/ChannelFinder/pvinfo/pull/173))
- Data grid toolbar is left aligned, compact, and uses the primary theme color, tables have a label in the toolbar, and the density selector is removed ([#173](https://github.com/ChannelFinder/pvinfo/pull/173))
- CSV exports include the table name and a timestamp in the file name ([#173](https://github.com/ChannelFinder/pvinfo/pull/173))
- Pages other than the home page are loaded on demand to reduce the initial bundle size ([#173](https://github.com/ChannelFinder/pvinfo/pull/173))
- The Advanced search properties and tags dropdown is wider and taller, sorted, and shows property names from `REACT_APP_DETAILS_PAGE_PROPERTIES` and the extra property labels. Lists that are empty are hidden, and the add button is hidden if there are no properties or tags
- Search URLs list tags as `tag=a&tag=b` instead of `tag1=a&tag2=b`. Links with the old numbered tags still work
- Advanced search property values get partial match wildcards like the standard search, so `recordDesc=temp` matches descriptions containing temp. `property==value` is an exact match and `property!=value` or `property=!value` is not equal. PV status, record type, and properties with known values from `REACT_APP_PROPERTY_VALUES` or the extra property dropdown labels are always an exact match. The "Searching for:" preview shows the wildcards that are added
- IOCs page column "IOC Reboot Time" is renamed to "Last Recsync Update" ([#176](https://github.com/ChannelFinder/pvinfo/pull/176))
- IOCs page shows IOC IP, CA Port, and PVA Port columns by default instead of the IP address from `iocid` ([#176](https://github.com/ChannelFinder/pvinfo/pull/176))
- Search results live monitoring uses toggle switches instead of checkboxes. Switches for PVs that can't be monitored are faded and their tooltip says why
- The monitor all switch is in the search results toolbar with a "Monitor all PVs" label instead of next to the "Actions" column header
- The Services page Preference Settings show the new settings, and the IOCs page settings are in their own IOCs Page table

### Added

- Resizable data grid columns that keep their width when the table updates ([#172](https://github.com/ChannelFinder/pvinfo/pull/172))
- Vitest tests, run in CI ([#173](https://github.com/ChannelFinder/pvinfo/pull/173))
- Advanced search shows a preview of how the query will be searched, as chips below the search box
- Advanced search does not search a property without a value after the `=`, it shows how to fix the query instead
- OR searches with `|` (or `;`) are documented in the help page and search tooltips ([#174](https://github.com/ChannelFinder/pvinfo/pull/174), fixes [#148](https://github.com/ChannelFinder/pvinfo/issues/148))
- Space separated words in the PV name search match PV names containing all of the words in any order ([#174](https://github.com/ChannelFinder/pvinfo/pull/174))
- Options to hide the IOCs page, change its PV name pattern, and add columns ([#176](https://github.com/ChannelFinder/pvinfo/pull/176), fixes [#134](https://github.com/ChannelFinder/pvinfo/issues/134))
- Copy PV name button on the PV details page
- Checkboxes to select PVs in the search results, hidden at phone width
- Search results toolbar buttons to copy PV names to the clipboard (the selected PVs, or all results if none are selected) and to plot the selected PVs together in the archiver viewer, hidden at phone width
- Renamed "Free Form" to "Advanced" search in codebase and labels in case we want to add a true free form search later
- "Standard" and "Advanced" labels on the search type buttons ([#177](https://github.com/ChannelFinder/pvinfo/pull/177))

### Fixed

- The search button queried Channel Finder twice for each new search, once for the button and once for the URL change
- Clicking next to a header link navigated to the home page ([#173](https://github.com/ChannelFinder/pvinfo/pull/173))
- Monitor all counted waveform PVs toward the monitoring warning and limit when waveform monitoring was turned off, even though they were not monitored
- A tag only Advanced search opened from a URL searched the tag as a PV name when searched again
- Properties with "tag" in the name, like `voltage`, were searched as tags in Advanced search
- OR searches without wildcards only added partial match wildcards to the first and last pattern ([#174](https://github.com/ChannelFinder/pvinfo/pull/174))
- Search property values are URL encoded ([#174](https://github.com/ChannelFinder/pvinfo/pull/174))
- Extra properties without dropdown labels did not get partial match wildcards in the standard search, and not equal searches on PV status, record type, or extra properties with dropdown labels got wildcards
- Advanced search queries with extra spaces searched for empty tags or treated the PV name as a tag, and property values containing `=` were cut off
- IOCs page stayed on "Data Loading..." if the Channel Finder query failed ([#176](https://github.com/ChannelFinder/pvinfo/pull/176))
- The mobile menu showed the Plotting link when the archiver was disabled ([#177](https://github.com/ChannelFinder/pvinfo/pull/177))
- The caput log section on the PV details page opened to an empty table when the PV had no caput log data, it now shows "No Caput Log Data" like the online log and alarm log sections
- The plot button in each search results row showed when the archiver was disabled
- `REACT_APP_DETAILS_PAGE_PROPERTIES` entries with spaces, like `a:A, b:B`, showed an empty value on the PV details page
- "Alarm Low Value" was misspelled on the PV details page

### Removed

- Unused dependencies `he`, `moment`, `web-vitals`, and `vite-plugin-svgr`, and leftover Create React App configuration ([#173](https://github.com/ChannelFinder/pvinfo/pull/173))

## [2.8.2] - 2026-03-02

### Security

- Dependency updates for react-router, undici, lodash, qs, and rollup ([#139](https://github.com/ChannelFinder/pvinfo/pull/139), [#140](https://github.com/ChannelFinder/pvinfo/pull/140), [#141](https://github.com/ChannelFinder/pvinfo/pull/141), [#142](https://github.com/ChannelFinder/pvinfo/pull/142), [#143](https://github.com/ChannelFinder/pvinfo/pull/143))

## [2.8.1] - 2026-01-05

### Security

- Dependency update for qs ([#138](https://github.com/ChannelFinder/pvinfo/pull/138))

## [2.8.0] - 2025-12-15

Node.js v18 support is dropped, Vite 7 requires Node.js 20.19+ or 22.12+.

### Changed

- Update from Vite 6 to Vite 7 ([#136](https://github.com/ChannelFinder/pvinfo/pull/136))
- Node.js CI no longer tests Node.js 18 ([#136](https://github.com/ChannelFinder/pvinfo/pull/136))

### Security

- Dependency updates for vite and js-yaml ([#135](https://github.com/ChannelFinder/pvinfo/pull/135), [#137](https://github.com/ChannelFinder/pvinfo/pull/137))

## [2.7.0] - 2025-09-21

### Environment Variables

- Renamed `REACT_APP_USE_CAPUT_API_PROXY_CONNNECTOR` to `REACT_APP_USE_CAPUT_API_PROXY_CONNECTOR` (fixed spelling), the old name still works ([#131](https://github.com/ChannelFinder/pvinfo/pull/131))

### Changed

- Update from Vite 5 to Vite 6 ([#132](https://github.com/ChannelFinder/pvinfo/pull/132), fixes [#109](https://github.com/ChannelFinder/pvinfo/issues/109))
- Update the README ([#133](https://github.com/ChannelFinder/pvinfo/pull/133))

## [2.6.0] - 2025-09-21

### Added

- "Preference Settings" section on the Services page showing the site's PV Info settings ([#128](https://github.com/ChannelFinder/pvinfo/pull/128))

### Changed

- All environment variables are read in one config file, `src/config.js`, instead of throughout the code ([#128](https://github.com/ChannelFinder/pvinfo/pull/128), fixes [#120](https://github.com/ChannelFinder/pvinfo/issues/120))
- The CaputLog page search box matches the home page search style, and the Clear button clears both the search query and the date range ([#129](https://github.com/ChannelFinder/pvinfo/pull/129))
- Update from Vite 4 to Vite 5, and the project uses ES modules by default ([#130](https://github.com/ChannelFinder/pvinfo/pull/130))

### Removed

- Unused `dayjs` and `react-router` dependencies ([#130](https://github.com/ChannelFinder/pvinfo/pull/130))

## [2.5.1] - 2025-09-19

### Environment Variables

- Added `REACT_APP_SHOW_DISCONNECTED` (default `true`) to show "Disconnected" for PVs whose live value can not be reached ([#126](https://github.com/ChannelFinder/pvinfo/pull/126))

### Added

- "(DISCONNECTED)" is shown in the search results for PVs that PV Web Socket can not connect to, and the PV details page shows a DISCONNECTED alarm severity in the undefined severity color ([#126](https://github.com/ChannelFinder/pvinfo/pull/126), fixes [#125](https://github.com/ChannelFinder/pvinfo/issues/125))

### Fixed

- Live monitor checkboxes stayed disabled after changing the search from Inactive back to Active PVs ([#126](https://github.com/ChannelFinder/pvinfo/pull/126))
- "Monitor All" subscribed to PVs with an Inactive pvStatus when `REACT_APP_PVWS_IGNORE_CF_PVSTATUS` is false ([#126](https://github.com/ChannelFinder/pvinfo/pull/126))

## [2.5.0] - 2025-09-16

### Environment Variables

- Added `REACT_APP_PVWS_TREAT_BYTE_ARRAY_AS_STRING` (default `true`) to display char waveforms from PVWS as strings ([#122](https://github.com/ChannelFinder/pvinfo/pull/122))
- Added `REACT_APP_PVWS_IGNORE_CF_PVSTATUS` (default `false`) to allow live monitoring of PVs with an Inactive Channel Finder pvStatus ([#119](https://github.com/ChannelFinder/pvinfo/pull/119))

### Added

- Option to live monitor PVs whose Channel Finder pvStatus is not Active ([#119](https://github.com/ChannelFinder/pvinfo/pull/119), fixes [#99](https://github.com/ChannelFinder/pvinfo/issues/99))
- Support for the b64flt, b64byt, and b64srt value formats in newer PV Web Socket versions, still compatible with older versions. Web socket message parsing is now in one place in `api.js` ([#122](https://github.com/ChannelFinder/pvinfo/pull/122), fixes [#111](https://github.com/ChannelFinder/pvinfo/issues/111))
- Labels field in the PV details table ([#123](https://github.com/ChannelFinder/pvinfo/pull/123))

### Changed

- Live monitor checkboxes are disabled for any pvStatus other than Active, previously only for Inactive ([#119](https://github.com/ChannelFinder/pvinfo/pull/119))

### Fixed

- Builds and the dev server continue with an unknown git commit if git is not installed ([#121](https://github.com/ChannelFinder/pvinfo/pull/121), fixes [#116](https://github.com/ChannelFinder/pvinfo/issues/116))

## [2.4.1] - 2025-08-26

### Added

- CaputLog page in the header to search caput log entries by PV name, user, or client with a date range filter, showing the most recent entries first ([#117](https://github.com/ChannelFinder/pvinfo/pull/117))

### Fixed

- Selecting a date range for CaputLog searches starts a new search ([#117](https://github.com/ChannelFinder/pvinfo/pull/117))
- Install git in the Dockerfile ([#115](https://github.com/ChannelFinder/pvinfo/pull/115))

### Changed

- Update the Node.js, Docker image, and pre-commit CI workflows ([#118](https://github.com/ChannelFinder/pvinfo/pull/118))

## [2.4.0] - 2025-07-15

### Environment Variables

- Added `REACT_APP_USE_CAPUTLOG` (default `true`), `REACT_APP_CAPUTLOG_URL`, `REACT_APP_CAPUTLOG_URL_DEV`, `REACT_APP_USE_CAPUT_API_PROXY_CONNNECTOR` (default `true`), `REACT_APP_ELASTICSEARCH_INDEX_NAME`, and `REACT_APP_ELASTICSEARCH_API_KEY` for the CaputLog integration ([#112](https://github.com/ChannelFinder/pvinfo/pull/112))
- Changed the default `REACT_APP_HOMEPAGE_SUBHEADER` to mention Caput Log

### Added

- CaputLog integration showing caput log entries on the PV details page and the CaputLog service on the Services page. PV Info connects to an Elasticsearch instance with caput log data directly, or through an API proxy connector which is recommended for production ([#112](https://github.com/ChannelFinder/pvinfo/pull/112))

### Fixed

- Searches containing curly braces caused a Channel Finder error, they are now URL encoded ([#114](https://github.com/ChannelFinder/pvinfo/pull/114))

## [2.3.0] - 2025-06-09

### Fixed

- The PV details page alarm config table failed to load when it contained acknowledge or unacknowledge commands ([#110](https://github.com/ChannelFinder/pvinfo/pull/110))

## [2.2.2] - 2025-06-02

### Changed

- Update the Node.js versions tested in CI ([#107](https://github.com/ChannelFinder/pvinfo/pull/107))

### Security

- Dependency updates for vite, @babel/runtime, and @babel/helpers ([#104](https://github.com/ChannelFinder/pvinfo/pull/104), [#105](https://github.com/ChannelFinder/pvinfo/pull/105), [#106](https://github.com/ChannelFinder/pvinfo/pull/106))

## [2.2.1] - 2025-06-02

### Added

- The PV details page alarm config table shows acknowledge and unacknowledge commands, which have no config message ([#102](https://github.com/ChannelFinder/pvinfo/pull/102))

### Security

- Dependency update for vite ([#97](https://github.com/ChannelFinder/pvinfo/pull/97))

## [2.2.0] - 2025-01-14

### Fixed

- Searching for PV names containing commas. Channel Finder treats commas as OR, so commas in the PV name search are replaced with the `?` single character wildcard ([#96](https://github.com/ChannelFinder/pvinfo/pull/96), fixes [#94](https://github.com/ChannelFinder/pvinfo/issues/94))

### Security

- Dependency update for nanoid ([#95](https://github.com/ChannelFinder/pvinfo/pull/95))

## [2.1.4] - 2024-09-23

### Security

- Dependency updates for vite and rollup ([#92](https://github.com/ChannelFinder/pvinfo/pull/92), [#93](https://github.com/ChannelFinder/pvinfo/pull/93))

## [2.1.3] - 2024-09-03

### Security

- Dependency updates for braces and micromatch ([#90](https://github.com/ChannelFinder/pvinfo/pull/90), [#91](https://github.com/ChannelFinder/pvinfo/pull/91))

## [2.1.2] - 2024-05-14

### Security

- Dependency update for vite ([#88](https://github.com/ChannelFinder/pvinfo/pull/88))

## [2.1.1] - 2024-02-06

### Security

- Dependency update for vite ([#87](https://github.com/ChannelFinder/pvinfo/pull/87))

## [2.1.0] - 2023-12-15

### Environment Variables

- Added `REACT_APP_PVWS_ALLOW_WAVEFORMS` (default `false`) to allow live monitoring of waveform PVs ([#86](https://github.com/ChannelFinder/pvinfo/pull/86))

### Added

- Option to live monitor waveform PVs and display their values ([#86](https://github.com/ChannelFinder/pvinfo/pull/86))

## [2.0.1] - 2023-12-06

### Fixed

- Update the .env documentation link from Create React App to Vite ([#83](https://github.com/ChannelFinder/pvinfo/pull/83))

### Security

- Dependency updates for @adobe/css-tools and vite ([#84](https://github.com/ChannelFinder/pvinfo/pull/84), [#85](https://github.com/ChannelFinder/pvinfo/pull/85))

## [2.0.0] - 2023-11-09

The build tool changed from Create React App to Vite. All `REACT_APP_` environment variables and npm commands work the same way. Delete the node_modules directory and run `npm install` when upgrading. See the [version 2 migration notes](docs/v2-migration.md) for more details.

### Environment Variables

- `REACT_APP_ENDPOINT` now also sets the Vite base path for builds hosted on a non-root endpoint. `PUBLIC_URL` and the package.json `homepage` are no longer used ([#82](https://github.com/ChannelFinder/pvinfo/pull/82))

### Changed

- Migrate from Create React App to Vite with a much faster dev server and builds. Files with JSX use the .jsx extension, environment variables are read with `import.meta.env`, the dev server still runs on port 3000, and the git commit hash and date are set in `vite.config.js` ([#82](https://github.com/ChannelFinder/pvinfo/pull/82))

## [1.3.1] - 2023-10-24

### Fixed

- Only show the EPICS epoch timestamp for INVALID PVs, PVWS sends the epoch timestamp in the first message for all PVs ([#80](https://github.com/ChannelFinder/pvinfo/pull/80), [#81](https://github.com/ChannelFinder/pvinfo/pull/81))

### Security

- Dependency update for @babel/traverse ([#79](https://github.com/ChannelFinder/pvinfo/pull/79))

## [1.3.0] - 2023-10-10

### Environment Variables

- Added `REACT_APP_PVWS_HTTP_URL` and `REACT_APP_PVWS_HTTP_URL_DEV` for the PVWS HTTP endpoints shown on the Services page, leave blank if the PVWS HTTP endpoints aren't exposed ([#72](https://github.com/ChannelFinder/pvinfo/pull/72))
- Added `REACT_APP_CF_MAX_RESULTS` (default empty, no limit) to limit the number of channels returned by Channel Finder ([#75](https://github.com/ChannelFinder/pvinfo/pull/75))
- Added `REACT_APP_VERSION` (default `$npm_package_version`) to show the PV Info version on the Services page ([#78](https://github.com/ChannelFinder/pvinfo/pull/78))

### Added

- Services page showing the connection status and details of Channel Finder, PV Web Socket, Alarm Logger, and OLOG, plus the PV Info version and git commit ([#72](https://github.com/ChannelFinder/pvinfo/pull/72), [#78](https://github.com/ChannelFinder/pvinfo/pull/78))
- Number of matching PVs shown on the search page ([#72](https://github.com/ChannelFinder/pvinfo/pull/72))
- Option to send credentials with requests, for services behind single sign on ([#74](https://github.com/ChannelFinder/pvinfo/pull/74))

### Changed

- The Help link is at the end of the header links ([#72](https://github.com/ChannelFinder/pvinfo/pull/72))
- Refactor the home page search and severity color handling ([#76](https://github.com/ChannelFinder/pvinfo/pull/76))

### Fixed

- Searching on the extra search properties ([#76](https://github.com/ChannelFinder/pvinfo/pull/76))
- Disable the PV details page Live Monitor checkbox for Inactive PVs ([#77](https://github.com/ChannelFinder/pvinfo/pull/77))

## [1.2.0] - 2023-09-20

### Environment Variables

- Changed the default `REACT_APP_PVWS_URL` from `ws://localhost:8081/pvws/ws` to `ws://localhost:8081/pvws/pv` ([#64](https://github.com/ChannelFinder/pvinfo/pull/64))

### Added

- Channel Finder tags in the free form search, words without `=` after the PV name are tag searches ([#68](https://github.com/ChannelFinder/pvinfo/pull/68))
- Dropdown on the free form search showing the available properties and tags to search on ([#68](https://github.com/ChannelFinder/pvinfo/pull/68))
- Tags on the PV details page, each a link to search for PVs with that tag ([#70](https://github.com/ChannelFinder/pvinfo/pull/70), fixes [#69](https://github.com/ChannelFinder/pvinfo/issues/69))

### Fixed

- Crash if a PV has no recordType ([#67](https://github.com/ChannelFinder/pvinfo/pull/67), fixes [#66](https://github.com/ChannelFinder/pvinfo/issues/66))
- Null checks on the PV details page for Channel Finder properties that might not exist ([#71](https://github.com/ChannelFinder/pvinfo/pull/71))

### Security

- Dependency update for @adobe/css-tools ([#65](https://github.com/ChannelFinder/pvinfo/pull/65))

## [1.1.0] - 2023-08-07

### Environment Variables

- Changed the default `REACT_APP_HOMEPAGE_SUBHEADER` to list the PV Web Socket, Phoebus OLOG, Phoebus Alarm Logger, and Archiver Appliance integrations

### Added

- Example screenshots page and screenshots in the README ([#63](https://github.com/ChannelFinder/pvinfo/pull/63))

### Changed

- The mobile menu uses MUI icons instead of mobile-menu-logo.png
- The default home page banner is a generic EPICS controls logo instead of the Advanced Light Source logo, and is sized by height so site specific logos work better

## [1.0.0] - 2023-08-02

First release, with the Advanced Light Source fully using this codebase. All site specific settings are configurable in the .env file, including which Channel Finder properties are shown on the home page and PV details page. Includes integrations with PV Web Socket, Archiver Appliance, Phoebus OLOG, and Phoebus Alarm Logger.


[3.0.0]: https://github.com/ChannelFinder/pvinfo/compare/2.8.2...HEAD
[2.8.2]: https://github.com/ChannelFinder/pvinfo/compare/2.8.1...2.8.2
[2.8.1]: https://github.com/ChannelFinder/pvinfo/compare/2.8.0...2.8.1
[2.8.0]: https://github.com/ChannelFinder/pvinfo/compare/2.7.0...2.8.0
[2.7.0]: https://github.com/ChannelFinder/pvinfo/compare/2.6.0...2.7.0
[2.6.0]: https://github.com/ChannelFinder/pvinfo/compare/2.5.1...2.6.0
[2.5.1]: https://github.com/ChannelFinder/pvinfo/compare/2.5.0...2.5.1
[2.5.0]: https://github.com/ChannelFinder/pvinfo/compare/2.4.1...2.5.0
[2.4.1]: https://github.com/ChannelFinder/pvinfo/compare/2.4.0...2.4.1
[2.4.0]: https://github.com/ChannelFinder/pvinfo/compare/2.3.0...2.4.0
[2.3.0]: https://github.com/ChannelFinder/pvinfo/compare/2.2.2...2.3.0
[2.2.2]: https://github.com/ChannelFinder/pvinfo/compare/2.2.1...2.2.2
[2.2.1]: https://github.com/ChannelFinder/pvinfo/compare/2.2.0...2.2.1
[2.2.0]: https://github.com/ChannelFinder/pvinfo/compare/2.1.4...2.2.0
[2.1.4]: https://github.com/ChannelFinder/pvinfo/compare/2.1.3...2.1.4
[2.1.3]: https://github.com/ChannelFinder/pvinfo/compare/2.1.2...2.1.3
[2.1.2]: https://github.com/ChannelFinder/pvinfo/compare/2.1.1...2.1.2
[2.1.1]: https://github.com/ChannelFinder/pvinfo/compare/2.1.0...2.1.1
[2.1.0]: https://github.com/ChannelFinder/pvinfo/compare/2.0.1...2.1.0
[2.0.1]: https://github.com/ChannelFinder/pvinfo/compare/2.0.0...2.0.1
[2.0.0]: https://github.com/ChannelFinder/pvinfo/compare/1.3.1...2.0.0
[1.3.1]: https://github.com/ChannelFinder/pvinfo/compare/1.3.0...1.3.1
[1.3.0]: https://github.com/ChannelFinder/pvinfo/compare/1.2.0...1.3.0
[1.2.0]: https://github.com/ChannelFinder/pvinfo/compare/1.1.0...1.2.0
[1.1.0]: https://github.com/ChannelFinder/pvinfo/compare/1.0.0...1.1.0
[1.0.0]: https://github.com/ChannelFinder/pvinfo/releases/tag/1.0.0
