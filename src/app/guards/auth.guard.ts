import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService, SessionStatus } from '../services/auth.service';

/**
 * Protected pages stay unmounted until the stored session is confirmed.
 * An expired or rejected token is cleared and the login screen is shown instead.
 */
export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const status = await auth.ensureSession();
  return status === 'valid' ? true : loginTree(router, status);
};

export const guestGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const status = await auth.ensureSession();
  if (status === 'valid') return router.createUrlTree(['/']);
  if (status === 'invalid') return loginTree(router, status);
  return true;
};

function loginTree(router: Router, status: SessionStatus): UrlTree {
  if (status === 'invalid') {
    return router.createUrlTree(['/login'], { queryParams: { session: 'expired' } });
  }
  return router.createUrlTree(['/login']);
}
