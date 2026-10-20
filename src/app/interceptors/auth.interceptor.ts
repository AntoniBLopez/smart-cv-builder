import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { SKIP_SESSION_REDIRECT } from '../auth/session-redirect';
import { isCredentialRequest, readSessionToken } from '../auth/session-token';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const injector = inject(Injector);
  const token = readSessionToken();
  const authed = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authed).pipe(
    catchError((error: unknown) => {
      if (shouldEndSession(authed, error)) {
        injector.get(AuthService).expireSession();
      }
      return throwError(() => error);
    })
  );
};

function shouldEndSession(req: HttpRequest<unknown>, error: unknown): boolean {
  if (!(error instanceof HttpErrorResponse) || error.status !== 401) return false;
  if (req.context.get(SKIP_SESSION_REDIRECT)) return false;
  return !isCredentialRequest(req.url);
}
