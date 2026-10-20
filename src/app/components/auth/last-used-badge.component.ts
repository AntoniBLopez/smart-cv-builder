import { Component, computed, input } from '@angular/core';
import { lastUsedLabel, SignInMethod } from '../../auth/last-sign-in';

/** Label for the sign-in control used on the previous successful login. */
@Component({
  selector: 'app-last-used-badge',
  standalone: true,
  template: `<span class="last-used-badge">{{ label() }}</span>`,
  styles: `
    :host {
      display: inline-flex;
    }

    .last-used-badge {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 999px;
      background: #5d9cec;
      color: #fff;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.01em;
      line-height: 1.4;
      white-space: nowrap;
    }
  `,
})
export class LastUsedBadgeComponent {
  readonly method = input<SignInMethod>('google');
  readonly label = computed(() => lastUsedLabel(this.method()));
}
