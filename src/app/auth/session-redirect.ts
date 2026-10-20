import { HttpContextToken } from '@angular/common/http';

/** Session probe requests handle 401 themselves; the interceptor must not redirect. */
export const SKIP_SESSION_REDIRECT = new HttpContextToken<boolean>(() => false);
