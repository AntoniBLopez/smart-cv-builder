import { CvTheme } from '../models/cv.model';

export function getThemeStyles(theme: CvTheme): Record<string, string> {
  return {
    '--cv-primary': theme.primaryColor,
    '--cv-secondary': theme.secondaryColor,
    '--cv-accent': theme.accentColor,
    '--cv-text': theme.textColor,
    '--cv-bg': theme.backgroundColor,
    '--cv-sidebar': theme.sidebarColor,
    '--cv-font': `'${theme.fontFamily}', sans-serif`,
    '--cv-font-size': `${theme.fontSize}px`,
    '--cv-line-height': String(theme.lineHeight),
    '--cv-section-spacing': `${theme.sectionSpacing}px`,
    '--cv-sidebar-width': `${theme.sidebarWidth}%`,
  };
}

export function formatDateRange(start: string, end: string, current: boolean): string {
  const endLabel = current ? 'Present' : end;
  if (!start && !endLabel) return '';
  if (!start) return endLabel;
  if (!endLabel) return start;
  return `${start} – ${endLabel}`;
}

export function photoBorderRadius(shape: CvTheme['photoShape']): string {
  switch (shape) {
    case 'circle':
      return '50%';
    case 'rounded':
      return '12px';
    case 'square':
      return '0';
  }
}
