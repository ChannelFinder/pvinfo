import { render, screen, act } from '@testing-library/react';
import FakeWebSocket from '../../../fakeWebSocket';
import ValueTable from './ValueTable';

// uses the real web socket hook with a fake browser WebSocket, the test plays PVWS
const configOverrides = vi.hoisted(() => ({ PVWS_URL: 'ws://pvws/details', PVWS_IGNORE_CF_PVSTATUS: false, PVWS_ALLOW_WAVEFORMS: false }));
vi.mock('../../../config', async (importOriginal) => {
  const actual = (await importOriginal()).default;
  return { default: new Proxy({ ...actual }, { get: (target, key) => (key in configOverrides ? configOverrides[key] : target[key]) }) };
});

const props = {
  pvData: { pvStatus: { value: 'Active' } }, pvMonitoring: true, snapshot: false, isLoading: false, pvName: 'SR:temp',
  handleOpenErrorAlert: vi.fn(), handleErrorMessage: vi.fn(), handleSeverity: vi.fn(),
};

beforeEach(() => {
  FakeWebSocket.instances = [];
  vi.stubGlobal('WebSocket', FakeWebSocket);
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

async function renderValueTable(overrides = {}) {
  render(<ValueTable {...props} {...overrides} />);
  await act(async () => {});
}

const advance = (ms) => act(async () => { await vi.advanceTimersByTimeAsync(ms); });
const open = () => act(async () => FakeWebSocket.latest().open());
const drop = () => act(async () => FakeWebSocket.latest().drop());
const receive = (message) => act(async () => FakeWebSocket.latest().receive({ type: 'update', pv: 'SR:temp', severity: 'NONE', ...message }));
const subscribes = () => FakeWebSocket.latest().sent.filter((message) => message.type === 'subscribe');
const placeholder = (name) => screen.queryByRole('progressbar', name && { name });

test('subscribes again after the connection to PVWS drops and reconnects', async () => {
  await renderValueTable();
  await open();
  expect(subscribes()).toEqual([{ type: 'subscribe', pvs: ['SR:temp'] }]);
  await receive({ value: 5, precision: 0, vtype: 'VInt' });
  expect(screen.getByText('5')).toBeInTheDocument();

  await drop();
  await advance(1000);
  expect(FakeWebSocket.instances).toHaveLength(2);
  await open();
  expect(subscribes()).toEqual([{ type: 'subscribe', pvs: ['SR:temp'] }]);
  await receive({ value: 6 });
  expect(screen.getByText('6')).toBeInTheDocument();
});

test('shows a placeholder until the first value, and again while reconnecting', async () => {
  await renderValueTable();
  expect(placeholder('Connecting to PV Web Socket')).toBeInTheDocument();
  await open();
  expect(placeholder('Waiting for the live value')).toBeInTheDocument();
  await receive({ value: 5, precision: 0, vtype: 'VInt' });
  expect(placeholder()).not.toBeInTheDocument();

  await drop();
  expect(placeholder('Connecting to PV Web Socket')).toBeInTheDocument();
  await advance(1000);
  await open();
  expect(placeholder('Waiting for the live value')).toBeInTheDocument();
});

test('no placeholder once PVWS says the PV is disconnected', async () => {
  await renderValueTable();
  await open();
  await receive({ severity: 'UNDEFINED' });
  expect(placeholder()).not.toBeInTheDocument();
  expect(screen.getByText('DISCONNECTED')).toBeInTheDocument();
});

test('no placeholder or subscription when live monitoring is off', async () => {
  await renderValueTable({ pvMonitoring: false, snapshot: false });
  await open();
  expect(placeholder()).not.toBeInTheDocument();
  expect(subscribes()).toEqual([]);
});

test('a PV that is not Active gets no placeholder, and the warning is not shown again after a reconnect', async () => {
  await renderValueTable({ pvData: { pvStatus: { value: 'Inactive' } } });
  await open();
  expect(placeholder()).not.toBeInTheDocument();
  expect(subscribes()).toEqual([]);
  const warnings = props.handleOpenErrorAlert.mock.calls.length;
  expect(warnings).toBeGreaterThan(0);

  await drop();
  await advance(1000);
  await open();
  expect(props.handleOpenErrorAlert).toHaveBeenCalledTimes(warnings);
});
