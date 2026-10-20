import { readBrowserStorage, writeBrowserStorage } from './browser-storage';

export const LAST_SIGN_IN_KEY = 'cv-builder-last-sign-in';

/** Sign-in methods this app can complete. */
export type SignInMethod = 'email' | 'google';

const METHODS: readonly SignInMethod[] = ['email', 'google'];

/**
 * Last successful sign-in method. Reads storage only in the browser so the
 * helper is safe to import from server-rendered code.
 */
export function readLastSignInMethod(): SignInMethod | null {
  const value = readBrowserStorage(LAST_SIGN_IN_KEY);
  return METHODS.find((method) => method === value) ?? null;
}

/** Kept across logout and session expiry so /login can mark the previous method. */
export function rememberSignInMethod(method: SignInMethod): void {
  writeBrowserStorage(LAST_SIGN_IN_KEY, method);
}

/** Copy placed on the control for that method. Email must name the method. */
export function lastUsedLabel(method: SignInMethod): string {
  return method === 'email' ? 'Último usado: email' : 'Último usado';
}
