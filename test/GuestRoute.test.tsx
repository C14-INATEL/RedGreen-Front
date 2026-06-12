import { render, screen } from '@testing-library/react';
import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import GuestRoute from '../src/presentation/ui/GuestRoute';

const setTokenCookie = (value: string) => {
  document.cookie = `token=${value}; path=/`;
};

const clearTokenCookie = () => {
  document.cookie = 'token=; Max-Age=0; path=/';
};

const LoginPage = () => <div>Login Page</div>;
const HomePage = () => <div>Home Page</div>;

const RenderWithRouter = (initialEntry: string) => {
  return render(
    <MemoryRouter
      initialEntries={[initialEntry]}
      future={{
        v7_relativeSplatPath: true,
        v7_startTransition: true,
      }}
    >
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
};
describe('GuestRoute - route protection', () => {
  beforeEach(() => {
    clearTokenCookie();
  });
  afterEach(() => {
    clearTokenCookie();
  });

  it('displays the login page when there is no token', () => {
    RenderWithRouter('/login');
    expect(screen.getByText('Login Page')).not.toBeNull();
  });

  it('redirects to the home page when there is a valid token.', () => {
    setTokenCookie('token-fake-123');
    RenderWithRouter('/login');
    expect(screen.getByText('Home Page')).not.toBeNull();
  });

  it('does not redirect when the token is empty.', () => {
    setTokenCookie('');
    RenderWithRouter('/login');
    expect(screen.getByText('Login Page')).not.toBeNull();
  });

  it('displays the login page after removing the token.', () => {
    setTokenCookie('token-fake-123');
    clearTokenCookie();
    RenderWithRouter('/login');
    expect(screen.getByText('Login Page')).not.toBeNull();
  });
});
