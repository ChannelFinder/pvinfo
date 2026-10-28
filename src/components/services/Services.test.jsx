import { render, screen, act, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import FakeWebSocket from '../../fakeWebSocket';
import Services from './Services';

const configOverrides = vi.hoisted(() => ({}));
vi.mock('../../config', async (importOriginal) => {
  const actual = (await importOriginal()).default;
  return { default: new Proxy({ ...actual }, { get: (target, key) => (key in configOverrides ? configOverrides[key] : target[key]) }) };
});

vi.mock('../../api', () => {
  const query = () => Promise.resolve(null);
  return { default: { COUNT_QUERY: query, CFI_QUERY: query, ALI_QUERY: query, OLI_QUERY: query, PVWSI_QUERY: query, CAPUTLOG_QUERY: query } };
});

beforeEach(() => {
  FakeWebSocket.instances = [];
  vi.stubGlobal('WebSocket', FakeWebSocket);
  Object.assign(configOverrides, {
    USE_PVWS: true,
    PVWS_URL: 'ws://pvws/pv',
    USE_AA: true,
    AA_MAX_PLOT_PVS: 20,
    USE_IOC_PAGE: true,
    IOC_PAGE_PV_PATTERN: '*:ENGINEER',
    IOC_PAGE_EXTRA_COLUMNS: ['iocIP:IOC IP', 'Location'],
    SHOW_WHATS_NEW: true,
    CF_RECORD_TYPE: false,
    EXTRA_PROP: null,
    SECOND_EXTRA_PROP: null,
    PROPERTY_VALUES: 'Acc:GTB,SR;mode:Fast',
    RESULTS_TABLE_SIZE_OPTIONS: [10, 50, 100],
    SM_BREAKPOINT: 600,
    MD_BREAKPOINT: 900,
    LG_BREAKPOINT: 1536,
    OMIT_IN_TABLE_MEDIUM: ['hostName', 'iocName'],
    OMIT_IN_TABLE_SMALL: ['pvStatus'],
    OMIT_IN_TABLE_X_SMALL: [],
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

async function renderServices() {
  render(<MemoryRouter><Services /></MemoryRouter>);
  await act(async () => {});
  fireEvent.click(screen.getByRole('button', { name: 'Preference Settings' }));
  fireEvent.click(screen.getByRole('button', { name: 'Page Settings' }));
}

const settingValue = (name) => screen.getByRole('cell', { name }).nextSibling.textContent;

test('preference settings show the settings added in 3.0.0', async () => {
  await renderServices();
  expect(screen.getByText("What's New Page:").parentElement).toHaveTextContent("What's New Page: Enabled");
  expect(screen.getByText('IOCs Page:').parentElement).toHaveTextContent('IOCs Page: Enabled');
  expect(settingValue('Max PVs to Plot Together')).toBe('20');
  expect(settingValue('Properties with Predefined Values (Advanced Search)')).toBe('Acc, mode');
  expect(settingValue('PV Name Pattern')).toBe('*:ENGINEER');
  expect(settingValue('Extra Columns')).toBe('IOC IP, Location');
});

test('settings for features that are turned off are hidden or say none', async () => {
  Object.assign(configOverrides, { USE_AA: false, USE_IOC_PAGE: false, SHOW_WHATS_NEW: false, PROPERTY_VALUES: '' });
  await renderServices();
  expect(screen.getByText("What's New Page:").parentElement).toHaveTextContent("What's New Page: Disabled");
  expect(screen.queryByRole('cell', { name: 'Max PVs to Plot Together' })).not.toBeInTheDocument();
  expect(settingValue('Properties with Predefined Values (Advanced Search)')).toBe('None');
  expect(screen.queryByRole('cell', { name: 'PV Name Pattern' })).not.toBeInTheDocument();
});

test('no extra columns says none', async () => {
  configOverrides.IOC_PAGE_EXTRA_COLUMNS = [];
  await renderServices();
  expect(settingValue('Extra Columns')).toBe('None');
});

test('property values include record types and extra properties with dropdown labels', async () => {
  Object.assign(configOverrides, { CF_RECORD_TYPE: true, EXTRA_PROP: 'Sector', EXTRA_PROP_DROPDOWN_LABELS: ['1', '2'] });
  await renderServices();
  expect(settingValue('Properties with Predefined Values (Advanced Search)')).toBe('recordType, Sector, Acc, mode');
});

test('results table settings show the size options and the columns hidden at each width', async () => {
  await renderServices();
  expect(settingValue('PV Results Table Size Options')).toBe('10, 50, 100');
  expect(settingValue('Columns Hidden at 1536px Wide or Less')).toBe('hostName, iocName');
  expect(settingValue('Columns Hidden at 900px Wide or Less')).toBe('pvStatus');
  expect(settingValue('Columns Hidden at 600px Wide or Less')).toBe('None');
});

test('extra properties say if they are not shown in the results', async () => {
  Object.assign(configOverrides, { EXTRA_PROP: 'Sector', EXTRA_PROP_SHOW_IN_RESULTS: true, SECOND_EXTRA_PROP: 'Device', SECOND_EXTRA_PROP_SHOW_IN_RESULTS: false });
  await renderServices();
  expect(settingValue('Extra Property')).toBe('Sector');
  expect(settingValue('Second Extra Property')).toBe('Device (not shown in results)');
});

describe('PV Web Socket status', () => {
  const echo = { type: 'echo', body: 'Hello, PVWS!' };
  const pvwsStatus = () => within(screen.getByText('PV Web Socket').parentElement).getByText(/^(Connected|Connecting|Disconnected)$/).textContent;

  async function renderPVWS() {
    render(<MemoryRouter><Services /></MemoryRouter>);
    await act(async () => {});
  }

  test('shows Connecting until PVWS answers the echo', async () => {
    await renderPVWS();
    expect(pvwsStatus()).toBe('Connecting');
    await act(async () => FakeWebSocket.latest().open());
    expect(FakeWebSocket.latest().sent).toEqual([echo]);
    expect(pvwsStatus()).toBe('Connecting');
    await act(async () => FakeWebSocket.latest().echo());
    expect(pvwsStatus()).toBe('Connected');
  });

  test('shows Disconnected when the web socket closes', async () => {
    await renderPVWS();
    await act(async () => FakeWebSocket.latest().open());
    await act(async () => FakeWebSocket.latest().echo());
    await act(async () => FakeWebSocket.latest().drop());
    expect(pvwsStatus()).toBe('Disconnected');
  });

  test('checks PVWS again when the web socket reconnects', async () => {
    vi.useFakeTimers();
    await renderPVWS();
    // the connection drops after the echo is sent, before PVWS answers it
    await act(async () => FakeWebSocket.latest().open());
    await act(async () => FakeWebSocket.latest().drop());
    await act(async () => { await vi.advanceTimersByTimeAsync(10000); });
    expect(FakeWebSocket.instances).toHaveLength(2);
    await act(async () => FakeWebSocket.latest().open());
    expect(FakeWebSocket.latest().sent).toEqual([echo]);
    await act(async () => FakeWebSocket.latest().echo());
    expect(pvwsStatus()).toBe('Connected');
  });

  test('does not connect when PV Web Socket is turned off', async () => {
    configOverrides.USE_PVWS = false;
    await renderPVWS();
    expect(FakeWebSocket.instances).toHaveLength(0);
    expect(screen.queryByText('PV Web Socket')).not.toBeInTheDocument();
  });
});
