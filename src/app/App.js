import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Grid } from '@mui/material';

import Home from '../components/home';
import PV from '../components/pv';
import IOC from '../components/ioc';
import Plot from '../components/plot';
import Header from '../components/header';
import Help from '../components/help';
import Page404 from '../Page404';

function App() {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <Grid container>
        <Header />
      </Grid>
      <Grid container spacing={0} direction="column" alignItems="center" style={{ marginTop: 30 }}>
        <main style={{ width: "90%" }}>
          <Routes>
            <Route path='*' element={<Page404 />} />
            <Route path="/pv/:id" exact={true} element={<PV />} />
            <Route path="/ioc" exact={true} element={<IOC />} />
            <Route path="/plot" exact={true} element={<Plot />} />
            <Route path="/help" exact={true} element={<Help />} />
            <Route path="/" exact={true} element={<Home />} />
          </Routes>
        </main>
      </Grid>
    </Router>
  );
}

export default App;
