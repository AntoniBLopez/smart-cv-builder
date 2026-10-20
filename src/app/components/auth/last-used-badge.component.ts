import { Component } from '@angular/core';

/** Small label for the sign-in option used on the previous successful login. */
@Component({
  selector: 'app-last-used-badge',
  standalone: true,
  template: `<span class="last-used-badge">Último usado</span>`,
  styles: `
    .last-used-badge {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 999px;
      background: rgba(93, 156, 236, 0.2);
      color: #d6e6ff;
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      line-height: 1.4;
      text-transform: uppercase;
      white-space: nowrap;
    }
  `,
})
export class LastUsedBadgeComponent {}
