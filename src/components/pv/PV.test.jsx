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

test('live monitoring is a switch, like the search results', async () => {
  Object.assign(configOverrides, { USE_PVWS: true, PVWS_IGNORE_CF_PVSTATUS: false });
  await renderPV([{ name: 'pvStatus', value: 'Active' }]);
  expect(screen.getByRole('switch', { name: 'Live PV Monitoring' })).toBeEnabled();
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
});

test('the live monitoring switch is disabled for a PV that is not Active, and its tooltip says why', async () => {
  Object.assign(configOverrides, { USE_PVWS: true, PVWS_IGNORE_CF_PVSTATUS: false });
  await renderPV([{ name: 'pvStatus', value: 'Inactive' }]);
  expect(screen.getByRole('switch', { name: 'Live PV Monitoring' })).toBeDisabled();
  fireEvent.mouseOver(screen.getByText('Live PV Monitoring'));
  expect(await screen.findByRole('tooltip')).toHaveTextContent('PV status is Inactive');
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

test('the IOC and alias links search for exact matches, not IOCs or PVs with similar names', async () => {
  await renderPV([{ name: 'iocName', value: 'IOC 1' }, { name: 'alias', value: 'SR:C1:current' }]);
  expect(screen.getByRole('link', { name: 'IOC 1' })).toHaveAttribute('href', '/?iocName==IOC%201');
  expect(screen.getByRole('link', { name: 'SR:C1:current' })).toHaveAttribute('href', '/?alias==SR%3AC1%3Acurrent');
});
