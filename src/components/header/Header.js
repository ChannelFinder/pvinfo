import React, {useState} from "react";
import './Header.css';
import { NavLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Grid, Drawer, Hidden, Divider } from '@mui/material';
import { List, ListItem, ListItemText } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { makeStyles } from 'tss-react/mui';
import MenuIcon from '@mui/icons-material/Menu';
import logoBanner from "../../assets/mobile-menu-logo.png";


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


function Header () {
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
                    <img src={logoBanner} style={{ height: 60, width: 302 }} alt="Banner Logo" />
                    <Divider />
                    <List>
                        <ListItem button key="PVs" component={NavLink} to="/" onClick={handleMenuToggle}>
                            <ListItemText primary="PVs"/>
                        </ListItem>
                        <ListItem button key="IOCs" component={NavLink} to="/ioc" onClick={handleMenuToggle}>
                            <ListItemText primary="IOCs"/>
                        </ListItem>
                        {process.env.REACT_APP_USE_AA.toLowerCase() === "true" &&
                          <ListItem button key="Plotting" component={NavLink} to="/plot" onClick={handleMenuToggle}>
                              <ListItemText primary="Plotting"/>
                          </ListItem>
                        }
                        <ListItem button key="Help" component={NavLink} to="/help" onClick={handleMenuToggle}>
                            <ListItemText primary="Help"/>
                        </ListItem>
                    </List>
                    <Divider />
                </div>
            </Drawer>
        </Hidden>
        <NavLink to={"/"} className={classes.title} style={{ textDecoration: 'none', color: 'inherit' }}>
          <Typography variant="h3" component="h1" style={{flexGrow: 1}} noWrap>
            PV Info
          </Typography>
        </NavLink>
        <Hidden mdDown>
          <NavLink to="/ioc" style={{textDecoration: "none", color: 'inherit', paddingRight: 40 }}>
            <Typography variant="h5">IOCs</Typography>
          </NavLink>
          {process.env.REACT_APP_USE_AA.toLowerCase() === "true" &&
            <NavLink to="/plot" style={{textDecoration: "none", color: 'inherit', paddingRight: 40 }}>
              <Typography variant="h5">Plotting</Typography>
            </NavLink>
          }
          <NavLink to="/help" style={{textDecoration: "none", color: 'inherit', paddingRight: 40 }}>
            <Typography variant="h5">Help</Typography>
          </NavLink>
        </Hidden>
        </Toolbar>
      </AppBar>
    </Grid>
  );
}

export default Header;
