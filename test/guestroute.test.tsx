import { render, screen } from '@testing-library/react';
import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import GuestRoute from '../src/presentation/ui/GuestRoute';

const LoginPage = () => <div>Login Page</div>;
const HomePage = () => <div>Home Page</div>;

const renderWithRouter = (initialEntry: string) => {
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
describe('guestRoute - route protection', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('displays the login page when there is no token.', () => {
    renderWithRouter('/login');
    expect(screen.getByText('Login Page')).not.toBeNull();
  });

  it('redirects to the home page when there is a valid token.', () => {
    localStorage.setItem('authToken', 'token-fake-123');
    renderWithRouter('/login');
    expect(screen.getByText('Home Page')).not.toBeNull();
  });

  it('does not redirect when the token is empty.', () => {
    localStorage.setItem('authToken', '');
    renderWithRouter('/login');
    expect(screen.getByText('Login Page')).not.toBeNull();
  });

  it('displays the login page after removing the token.', () => {
    localStorage.setItem('authToken', 'token-fake-123');
    localStorage.removeItem('authToken');
    renderWithRouter('/login');
    expect(screen.getByText('Login Page')).not.toBeNull();
  });
});
