const TOKEN_KEY = 'token';
const SESSION_KEY = 'session_active';

const COOKIE_OPTIONS = 'path=/; SameSite=Strict; Secure';

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; ${COOKIE_OPTIONS}`;
}

function getCookie(name: string): string | null {
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));
  return match ? match.split('=')[1] : null;
}

function removeCookie(name: string) {
  document.cookie = `${name}=; ${COOKIE_OPTIONS}; Max-Age=0`;
}

export function getToken(): string | null {
  return getCookie(TOKEN_KEY);
}

export function setToken(token: string) {
  setCookie(TOKEN_KEY, token);
}

export function removeToken() {
  removeCookie(TOKEN_KEY);
}

export function isSessionActive(): boolean {
  return getCookie(SESSION_KEY) === 'true';
}

export function setSessionActive(active: boolean) {
  if (active) {
    setCookie(SESSION_KEY, 'true');
  } else {
    removeCookie(SESSION_KEY);
  }
}

export function clearAuthCookies() {
  removeToken();
  setSessionActive(false);
}
