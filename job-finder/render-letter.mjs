import { profilePhotoDataUri, robotoFontCss } from './assets.mjs';
import { escapeHtml } from './escape.mjs';

const THEME = {
  primary: '#5D9CEC',
  secondary: '#4A89DC',
  accent: '#E8F2FF',
  text: '#2C3E50',
  sidebar: '#F8FAFC',
};

/** One-page letter using the same photo, blue header and type as the CV. */
export function renderLetterHtml(letter) {
  const photo = profilePhotoDataUri();
  const hooks = letter.hooks.length
    ? `<ul class="hooks">${letter.hooks.map((hook) => `<li>${escapeHtml(hook)}</li>`).join('')}</ul>`
    : '';
  const recipientLines = [
    letter.recipientName,
    letter.recipientTitle,
    letter.company,
  ].filter(Boolean);

  return `<!DOCTYPE html>
<html lang="${letter.language}">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(letter.fullName)} — ${escapeHtml(letter.company)}</title>
  <style>
    ${robotoFontCss()}
    ${letterCss()}
  </style>
</head>
<body>
  <article class="letter-page">
    <header class="letter-header">
      <img src="${photo}" alt="${escapeHtml(letter.fullName)}">
      <div class="who">
        <h1>${escapeHtml(letter.fullName)}</h1>
        <h2>${escapeHtml(letter.headline)}</h2>
      </div>
    </header>
    <div class="contact-strip">
      <span>${escapeHtml(letter.contact.email)}</span>
      <span>${escapeHtml(letter.contact.phone)}</span>
      <span>${escapeHtml(letter.contact.location)}</span>
      <span>${escapeHtml(letter.contact.linkedin)}</span>
      <span>${escapeHtml(letter.contact.github)}</span>
    </div>
    <div class="letter-body">
      <p class="date">${escapeHtml(letter.date)}</p>
      ${recipientLines.length ? `<p class="recipient">${recipientLines.map((line) => escapeHtml(line)).join('<br>')}</p>` : ''}
      <p class="subject">${escapeHtml(letter.subject)}</p>
      <p class="greeting">${escapeHtml(letter.greeting)}</p>
      ${letter.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
      ${hooks}
      <p class="closing">${escapeHtml(letter.closing)}</p>
      <p class="signature">${escapeHtml(letter.signature)}</p>
    </div>
  </article>
</body>
</html>`;
}

function letterCss() {
  return `
    @page { size: A4 portrait; margin: 0; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #fff; }
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .letter-page {
      width: 794px;
      min-height: 1123px;
      font-family: Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: ${THEME.text};
      background: #fff;
    }
    .letter-header {
      display: flex;
      align-items: center;
      gap: 20px;
      background: ${THEME.primary};
      color: #fff;
      padding: 28px 32px 22px;
    }
    .letter-header img {
      width: 96px; height: 96px; object-fit: cover; border-radius: 50%;
      border: 3px solid #fff; flex-shrink: 0;
    }
    .letter-header h1 { margin: 0 0 4px; font-size: 32px; font-weight: 700; line-height: 1.1; }
    .letter-header h2 {
      margin: 0; font-size: 18px; font-weight: 400;
      border-bottom: 1px solid rgba(255,255,255,0.85); padding-bottom: 4px; display: inline-block;
    }
    .contact-strip {
      display: flex; flex-wrap: wrap; gap: 6px 16px;
      background: ${THEME.sidebar}; color: ${THEME.secondary};
      padding: 10px 32px; font-size: 12px; font-weight: 500;
    }
    .letter-body { padding: 28px 40px 32px; }
    .date { margin: 0 0 16px; text-align: right; color: #64748b; font-style: italic; }
    .recipient { margin: 0 0 16px; font-weight: 500; }
    .subject {
      margin: 0 0 16px; color: ${THEME.primary}; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.6px; font-size: 14px;
      border-bottom: 2px solid ${THEME.primary}; padding-bottom: 4px; display: inline-block;
    }
    .greeting { margin: 0 0 12px; }
    .letter-body p { margin: 0 0 12px; }
    .hooks { margin: 4px 0 14px; padding-left: 0; list-style: none; }
    .hooks li {
      position: relative; margin: 0 0 6px; padding-left: 14px; font-weight: 500;
    }
    .hooks li::before {
      content: ''; position: absolute; left: 0; top: 0.5em;
      width: 5px; height: 5px; background: ${THEME.primary};
    }
    .closing { margin-top: 8px; }
    .signature {
      margin: 0; color: ${THEME.primary}; font-weight: 700; font-size: 16px;
    }
  `;
}
