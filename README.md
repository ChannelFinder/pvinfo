# PV Info

[![Node Builds](https://github.com/ChannelFinder/pvinfo/workflows/Node.js%20CI/badge.svg)](https://github.com/ChannelFinder/pvinfo/actions/workflows/node.js.yml)
[![Docker Build](https://github.com/ChannelFinder/pvinfo/workflows/Docker%20Image%20CI/badge.svg)](https://github.com/ChannelFinder/pvinfo/actions/workflows/docker-image.yml)

Web interface to the EPICS [Channel Finder](https://github.com/ChannelFinder/ChannelFinderService) database. This interface allows users to query for PVs by wildcard name searches as well as querying by PV meta-data such as IOC name, record type, etc.

PV Info also integrates with several other EPICS high level services:
- [PV Web Socket](https://github.com/ornl-epics/pvws) is used to show live PV data including the value, alarm status/severity, alarm limits, etc.
- [Phoebus OLOG](https://github.com/Olog/phoebus-olog) allows you to display any log entries that contain the specific PV name on the PV "details" page.
- [Phoebus Alarm Logger](https://github.com/ControlSystemStudio/phoebus/tree/master/services/alarm-logger) displays the alarm history for a specific PV on it's "details" page.
- [Archiver Appliance Web Viewer](https://github.com/archiver-appliance/epicsarchiverap) is used to show the archived history of PVs. Since this is simply an external link in PV Info to the archiver web viewer, other archive engines and their own web viewers can easily be used.
- [caPutLog (with Elasticsearch)](https://github.com/epics-modules/caPutLog) displays the who/what/when/where history of caputs to a specific PV on the PV "details" page.

It is important to note that **only the Channel Finder integration is required to use PV Info**.
![PV Info Arch](docs/arch.svg?raw=true "PV Info Arch")

This repository is under active development and is currently in production at the Advanced Light Source (ALS). Effort has been made to make PV Info non-ALS specific and configurable for any site using Channel Finder but things might have been missed. So please report any bugs you might find, any new features which could be useful, and any feedback on configuring/installing/using PV Info.

## Required Packages

- Node.js - https://nodejs.org/

## Configuration

### Version 1.x.x vs. Version 2.x.x

In version 2.0.0 the PV Info build tool was changed from [Create React App](https://github.com/facebook/create-react-app) to [Vite](https://github.com/vitejs/vite). Create React App has been deprecated by Facebook and is no longer maintained. This can cause some issues with security vulnerabilities and isn't good for the long term so we have switched to Vite. Vite is mostly a drop-in replacement but see here for differences in PV Info 1.x.x and 2.x.x - [Version 2 notes](docs/v2-migration.md).

It is important to delete the node_modules directory and do an `npm install` to regenerate all the dependencies when converting an existing application to version 2.0.0.

### React Environment Variables

There are many React environment variables avaiable to configure PV Info for your site. Several variables will most definately need to be updated for PV Info to work. These variables are containted in [.env file](.env):

- `REACT_APP_ENDPOINT`
- `REACT_APP_DOMAIN`
- `REACT_APP_HTTP_PROTOCOL`
- `REACT_APP_CF_URL`
- `REACT_APP_PVWS_URL`
- `REACT_APP_AA_URL`
- `REACT_APP_OLOG_URL`
- `REACT_APP_AL_URL`

The only required service is Channel Finder. To turn off PV Web Socket, Archiver Web Viewer, OLOG, or caPutLog:
- `REACT_APP_USE_PVWS=false`
- `REACT_APP_USE_AA=false`
- `REACT_APP_USE_OLOG=false`
- `REACT_APP_USE_AL=false`
- `REACT_APP_USE_CAPUTLOG=false`

Other interesting variables are the channel finder properties that you can configure to show as searchable on the homepage:
- `REACT_APP_CF_RECORD_TYPE`
- `REACT_APP_CF_RECORD_DESC`
- `REACT_APP_CF_ALIAS`
- `REACT_APP_EXTRA_PROP`
- `REACT_APP_SECOND_EXTRA_PROP`

### Logos and Colors

- Update [src/theme.js](src/theme.js) with the colors and fonts you want
- Place your own logo in src/assets
- Place your own favicons in [public](public)


## Initial Setup and Running Locally

### `npm install`

Installs the needed NPM modules into node_modules directory. Run this the first time you clone the repository.

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) or possibly [http://localhost:3000/pvinfo](http://localhost:3000/pvinfo) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.


## Building Production Bundle

### ```npm run build```
Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://vitejs.dev/guide/using-plugins.html) for more information.

### React Routing Configuration

Since React routing is done on the client side, direct links to sub pages of PV Info might not load (i.e. https://myhost/pvinfo/pv/mypv). To solve this, something like this can be added to .htaccess for apache setups to always route through the index endpoint:

```bash
$ cat .htaccess
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```
https://stackoverflow.com/questions/27928372/react-router-urls-dont-work-when-refreshing-or-writing-manually/46035346#46035346

## Screenshots

![Monitor All](docs/monitor-all.png?raw=true "Monitor All")

See more screenshots here: [example.md](docs/example.md)
