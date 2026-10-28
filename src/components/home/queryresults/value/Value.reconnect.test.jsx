import { render, screen, act } from '@testing-library/react';
import FakeWebSocket from '../../../../fakeWebSocket';
import Value from './Value';
import ValueCheckbox from '../valuecheckbox/ValueCheckbox';

// uses the real web socket hook with a fake browser WebSocket, the test plays PVWS
const configOverrides = vi.hoisted(() => ({ PVWS_URL: 'ws://pvws/results', SHOW_DISCONNECTED: true }));
vi.mock('../../../../config', async (importOriginal) => {
  const actual = (await importOriginal()).default;
  return { default: new Proxy({ ...actual }, { get: (target, key) => (key in configOverrides ? configOverrides[key] : target[key]) }) };
});

const monitored = new Set([0]);
const notMonitored = new Set();

// one row of the search results: the switch subscribes and the Value cell shows the value, sharing one web socket
function Row({ isChecked = true }) {
  return (
    <div>
      <ValueCheckbox pvName="SR:temp" id={0} pvStatus="Active" recordType="ai" checked={{ 0: isChecked }}
        currentChecked={isChecked ? monitored : notMonitored} updateCurrentChecked={() => {}} />
      <Value pvName="SR:temp" id={0} isChecked={isChecked} pvStatus="Active" pvRecordType="ai" />
    </div>
  );
}

beforeEach(() => {
  FakeWebSocket.instances = [];
  vi.stubGlobal('WebSocket', FakeWebSocket);
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  configOverrides.SHOW_DISCONNECTED = true;
});

async function renderRow(props) {
  render(<Row {...props} />);
  await act(async () => {});
}

const advance = (ms) => act(async () => { await vi.advanceTimersByTimeAsync(ms); });
const open = () => act(async () => FakeWebSocket.latest().open());
const drop = () => act(async () => FakeWebSocket.latest().drop());
const receive = (message) => act(async () => FakeWebSocket.latest().receive({ type: 'update', pv: 'SR:temp', severity: 'NONE', ...message }));
const subscribes = () => FakeWebSocket.latest().sent.filter((message) => message.type === 'subscribe');
const placeholder = (name) => screen.queryByRole('progressbar', name && { name });
const disconnected = () => screen.queryByText('(DISCONNECTED)');

test('retries when the first connection fails, then subscribes the monitored PV', async () => {
  await renderRow();
  await drop();
  await advance(1000);
  expect(FakeWebSocket.instances).toHaveLength(2);
  await open();
  expect(subscribes()).toEqual([{ type: 'subscribe', pvs: ['SR:temp'] }]);
});

test('subscribes again after the connection drops, and shows a placeholder until the new value', async () => {
  await renderRow();
  await open();
  expect(subscribes()).toEqual([{ type: 'subscribe', pvs: ['SR:temp'] }]);
  await receive({ value: 1.5, precision: 3, vtype: 'VDouble', units: 'mA' });
  expect(screen.getByText('1.50 mA')).toBeInTheDocument();

  // the old value is not left on screen as if it were still updating
  await drop();
  expect(screen.queryByText('1.50 mA')).not.toBeInTheDocument();
  await advance(500);
  expect(placeholder('Connecting to PV Web Socket')).toBeInTheDocument();
  await advance(500);
  await open();
  expect(subscribes()).toEqual([{ type: 'subscribe', pvs: ['SR:temp'] }]);
  expect(placeholder('Waiting for the live value')).toBeInTheDocument();
  await receive({ value: 2 });
  expect(screen.getByText('2.00 mA')).toBeInTheDocument();
});

test('shows a placeholder after 500 ms without a value', async () => {
  await renderRow();
  await advance(499);
  expect(placeholder()).not.toBeInTheDocument();
  await advance(1);
  expect(placeholder('Connecting to PV Web Socket')).toBeInTheDocument();
  await open();
  expect(placeholder('Waiting for the live value')).toBeInTheDocument();
  await receive({ value: 1.5, precision: 3, vtype: 'VDouble', units: 'mA' });
  expect(placeholder()).not.toBeInTheDocument();
});

test('a value that arrives within 500 ms shows no placeholder', async () => {
  await renderRow();
  await open();
  await advance(400);
  expect(placeholder()).not.toBeInTheDocument();
  await receive({ value: 1.5, precision: 3, vtype: 'VDouble', units: 'mA' });
  await advance(1000);
  expect(placeholder()).not.toBeInTheDocument();
  expect(screen.getByText('1.50 mA')).toBeInTheDocument();
});

test('a PV without a value shows (DISCONNECTED) 500 ms after PVWS answers', async () => {
  await renderRow();
  await open();
  await receive({ severity: 'UNDEFINED' });
  await advance(499);
  expect(disconnected()).not.toBeInTheDocument();
  await advance(1);
  expect(placeholder()).not.toBeInTheDocument();
  expect(disconnected()).toBeInTheDocument();
});

test('a placeholder on screen stays through a message without a value until the value arrives', async () => {
  await renderRow();
  await advance(500);
  expect(placeholder()).toBeInTheDocument();
  // PVWS sends a message without a value while it connects to the PV
  await open();
  await receive({ severity: 'UNDEFINED' });
  await advance(400);
  expect(placeholder()).toBeInTheDocument();
  expect(disconnected()).not.toBeInTheDocument();
  await receive({ value: 1.5, precision: 3, vtype: 'VDouble', units: 'mA' });
  expect(placeholder()).not.toBeInTheDocument();
  expect(screen.getByText('1.50 mA')).toBeInTheDocument();
});

test('a placeholder on screen is replaced by (DISCONNECTED) 500 ms after a message without a value', async () => {
  await renderRow();
  await advance(500);
  await open();
  await receive({ severity: 'UNDEFINED' });
  await advance(499);
  expect(placeholder()).toBeInTheDocument();
  await advance(1);
  expect(placeholder()).not.toBeInTheDocument();
  expect(disconnected()).toBeInTheDocument();
});

test('with SHOW_DISCONNECTED off, a PV without a value is left blank instead of keeping the placeholder', async () => {
  configOverrides.SHOW_DISCONNECTED = false;
  await renderRow();
  await open();
  await receive({ severity: 'UNDEFINED' });
  await advance(1000);
  expect(placeholder()).not.toBeInTheDocument();
  expect(disconnected()).not.toBeInTheDocument();
});

test('rows that are not monitored have no placeholder', async () => {
  await renderRow({ isChecked: false });
  await open();
  await advance(1000);
  expect(placeholder()).not.toBeInTheDocument();
  expect(subscribes()).toEqual([]);
});
