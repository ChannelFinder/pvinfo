import React, { useState } from "react";
import './Header.css';
import { NavLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Grid, Drawer, Hidden, Divider } from '@mui/material';
import { List, ListItemText, ListItemIcon, ListItemButton } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import HomeIcon from '@mui/icons-material/Home';
import AppsIcon from '@mui/icons-material/Apps';
import SsidChartIcon from '@mui/icons-material/SsidChart';
import HelpIcon from '@mui/icons-material/Help';
import InfoIcon from '@mui/icons-material/Info'
import MenuIcon from '@mui/icons-material/Menu';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
  root: {
    flexGrow: 1,
    display: 'flex'
  },
  title: {
    flexGrow: 1,
    marginLeft: theme.spacing(4),
  },
}));


function Header() {
  const { classes } = useStyles();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleMenuToggle = () => {
    setDrawerOpen(!drawerOpen);
  }

  return (
    <Grid item className={classes.root}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Hidden mdUp>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={handleMenuToggle}
              size="large">
              <MenuIcon />
            </IconButton>
            <Drawer variant="temporary" open={drawerOpen} onClose={handleMenuToggle} anchor="left">
              <div>
                <div className={classes.toolbar} />
                <Divider />
                <List>
                  <ListItemButton key="Home" component={NavLink} to="/" onClick={handleMenuToggle} divider color="primary">
                    <ListItemIcon>
                      <HomeIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Home" />
                  </ListItemButton>
                  <ListItemButton key="IOCs" component={NavLink} to="/ioc" onClick={handleMenuToggle} divider color="primary">
                    <ListItemIcon>
                      <AppsIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="IOCs" />
                  </ListItemButton>
                  <ListItemButton key="Plotting" component={NavLink} to="/plot" onClick={handleMenuToggle} divider color="primary">
                    <ListItemIcon>
                      <SsidChartIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Plotting" />
                  </ListItemButton>
                  {(import.meta.env.REACT_APP_USE_CAPUTLOG || "").toLowerCase() === "true" &&
                    <ListItemButton key="CaputLog" component={NavLink} to="/caputlog" onClick={handleMenuToggle} divider color="primary">
                      <ListItemIcon>
                        <InfoIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="CaputLog" />
                    </ListItemButton>
                  }
                  <ListItemButton key="Services" component={NavLink} to="/services" onClick={handleMenuToggle} divider color="primary">
                    <ListItemIcon>
                      <InfoIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Services" />
                  </ListItemButton>
                  <ListItemButton key="Help" component={NavLink} to="/help" onClick={handleMenuToggle} divider color="primary">
                    <ListItemIcon>
                      <HelpIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Help" />
                  </ListItemButton>
                </List>
              </div>
            </Drawer>
          </Hidden>
          <NavLink to={"/"} className={classes.title} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography variant="h3" component="h1" style={{ flexGrow: 1 }} noWrap>
              PV Info
            </Typography>
          </NavLink>
          <Hidden mdDown>
            <NavLink to="/ioc" style={{ textDecoration: "none", color: 'inherit', paddingRight: 40 }}>
              <Typography variant="h5">IOCs</Typography>
            </NavLink>
            {(import.meta.env.REACT_APP_USE_AA || "").toLowerCase() === "true" &&
              <NavLink to="/plot" style={{ textDecoration: "none", color: 'inherit', paddingRight: 40 }}>
                <Typography variant="h5">Plotting</Typography>
              </NavLink>
            }
            {(import.meta.env.REACT_APP_USE_CAPUTLOG || "").toLowerCase() === "true" &&
              <NavLink to="/caputlog" style={{ textDecoration: "none", color: 'inherit', paddingRight: 40 }}>
                <Typography variant="h5">Caput Log</Typography>
              </NavLink>
            }
            <NavLink to="/services" style={{ textDecoration: "none", color: 'inherit', paddingRight: 40 }}>
              <Typography variant="h5">Services</Typography>
            </NavLink>
            <NavLink to="/help" style={{ textDecoration: "none", color: 'inherit', paddingRight: 40 }}>
              <Typography variant="h5">Help</Typography>
            </NavLink>
          </Hidden>
        </Toolbar>
      </AppBar>
    </Grid>
  );
}

export default Header;
