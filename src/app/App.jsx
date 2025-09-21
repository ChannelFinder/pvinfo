import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Grid, Snackbar, Alert } from '@mui/material';
import { useState } from "react";

import config from "../config";
import Home from '../components/home';
import PV from '../components/pv';
import IOC from '../components/ioc';
import Plot from '../components/plot';
import Header from '../components/header';
import Help from '../components/help';
import Services from '../components/services';
import CaputLogPage from '../components/caputlog/CaputLogPage';
import Page404 from '../Page404';

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
          <Routes>
            <Route path='*' element={<Page404 />} />
            <Route path="/pv/:id" exact={true} element={<PV handleOpenErrorAlert={setOpenErrorAlert} handleErrorMessage={setErrorMessage} handleSeverity={setSeverity} />} />
            <Route path="/ioc" exact={true} element={<IOC />} />
            <Route path="/plot" exact={true} element={<Plot />} />
            {
              config.USE_CAPUTLOG ? <Route path="/caputlog" exact={true} element={<CaputLogPage />} /> : null
            }
            <Route path="/services" exact={true} element={<Services />} />
            <Route path="/help" exact={true} element={<Help />} />
            <Route path="/" exact={true} element={<Home handleOpenErrorAlert={setOpenErrorAlert} handleErrorMessage={setErrorMessage} handleSeverity={setSeverity} />} />
          </Routes>
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
