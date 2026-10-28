import { useEffect } from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

afterEach(() => {
  vi.restoreAllMocks();
});

const Page = ({ broken }) => {
  if (broken) {
    throw new Error('page failed');
  }
  return <div>page</div>;
};

test('shows the error message, and a navigation clears it', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const { rerender } = render(<ErrorBoundary locationKey="a"><Page broken /></ErrorBoundary>);
  expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  expect(screen.getByText('page failed')).toBeInTheDocument();

  // same location, still the error
  rerender(<ErrorBoundary locationKey="a"><Page /></ErrorBoundary>);
  expect(screen.getByText('Something went wrong')).toBeInTheDocument();

  rerender(<ErrorBoundary locationKey="b"><Page /></ErrorBoundary>);
  expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  expect(screen.getByText('page')).toBeInTheDocument();
});

test('a navigation does not remount the page, so a new search keeps the home page state', () => {
  const mounted = vi.fn();
  const MountCounter = () => {
    useEffect(() => mounted(), []);
    return null;
  };
  const { rerender } = render(<ErrorBoundary locationKey="a"><MountCounter /></ErrorBoundary>);
  rerender(<ErrorBoundary locationKey="b"><MountCounter /></ErrorBoundary>);
  expect(mounted).toHaveBeenCalledTimes(1);
});
