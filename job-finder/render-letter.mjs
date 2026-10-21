import { profilePhotoDataUri, robotoFontCss } from './assets.mjs';
import { escapeHtml } from './escape.mjs';

const INK = '#1F2933';
const MUTED = '#5C6B76';

/**
 * Business letter, not a CV page.
 * Navy letterhead, left-aligned blocks, one-inch margins, selectable text.
 */
export function renderLetterHtml(letter) {
  const accent = letter.accentColor;
  const photo = letter.showPhoto
    ? `<img class="portrait" src="${profilePhotoDataUri()}" alt="">`
    : '';
  const contact = [
    letter.contact.email,
    letter.contact.phone,
    letter.contact.location,
    letter.contact.linkedin,
    letter.contact.github,
  ].filter(Boolean).map((item) => escapeHtml(item)).join('<span class="dot"> · </span>');
  const recipient = [
    letter.recipientName,
    letter.recipientTitle,
    letter.company,
    letter.recipientCity,
  ].filter(Boolean);
  const hooks = letter.hooks.length
    ? `<ul class="hooks">${letter.hooks.map((hook) => `<li>${escapeHtml(hook)}</li>`).join('')}</ul>`
    : '';

  return `<!DOCTYPE html>
<html lang="${letter.language}">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(letter.fullName)} — ${escapeHtml(letter.company)}</title>
  <style>
    ${robotoFontCss()}
    ${letterCss(accent)}
  </style>
</head>
<body>
  <article class="letter">
    <header class="letterhead">
      <div class="who">
        ${photo}
        <div>
          <h1>${escapeHtml(letter.fullName)}</h1>
          <p class="role-line">${escapeHtml(letter.headline)}</p>
        </div>
      </div>
      <p class="contact">${contact}</p>
    </header>
    <p class="date">${escapeHtml(letter.date)}</p>
    ${recipient.length ? `<p class="recipient">${recipient.map((line) => escapeHtml(line)).join('<br>')}</p>` : ''}
    ${letter.subject ? `<p class="subject">${escapeHtml(letter.subject)}</p>` : ''}
    <p class="greeting">${escapeHtml(letter.greeting)}</p>
    ${letter.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
    ${hooks}
    <p class="closing">${escapeHtml(letter.closing)}</p>
    <p class="signature">${escapeHtml(letter.signature)}</p>
    <p class="signed-title">${escapeHtml(letter.headline)}</p>
  </article>
</body>
</html>`;
}

function letterCss(accent) {
  return `
    @page { size: A4 portrait; margin: 0; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #fff; }
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .letter {
      width: 794px;
      min-height: 1123px;
      padding: 80px 88px 72px;
      font-family: Roboto, sans-serif;
      font-size: 15px;
      line-height: 1.55;
      color: ${INK};
      background: #fff;
    }
    .letterhead {
      margin: 0 0 28px;
      padding-bottom: 14px;
      border-bottom: 2px solid ${accent};
    }
    .who { display: flex; align-items: center; gap: 14px; }
    .portrait {
      width: 46px; height: 46px; object-fit: cover; border-radius: 50%;
      flex-shrink: 0;
    }
    h1 {
      margin: 0;
      color: ${accent};
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 0.2px;
      line-height: 1.2;
    }
    .role-line { margin: 2px 0 0; color: ${MUTED}; font-size: 13px; }
    .contact {
      margin: 10px 0 0;
      color: ${MUTED};
      font-size: 11.5px;
      line-height: 1.45;
    }
    .dot { color: ${accent}; }
    .date { margin: 0 0 22px; }
    .recipient { margin: 0 0 18px; }
    .subject { margin: 0 0 18px; font-weight: 700; color: ${accent}; }
    .greeting { margin: 0 0 14px; }
    p { margin: 0 0 14px; }
    .hooks {
      margin: 0 0 14px;
      padding-left: 1.15em;
    }
    .hooks li { margin: 0 0 4px; padding-left: 0.15em; }
    .closing { margin: 18px 0 14px; }
    .signature {
      margin: 0;
      color: ${accent};
      font-weight: 700;
      font-size: 16px;
    }
    .signed-title { margin: 2px 0 0; color: ${MUTED}; font-size: 13px; }
  `;
}
