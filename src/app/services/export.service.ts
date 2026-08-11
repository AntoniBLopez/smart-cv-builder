import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ExportService {
  async downloadPdf(
    _element: HTMLElement,
    filename: string,
    options?: { atsOnly?: boolean }
  ): Promise<void> {
    const previousTitle = document.title;
    document.title = filename;
    document.body.classList.add('cv-print-mode');
    if (options?.atsOnly) {
      document.body.classList.add('cv-print-ats');
    }

    const cleanup = (): void => {
      document.body.classList.remove('cv-print-mode', 'cv-print-ats');
      document.title = previousTitle;
      window.removeEventListener('afterprint', cleanup);
    };

    window.addEventListener('afterprint', cleanup);

    // Allow print styles to apply before opening the dialog.
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    window.print();
  }
}
