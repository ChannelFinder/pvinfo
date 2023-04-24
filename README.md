# PV Info

[![Node Builds](https://github.com/ChannelFinder/pvinfo/workflows/Node.js%20CI/badge.svg)](https://github.com/ChannelFinder/pvinfo/actions/workflows/node.js.yml)
[![Docker Build](https://github.com/ChannelFinder/pvinfo/workflows/Docker%20Image%20CI/badge.svg)](https://github.com/ChannelFinder/pvinfo/actions/workflows/docker-image.yml)

Web interface to the EPICS [Channel Finder](https://github.com/ChannelFinder/ChannelFinderService) database. This interface allows users to query for PVs by wildcard name searches as well as querying by PV meta-data such as IOC name, record type, etc.

PV Info also integrates with several other EPICS services. The [PV Web Socket](https://github.com/ornl-epics/pvws) service is used to show live PV data. There are buttons for each PV in PV Info which link to an external archive web viewer to allow users to quickly view past PV history. Currently this is configured to work with the [Archiver Appliance Web Viewer](https://github.com/slacmshankar/epicsarchiverap) but other archive web viewers can easily be used since this is simply an external link to another web page. Lastly, there is an integration with the [Phoebus OLOG service](https://github.com/Olog/phoebus-olog) to display any log entries that contain the specific PV name on the PV "details" page. Only the Channel Finder integration is required to use PV Info.

![PV Info Arch](docs/arch.png?raw=true "PV Info Arch")

This repository is under active development and is currently in production at the Advanced Light Source (ALS). Effort has been made to make PV Info non-ALS specific and configurable for any site using Channel Finder but things might have been missed. So please report any bugs you might find, any new features which could be useful, and any feedback on configuring/installing/using PV Info.

## Required Packages

- Node.js - https://nodejs.org/

## Configuration

### React Environment Variables

There are many React environment variables avaiable to configure PV Info for your site. Several variables will most definately need to be updated for PV Info to work. These variables are containted in [.env file](.env):

- `REACT_APP_ENDPOINT`
- `REACT_APP_DOMAIN`
- `REACT_APP_HTTP_PROTOCOL`
- `REACT_APP_CF_URL`
- `REACT_APP_PVWS_URL`
- `REACT_APP_AA_URL`
- `REACT_APP_OLOG_URL`

The only required service is Channel Finder. To turn off PV Web Socket, Archiver Web Viewer, or OLOG:
- `REACT_APP_USE_PVWS=false`
- `REACT_APP_USE_AA=false`
- `REACT_APP_USE_OLOG=false`

Other interesting variables are the channel finder properties that you can configure to show as searchable on the homepage:
- `REACT_APP_CF_RECORD_TYPE`
- `REACT_APP_CF_RECORD_DESC`
- `REACT_APP_CF_ALIAS`
- `REACT_APP_EXTRA_PROP`
- `REACT_APP_SECOND_EXTRA_PROP`

### package.json

Update the "homepage" variable in [package.json](package.json).

https://github.com/ChannelFinder/pvinfo/blob/master/package.json#L3


### Logos and Colors

- Update [src/theme.js](src/theme.js) with the colors and fonts you want
- Place your own logos in src/assets


## Initial Setup and Running Locally

### `npm install`

Installs the needed NPM modules into node_modules directory. Run this the first time you clone the repository.

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.


## Building Production Bundle

### ```npm run build```
Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
