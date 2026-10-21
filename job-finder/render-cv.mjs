import { profilePhotoDataUri, robotoFontCss } from './assets.mjs';
import { escapeHtml } from './escape.mjs';

const THEME = {
  primary: '#5D9CEC',
  secondary: '#4A89DC',
  accent: '#E8F2FF',
  text: '#2C3E50',
  background: '#FFFFFF',
  sidebar: '#F8FAFC',
};

/** Professional-template layout with the frontend CV view model. */
export function renderCvHtml(cv) {
  const photo = profilePhotoDataUri();
  const labels = cv.labels;
  return `<!DOCTYPE html>
<html lang="${cv.language}">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(cv.fullName)} — CV</title>
  <style>
    ${robotoFontCss()}
    ${cvCss()}
  </style>
</head>
<body>
  <article class="cv-page professional">
    <aside class="sidebar">
      <div class="photo-wrap">
        <img src="${photo}" alt="${escapeHtml(cv.fullName)}">
      </div>
      <div class="contact-block">
        ${contactItem('✉', cv.contact.email)}
        ${contactItem('☎', cv.contact.phone)}
        ${contactItem(pinIcon(), cv.contact.location, true)}
        ${contactItem('in', cv.contact.linkedin)}
        ${contactItem('⌘', cv.contact.github)}
      </div>
      ${cv.skills.length ? sidebarSection(labels.skills, `<div class="skills-tags">${cv.skills.map((skill) => `<span class="skill-tag">${escapeHtml(skill)}</span>`).join('')}</div>`) : ''}
      ${cv.languages.length ? sidebarSection(labels.languages, cv.languages.map((language) => `<div class="lang-item"><strong>${escapeHtml(language.name)}</strong><em>${escapeHtml(language.level)}</em></div>`).join('')) : ''}
      ${cv.interests.length ? sidebarSection(labels.interests, `<div class="interests-tags">${cv.interests.map((interest) => `<span class="interest-tag">${escapeHtml(interest)}</span>`).join('')}</div>`) : ''}
    </aside>
    <main class="main-content">
      <header class="header-block">
        <h1>${escapeHtml(cv.fullName)}</h1>
        <h2>${escapeHtml(cv.headline)}</h2>
        ${cv.summary ? `<p class="summary">${escapeHtml(cv.summary)}</p>` : ''}
      </header>
      ${experienceSection(cv)}
      ${educationSection(cv)}
      ${otherSection(cv)}
    </main>
  </article>
</body>
</html>`;
}

function contactItem(icon, value, svg = false) {
  return `<div class="contact-item"><span class="icon${svg ? ' icon-svg' : ''}">${icon}</span><span>${softWrap(value)}</span></div>`;
}

/** Allow long URLs to wrap after a slash or dot instead of mid-word. */
function softWrap(value) {
  return escapeHtml(value).replaceAll('/', '/<wbr>').replaceAll('.', '.<wbr>');
}

function pinIcon() {
  return '<svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>';
}

function sidebarSection(title, body) {
  return `<section class="sidebar-section"><h3 class="section-title">${escapeHtml(title)}</h3>${body}</section>`;
}

function experienceSection(cv) {
  if (!cv.experience.length) return '';
  const entries = cv.experience.map((role) => `
    <div class="entry">
      <div class="entry-header">
        <div>
          <h4 class="entry-title">${escapeHtml(role.title)}</h4>
          <strong class="entry-subtitle">${escapeHtml(role.company)}</strong>
        </div>
        <div class="entry-meta">
          <span>${escapeHtml(role.dates)}</span>
          ${role.location ? `<span class="location">${escapeHtml(role.location)}</span>` : ''}
        </div>
      </div>
      ${role.bullets.length ? `<p class="sub-label">${escapeHtml(cv.labels.achievements)}</p><ul>${role.bullets.map((bullet) => `<li class="${bullet.highlight ? 'highlight' : ''}">${escapeHtml(bullet.text)}</li>`).join('')}</ul>` : ''}
    </div>`).join('');
  return `<section class="content-section"><h3 class="section-title">${escapeHtml(cv.labels.experience)}</h3>${entries}</section>`;
}

function educationSection(cv) {
  if (!cv.education.length) return '';
  const entries = cv.education.map((entry) => `
    <div class="entry">
      <div class="entry-header">
        <div>
          <h4 class="entry-title">${escapeHtml(entry.degree)}</h4>
          <strong class="entry-subtitle">${escapeHtml(entry.institution)}</strong>
        </div>
        <div class="entry-meta">
          <span>${escapeHtml(entry.dates)}</span>
          ${entry.location ? `<span class="location">${escapeHtml(entry.location)}</span>` : ''}
        </div>
      </div>
      ${entry.details.length ? `<p class="sub-label">${escapeHtml(cv.labels.knowledge)}</p><ul class="education-list">${entry.details.map((detail) => `<li>${escapeHtml(detail)}</li>`).join('')}</ul>` : ''}
    </div>`).join('');
  return `<section class="content-section keep-together"><h3 class="section-title">${escapeHtml(cv.labels.education)}</h3>${entries}</section>`;
}

function otherSection(cv) {
  if (!cv.other.length) return '';
  return `<section class="content-section keep-together"><h3 class="section-title">${escapeHtml(cv.labels.other)}</h3><ul class="other-list">${cv.other.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section>`;
}

function cvCss() {
  return `
    @page { size: A4 portrait; margin: 0; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #fff; }
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      width: 28%;
      height: 297mm;
      background: ${THEME.sidebar};
      z-index: -1;
    }
    .cv-page.professional {
      display: flex;
      width: 794px;
      min-height: 1123px;
      font-family: Roboto, sans-serif;
      font-size: 13px;
      line-height: 1.42;
      color: ${THEME.text};
      background: ${THEME.background};
    }
    .sidebar {
      width: 28%;
      background: ${THEME.sidebar};
      padding: 32px 18px 32px 20px;
      flex-shrink: 0;
    }
    .photo-wrap { text-align: center; margin-bottom: 24px; }
    .photo-wrap img {
      width: 120px; height: 120px; object-fit: cover; border-radius: 50%;
    }
    .contact-block { margin-bottom: 24px; }
    .contact-item {
      display: flex; align-items: center; gap: 6px;
      margin-bottom: 10px; font-size: 12px; overflow-wrap: break-word;
    }
    .contact-item .icon {
      color: ${THEME.primary}; font-weight: 700; width: 18px; min-width: 18px; height: 18px;
      font-size: 0.9em; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .sidebar-section { margin-bottom: 24px; }
    .section-title {
      color: ${THEME.primary}; font-size: 1.1em; font-weight: 700; text-transform: uppercase;
      letter-spacing: 1px; line-height: 1.15; margin: 0 0 12px; padding-bottom: 1px;
      border-bottom: 2px solid ${THEME.primary};
    }
    .skills-tags, .interests-tags { display: flex; flex-wrap: wrap; gap: 8px; }
    .skill-tag {
      background: ${THEME.accent}; color: ${THEME.secondary};
      padding: 4px 12px; border-radius: 16px; font-size: 0.85em; font-weight: 500;
    }
    .lang-item { margin-bottom: 10px; }
    .lang-item strong { display: block; }
    .lang-item em { font-size: 0.85em; color: #64748b; font-style: italic; }
    .interest-tag {
      border: 1px solid ${THEME.primary}; color: ${THEME.text};
      padding: 4px 12px; border-radius: 16px; font-size: 0.85em;
    }
    .main-content { flex: 1; min-width: 0; padding: 0; }
    .header-block {
      background: ${THEME.primary}; color: #fff; margin-top: 18px; padding: 8px 16px;
    }
    .header-block h1 { margin: 0 0 2px; font-size: 2em; font-weight: 700; }
    .header-block h2 {
      margin: 0 0 12px; padding-bottom: 2px; border-bottom: 1px solid rgba(255,255,255,0.85);
      font-size: 1.15em; font-weight: 400;
    }
    .header-block .summary { margin: 0; font-size: 0.95em; line-height: 1.6; }
    .content-section { padding: 16px 16px 0; }
    .keep-together { break-inside: avoid; page-break-inside: avoid; }
    .content-section:last-child { padding-bottom: 24px; }
    .entry { margin-bottom: 12px; break-inside: avoid; }
    .entry:last-child { margin-bottom: 0; }
    .entry-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 2px; }
    .entry-title { margin: 0; color: ${THEME.primary}; font-size: 1.05em; font-weight: 700; line-height: 1.25; }
    .entry-subtitle { display: block; line-height: 1.25; }
    .entry-meta {
      text-align: right; font-size: 0.85em; color: #64748b; font-style: italic;
      white-space: nowrap; flex-shrink: 0; line-height: 1.25;
    }
    .entry-meta .location { display: block; }
    .sub-label { color: ${THEME.primary}; font-weight: 600; font-size: 0.9em; margin: 2px 0; }
    ul { margin: 0; padding-left: 0; list-style: none; }
    li {
      position: relative; margin-bottom: 2px; padding-left: 14px;
      font-size: 0.9em; font-weight: 500; overflow-wrap: break-word;
    }
    li::before {
      content: ''; position: absolute; left: 0; top: 0.45em;
      width: 5px; height: 5px; background: ${THEME.primary};
    }
    li.highlight { font-weight: 700; }
    li.highlight::before { width: 7px; height: 7px; top: 0.42em; }
    ul.education-list {
      display: grid; grid-template-columns: 1fr 1fr; column-gap: 16px; row-gap: 4px; align-items: start;
    }
    ul.other-list li::before { border-radius: 50%; background: ${THEME.text}; }
  `;
}
