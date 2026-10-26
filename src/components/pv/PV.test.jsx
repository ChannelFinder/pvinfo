import { render, screen, act, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import { MemoryRouter, Route, Routes } from 'react-router';
import theme from '../../theme';
import api from '../../api';
import PV from './PV';

vi.mock('../../api', () => ({ default: { CF_QUERY: vi.fn() } }));

const configOverrides = vi.hoisted(() => ({ USE_PVWS: false, USE_AA: false, USE_OLOG: false, USE_AL: false, USE_CAPUTLOG: false }));
vi.mock('../../config', async (importOriginal) => {
  const actual = (await importOriginal()).default;
  return { default: new Proxy({ ...actual }, { get: (target, key) => (key in configOverrides ? configOverrides[key] : target[key]) }) };
});

test('copy button copies the PV name', async () => {
  api.CF_QUERY.mockResolvedValue([{ name: 'SR:C1:beam', owner: 'owner', properties: [{ name: 'hostName', value: 'host1' }], tags: [] }]);
  Object.defineProperty(window, 'isSecureContext', { value: true, configurable: true });
  Object.defineProperty(navigator, 'clipboard', { value: { writeText: vi.fn(() => Promise.resolve()) }, configurable: true });
  const alerts = { handleErrorMessage: vi.fn(), handleOpenErrorAlert: vi.fn(), handleSeverity: vi.fn() };
  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={['/pv/SR:C1:beam']}>
        <Routes><Route path="/pv/:id" element={<PV {...alerts} />} /></Routes>
      </MemoryRouter>
    </ThemeProvider>
  );
  await act(async () => {});
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Copy PV name' })); });
  expect(navigator.clipboard.writeText).toHaveBeenCalledWith('SR:C1:beam');
  expect(alerts.handleSeverity).toHaveBeenCalledWith('success');
  expect(alerts.handleOpenErrorAlert).toHaveBeenCalledWith(true);
});
