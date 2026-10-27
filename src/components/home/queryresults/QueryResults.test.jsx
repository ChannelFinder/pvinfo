import { render, screen, act, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import { MemoryRouter } from 'react-router';
import theme from '../../../theme';
import QueryResults from './QueryResults';
import { archiverPlotURL } from './resultstoolbar/ResultsToolbar';

const configOverrides = vi.hoisted(() => ({}));
vi.mock('../../../config', async (importOriginal) => {
  const actual = (await importOriginal()).default;
  return { default: new Proxy({ ...actual }, { get: (target, key) => (key in configOverrides ? configOverrides[key] : target[key]) }) };
});

const channel = (name) => ({ name, owner: 'owner', properties: [{ name: 'hostName', value: 'host1' }, { name: 'pvStatus', value: 'Active' }] });

const alertProps = () => ({ handleErrorMessage: vi.fn(), handleOpenErrorAlert: vi.fn(), handleSeverity: vi.fn() });

const results = (cfData, props) => (
  <ThemeProvider theme={theme}><MemoryRouter><QueryResults isLoading={false} cfData={cfData} {...props} /></MemoryRouter></ThemeProvider>
);

async function renderResults(cfData, props = alertProps()) {
  const { container, rerender } = render(results(cfData, props));
  await act(async () => {});
  return { container, rerender, props };
}

const selectRow = (container, id) => fireEvent.click(container.querySelector(`.MuiDataGrid-row[data-id="${id}"] [data-field="__check__"] input`));

beforeEach(() => {
  configOverrides.USE_AA = true;
  configOverrides.USE_PVWS = false;
  configOverrides.AA_VIEWER = 'http://aa/archViewer.html';
  configOverrides.AA_MAX_PLOT_PVS = 2;
  Object.defineProperty(window, 'isSecureContext', { value: true, configurable: true });
  Object.defineProperty(navigator, 'clipboard', { value: { writeText: vi.fn(() => Promise.resolve()) }, configurable: true });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  Object.keys(configOverrides).forEach((key) => delete configOverrides[key]);
});

test('archiver plot URL has a pv parameter for each PV', () => {
  expect(archiverPlotURL(['SR:C1:a', 'SR:C1:b'])).toBe('http://aa/archViewer.html?pv=SR%3AC1%3Aa&pv=SR%3AC1%3Ab');
});

test('copy with nothing selected copies every PV name', async () => {
  const { props } = await renderResults([channel('PV:A'), channel('PV:B'), channel('PV:C')]);
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Copy all 3 PV names' })); });
  expect(navigator.clipboard.writeText).toHaveBeenCalledWith('PV:A\nPV:B\nPV:C');
  expect(props.handleSeverity).toHaveBeenCalledWith('success');
  expect(props.handleOpenErrorAlert).toHaveBeenCalledWith(true);
});

test('copy and plot use only the selected PVs', async () => {
  const openMock = vi.spyOn(window, 'open').mockImplementation(() => null);
  const { container } = await renderResults([channel('PV:A'), channel('PV:B'), channel('PV:C')]);
  expect(screen.getByRole('button', { name: 'Select PVs to plot them together' })).toBeDisabled();

  selectRow(container, 0);
  selectRow(container, 2);
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Copy 2 selected PV names' })); });
  expect(navigator.clipboard.writeText).toHaveBeenCalledWith('PV:A\nPV:C');

  fireEvent.click(screen.getByRole('button', { name: 'Plot 2 selected PVs together' }));
  expect(openMock).toHaveBeenCalledWith('http://aa/archViewer.html?pv=PV%3AA&pv=PV%3AC', '_blank', 'noopener');
});

test('plot is disabled when more than the maximum PVs are selected', async () => {
  const { container } = await renderResults([channel('PV:A'), channel('PV:B'), channel('PV:C')]);
  [0, 1, 2].forEach((id) => selectRow(container, id));
  expect(screen.getByRole('button', { name: 'Select at most 2 PVs to plot together' })).toBeDisabled();
});

test('plot button is hidden when the archiver is turned off', async () => {
  configOverrides.USE_AA = false;
  await renderResults([channel('PV:A')]);
  expect(screen.getByRole('button', { name: 'Copy all 1 PV name' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /plot them together/ })).not.toBeInTheDocument();
});

test('a new search clears the selection', async () => {
  const { container, rerender, props } = await renderResults([channel('PV:A'), channel('PV:B')]);
  selectRow(container, 0);
  expect(screen.getByRole('button', { name: 'Copy 1 selected PV name' })).toBeInTheDocument();
  rerender(results([channel('PV:X'), channel('PV:Y'), channel('PV:Z')], props));
  await act(async () => {});
  expect(screen.getByRole('button', { name: 'Copy all 3 PV names' })).toBeInTheDocument();
});

test('the selection checkboxes and the copy and plot buttons are hidden together at phone width', async () => {
  // only the phone width media query matches, see SM_BREAKPOINT
  const phoneQuery = `(max-width:${configOverrides.SM_BREAKPOINT ?? 600}px)`;
  // jsdom has no matchMedia, which MUI's useMediaQuery uses
  vi.stubGlobal('matchMedia', vi.fn((query) => ({
    matches: query.replace(/\s/g, '') === phoneQuery.replace(/\s/g, ''), media: query,
    addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {},
  })));
  const { container } = await renderResults([channel('PV:A'), channel('PV:B')]);
  expect(container.querySelector('[data-field="__check__"]')).toBeNull();
  expect(screen.queryByRole('button', { name: /Copy all/ })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /plot them together/ })).not.toBeInTheDocument();
});
