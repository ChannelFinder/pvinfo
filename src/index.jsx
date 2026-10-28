import React from 'react';
import './index.css';
import App from './app';
import reloadOnPreloadError from './app/reloadOnPreloadError';
import { CssBaseline, ThemeProvider, StyledEngineProvider } from '@mui/material';
import { createRoot } from 'react-dom/client';
import theme from './theme';

reloadOnPreloadError();

// IMPORTANT: make sure to specify correct ID
// must be the ID of the div element in your index.html file
const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </StyledEngineProvider>
);
