import { render, fireEvent, act } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import { MemoryRouter } from 'react-router';
import theme from '../../../theme';
import QueryResults from './QueryResults';

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

// override config settings per test
const configOverrides = vi.hoisted(() => ({}));
vi.mock('../../../config', async (importOriginal) => {
  const actual = (await importOriginal()).default;
  // config is frozen so proxy a copy of it
  return { default: new Proxy({ ...actual }, { get: (target, key) => (key in configOverrides ? configOverrides[key] : target[key]) }) };
});

const pvName = (i) => `PV${String(i).padStart(3, '0')}`;
const cfData = Array.from({ length: 120 }, (_, i) => ({
  name: pvName(i),
  owner: 'owner',
  properties: [{ name: 'pvStatus', value: 'Active' }, { name: 'recordType', value: 'ai' }],
}));

async function renderResults() {
  const props = { isLoading: false, cfData, handleErrorMessage: () => {}, handleOpenErrorAlert: () => {}, handleSeverity: () => {} };
  const { container } = render(<ThemeProvider theme={theme}><MemoryRouter><QueryResults {...props} /></MemoryRouter></ThemeProvider>);
  await act(async () => {});
  return container;
}

const visiblePVs = (container) => [...container.querySelectorAll('.MuiDataGrid-row')].map((row) => pvName(row.getAttribute('data-id')));
const monitorAllCheckbox = (container) => container.querySelector('.MuiDataGrid-columnHeader[data-field="button"] input');
const click = async (element) => { await act(async () => { fireEvent.click(element); }); };
const sortByNameDescending = async (container) => {
  const nameHeader = container.querySelector('.MuiDataGrid-columnHeader[data-field="name"] .MuiDataGrid-columnHeaderTitleContainer');
  await click(nameHeader);
  await click(nameHeader);
};

beforeEach(() => {
  subscribed.clear();
  Object.keys(configOverrides).forEach((key) => delete configOverrides[key]);
  Object.assign(configOverrides, { USE_PVWS: true, PVWS_IGNORE_CF_PVSTATUS: false, RESULTS_TABLE_SIZE: 50, DEFAULT_MONITOR_ALL: false });
});

describe('monitor all', () => {
  test('monitors the PVs on the visible page', async () => {
    const container = await renderResults();
    await click(monitorAllCheckbox(container));
    expect([...subscribed].sort()).toEqual(visiblePVs(container).sort());
    expect(subscribed.size).toBe(50);
  });

  test('monitors the visible page after the table is sorted', async () => {
    const container = await renderResults();
    await sortByNameDescending(container);
    expect(visiblePVs(container)[0]).toBe('PV119');
    await click(monitorAllCheckbox(container));
    expect([...subscribed].sort()).toEqual(visiblePVs(container).sort());
  });

  test('follows the visible page when the table is sorted while checked', async () => {
    const container = await renderResults();
    await click(monitorAllCheckbox(container));
    await sortByNameDescending(container);
    expect(monitorAllCheckbox(container).checked).toBe(true);
    expect([...subscribed].sort()).toEqual(visiblePVs(container).sort());
  });

  test('stops monitoring on page change by default', async () => {
    const container = await renderResults();
    await click(monitorAllCheckbox(container));
    await click(container.querySelector('[aria-label="Go to next page"]'));
    expect(subscribed.size).toBe(0);
    expect(monitorAllCheckbox(container).checked).toBe(false);
  });

  test('is checked after a search and follows page changes with DEFAULT_MONITOR_ALL', async () => {
    configOverrides.DEFAULT_MONITOR_ALL = true;
    const container = await renderResults();
    expect(monitorAllCheckbox(container).checked).toBe(true);
    expect([...subscribed].sort()).toEqual(visiblePVs(container).sort());

    await click(container.querySelector('[aria-label="Go to next page"]'));
    expect(visiblePVs(container)[0]).toBe('PV050');
    expect(monitorAllCheckbox(container).checked).toBe(true);
    expect([...subscribed].sort()).toEqual(visiblePVs(container).sort());
  });

  test('a PV unchecked by the user stays unchecked with DEFAULT_MONITOR_ALL', async () => {
    configOverrides.DEFAULT_MONITOR_ALL = true;
    const container = await renderResults();
    const firstRowCheckbox = container.querySelector('.MuiDataGrid-row[data-id="0"] [data-field="button"] input');
    await click(firstRowCheckbox);
    await act(async () => {});
    expect(subscribed.has('PV000')).toBe(false);
    expect(subscribed.size).toBe(49);
  });

  test('does nothing with DEFAULT_MONITOR_ALL when PVWS is disabled', async () => {
    Object.assign(configOverrides, { DEFAULT_MONITOR_ALL: true, USE_PVWS: false });
    await renderResults();
    expect(subscribed.size).toBe(0);
  });
});
