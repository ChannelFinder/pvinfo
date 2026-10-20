import React, { useState } from "react";
import './Header.css';
import { NavLink } from 'react-router';
import { AppBar, Toolbar, Typography, Grid, Drawer, Divider, useMediaQuery } from '@mui/material';
import { List, ListItemText, ListItemIcon, ListItemButton } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import HomeIcon from '@mui/icons-material/Home';
import AppsIcon from '@mui/icons-material/Apps';
import SsidChartIcon from '@mui/icons-material/SsidChart';
import HelpIcon from '@mui/icons-material/Help';
import InfoIcon from '@mui/icons-material/Info'
import TroubleshootIcon from '@mui/icons-material/Troubleshoot';
import MenuIcon from '@mui/icons-material/Menu';
import { makeStyles } from 'tss-react/mui';

import config from '../../config';

const useStyles = makeStyles()((theme) => ({
  root: {
    flexGrow: 1,
    display: 'flex'
  },
  title: {
    marginLeft: theme.spacing(4),
  },
  // fills the space between the title and the nav links so clicking there doesn't go to the home page
  spacer: {
    flexGrow: 1,
  },
  // nav links fill the full toolbar height with even padding so the click area is centered on the text
  navLink: {
    textDecoration: "none",
    color: "inherit",
    alignSelf: "stretch",
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 2.5),
  },
}));


function Header() {
  const { classes } = useStyles();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMdUp = useMediaQuery((theme) => theme.breakpoints.up('md'), { noSsr: true });

  const handleMenuToggle = () => {
    setDrawerOpen(!drawerOpen);
  }

  return (
    <Grid className={classes.root}>
      <AppBar position="static" color="primary">
        <Toolbar>
          {!isMdUp && <>
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
                  {config.USE_CAPUTLOG &&
                    <ListItemButton key="CaputLog" component={NavLink} to="/caputlog" onClick={handleMenuToggle} divider color="primary">
                      <ListItemIcon>
                        <TroubleshootIcon color="primary" />
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
          </>}
          <NavLink to={"/"} className={classes.title} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography variant="h3" component="h1" noWrap>
              PV Info
            </Typography>
          </NavLink>
          <div className={classes.spacer} />
          {isMdUp && <>
            <NavLink to="/ioc" className={classes.navLink}>
              <Typography variant="h5">IOCs</Typography>
            </NavLink>
            {config.USE_AA &&
              <NavLink to="/plot" className={classes.navLink}>
                <Typography variant="h5">Plotting</Typography>
              </NavLink>
            }
            {config.USE_CAPUTLOG &&
              <NavLink to="/caputlog" className={classes.navLink}>
                <Typography variant="h5">Caput Log</Typography>
              </NavLink>
            }
            <NavLink to="/services" className={classes.navLink}>
              <Typography variant="h5">Services</Typography>
            </NavLink>
            <NavLink to="/help" className={classes.navLink}>
              <Typography variant="h5">Help</Typography>
            </NavLink>
          </>}
        </Toolbar>
      </AppBar>
    </Grid>
  );
}

export default Header;
