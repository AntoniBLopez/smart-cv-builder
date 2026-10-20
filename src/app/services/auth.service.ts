import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { rememberSignInMethod, SignInMethod } from '../auth/last-sign-in';
import { SKIP_SESSION_REDIRECT } from '../auth/session-redirect';
import {
  clearStoredSession,
  isSessionTokenUsable,
  isUnauthorizedHttpError,
  persistSession,
  readSessionToken,
  readStoredUser,
  StoredAuthUser,
} from '../auth/session-token';

export type AuthUser = StoredAuthUser;

export type SessionStatus = 'valid' | 'anonymous' | 'invalid';

interface AuthResponse {
  token: string;
  user: AuthUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly userSignal = signal<AuthUser | null>(readStoredUser());
  private readonly tokenSignal = signal<string | null>(readSessionToken());
  private readonly cleanups: Array<() => void> = [];
  private sessionEpoch = 0;
  private probeInFlight: Promise<SessionStatus> | null = null;
  private redirecting = false;
  /** Token already rejected, so a failed storage clear cannot bounce the guard forever. */
  private rejectedToken: string | null = null;

  readonly user = this.userSignal.asReadonly();
  readonly token = this.tokenSignal.asReadonly();
  readonly isAuthenticated = computed(() => {
    const token = this.tokenSignal();
    return !!token && isSessionTokenUsable(token);
  });

  /** In-memory caches (CV library, etc.) register here and run on every session clear. */
  registerSessionCleanup(cleanup: () => void): void {
    this.cleanups.push(cleanup);
  }

  /**
   * Confirms the stored token before a protected route renders.
   * Expired or rejected tokens are wiped and reported as `invalid`.
   * A network failure on an unexpired token stays `valid` so a blip is not a logout.
   */
  ensureSession(): Promise<SessionStatus> {
    const token = readSessionToken();
    if (token && token === this.rejectedToken) {
      this.tokenSignal.set(null);
      return Promise.resolve('anonymous');
    }
    if (token !== this.tokenSignal()) this.tokenSignal.set(token);
    if (!token) return Promise.resolve('anonymous');
    if (!isSessionTokenUsable(token)) {
      this.rejectedToken = token;
      this.clearSession();
      return Promise.resolve('invalid');
    }
    if (!this.probeInFlight) {
      const epoch = this.sessionEpoch;
      this.probeInFlight = this.probeSession(epoch).finally(() => {
        this.probeInFlight = null;
      });
    }
    return this.probeInFlight;
  }

  async login(email: string, password: string): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password })
    );
    this.finishSignIn(res, 'email');
  }

  async register(email: string, password: string, name = ''): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, {
        email,
        password,
        name,
      })
    );
    this.finishSignIn(res, 'email');
  }

  async loginWithGoogle(credential: string): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>(`${environment.apiUrl}/auth/google`, { credential })
    );
    this.finishSignIn(res, 'google');
  }

  /** Public runtime config from server/.env (e.g. Google Client ID). */
  getAuthConfig(): Promise<{ googleClientId: string }> {
    return firstValueFrom(
      this.http.get<{ googleClientId: string }>(`${environment.apiUrl}/auth/config`)
    );
  }

  async refreshMe(): Promise<void> {
    await this.ensureSession();
  }

  logout(): void {
    this.clearSession();
    void this.router.navigateByUrl('/login');
  }

  /** 401 from a protected API call: drop the session and leave the editor. */
  expireSession(): void {
    this.clearSession();
    this.redirectToLogin(true);
  }

  private finishSignIn(res: AuthResponse, method: SignInMethod): void {
    this.sessionEpoch += 1;
    this.rejectedToken = null;
    persistSession(res.token, res.user);
    rememberSignInMethod(method);
    this.tokenSignal.set(res.token);
    this.userSignal.set(res.user);
  }

  private async probeSession(epoch: number): Promise<SessionStatus> {
    try {
      const res = await firstValueFrom(
        this.http.get<{ user: AuthUser }>(`${environment.apiUrl}/auth/me`, {
          context: new HttpContext().set(SKIP_SESSION_REDIRECT, true),
        })
      );
      if (epoch !== this.sessionEpoch) return this.snapshotStatus();
      const token = this.tokenSignal();
      if (!token) return 'anonymous';
      persistSession(token, res.user);
      this.userSignal.set(res.user);
      return 'valid';
    } catch (error) {
      if (epoch !== this.sessionEpoch) return this.snapshotStatus();
      if (isUnauthorizedHttpError(error)) {
        this.clearSession();
        return 'invalid';
      }
      return 'valid';
    }
  }

  private snapshotStatus(): SessionStatus {
    const token = this.tokenSignal();
    if (!token) return 'anonymous';
    return isSessionTokenUsable(token) ? 'valid' : 'invalid';
  }

  private clearSession(): void {
    this.sessionEpoch += 1;
    this.rejectedToken = readSessionToken() ?? this.tokenSignal();
    clearStoredSession();
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    for (const cleanup of this.cleanups) {
      cleanup();
    }
  }

  private redirectToLogin(expired: boolean): void {
    const commands = ['/login'];
    const extras = expired ? { queryParams: { session: 'expired' } } : undefined;
    if (this.redirecting) return;
    this.redirecting = true;
    void this.router.navigate(commands, extras).finally(() => {
      this.redirecting = false;
    });
  }
}
