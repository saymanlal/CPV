import type { AuthResponse, MeResponse } from '@cpv/contracts/auth';

export const authTokenStorageKey = 'cpv.auth.token';

export const getStoredAuthToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(authTokenStorageKey);
};

export const storeAuthToken = (token: string) => {
  window.localStorage.setItem(authTokenStorageKey, token);
};

export const clearAuthToken = () => {
  window.localStorage.removeItem(authTokenStorageKey);
};

const buildHeaders = (token?: string | null) => ({
  'Content-Type': 'application/json',
  ...(token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {}),
});

export const apiRequest = async <TResponse>(path: string, options?: RequestInit): Promise<TResponse> => {
  const response = await fetch(path, {
    ...options,
    headers: {
      ...buildHeaders(),
      ...(options?.headers ?? {}),
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message ?? 'Something went wrong.');
  }

  return payload as TResponse;
};

export const submitAuthForm = async (endpoint: string, payload: unknown): Promise<AuthResponse> => {
  return apiRequest<AuthResponse>(endpoint, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const fetchProfile = async (apiBaseUrl: string, token: string): Promise<MeResponse> => {
  const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
    headers: buildHeaders(token),
    cache: 'no-store',
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message ?? 'Unable to load your profile.');
  }

  return payload as MeResponse;
};
