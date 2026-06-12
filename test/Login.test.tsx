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

const mockSetToken = jest.fn();

jest.mock('@/infrastructure/Cookies', () => ({
  setToken: (token: string) => mockSetToken(token),
}));

const clearTokenCookie = () => {
  document.cookie = 'token=; Max-Age=0; path=/';
};

type ApiGetMock = (
  Url: string,
  Config?: Record<string, unknown>
) => Promise<{ data: Record<string, unknown>; status?: number }>;

type ApiPostMock = (
  Url: string,
  Payload?: Record<string, unknown>
) => Promise<{ data: Record<string, unknown>; status?: number }>;

const MockApiGet = jest.fn<ApiGetMock>();
const MockApiPost = jest.fn<ApiPostMock>();

jest.mock('@infrastructure/http/client', () => ({
  apiClient: {
    get: (Url: string, Config?: Record<string, unknown>) =>
      MockApiGet(Url, Config),
    post: (Url: string, Payload?: Record<string, unknown>) =>
      MockApiPost(Url, Payload),
  },
}));

beforeEach(() => {
  clearTokenCookie();
  mockSetToken.mockReset();
  MockApiGet.mockReset();
  MockApiPost.mockReset();
});

afterEach(() => {
  clearTokenCookie();
  mockSetToken.mockReset();
});

const GoToLoginStep = async () => {
  MockApiGet.mockResolvedValueOnce({
    data: { taken: true },
    status: 200,
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

describe('handleLogin - login successful.', () => {
  it('the token is saved to cookies when the API returns success.', async () => {
    await GoToLoginStep();

    const FakeToken = 'jwt-token-abc123';
    const FakeUser = { Nickname: 'Usuario1', ChipBalance: 10000 };

    MockApiPost.mockResolvedValueOnce({
      data: { Token: FakeToken, User: FakeUser },
      status: 200,
    });

    fireEvent.change(screen.getByPlaceholderText('Senha'), {
      target: { value: 'senhaCorreta123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(mockSetToken).toHaveBeenCalledWith(FakeToken);
    });
  });
});

describe('handleLogin - wrong password', () => {
  it('displays an invalid password toast message when the API returns an error.', async () => {
    await GoToLoginStep();

    MockApiPost.mockRejectedValueOnce({
      response: {
        status: 401,
      },
    });

    fireEvent.change(screen.getByPlaceholderText('Senha'), {
      target: { value: 'sdenhaErraa123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/SENHA INVÁLIDA/i)).toBeTruthy();
    });

    expect(mockSetToken).not.toHaveBeenCalled();
  });
});

describe('handleLogin - deleted account', () => {
  it('warns that the email can no longer be used to access the deleted account', async () => {
    await GoToLoginStep();

    MockApiPost.mockRejectedValueOnce({
      response: {
        status: 401,
        data: {
          message: 'User is not active',
          error: 'Unauthorized',
          statusCode: 401,
        },
      },
    });

    fireEvent.change(screen.getByPlaceholderText('Senha'), {
      target: { value: 'senhaCorreta123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(
        screen.getByText(
          /NÃO É MAIS POSSÍVEL ACESSAR UMA CONTA COM O E-MAIL INFORMADO/i
        )
      ).toBeTruthy();
    });

    expect(
      screen.getByText(/CRIE UMA NOVA CONTA COM OUTRO E-MAIL/i)
    ).toBeTruthy();
    expect(mockSetToken).not.toHaveBeenCalled();
  });
});
