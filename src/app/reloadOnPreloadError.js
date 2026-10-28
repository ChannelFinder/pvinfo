// Pages other than home are loaded on demand. If a new build is deployed while PV Info is open,
// the old page files are gone and loading the next page fails, so reload to get the new build.
const lastReloadKey = "pvinfoPreloadErrorReload";
// don't reload again this soon after the last reload, so a broken build can't reload in a loop
const minReloadInterval = 10000;
let reloading = false;

function handlePreloadError(event, reload = () => window.location.reload()) {
    try {
        const lastReload = Number(sessionStorage.getItem(lastReloadKey));
        if (Date.now() - lastReload < minReloadInterval) {
            return; // let the error through so the error boundary shows it
        }
        sessionStorage.setItem(lastReloadKey, String(Date.now()));
    } catch (err) {
        return; // without session storage the reloads can't be limited
    }
    reloading = true;
    // stop Vite from throwing the error, the error boundary shows a spinner until the page reloads
    event.preventDefault();
    reload();
}

function isReloading() {
    return reloading;
}

function reloadOnPreloadError() {
    window.addEventListener("vite:preloadError", (event) => handlePreloadError(event));
}

export { handlePreloadError, isReloading };
export default reloadOnPreloadError;
