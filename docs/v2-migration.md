# Migrating from PV Info 1.x.x to 2.0.0

The first step when migrating to version 2.0.0 is to delete the node_modules directory for PV Info and regenerate it with `npm install`. This will install Vite and the dependencies needed to run and build PV Info.

Vite configuration is done in the vite.config.js file. We have configured this file to try to best match the experience with Create React App. For instance, all env variables prefixed with `REACT_APP` will still work with Vite. The development server should also still work on localhost port 3000.

The major difference to be aware of is that Vite does not use the `PUBLIC_URL` environment variable that Create React App did. Instead, Vite uses the `base` variable in vite.config.js to let production static builds be hosted on the non-root endpoint of a domain. (https://vitejs.dev/guide/build.html#public-base-path)

For PV Info, we already included the `REACT_APP_ENDPOINT` variable in the .env or .env.local file to configure what endpoint of the domain PV Info is hosted on. Now, this variable is used to also configure the `base` variable for Vite. For instance, to achieve a build for the following URL https://mydomain.gov/pvinfo you would use `REACT_APP_ENDPOINT=/pvinfo`

There are no changes needed anymore in package.json.

### TL;DR

- `rm -r node_modules && npm install`
- Use `REACT_APP_ENDPOINT` instead of `PUBLIC_URL` or homepage variable in package.json
- All REACT_APP_* variables in .env should stay the same

### Old notes for configuring PV Info 1.x.x application

This was only required for Create React App builds (PV Info version 1.x.x)

- Update the "homepage" variable in [package.json](package.json).
  - https://github.com/ChannelFinder/pvinfo/blob/master/package.json#L3
- You can also use the `PUBLIC_URL` environment variable to override the homepage string, for instance during npm run
build: `PUBLIC_URL=http://myhomepage/pvinfo npm run build`
