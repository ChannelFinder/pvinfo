import { render, screen } from '@testing-library/react';
import QueryPreview from './QueryPreview';

const configOverrides = vi.hoisted(() => ({ DETAILS_PAGE_PROPERTIES: 'iocName:IOC Name,recordDesc:Description', EXTRA_PROP: null, SECOND_EXTRA_PROP: null, CF_RECORD_TYPE: false, PROPERTY_VALUES: 'Sector:1,5' }));
vi.mock('../../../config', async (importOriginal) => {
  const actual = (await importOriginal()).default;
  return { default: new Proxy({ ...actual }, { get: (target, key) => (key in configOverrides ? configOverrides[key] : target[key]) }) };
});

const chips = (container) => [...container.querySelectorAll('.MuiChip-label')].map((chip) => chip.textContent);

test('shows a chip for each part of the query with friendly property names', () => {
  const { container } = render(<QueryPreview query="SR*beam iocName=test* Sector=5 archived" />);
  expect(screen.getByText('Searching for:')).toBeInTheDocument();
  expect(chips(container)).toEqual(['PV name: *SR*beam*', 'IOC Name = test*', 'Sector = 5', 'archived']);
});

test('shows the wildcards that are added, exact matches, and not equal', () => {
  const { container } = render(<QueryPreview query="SR:beam* recordDesc=temp|fan iocName==test hostName!=sim Sector!=1" />);
  expect(chips(container)).toEqual(['PV name: SR:beam*', 'Description = *temp*|*fan*', 'IOC Name = test', 'hostName ≠ *sim*', 'Sector ≠ 1']);
});

test('shows any PV name for * and marks a property without a value as a warning', () => {
  const { container } = render(<QueryPreview query="* iocName= hostName!=" />);
  expect(chips(container)).toEqual(['PV name: any', 'IOC Name = …', 'hostName ≠ …']);
  expect(container.querySelectorAll('.MuiChip-colorWarning')).toHaveLength(2);
});

test('shows tag= as a tag and marks it as a warning without a tag name', () => {
  const { container } = render(<QueryPreview query="* tag=archived tag=" />);
  expect(chips(container)).toEqual(['PV name: any', 'archived', 'tag = …']);
  expect(container.querySelectorAll('.MuiChip-colorWarning')).toHaveLength(1);
});

test('marks tag!= as a warning', () => {
  const { container } = render(<QueryPreview query="* tag!=archived" />);
  expect(chips(container)).toEqual(['PV name: any', 'tag ≠ archived']);
  expect(container.querySelectorAll('.MuiChip-colorWarning')).toHaveLength(1);
});

test('shows nothing for an empty query', () => {
  const { container } = render(<QueryPreview query="  " />);
  expect(container).toBeEmptyDOMElement();
});
