import { render, screen, act, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import { MemoryRouter } from 'react-router';
import theme from '../../../theme';
import QueryResults from './QueryResults';
import { archiverPlotURL } from './resultstoolbar/ResultsToolbar';

// track which PVs are subscribed through the shared PVWS web socket
const subscribed = new Set();
vi.mock('../../../useWebSocket', () => ({
  default: () => ({
    lastJsonMessage: null,
    sendJsonMessage: (message) => {
      message.pvs.forEach((pv) => message.type === 'subscribe' ? subscribed.add(pv) : subscribed.delete(pv));
    },
  }),
}));

const pvName = (i) => `PV${String(i).padStart(3, '0')}`;
const cfData = Array.from({ length: 120 }, (_, i) => ({
  name: pvName(i),
  owner: 'owner',
  properties: [{ name: 'pvStatus', value: 'Active' }, { name: 'recordType', value: 'ai' }],
}));

async function renderMonitorResults() {
  const props = { isLoading: false, cfData, handleErrorMessage: () => {}, handleOpenErrorAlert: () => {}, handleSeverity: () => {} };
  const { container } = render(<ThemeProvider theme={theme}><MemoryRouter><QueryResults {...props} /></MemoryRouter></ThemeProvider>);
  await act(async () => {});
  return container;
}

const visiblePVs = (container) => [...container.querySelectorAll('.MuiDataGrid-row')].map((row) => pvName(row.getAttribute('data-id')));
const monitorAllCheckbox = () => screen.getByLabelText('Monitor all PVs');
const click = async (element) => { await act(async () => { fireEvent.click(element); }); };
const sortByNameDescending = async (container) => {
  const nameHeader = container.querySelector('.MuiDataGrid-columnHeader[data-field="name"] .MuiDataGrid-columnHeaderTitleContainer');
  await click(nameHeader);
  await click(nameHeader);
};

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

test('the monitor all switch is hidden when PV Web Socket is turned off', async () => {
  await renderResults([channel('PV:A')]);
  expect(screen.queryByLabelText('Monitor all PVs')).not.toBeInTheDocument();
});

describe('monitor all', () => {
  beforeEach(() => {
    subscribed.clear();
    Object.keys(configOverrides).forEach((key) => delete configOverrides[key]);
    Object.assign(configOverrides, { USE_PVWS: true, PVWS_IGNORE_CF_PVSTATUS: false, RESULTS_TABLE_SIZE: 50, DEFAULT_MONITOR_ALL: false });
  });

  test('the switch is in the toolbar and the actions header is only a label', async () => {
    const container = await renderMonitorResults();
    expect(container.querySelector('.MuiDataGrid-toolbar').contains(monitorAllCheckbox())).toBe(true);
    expect(container.querySelector('.MuiDataGrid-columnHeader[data-field="button"] input')).toBeNull();
  });

  test('monitors the PVs on the visible page', async () => {
    const container = await renderMonitorResults();
    await click(monitorAllCheckbox(container));
    expect([...subscribed].sort()).toEqual(visiblePVs(container).sort());
    expect(subscribed.size).toBe(50);
  });

  test('monitors the visible page after the table is sorted', async () => {
    const container = await renderMonitorResults();
    await sortByNameDescending(container);
    expect(visiblePVs(container)[0]).toBe('PV119');
    await click(monitorAllCheckbox(container));
    expect([...subscribed].sort()).toEqual(visiblePVs(container).sort());
  });

  test('follows the visible page when the table is sorted while checked', async () => {
    const container = await renderMonitorResults();
    await click(monitorAllCheckbox(container));
    await sortByNameDescending(container);
    expect(monitorAllCheckbox(container).checked).toBe(true);
    expect([...subscribed].sort()).toEqual(visiblePVs(container).sort());
  });

  test('stops monitoring on page change by default', async () => {
    const container = await renderMonitorResults();
    await click(monitorAllCheckbox(container));
    await click(container.querySelector('[aria-label="Go to next page"]'));
    expect(subscribed.size).toBe(0);
    expect(monitorAllCheckbox(container).checked).toBe(false);
  });

  test('is checked after a search and follows page changes with DEFAULT_MONITOR_ALL', async () => {
    configOverrides.DEFAULT_MONITOR_ALL = true;
    const container = await renderMonitorResults();
    expect(monitorAllCheckbox(container).checked).toBe(true);
    expect([...subscribed].sort()).toEqual(visiblePVs(container).sort());

    await click(container.querySelector('[aria-label="Go to next page"]'));
    expect(visiblePVs(container)[0]).toBe('PV050');
    expect(monitorAllCheckbox(container).checked).toBe(true);
    expect([...subscribed].sort()).toEqual(visiblePVs(container).sort());
  });

  test('the row switches stay on when the same results arrive twice with DEFAULT_MONITOR_ALL', async () => {
    // a search from the search button queries Channel Finder twice, once for the submit and once for the new URL
    configOverrides.DEFAULT_MONITOR_ALL = true;
    const props = { isLoading: false, handleErrorMessage: () => {}, handleOpenErrorAlert: () => {}, handleSeverity: () => {} };
    const page = (data) => <ThemeProvider theme={theme}><MemoryRouter><QueryResults cfData={data} {...props} /></MemoryRouter></ThemeProvider>;
    const rowSwitches = (container) => [...container.querySelectorAll('.MuiDataGrid-row [data-field="button"] input')];
    const { container, rerender } = render(page(cfData));
    await act(async () => {});
    rerender(page([...cfData]));
    await act(async () => {});
    expect(monitorAllCheckbox(container).checked).toBe(true);
    expect(rowSwitches(container)).toHaveLength(50);
    expect(rowSwitches(container).every((input) => input.checked)).toBe(true);
    expect([...subscribed].sort()).toEqual(visiblePVs(container).sort());
  });

  test('new results stop monitoring by default', async () => {
    const props = { isLoading: false, handleErrorMessage: () => {}, handleOpenErrorAlert: () => {}, handleSeverity: () => {} };
    const page = (data) => <ThemeProvider theme={theme}><MemoryRouter><QueryResults cfData={data} {...props} /></MemoryRouter></ThemeProvider>;
    const { container, rerender } = render(page(cfData));
    await act(async () => {});
    await click(monitorAllCheckbox(container));
    expect(subscribed.size).toBe(50);
    rerender(page(cfData.map((channel) => ({ ...channel, name: `${channel.name}:B` }))));
    await act(async () => {});
    expect(monitorAllCheckbox(container).checked).toBe(false);
    expect(subscribed.size).toBe(0);
  });

  test('a PV unchecked by the user stays unchecked with DEFAULT_MONITOR_ALL', async () => {
    configOverrides.DEFAULT_MONITOR_ALL = true;
    const container = await renderMonitorResults();
    const firstRowCheckbox = container.querySelector('.MuiDataGrid-row[data-id="0"] [data-field="button"] input');
    await click(firstRowCheckbox);
    await act(async () => {});
    expect(subscribed.has('PV000')).toBe(false);
    expect(subscribed.size).toBe(49);
  });

  test('does nothing with DEFAULT_MONITOR_ALL when PVWS is disabled', async () => {
    Object.assign(configOverrides, { DEFAULT_MONITOR_ALL: true, USE_PVWS: false });
    await renderMonitorResults();
    expect(subscribed.size).toBe(0);
  });
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
