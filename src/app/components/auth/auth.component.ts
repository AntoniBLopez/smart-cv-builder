import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, string | number>
          ) => void;
          cancel: () => void;
        };
      };
    };
  }
}

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
})
export class AuthComponent implements AfterViewInit, OnDestroy {
  private auth = inject(AuthService);
  private router = inject(Router);
  private zone = inject(NgZone);

  private googleBtn = viewChild<ElementRef<HTMLDivElement>>('googleBtn');
  private scriptEl: HTMLScriptElement | null = null;
  private googleClientId = '';

  mode = signal<'login' | 'register'>('login');
  email = '';
  password = '';
  name = '';
  error = signal('');
  loading = signal(false);
  googleReady = signal(false);

  ngAfterViewInit(): void {
    void this.initGoogleSignIn();
  }

  ngOnDestroy(): void {
    window.google?.accounts.id.cancel();
    this.scriptEl?.remove();
  }

  switchMode(mode: 'login' | 'register'): void {
    this.mode.set(mode);
    this.error.set('');
  }

  async submit(): Promise<void> {
    this.error.set('');
    this.loading.set(true);
    try {
      if (this.mode() === 'login') {
        await this.auth.login(this.email, this.password);
      } else {
        await this.auth.register(this.email, this.password, this.name);
      }
      await this.router.navigateByUrl('/');
    } catch (err: unknown) {
      const message =
        (err as { error?: { message?: string } })?.error?.message ||
        'No se pudo completar la operación';
      this.error.set(message);
    } finally {
      this.loading.set(false);
    }
  }

  private async initGoogleSignIn(): Promise<void> {
    try {
      const config = await this.auth.getAuthConfig();
      this.googleClientId = (config.googleClientId || '').trim();
      if (!this.googleClientId) {
        this.googleReady.set(false);
        return;
      }
      await this.loadGoogleScript();
      this.googleReady.set(true);
      // Wait for *ngIf / @if to render the button host
      setTimeout(() => this.renderGoogleButton(), 0);
    } catch {
      this.googleReady.set(false);
    }
  }

  private loadGoogleScript(): Promise<void> {
    if (window.google?.accounts?.id) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(
        'script[data-google-gsi]'
      );
      if (existing) {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject());
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.dataset['googleGsi'] = 'true';
      script.onload = () => resolve();
      script.onerror = () => reject();
      this.scriptEl = script;
      document.head.appendChild(script);
    });
  }

  private renderGoogleButton(): void {
    const el = this.googleBtn()?.nativeElement;
    if (!el || !window.google?.accounts?.id || !this.googleClientId) return;

    window.google.accounts.id.initialize({
      client_id: this.googleClientId,
      callback: (response) => {
        void this.zone.run(() => this.handleGoogleCredential(response.credential));
      },
    });

    el.innerHTML = '';
    window.google.accounts.id.renderButton(el, {
      theme: 'outline',
      size: 'large',
      width: 360,
      text: 'continue_with',
      shape: 'rectangular',
      logo_alignment: 'left',
    });
  }

  private async handleGoogleCredential(credential: string): Promise<void> {
    this.error.set('');
    this.loading.set(true);
    try {
      await this.auth.loginWithGoogle(credential);
      await this.router.navigateByUrl('/');
    } catch (err: unknown) {
      const message =
        (err as { error?: { message?: string } })?.error?.message ||
        'No se pudo iniciar sesión con Google';
      this.error.set(message);
    } finally {
      this.loading.set(false);
    }
  }
}
