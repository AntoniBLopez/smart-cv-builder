/** localStorage/cookie access that is safe during server rendering. */

export function readBrowserStorage(key: string): string | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeBrowserStorage(key: string, value: string): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch {
    /* private mode / blocked storage */
  }
}

export function removeBrowserStorage(key: string): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
    /* private mode / blocked storage */
  }
}

/** Drop cookies that may mirror the session keys. Auth itself lives in localStorage. */
export function clearBrowserCookies(names: readonly string[]): void {
  if (typeof document === 'undefined') return;
  for (const name of names) {
    document.cookie = `${name}=; Max-Age=0; path=/`;
  }
}
