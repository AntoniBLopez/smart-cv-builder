import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));

const FONT_FACES = [
  ['roboto-400.woff2', 400, 'normal'],
  ['roboto-500.woff2', 500, 'normal'],
  ['roboto-700.woff2', 700, 'normal'],
  ['roboto-400i.woff2', 400, 'italic'],
];

let fontCss;
let photoDataUri;

/** Roboto (same family as the editor) embedded so PDF generation needs no network. */
export function robotoFontCss() {
  if (fontCss) return fontCss;
  fontCss = FONT_FACES.map(([file, weight, style]) => {
    const b64 = readFileSync(join(root, 'fonts', file)).toString('base64');
    return `@font-face{font-family:'Roboto';src:url(data:font/woff2;base64,${b64}) format('woff2');font-weight:${weight};font-style:${style};font-display:block;}`;
  }).join('\n');
  return fontCss;
}

/** Same profile photo the existing CVs use (`public/images/photo-cv.jpg`). */
export function profilePhotoDataUri() {
  if (photoDataUri) return photoDataUri;
  const path = join(root, '../public/images/photo-cv.jpg');
  try {
    const b64 = readFileSync(path).toString('base64');
    photoDataUri = `data:image/jpeg;base64,${b64}`;
    return photoDataUri;
  } catch (error) {
    throw new Error(
      `Profile photo not found at public/images/photo-cv.jpg (${error.message}). The job-finder templates use the same picture as the existing CVs.`
    );
  }
}
