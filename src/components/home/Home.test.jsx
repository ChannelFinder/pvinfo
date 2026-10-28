import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material';
import { MemoryRouter } from 'react-router';
import theme from '../../theme';
import api from '../../api';
import Home from './Home';

vi.mock('../../api', async (importOriginal) => ({
  default: {
    ...(await importOriginal()).default,
    CF_QUERY: vi.fn(() => Promise.resolve([])),
    COUNT_QUERY: vi.fn(() => Promise.resolve(0)),
    HELPERS_QUERY: vi.fn(() => Promise.resolve([])),
    HELPERS_ENUM: { PROPERTIES: 'properties', TAGS: 'tags' },
  },
}));

const alertProps = { handleErrorMessage: vi.fn(), handleOpenErrorAlert: vi.fn(), handleSeverity: vi.fn() };
const queryError = 'Enter a value after iocName=, or use iocName=* to match any value';

async function renderAdvancedSearch(url = '/') {
  render(<ThemeProvider theme={theme}><MemoryRouter initialEntries={[url]}><Home {...alertProps} /></MemoryRouter></ThemeProvider>);
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

test('tags are searched as a list', async () => {
  await renderAdvancedSearch();
  typeQuery('SR* archived golden');
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'search' })); });
  expect(api.CF_QUERY).toHaveBeenCalledWith({ pvName: 'SR*', tag: ['archived', 'golden'], standardSearch: false });
});

test('a tag only search from the URL keeps the tags in the Advanced query', async () => {
  await renderAdvancedSearch('/?tag=archived&tag=golden&standardSearch=false');
  expect(screen.getByRole('searchbox')).toHaveValue('* archived golden');
  expect(api.CF_QUERY).toHaveBeenCalledWith({ tag: ['archived', 'golden'], standardSearch: false });
});

test('a link with numbered tags from before 3.0 still searches the tags', async () => {
  await renderAdvancedSearch('/?pvName=SR*&tag1=archived&tag2=golden&standardSearch=false');
  expect(screen.getByRole('searchbox')).toHaveValue('SR* archived golden');
  expect(api.CF_QUERY).toHaveBeenCalledWith({ pvName: 'SR*', tag: ['archived', 'golden'], standardSearch: false });
});

test('Enter in the results table search box filters the table without searching again', async () => {
  const channel = (name) => ({ name, owner: 'owner', properties: [{ name: 'pvStatus', value: 'Active' }] });
  api.CF_QUERY.mockResolvedValueOnce([channel('PV:A'), channel('PV:B')]);
  await renderAdvancedSearch('/?pvName=PV*&standardSearch=false');
  expect(api.CF_QUERY).toHaveBeenCalledTimes(1);
  const quickFilter = screen.getByPlaceholderText('Search…');
  await userEvent.type(quickFilter, 'PV:A{Enter}');
  expect(api.CF_QUERY).toHaveBeenCalledTimes(1);
  expect(quickFilter).toHaveValue('PV:A');
});

// these use the Advanced search since jsdom doesn't support reading the Standard search fields from the form
describe('search button', () => {
  const search = async () => { await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'search' })); }); };

  test('queries Channel Finder once for a new search', async () => {
    await renderAdvancedSearch();
    typeQuery('SR*');
    await search();
    expect(api.CF_QUERY).toHaveBeenCalledTimes(1);
    expect(api.COUNT_QUERY).toHaveBeenCalledTimes(1);
    expect(api.CF_QUERY).toHaveBeenCalledWith({ pvName: 'SR*', standardSearch: false });
  });

  test('queries Channel Finder again when the same search is repeated', async () => {
    await renderAdvancedSearch();
    typeQuery('SR*');
    await search();
    await search();
    expect(api.CF_QUERY).toHaveBeenCalledTimes(2);
  });

  test('queries Channel Finder once for a new search with tags, and again when it is repeated', async () => {
    await renderAdvancedSearch();
    typeQuery('SR* archived golden');
    await search();
    expect(api.CF_QUERY).toHaveBeenCalledTimes(1);
    await search();
    expect(api.CF_QUERY).toHaveBeenCalledTimes(2);
  });

  test('repeating a search from a URL with a ~ queries Channel Finder once', async () => {
    // URLSearchParams encodes ~ as %7E, so the URL from a tag link isn't exactly what the search button sets
    await renderAdvancedSearch('/?pvName=*&tag=beam~test&standardSearch=false');
    expect(screen.getByRole('searchbox')).toHaveValue('* beam~test');
    vi.clearAllMocks();
    await search();
    expect(api.CF_QUERY).toHaveBeenCalledTimes(1);
    expect(api.COUNT_QUERY).toHaveBeenCalledTimes(1);
  });

  test('a search with only an empty PV name queries every PV once', async () => {
    await renderAdvancedSearch();
    typeQuery('pvName=');
    await search();
    expect(api.CF_QUERY).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Data Loading...')).not.toBeInTheDocument();
  });

  test('a search with only standardSearch typed in queries every PV once', async () => {
    await renderAdvancedSearch();
    typeQuery('standardSearch=false');
    await search();
    expect(api.CF_QUERY).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Data Loading...')).not.toBeInTheDocument();
  });

  test('a search without search terms queries every PV once', async () => {
    await renderAdvancedSearch();
    await search();
    expect(api.CF_QUERY).toHaveBeenCalledTimes(1);
    expect(api.CF_QUERY).toHaveBeenCalledWith({ standardSearch: false });
  });
});

test('switching from Standard to Advanced keeps values with spaces and an exact PV name in the search', async () => {
  await renderAdvancedSearch('/?pvName=%3DSR%3ABPM1&recordDesc=beam+current&standardSearch=true');
  expect(screen.getByRole('searchbox')).toHaveValue('=SR:BPM1 recordDesc="beam current"');
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'search' })); });
  expect(api.CF_QUERY).toHaveBeenLastCalledWith({ pvName: '=SR:BPM1', recordDesc: 'beam current', standardSearch: false });
});
