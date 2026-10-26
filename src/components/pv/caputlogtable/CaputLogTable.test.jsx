import { render, screen } from '@testing-library/react';
import { useSearch } from '@elastic/react-search-ui';
import CaputLogTable from './CaputLogTable';

vi.mock('@elastic/react-search-ui', () => ({
  SearchProvider: ({ children }) => children,
  useSearch: vi.fn(),
}));
vi.mock('../../caputlog/CaputLogSearchLayout', () => ({ default: () => <div>caput log layout</div> }));
vi.mock('../../caputlog/CaputLogDataTable', () => ({ default: () => null }));
vi.mock('@elastic/react-search-ui-views/lib/styles/styles.css', () => ({}));

const searchState = (state) => ({ isLoading: false, wasSearched: true, totalResults: 0, error: '', ...state });

afterEach(() => {
  vi.clearAllMocks();
});

test('shows loading until the first search finishes', () => {
  useSearch.mockReturnValue(searchState({ isLoading: true, wasSearched: false }));
  render(<CaputLogTable pvName="SR:C1:beam" />);
  expect(screen.getByText('Caput Log Data Loading...')).toBeInTheDocument();
});

test('shows no caput log data when the PV has no entries', () => {
  useSearch.mockReturnValue(searchState({ totalResults: 0 }));
  render(<CaputLogTable pvName="SR:C1:beam" />);
  expect(screen.getByText('No Caput Log Data')).toBeInTheDocument();
  expect(screen.queryByText('caput log layout')).not.toBeInTheDocument();
});

test('shows the caput log table when the PV has entries', () => {
  useSearch.mockReturnValue(searchState({ totalResults: 12 }));
  render(<CaputLogTable pvName="SR:C1:beam" />);
  expect(screen.getByText('Caput Log Data')).toBeInTheDocument();
  expect(screen.getByText('caput log layout')).toBeInTheDocument();
});

test('a later search with no results keeps the table so filters can be changed', () => {
  useSearch.mockReturnValue(searchState({ totalResults: 12 }));
  const { rerender } = render(<CaputLogTable pvName="SR:C1:beam" />);
  useSearch.mockReturnValue(searchState({ totalResults: 0 }));
  rerender(<CaputLogTable pvName="SR:C1:beam" />);
  expect(screen.getByText('Caput Log Data')).toBeInTheDocument();
  expect(screen.queryByText('No Caput Log Data')).not.toBeInTheDocument();
});

test('shows an error when the first search fails', () => {
  useSearch.mockReturnValue(searchState({ error: 'connection refused' }));
  render(<CaputLogTable pvName="SR:C1:beam" />);
  expect(screen.getByText('Error Fetching Caput Log Data')).toBeInTheDocument();
});
