import { Component, Fragment } from "react";
import { Button, CircularProgress, Grid, Typography } from "@mui/material";
import { isReloading } from "./reloadOnPreloadError";

// Shows an error message instead of a blank page when a page fails to load or render.
// Errors from event handlers and other callbacks don't reach error boundaries.
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { error: null, locationKey: props.locationKey };
    }

    static getDerivedStateFromError(error) {
        return { error };
    }

    // any navigation clears the error, including a new search that only changes the query string.
    // the location key isn't used as the React key since that would remount the page on every search
    static getDerivedStateFromProps(props, state) {
        if (props.locationKey !== state.locationKey) {
            return { error: null, locationKey: props.locationKey };
        }
        return null;
    }

    render() {
        if (this.state.error === null) {
            return this.props.children;
        }
        if (isReloading()) {
            return <Grid container justifyContent="center"><CircularProgress /></Grid>;
        }
        return (
            <Fragment>
                <Typography variant="h4">Something went wrong</Typography>
                <Typography sx={{ mt: 1 }}>
                    This page could not be shown. If PV Info was updated since it was opened, reloading the page will load the new version.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, overflowWrap: "anywhere" }}>
                    {String(this.state.error?.message ?? this.state.error)}
                </Typography>
                <Button onClick={() => window.location.reload()} variant="contained" color="secondary" sx={{ mt: 2 }}>Reload Page</Button>
            </Fragment>
        );
    }
}

export default ErrorBoundary;
