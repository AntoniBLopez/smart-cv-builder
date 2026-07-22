import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ExportService {
  async downloadPdf(_element: HTMLElement, filename: string): Promise<void> {
    const previousTitle = document.title;
    document.title = filename;
    document.body.classList.add('cv-print-mode');

    const cleanup = (): void => {
      document.body.classList.remove('cv-print-mode');
      document.title = previousTitle;
      window.removeEventListener('afterprint', cleanup);
    };

    window.addEventListener('afterprint', cleanup);

    // Allow print styles to apply before opening the dialog.
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    window.print();
  }
}
