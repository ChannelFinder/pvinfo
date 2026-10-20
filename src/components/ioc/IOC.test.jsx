import { render, screen, act } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import { MemoryRouter } from 'react-router';
import theme from '../../theme';
import api from '../../api';
import IOC from './IOC';

vi.mock('../../api', () => ({ default: { CF_QUERY: vi.fn() } }));

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
});

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
