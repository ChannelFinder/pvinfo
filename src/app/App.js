import './App.css';
import { BrowserRouter as Router, Route, Routes, Redirect } from "react-router-dom";
import { Grid } from '@material-ui/core';

import Home from '../components/home';
import PV from '../components/pv';
import IOC from '../components/ioc';
import EventLog from '../components/eventlog';
import Plot from '../components/plot';
import Header from '../components/header';
import Help from '../components/help';
import Status from '../components/status';
import Page404 from '../Page404';

function App() {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <Grid container>
        <Header />
      </Grid>
      <Grid container spacing={0} direction="column" alignItems="center" style={{marginTop: 30}}>
        <main style={{width: "90%"}}>
          <Routes>
            <Route path='*' element={<Page404 />} />
            <Route path="/pv/:id" exact={true} element={<PV />} />
            <Route path="/ioc" exact={true} element={<IOC />} />
            <Route path="/plot" exact={true} element={<Plot />} />
            <Route path="/event-log" exact={true} element={<EventLog />} />
            <Route path="/help" exact={true} element={<Help />} />
            <Route path="/status" exact={true} element={<Status />} />
            <Route path="/" exact={true} element={<Home />} />
          </Routes>
        </main>
      </Grid>
      {/* <Grid container justifyContent="space-around" spacing={0} style={{flexGrow: 1, display: "flex"}}>
        <Footer />
      </Grid> */}
    </Router>
  );
}

export default App;
