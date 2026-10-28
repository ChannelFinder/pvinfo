import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import App from './App';
import theme from '../theme';

// a page that fails to load, like after a new build is deployed and the old page files are gone
vi.mock('../components/help', () => { throw new Error('Failed to fetch dynamically imported module'); });

const renderApp = () => render(
  <ThemeProvider theme={theme}>
    <App />
  </ThemeProvider>
);

beforeEach(() => {
  // keep the home page from making real network requests
  vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));
  window.history.pushState({}, '', '/');
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

test('renders header', () => {
  renderApp();
  expect(screen.getByRole('banner')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Advanced search' })).toHaveTextContent('Advanced');
});

test('a page that fails to load shows an error instead of a blank page, and the header links still work', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  window.history.pushState({}, '', '/help');
  renderApp();
  expect(await screen.findByText('Something went wrong')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Reload Page' })).toBeInTheDocument();
  expect(screen.getByRole('banner')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('link', { name: 'PV Info' }));
  expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Advanced search' })).toBeInTheDocument();
});
