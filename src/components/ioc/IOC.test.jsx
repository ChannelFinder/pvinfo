import { render, screen, act } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import { MemoryRouter } from 'react-router';
import theme from '../../theme';
import api from '../../api';
import IOC from './IOC';

vi.mock('../../api', () => ({ default: { CF_QUERY: vi.fn() } }));

const configOverrides = vi.hoisted(() => ({}));
vi.mock('../../config', async (importOriginal) => {
  const actual = (await importOriginal()).default;
  return { default: new Proxy({ ...actual }, { get: (target, key) => (key in configOverrides ? configOverrides[key] : target[key]) }) };
});

const channel = (name, iocName, hostName = 'host1') => ({
  name,
  owner: 'owner',
  properties: [
    ...(iocName ? [{ name: 'iocName', value: iocName }] : []),
    { name: 'hostName', value: hostName },
  ],
});

async function renderIOC(cfData) {
  api.CF_QUERY.mockResolvedValue(cfData);
  const { container } = render(<ThemeProvider theme={theme}><MemoryRouter><IOC /></MemoryRouter></ThemeProvider>);
  await act(async () => {});
  return container;
}

const iocRows = (container) => [...container.querySelectorAll('.MuiDataGrid-row')].map((row) => row.getAttribute('data-id'));

afterEach(() => {
  vi.clearAllMocks();
  Object.keys(configOverrides).forEach((key) => delete configOverrides[key]);
});

const headers = (container) => [...container.querySelectorAll('.MuiDataGrid-columnHeaderTitle')].map((header) => header.textContent);
const cellText = (container, iocId, field) => container.querySelector(`.MuiDataGrid-row[data-id="${iocId}"] [data-field="${field}"]`)?.textContent;

test('queries Channel Finder with the configured PV pattern', async () => {
  await renderIOC([channel('IOC1:ENGINEER', 'IOC1')]);
  expect(api.CF_QUERY).toHaveBeenCalledWith({ pvName: '*:ENGINEER' });
});

test('lists each IOC once and skips PVs without an IOC name', async () => {
  const container = await renderIOC([
    channel('IOCB:ENGINEER', 'IOCB'),
    channel('IOCA:ENGINEER', 'IOCA'),
    channel('IOCA:UPTIME', 'IOCA'),
    channel('STATIC:ENGINEER', null),
  ]);
  expect(iocRows(container).sort()).toEqual(['ioca', 'iocb']);
  expect(screen.getByText('*:ENGINEER', { selector: 'strong' })).toBeInTheDocument();
});

test('explains where the IOC list comes from when no IOCs are found', async () => {
  await renderIOC([channel('STATIC:ENGINEER', null)]);
  expect(screen.getByText('No IOCs Found')).toBeInTheDocument();
  expect(screen.getByText(/REACT_APP_IOC_PAGE_PV_PATTERN/)).toBeInTheDocument();
});

test('shows the IOC IP and CA and PVA ports by default', async () => {
  const ioc = channel('IOCA:ENGINEER', 'IOCA');
  ioc.properties.push({ name: 'iocIP', value: '10.0.0.1' }, { name: 'caPort', value: '5064' }, { name: 'pvaPort', value: '5075' }, { name: 'iocid', value: '10.0.0.1:41234' });
  const container = await renderIOC([ioc]);
  expect(headers(container)).toEqual(['IOC Name', 'Host', 'Engineer', 'IOC IP', 'CA Port', 'PVA Port', 'Last Recsync Update']);
  expect([cellText(container, 'ioca', 'iocIP'), cellText(container, 'ioca', 'caPort'), cellText(container, 'ioca', 'pvaPort')]).toEqual(['10.0.0.1', '5064', '5075']);
});

test('adds extra columns from REACT_APP_IOC_PAGE_EXTRA_COLUMNS', async () => {
  configOverrides.IOC_PAGE_EXTRA_COLUMNS = ['iocid:IOC ID', 'Location'];
  const ioc = channel('IOCA:ENGINEER', 'IOCA');
  ioc.properties.push({ name: 'iocid', value: '10.0.0.1:41234' }, { name: 'Location', value: 'Sector 5' });
  const container = await renderIOC([ioc]);
  expect(headers(container)).toEqual(['IOC Name', 'Host', 'Engineer', 'IOC ID', 'Location', 'Last Recsync Update']);
  expect([cellText(container, 'ioca', 'iocid'), cellText(container, 'ioca', 'Location')]).toEqual(['10.0.0.1:41234', 'Sector 5']);
});

test('shows only the required columns when REACT_APP_IOC_PAGE_EXTRA_COLUMNS is empty', async () => {
  configOverrides.IOC_PAGE_EXTRA_COLUMNS = [];
  const container = await renderIOC([channel('IOCA:ENGINEER', 'IOCA')]);
  expect(headers(container)).toEqual(['IOC Name', 'Host', 'Engineer', 'Last Recsync Update']);
});
