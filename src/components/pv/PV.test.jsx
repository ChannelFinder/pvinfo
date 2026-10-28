import { render, screen, act, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import { MemoryRouter, Route, Routes } from 'react-router';
import theme from '../../theme';
import api from '../../api';
import PV from './PV';

vi.mock('../../api', () => ({ default: { CF_QUERY: vi.fn(), PARSE_WEBSOCKET_MSG: () => null } }));
vi.mock('../../useWebSocket', () => ({ default: () => ({ lastJsonMessage: null, sendJsonMessage: vi.fn() }) }));

const defaultConfig = { USE_PVWS: false, USE_AA: false, USE_OLOG: false, USE_AL: false, USE_CAPUTLOG: false };
const configOverrides = vi.hoisted(() => ({}));
vi.mock('../../config', async (importOriginal) => {
  const actual = (await importOriginal()).default;
  return { default: new Proxy({ ...actual }, { get: (target, key) => (key in configOverrides ? configOverrides[key] : target[key]) }) };
});

const alertProps = () => ({ handleErrorMessage: vi.fn(), handleOpenErrorAlert: vi.fn(), handleSeverity: vi.fn() });

async function renderPV(properties, alerts = alertProps()) {
  api.CF_QUERY.mockResolvedValue([{ name: 'SR:C1:beam', owner: 'owner', properties, tags: [] }]);
  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={['/pv/SR:C1:beam']}>
        <Routes><Route path="/pv/:id" element={<PV {...alerts} />} /></Routes>
      </MemoryRouter>
    </ThemeProvider>
  );
  await act(async () => {});
  return alerts;
}

beforeEach(() => {
  Object.assign(configOverrides, defaultConfig);
});

afterEach(() => {
  Object.keys(configOverrides).forEach((key) => delete configOverrides[key]);
});

test('copy button copies the PV name', async () => {
  Object.defineProperty(window, 'isSecureContext', { value: true, configurable: true });
  Object.defineProperty(navigator, 'clipboard', { value: { writeText: vi.fn(() => Promise.resolve()) }, configurable: true });
  const alerts = await renderPV([{ name: 'hostName', value: 'host1' }]);
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Copy PV name' })); });
  expect(navigator.clipboard.writeText).toHaveBeenCalledWith('SR:C1:beam');
  expect(alerts.handleSeverity).toHaveBeenCalledWith('success');
  expect(alerts.handleOpenErrorAlert).toHaveBeenCalledWith(true);
});

test('details page properties can have spaces around the commas and colons', async () => {
  configOverrides.DETAILS_PAGE_PROPERTIES = 'hostName:Host, iocName : IOC Name ,';
  await renderPV([{ name: 'hostName', value: 'host1' }, { name: 'iocName', value: 'IOC1' }]);
  expect(screen.getByText('Host')).toBeInTheDocument();
  expect(screen.getByText('IOC Name')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'IOC1' })).toBeInTheDocument();
});

test('the live value table labels the alarm low value', async () => {
  configOverrides.USE_PVWS = true;
  await renderPV([{ name: 'pvStatus', value: 'Active' }]);
  expect(screen.getByText('Alarm Low Value')).toBeInTheDocument();
});
