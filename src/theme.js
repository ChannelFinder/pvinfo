import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      light: '#335b70',
      main: '#00334d',
      dark: '#002335',
      contrastText: '#fff',
    },
    secondary: {
      light: '#33c9eb',
      main: '#00bce7',
      dark: '#0083a1',
      contrastText: '#000',
    },
    info: {
      light: '#ffffff',
      main: '#e0e0e0',
      dark: '#aeaeae',
      contrastText: '#000',
    },
  },
  typography: {
    fontFamily: [
      'Ubuntu',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
  overrides: {
    MuiTooltip: {
      tooltip: {
        fontSize: "1em",
        textAlign: "center"
      },
    },
  },
});

export default theme;
