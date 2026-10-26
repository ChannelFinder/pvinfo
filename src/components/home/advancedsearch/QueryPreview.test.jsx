import { render, screen } from '@testing-library/react';
import QueryPreview from './QueryPreview';

const configOverrides = vi.hoisted(() => ({ DETAILS_PAGE_PROPERTIES: 'iocName:IOC Name', EXTRA_PROP: null, SECOND_EXTRA_PROP: null }));
vi.mock('../../../config', async (importOriginal) => {
  const actual = (await importOriginal()).default;
  return { default: new Proxy({ ...actual }, { get: (target, key) => (key in configOverrides ? configOverrides[key] : target[key]) }) };
});

const chips = (container) => [...container.querySelectorAll('.MuiChip-label')].map((chip) => chip.textContent);

test('shows a chip for each part of the query with friendly property names', () => {
  const { container } = render(<QueryPreview query="SR*beam iocName=test* Sector=5 archived" />);
  expect(screen.getByText('Searching for:')).toBeInTheDocument();
  expect(chips(container)).toEqual(['PV name: SR*beam', 'IOC Name = test*', 'Sector = 5', 'archived']);
});

test('shows any PV name for * and marks a property without a value as a warning', () => {
  const { container } = render(<QueryPreview query="* iocName=" />);
  expect(chips(container)).toEqual(['PV name: any', 'IOC Name = …']);
  expect(container.querySelectorAll('.MuiChip-colorWarning')).toHaveLength(1);
});

test('shows nothing for an empty query', () => {
  const { container } = render(<QueryPreview query="  " />);
  expect(container).toBeEmptyDOMElement();
});
