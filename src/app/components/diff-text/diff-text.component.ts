import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { diffToHtml } from '../../utils/text-diff.util';

@Component({
  selector: 'app-diff-text',
  standalone: true,
  template: `
    @if (useDiff) {
      <span class="diff-text" [innerHTML]="html"></span>
    } @else {
      <span>{{ text }}</span>
    }
  `,
  styles: [
    `
      :host {
        display: contents;
      }
      .diff-text ::ng-deep mark.diff-add {
        background: rgba(46, 213, 115, 0.35);
        color: inherit;
        border-radius: 2px;
        padding: 0 1px;
      }
      .diff-text ::ng-deep mark.diff-del {
        background: rgba(255, 118, 117, 0.4);
        color: inherit;
        border-radius: 2px;
        padding: 0 1px;
        text-decoration: line-through;
      }
    `,
  ],
})
export class DiffTextComponent {
  @Input() text = '';
  @Input() original: string | null | undefined;
  /** When true and original differs, render green/red marks. */
  @Input() diff = false;

  constructor(private sanitizer: DomSanitizer) {}

  get useDiff(): boolean {
    return this.diff && this.original != null && this.original !== this.text;
  }

  get html(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(
      diffToHtml(this.original ?? '', this.text ?? '')
    );
  }
}
