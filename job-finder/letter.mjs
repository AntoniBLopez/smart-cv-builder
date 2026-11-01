import { LABELS, PROFILE, textOf } from './profile.mjs';
import { asStringArray, optionalText, rejectUnknown, requireText } from './text.mjs';

const MONTHS = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  es: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
};

const DEFAULT_LETTER_ACCENT = '#1B3A4B';

/**
 * Target companies already used in a letter template in this repo.
 * CV employers (eXplorins, Forvis Mazars, clients such as Benetton) are omitted:
 * naming them in a letter for someone else is normal.
 */
export const KNOWN_TARGET_COMPANIES = ['Example Studio'];

export function buildLetter(letterInput, { language, company, role }) {
  rejectUnknown(
    letterInput,
    [
      'recipientName',
      'recipientTitle',
      'recipientCity',
      'date',
      'subject',
      'paragraphs',
      'hooks',
      'signature',
      'accentColor',
      'showPhoto',
    ],
    'coverLetter'
  );

  const paragraphs = asStringArray(letterInput.paragraphs, 'coverLetter.paragraphs', {
    min: 2,
    max: 4,
    itemMax: 700,
  });
  const hooks = letterInput.hooks == null
    ? []
    : asStringArray(letterInput.hooks, 'coverLetter.hooks', { min: 0, max: 4, itemMax: 180 });

  const recipientName = letterInput.recipientName == null
    ? ''
    : optionalText(letterInput.recipientName, 'coverLetter.recipientName', 80);
  const recipientTitle = letterInput.recipientTitle == null
    ? ''
    : optionalText(letterInput.recipientTitle, 'coverLetter.recipientTitle', 80);
  const recipientCity = letterInput.recipientCity == null
    ? ''
    : optionalText(letterInput.recipientCity, 'coverLetter.recipientCity', 80);
  const date = formatLetterDate(requireText(letterInput.date, 'coverLetter.date', 40), language);
  const signature = letterInput.signature == null
    ? PROFILE.fullName
    : requireText(letterInput.signature, 'coverLetter.signature', 80);
  const accentColor = parseAccent(letterInput.accentColor);
  const showPhoto = parseShowPhoto(letterInput.showPhoto);
  const labels = LABELS[language];
  const subject = letterInput.subject == null
    ? labels.subject(role)
    : optionalText(letterInput.subject, 'coverLetter.subject', 120);

  assertCoverLetterCompany(company, {
    paragraphs,
    hooks,
    subject: letterInput.subject == null ? '' : subject,
  });

  return {
    language,
    fullName: PROFILE.fullName,
    headline: textOf(PROFILE.headline, language),
    contact: {
      email: PROFILE.email,
      phone: PROFILE.phone,
      location: textOf(PROFILE.location, language),
      linkedin: PROFILE.linkedin,
      github: PROFILE.github,
    },
    company,
    role,
    recipientName,
    recipientTitle,
    recipientCity,
    date,
    subject,
    greeting: recipientName ? labels.greetingNamed(recipientName) : labels.greetingTeam,
    paragraphs,
    hooks,
    closing: labels.closing,
    signature,
    accentColor,
    showPhoto,
  };
}

/**
 * The letterhead prints `company` by itself, so that line cannot prove the
 * paragraphs were written for this company. Check the caller's prose only.
 */
export function assertCoverLetterCompany(company, { paragraphs, hooks, subject }) {
  const text = [...paragraphs, ...hooks, subject]
    .filter((item) => typeof item === 'string' && item.trim())
    .join('\n');

  const foreign = KNOWN_TARGET_COMPANIES.filter(
    (name) => !sameCompany(name, company) && textMentionsCompany(text, name)
  );
  if (foreign.length) {
    throw new Error(
      `coverLetter mentions "${foreign.join('", "')}" but company is "${company}". Refusing to generate a letter written for a different company.`
    );
  }
  if (!textMentionsCompany(text, company)) {
    throw new Error(
      `coverLetter does not mention company "${company}". Refusing to generate a letter that may belong to another company.`
    );
  }
}

export function textMentionsCompany(text, company) {
  const haystack = normalizeCompany(text);
  const needle = normalizeCompany(company);
  if (!needle) return false;
  const pattern = new RegExp(
    `(?<![\\p{L}\\p{N}])${escapeRegExp(needle)}(?![\\p{L}\\p{N}])`,
    'u'
  );
  return pattern.test(haystack);
}

function sameCompany(left, right) {
  return normalizeCompany(left) === normalizeCompany(right);
}

function normalizeCompany(value) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseAccent(value) {
  if (value == null || value === '') return DEFAULT_LETTER_ACCENT;
  if (typeof value !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(value.trim())) {
    throw new Error('coverLetter.accentColor must be a #RRGGBB colour');
  }
  return value.trim();
}

function parseShowPhoto(value) {
  if (value == null) return true;
  if (typeof value !== 'boolean') throw new Error('coverLetter.showPhoto must be true or false');
  return value;
}

function formatLetterDate(value, language) {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!iso) return value;
  const year = Number(iso[1]);
  const month = Number(iso[2]);
  const day = Number(iso[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    throw new Error('coverLetter.date must be a real calendar date (YYYY-MM-DD) or a display string');
  }
  const monthName = MONTHS[language][month - 1];
  return language === 'es' ? `${day} de ${monthName} de ${year}` : `${day} ${monthName} ${year}`;
}
