import { render, screen, act } from '@testing-library/react';
import ValueTable from './ValueTable';

// the PV Web Socket message the component sees, changed by each test
const socket = vi.hoisted(() => ({ lastJsonMessage: null }));
vi.mock('../../../useWebSocket', () => ({ default: () => ({ lastJsonMessage: socket.lastJsonMessage, sendJsonMessage: vi.fn() }) }));

const configOverrides = vi.hoisted(() => ({ PVWS_IGNORE_CF_PVSTATUS: false, PVWS_ALLOW_WAVEFORMS: false }));
vi.mock('../../../config', async (importOriginal) => {
  const actual = (await importOriginal()).default;
  return { default: new Proxy({ ...actual }, { get: (target, key) => (key in configOverrides ? configOverrides[key] : target[key]) }) };
});

const props = {
  pvData: { pvStatus: { value: 'Active' } }, pvMonitoring: true, snapshot: false, isLoading: false, pvName: 'SR:temp',
  handleOpenErrorAlert: vi.fn(), handleErrorMessage: vi.fn(), handleSeverity: vi.fn(),
};

async function receive(rerender, message) {
  socket.lastJsonMessage = { type: 'update', pv: 'SR:temp', severity: 'NONE', ...message };
  rerender(<ValueTable {...props} />);
  await act(async () => {});
}

afterEach(() => {
  socket.lastJsonMessage = null;
});

test('the value keeps the PV precision from the first message for later updates', async () => {
  const { rerender } = render(<ValueTable {...props} />);
  await receive(rerender, { value: -12.5, precision: 2, vtype: 'VDouble', units: 'C' });
  expect(screen.getByText('-12.50')).toBeInTheDocument();

  // PV Web Socket only sends the precision with the first message
  await receive(rerender, { value: 3.14159 });
  expect(screen.getByText('3.14')).toBeInTheDocument();
});
