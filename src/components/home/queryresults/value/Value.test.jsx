import { render, screen, act } from '@testing-library/react';
import Value from './Value';

// the PV Web Socket message the component sees, changed by each test
const socket = vi.hoisted(() => ({ lastJsonMessage: null }));
vi.mock('../../../../useWebSocket', () => ({ default: () => ({ lastJsonMessage: socket.lastJsonMessage }) }));

async function receive(rerender, message) {
  socket.lastJsonMessage = { type: 'update', pv: 'SR:temp', severity: 'NONE', ...message };
  rerender(<Value pvName="SR:temp" isChecked />);
  await act(async () => {});
}

afterEach(() => {
  socket.lastJsonMessage = null;
});

test('the results table uses the PV precision up to 2 decimals for every update', async () => {
  const { rerender } = render(<Value pvName="SR:temp" isChecked />);
  await receive(rerender, { value: 1.5, precision: 3, vtype: 'VDouble', units: 'mA' });
  expect(screen.getByText('1.50 mA')).toBeInTheDocument();
  await receive(rerender, { value: 2 });
  expect(screen.getByText('2.00 mA')).toBeInTheDocument();
});

test('integer PVs are whole numbers', async () => {
  const { rerender } = render(<Value pvName="SR:temp" isChecked />);
  await receive(rerender, { value: 5, precision: 0, vtype: 'VInt', units: 'counts' });
  expect(screen.getByText('5 counts')).toBeInTheDocument();
});

test('without the first message, like after the cell is remounted, values have up to 2 decimals without trailing zeros', async () => {
  const { rerender } = render(<Value pvName="SR:temp" isChecked />);
  await receive(rerender, { value: 5 });
  expect(screen.getByText('5')).toBeInTheDocument();
  await receive(rerender, { value: -3.14159 });
  expect(screen.getByText('-3.14')).toBeInTheDocument();
});
