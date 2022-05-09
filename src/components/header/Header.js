import React, {useState} from "react";
import './Header.css';
import { NavLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Grid, Drawer, Hidden, Divider } from '@mui/material';
import { List, ListItem, ListItemText } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import { alpha } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import alsBanner from "../../assets/als-banner.png";


const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    display: 'flex'
  },
  title: {
    flexGrow: 1,
    marginLeft: theme.spacing(4),
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(1),
      width: 'auto',
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '20ch',
      '&:focus': {
        width: '40ch',
      },
    },
  },
}));


function Header () {
  const classes = useStyles();

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
                    <img src={alsBanner} style={{ height: 60, width: 302 }} alt="ALS Banner Logo" />
                    <Divider />
                    <List>
                        <ListItem button key="PVs" component={NavLink} to="/" onClick={handleMenuToggle}>
                            <ListItemText primary="PVs"/>
                        </ListItem>
                        <ListItem button key="IOCs" component={NavLink} to="/ioc" onClick={handleMenuToggle}>
                            <ListItemText primary="IOCs"/>
                        </ListItem>
                        <ListItem button key="Plotting" component={NavLink} to="/plot" onClick={handleMenuToggle}>
                            <ListItemText primary="Plotting"/>
                        </ListItem>
                        <ListItem button key="IRMs" component={NavLink} to="/irm" onClick={handleMenuToggle}>
                            <ListItemText primary="IRMs"/>
                        </ListItem>
                        <ListItem button key="EventLog" component={NavLink} to="/event-log" onClick={handleMenuToggle}>
                            <ListItemText primary="Event Log"/>
                        </ListItem>
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
          <NavLink to="/plot" style={{textDecoration: "none", color: 'inherit', paddingRight: 40 }}>
            <Typography variant="h5">Plotting</Typography>
          </NavLink>
          <NavLink to="/irm" style={{textDecoration: "none", color: 'inherit', paddingRight: 40 }}>
            <Typography variant="h5">IRMs</Typography>
          </NavLink>
          <NavLink to="/event-log" style={{textDecoration: "none", color: 'inherit', paddingRight: 40 }}>
            <Typography variant="h5">Event Log</Typography>
          </NavLink>
          <NavLink to="/help" style={{textDecoration: "none", color: 'inherit', paddingRight: 40 }}>
            <Typography variant="h5">Help</Typography>
          </NavLink>
          {/* <div className={classes.search}>
            <div className={classes.searchIcon}>
              <SearchIcon />
            </div>
            <InputBase
              placeholder="Search pv…"
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              inputProps={{ 'aria-label': 'search' }}
            />
          </div> */}
        </Hidden>
        </Toolbar>
      </AppBar>
    </Grid>
  );
}

export default Header;