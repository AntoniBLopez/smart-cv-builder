import { clearBrowserCookies, readBrowserStorage, removeBrowserStorage, writeBrowserStorage } from './browser-storage';

export const SESSION_TOKEN_KEY = 'cv-builder-token';
export const SESSION_USER_KEY = 'cv-builder-user';

const SESSION_COOKIE_NAMES = [SESSION_TOKEN_KEY, SESSION_USER_KEY] as const;

export interface StoredAuthUser {
  id: string;
  email: string;
  name: string;
}

interface JwtPayload {
  exp?: number;
}

export function readSessionToken(): string | null {
  return readBrowserStorage(SESSION_TOKEN_KEY);
}

export function readStoredUser(): StoredAuthUser | null {
  const raw = readBrowserStorage(SESSION_USER_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredAuthUser;
    if (!parsed || typeof parsed.email !== 'string' || typeof parsed.id !== 'string') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function persistSession(token: string, user: StoredAuthUser): void {
  writeBrowserStorage(SESSION_TOKEN_KEY, token);
  writeBrowserStorage(SESSION_USER_KEY, JSON.stringify(user));
}

export function clearStoredSession(): void {
  removeBrowserStorage(SESSION_TOKEN_KEY);
  removeBrowserStorage(SESSION_USER_KEY);
  clearBrowserCookies(SESSION_COOKIE_NAMES);
}

/** A token we can still present: three segments and an unexpired `exp` claim. */
export function isSessionTokenUsable(token: string, nowMs = Date.now()): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return false;
  return payload.exp * 1000 > nowMs;
}

export function isUnauthorizedHttpError(error: unknown): boolean {
  return (error as { status?: number } | null)?.status === 401;
}

export function isCredentialRequest(url: string): boolean {
  return ['/auth/login', '/auth/register', '/auth/google', '/auth/config'].some((path) =>
    url.includes(path)
  );
}

function decodeJwtPayload(token: string): JwtPayload | null {
  const segment = token.split('.')[1];
  if (!segment) return null;
  try {
    const json = JSON.parse(decodeBase64Url(segment)) as unknown;
    if (!json || typeof json !== 'object') return null;
    return json as JwtPayload;
  } catch {
    return null;
  }
}

function decodeBase64Url(segment: string): string {
  const padded = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (padded.length % 4)) % 4;
  return atob(padded + '='.repeat(padLength));
}
