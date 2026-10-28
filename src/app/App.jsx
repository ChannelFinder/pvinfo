import './App.css';
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router";
import { Grid, Snackbar, Alert, CircularProgress } from '@mui/material';
import { lazy, Suspense, useState } from "react";

import config from "../config";
import Home from '../components/home';
import Header from '../components/header';
import Page404 from '../Page404';
import ErrorBoundary from './ErrorBoundary';

// load pages other than home on demand to keep the initial bundle small
const PV = lazy(() => import('../components/pv'));
const IOC = lazy(() => import('../components/ioc'));
const Plot = lazy(() => import('../components/plot'));
const Help = lazy(() => import('../components/help'));
const Services = lazy(() => import('../components/services'));
const CaputLogPage = lazy(() => import('../components/caputlog/CaputLogPage'));
const WhatsNew = lazy(() => import('../components/whatsnew'));

// the error boundary needs the location from inside the Router to clear the error on navigation
function PageErrorBoundary({ children }) {
  const location = useLocation();
  return <ErrorBoundary locationKey={location.key}>{children}</ErrorBoundary>;
}

function App() {
  const [openErrorAlert, setOpenErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [severity, setSeverity] = useState("error");

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenErrorAlert(false);
  };

  return (
    <Router basename={import.meta.env.BASE_URL}>
      <Grid container>
        <Header />
      </Grid>
      <Grid container spacing={0} direction="column" alignItems="center" style={{ marginTop: 30 }}>
        <main style={{ width: "90%" }}>
          <PageErrorBoundary>
            <Suspense fallback={<Grid container justifyContent="center"><CircularProgress /></Grid>}>
              <Routes>
                <Route path='*' element={<Page404 />} />
                <Route path="/pv/:id" element={<PV handleOpenErrorAlert={setOpenErrorAlert} handleErrorMessage={setErrorMessage} handleSeverity={setSeverity} />} />
                {
                  config.USE_IOC_PAGE ? <Route path="/ioc" element={<IOC />} /> : null
                }
                <Route path="/plot" element={<Plot />} />
                {
                  config.USE_CAPUTLOG ? <Route path="/caputlog" element={<CaputLogPage />} /> : null
                }
                <Route path="/services" element={<Services />} />
                <Route path="/help" element={<Help />} />
                {
                  config.SHOW_WHATS_NEW ? <Route path="/whatsnew" element={<WhatsNew />} /> : null
                }
                <Route path="/" element={<Home handleOpenErrorAlert={setOpenErrorAlert} handleErrorMessage={setErrorMessage} handleSeverity={setSeverity} />} />
              </Routes>
            </Suspense>
          </PageErrorBoundary>
        </main>
      </Grid>
      <div>
        <Snackbar open={openErrorAlert} autoHideDuration={6000} onClose={handleClose}>
          <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
            {errorMessage}
          </Alert>
        </Snackbar>
      </div>
    </Router>
  );
}

export default App;
