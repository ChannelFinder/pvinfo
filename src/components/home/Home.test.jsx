import { render, screen, act, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import { MemoryRouter } from 'react-router';
import theme from '../../theme';
import api from '../../api';
import Home from './Home';

vi.mock('../../api', () => ({
  default: {
    CF_QUERY: vi.fn(() => Promise.resolve([])),
    COUNT_QUERY: vi.fn(() => Promise.resolve(0)),
    HELPERS_QUERY: vi.fn(() => Promise.resolve([])),
    HELPERS_ENUM: { PROPERTIES: 'properties', TAGS: 'tags' },
  },
}));

const alertProps = { handleErrorMessage: vi.fn(), handleOpenErrorAlert: vi.fn(), handleSeverity: vi.fn() };
const queryError = 'Enter a value after iocName=, or use iocName=* to match any value';

async function renderAdvancedSearch() {
  render(<ThemeProvider theme={theme}><MemoryRouter><Home {...alertProps} /></MemoryRouter></ThemeProvider>);
  await act(async () => {});
  fireEvent.click(screen.getByRole('button', { name: 'Advanced search' }));
}

const typeQuery = (query) => fireEvent.change(screen.getByRole('searchbox'), { target: { value: query } });

afterEach(() => {
  vi.clearAllMocks();
});

test('an Advanced search with a property but no value is not searched', async () => {
  await renderAdvancedSearch();
  typeQuery('SR* iocName=');
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'search' })); });
  expect(api.CF_QUERY).not.toHaveBeenCalled();
  expect(screen.getByText(queryError)).toBeInTheDocument();
});

test('the error clears when the query is changed and the search then runs', async () => {
  await renderAdvancedSearch();
  typeQuery('SR* iocName=');
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'search' })); });
  typeQuery('SR* iocName=test*');
  expect(screen.queryByText(queryError)).not.toBeInTheDocument();
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'search' })); });
  expect(api.CF_QUERY).toHaveBeenCalledWith({ pvName: 'SR*', iocName: 'test*', standardSearch: false });
});
