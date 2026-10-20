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
  components: {
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: "1em",
          textAlign: "center"
        }
      }
    },
    MuiDataGrid: {
      styleOverrides: {
        // the v8 default toolbar is right aligned with grey buttons and a 52px min height,
        // make it left aligned, compact, and use the primary color like the pre-v8 toolbar.
        // the label and quick filter search box are also kept on the left next to the buttons
        toolbar: ({ theme }) => ({
          justifyContent: "flex-start",
          minHeight: "auto",
          padding: theme.spacing(0.25, 0.5),
          "& .MuiIconButton-root": {
            color: theme.palette.primary.main,
            padding: theme.spacing(0.75),
          },
          // the label grows to fill the toolbar by default, which pushes the buttons to the right
          "& .MuiDataGrid-toolbarLabel": {
            flex: "0 0 auto",
            marginRight: theme.spacing(1),
          },
        }),
      },
    },
  },
});

export default theme;
