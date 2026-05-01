import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import {
  beforeEach,
  afterEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import Login from '../src/presentation/pages/Login';

const MockFetch = jest.fn<() => Promise<Partial<Response>>>();

beforeEach(() => {
  globalThis.fetch = MockFetch as unknown as typeof fetch;
  localStorage.clear();
});

afterEach(() => {
  MockFetch.mockReset();
  localStorage.clear();
});

const GoToLoginStep = async () => {
  MockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ taken: true }),
  });

  render(
    <MemoryRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Login />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByPlaceholderText('Digite seu e-mail'), {
    target: { value: 'teste@teste.com' },
  });

  fireEvent.click(screen.getByRole('button', { name: /continuar/i }));

  await waitFor(() => {
    expect(screen.getByPlaceholderText('Senha')).toBeTruthy();
  });
};

describe('handleLogin — login successful.', () => {
  it('the token is saved to localStorage when the API returns success.', async () => {
    await GoToLoginStep();

    const FakeToken = 'jwt-token-abc123';
    const FakeUser = { Nickname: 'Usuário1', ChipBalance: 10000 };

    MockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ Token: FakeToken, User: FakeUser }),
    });

    fireEvent.change(screen.getByPlaceholderText('Senha'), {
      target: { value: 'senhaCorreta123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe(FakeToken);
    });
  });
});

describe('handleLogin — wrong password', () => {
  it('displays an invalid password toast message when the API returns an error.', async () => {
    await GoToLoginStep();

    MockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Unauthorized' }),
    });

    fireEvent.change(screen.getByPlaceholderText('Senha'), {
      target: { value: 'sdenhaErraa123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/SENHA INVÁLIDA/i)).toBeTruthy();
    });

    expect(localStorage.getItem('token')).toBeNull();
  });
});
