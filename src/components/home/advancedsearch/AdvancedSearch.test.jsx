import { render, screen, fireEvent, within } from '@testing-library/react';
import AdvancedSearch from './AdvancedSearch';

const configOverrides = vi.hoisted(() => ({
  DETAILS_PAGE_PROPERTIES: 'pvName:PV Name,iocName:IOC Name,hostName:Host Name,*',
  EXTRA_PROP: 'Sector',
  EXTRA_PROP_LABEL: 'Storage Ring Sector',
  SECOND_EXTRA_PROP: null,
}));
vi.mock('../../../config', async (importOriginal) => {
  const actual = (await importOriginal()).default;
  return { default: new Proxy({ ...actual }, { get: (target, key) => (key in configOverrides ? configOverrides[key] : target[key]) }) };
});

function renderSearch({ searchProperties = [], searchTags = [], advancedQuery = '' } = {}) {
  const setAdvancedQuery = vi.fn();
  render(
    <AdvancedSearch advancedQuery={advancedQuery} setAdvancedQuery={setAdvancedQuery} handleAdvancedChange={() => {}}
      handleClear={() => {}} searchProperties={searchProperties} searchTags={searchTags} showHelp={true} />
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
