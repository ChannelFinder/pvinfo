import { render, screen, fireEvent, within } from '@testing-library/react';
import AdvancedSearch from './AdvancedSearch';

const configOverrides = vi.hoisted(() => ({
  DETAILS_PAGE_PROPERTIES: 'pvName:PV Name,iocName:IOC Name,hostName:Host Name,*',
  EXTRA_PROP: 'Sector',
  EXTRA_PROP_LABEL: 'Storage Ring Sector',
  SECOND_EXTRA_PROP: null,
  PROPERTY_VALUES: 'Acc:GTB,BR,BTS,SR;mode:Fast Archive',
}));
vi.mock('../../../config', async (importOriginal) => {
  const actual = (await importOriginal()).default;
  return { default: new Proxy({ ...actual }, { get: (target, key) => (key in configOverrides ? configOverrides[key] : target[key]) }) };
});

function renderSearch({ searchProperties = [], searchTags = [], advancedQuery = '', queryError = '' } = {}) {
  const setAdvancedQuery = vi.fn();
  render(
    <AdvancedSearch advancedQuery={advancedQuery} setAdvancedQuery={setAdvancedQuery} handleAdvancedChange={() => {}}
      handleClear={() => {}} searchProperties={searchProperties} searchTags={searchTags} showHelp={true} queryError={queryError} />
  );
  return { setAdvancedQuery };
}

const openDropdown = (name) => fireEvent.click(screen.getByRole('button', { name }));
const listItems = (title) => within(screen.getByText(title).parentElement.parentElement).getAllByRole('button').map((item) => item.textContent);

test('properties use friendly names and are sorted with upper case first', () => {
  renderSearch({ searchProperties: ['iocName', 'Sector', 'archive', 'hostName'], searchTags: ['zeta', 'Alpha'] });
  openDropdown('Props/Tags');
  expect(listItems('Properties')).toEqual(['Host Name', 'IOC Name', 'Storage Ring Sector', 'archive']);
  expect(listItems('Tags')).toEqual(['Alpha', 'zeta']);
});

test('clicking a friendly name adds the Channel Finder property name to the query', () => {
  const { setAdvancedQuery } = renderSearch({ searchProperties: ['iocName'], advancedQuery: 'SR*' });
  openDropdown('Properties');
  fireEvent.click(screen.getByRole('button', { name: 'IOC Name' }));
  expect(setAdvancedQuery).toHaveBeenCalledWith('SR* iocName=');
});

test('only the properties column and label show when there are no tags', () => {
  renderSearch({ searchProperties: ['iocName'] });
  openDropdown('Properties');
  // the button label and the column header
  expect(screen.getAllByText('Properties')).toHaveLength(2);
  expect(screen.queryByText('Tags')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Props/Tags' })).not.toBeInTheDocument();
});

test('the add button is hidden when there are no properties or tags', () => {
  renderSearch();
  expect(screen.queryByRole('button', { name: /Props\/Tags|Properties|Tags/ })).not.toBeInTheDocument();
  expect(screen.queryByText(/to browse the available/)).not.toBeInTheDocument();
});

test('a query error is shown on the search box', () => {
  renderSearch({ advancedQuery: 'SR* iocName=', queryError: 'Enter a value after iocName=, or use iocName=* to match any value' });
  expect(screen.getByText('Enter a value after iocName=, or use iocName=* to match any value')).toBeInTheDocument();
  expect(screen.getByRole('searchbox')).toHaveAttribute('aria-invalid', 'true');
});

test('a property with known values opens its values and picking one adds the whole term', () => {
  const { setAdvancedQuery } = renderSearch({ searchProperties: ['Acc', 'iocName'], advancedQuery: 'SR*' });
  openDropdown('Properties');
  fireEvent.click(screen.getByRole('button', { name: 'Acc' }));
  expect(setAdvancedQuery).not.toHaveBeenCalled();
  // shown in the configured order, after the back button
  expect(listItems('Acc')).toEqual(['Acc', 'GTB', 'BR', 'BTS', 'SR']);
  fireEvent.click(screen.getByRole('button', { name: 'BTS' }));
  expect(setAdvancedQuery).toHaveBeenCalledWith('SR* Acc=BTS ');
});

test('a picked value with spaces is quoted so the value stays one term', () => {
  const { setAdvancedQuery } = renderSearch({ searchProperties: ['mode'], advancedQuery: 'SR*' });
  openDropdown('Properties');
  fireEvent.click(screen.getByRole('button', { name: 'mode' }));
  fireEvent.click(screen.getByRole('button', { name: 'Fast Archive' }));
  expect(setAdvancedQuery).toHaveBeenCalledWith('SR* mode="Fast Archive" ');
});

test('a picked tag with spaces is quoted', () => {
  const { setAdvancedQuery } = renderSearch({ searchTags: ['my tag'], advancedQuery: 'SR*' });
  openDropdown('Tags');
  fireEvent.click(screen.getByRole('button', { name: 'my tag' }));
  expect(setAdvancedQuery).toHaveBeenCalledWith('SR* "my tag"');
});

test('back returns from a property\'s values to the properties list', () => {
  renderSearch({ searchProperties: ['Acc', 'iocName'] });
  openDropdown('Properties');
  fireEvent.click(screen.getByRole('button', { name: 'Acc' }));
  expect(screen.queryByRole('button', { name: 'IOC Name' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Acc' }));
  expect(screen.getByRole('button', { name: 'IOC Name' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'GTB' })).not.toBeInTheDocument();
});
