import { API_BASE_URL } from '@/lib/api';

// Customer auth backed by the server's JWT API (/api/user/*). The token lives
// in localStorage; components subscribe to AUTH_EVENT to react to login/logout.
const TOKEN_KEY = 'ecomus_token';
const USER_KEY = 'ecomus_user';
const AUTH_EVENT = 'auth-changed';

export interface AuthUser {
  id: string;
  name: string;
  mobile?: string;
  email?: string;
  address?: string;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function subscribeAuth(callback: () => void): () => void {
  window.addEventListener(AUTH_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(AUTH_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

// Fetch wrapper that attaches the Bearer token and surfaces API error messages.
export async function authFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    // Token no longer maps to a real account (e.g. admin deleted this
    // customer) — drop the stale local session so the UI reflects it.
    if (res.status === 401 && token) logout();
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data as T;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: AuthUser;
}

/** Register a new account — active immediately, no verification step. */
export async function apiRegister(body: {
  name: string;
  mobile: string;
  email: string;
  password: string;
  address?: string;
}) {
  const data = await authFetch<AuthResponse>('/user/register', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  saveSession(data.token, data.user);
  return data;
}

/** Log in with a mobile number only. */
export async function apiLogin(mobile: string, password: string) {
  const data = await authFetch<AuthResponse>('/user/login', {
    method: 'POST',
    body: JSON.stringify({ mobile, password }),
  });
  saveSession(data.token, data.user);
  return data;
}

/** Request a password-reset link by email. */
export async function apiForgotPassword(email: string) {
  return authFetch<{ success: boolean; message: string }>('/user/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

/** Confirm the emailed reset token and set a new password — signs the user in on success. */
export async function apiResetPassword(email: string, token: string, password: string) {
  const data = await authFetch<AuthResponse>('/user/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, token, password }),
  });
  saveSession(data.token, data.user);
  return data;
}
