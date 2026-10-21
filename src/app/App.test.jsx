import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import App from './App';
import theme from '../theme';

beforeEach(() => {
  // keep the home page from making real network requests
  vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test('renders header', () => {
  render(
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  );
  expect(screen.getByRole('banner')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Free Form search' })).toHaveTextContent('Free Form');
});
