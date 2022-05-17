import React, {useState} from "react";
import './Header.css';
import { NavLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Grid, Drawer, Hidden, Divider } from '@mui/material';
import { List, ListItem, ListItemText } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { alpha } from '@mui/material/styles';
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
