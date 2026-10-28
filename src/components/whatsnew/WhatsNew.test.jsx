import { render, screen } from '@testing-library/react';
import WhatsNew from './WhatsNew';

const configOverrides = vi.hoisted(() => ({}));
vi.mock('../../config', async (importOriginal) => {
  const actual = (await importOriginal()).default;
  return { default: new Proxy({ ...actual }, { get: (target, key) => (key in configOverrides ? configOverrides[key] : target[key]) }) };
});

beforeEach(() => {
  Object.assign(configOverrides, {
    USE_AA: true,
    AA_MAX_PLOT_PVS: 20,
    USE_PVWS: true,
    USE_IOC_PAGE: true,
    IOC_PAGE_EXTRA_COLUMNS: ['iocIP:IOC IP', 'caPort:CA Port'],
    CF_RECORD_TYPE: false,
    EXTRA_PROP: null,
    SECOND_EXTRA_PROP: null,
    PROPERTY_VALUES: 'Acc:SR',
  });
});

test('shows every item when all features are on', () => {
  render(<WhatsNew />);
  expect(screen.getByText(/Plot several PVs together/)).toBeInTheDocument();
  expect(screen.getByText(/Select up to 20 PVs/)).toBeInTheDocument();
  expect(screen.getByText(/Live monitoring uses on\/off switches/)).toBeInTheDocument();
  expect(screen.getByText(/Pick property values from a list/)).toBeInTheDocument();
  expect(screen.getByText('IOCs Page')).toBeInTheDocument();
  expect(screen.getByText(/for IOC IP, CA Port\./)).toBeInTheDocument();
  expect(screen.getByText(/"plot selected"/)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'full release history' })).toBeInTheDocument();
});

test('explains the Advanced search quotes for values with spaces', () => {
  render(<WhatsNew />);
  expect(screen.getByText(/Search for values with spaces/)).toBeInTheDocument();
  expect(screen.getByText('recordDesc=="beam current"')).toBeInTheDocument();
});

test('hides items for features a site has turned off', () => {
  Object.assign(configOverrides, { USE_AA: false, USE_PVWS: false, USE_IOC_PAGE: false });
  render(<WhatsNew />);
  expect(screen.queryByText(/Plot several PVs together/)).not.toBeInTheDocument();
  expect(screen.queryByText(/Live monitoring uses on\/off switches/)).not.toBeInTheDocument();
  expect(screen.queryByText('IOCs Page')).not.toBeInTheDocument();
  expect(screen.queryByText(/"plot selected"/)).not.toBeInTheDocument();
  expect(screen.getByText(/Copy PV names/)).toBeInTheDocument();
});

test('hides a section when none of its items apply', () => {
  configOverrides.IOC_PAGE_EXTRA_COLUMNS = [];
  render(<WhatsNew />);
  expect(screen.queryByText('IOCs Page')).not.toBeInTheDocument();
});

test('the property values item is shown without configured property values, since pvStatus always has a list', () => {
  configOverrides.PROPERTY_VALUES = '';
  render(<WhatsNew />);
  expect(screen.getByText(/Pick property values from a list/)).toBeInTheDocument();
});

test('the live value precision item is shown only when PV Web Socket is used', () => {
  const { unmount } = render(<WhatsNew />);
  expect(screen.getByText(/Live values use the PV's precision/)).toBeInTheDocument();
  unmount();
  configOverrides.USE_PVWS = false;
  render(<WhatsNew />);
  expect(screen.queryByText(/Live values use the PV's precision/)).not.toBeInTheDocument();
});
