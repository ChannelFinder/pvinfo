import { render, screen } from '@testing-library/react';

// the reloading flag is module state, so each test gets fresh modules
let handlePreloadError, isReloading, ErrorBoundary;
beforeEach(async () => {
  vi.resetModules();
  ({ handlePreloadError, isReloading } = await import('./reloadOnPreloadError'));
  ErrorBoundary = (await import('./ErrorBoundary')).default;
  sessionStorage.clear();
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-10-27T12:00:00'));
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const preloadError = () => new Event('vite:preloadError', { cancelable: true });

test('a page file that fails to load reloads the page', () => {
  const reload = vi.fn();
  const event = preloadError();
  handlePreloadError(event, reload);
  expect(reload).toHaveBeenCalledTimes(1);
  expect(event.defaultPrevented).toBe(true);
  expect(isReloading()).toBe(true);
});

test('does not reload again a few seconds after the last reload, so a broken build cannot reload in a loop', () => {
  handlePreloadError(preloadError(), vi.fn());
  vi.setSystemTime(new Date('2026-10-27T12:00:05'));
  const reload = vi.fn();
  const event = preloadError();
  handlePreloadError(event, reload);
  expect(reload).not.toHaveBeenCalled();
  // the error goes through to the error boundary
  expect(event.defaultPrevented).toBe(false);
});

test('a later deploy in the same tab reloads again', () => {
  handlePreloadError(preloadError(), vi.fn());
  vi.setSystemTime(new Date('2026-10-27T12:30:00'));
  const reload = vi.fn();
  handlePreloadError(preloadError(), reload);
  expect(reload).toHaveBeenCalledTimes(1);
});

test('the error boundary shows a spinner instead of the error while the page reloads', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  handlePreloadError(preloadError(), vi.fn());
  const Broken = () => { throw new Error('page failed'); };
  render(<ErrorBoundary locationKey="a"><Broken /></ErrorBoundary>);
  expect(screen.getByRole('progressbar')).toBeInTheDocument();
  expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
});
