# PV Info

[![Node Builds](https://github.com/ChannelFinder/pvinfo/workflows/Node.js%20CI/badge.svg)](https://github.com/ChannelFinder/pvinfo/actions/workflows/node.js.yml)
[![Docker Build](https://github.com/ChannelFinder/pvinfo/workflows/Docker%20Image%20CI/badge.svg)](https://github.com/ChannelFinder/pvinfo/actions/workflows/docker-image.yml)

Web interface for using EPICS Channel Finder database. Integrates with PV Web Socket (PVWS), Archiver Appliance web viewing, and OLOG.

![PV Info Arch](docs/arch.png?raw=true "PV Info Arch")

Please report bugs and give feedback!

## Required Packages

- node JS
	- Test with:
		- ```node -v```
		- ```npm -v```

## Initial Setup and Running Locally

### `npm install`

Installs the needed NPM modules into node_modules directory. Run this the first time you clone the repository.

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

## Site specific settings

- Update src/theme.js with the colors and fonts you want
- Place your own logos in src/assets
- Edit .env or create .env.local with your site specific settings


## Building Production Bundle

### ```npm run build```
Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

