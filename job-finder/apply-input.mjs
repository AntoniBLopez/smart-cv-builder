import {
  DEFAULT_EDUCATION_DETAILS,
  DEFAULT_EXPERIENCE_ORDER,
  DEFAULT_HIGHLIGHTS,
  DEFAULT_OTHER_INFO,
  DEFAULT_SKILL_ORDER,
  EDUCATION,
  EXPERIENCE,
  INTERESTS,
  LABELS,
  LANGUAGES,
  OTHER_INFO,
  PROFILE,
  bulletById,
  formatDateRange,
  textOf,
} from './profile.mjs';

const MONTHS = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  es: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
};

export function buildJob(input) {
  const source = asObject(input, 'input');
  rejectUnknown(source, ['$schema', '_comment', 'language', 'company', 'role', 'cv', 'coverLetter'], 'input');

  const language = source.language == null ? 'en' : source.language;
  if (language !== 'en' && language !== 'es') {
    throw new Error('language must be "en" or "es"');
  }

  const company = requireText(source.company, 'company', 80);
  const role = requireText(source.role, 'role', 80);
  const cvInput = source.cv == null ? {} : asObject(source.cv, 'cv');
  const letterInput = asObject(source.coverLetter, 'coverLetter');

  return {
    language,
    company,
    role,
    cv: buildCv(cvInput, language),
    letter: buildLetter(letterInput, { language, company, role }),
  };
}

function buildCv(cvInput, language) {
  rejectUnknown(
    cvInput,
    [
      'headline',
      'summary',
      'skills',
      'experienceOrder',
      'bullets',
      'highlightBullets',
      'educationDetails',
      'interests',
      'otherInfo',
    ],
    'cv'
  );

  const labels = LABELS[language];
  const headline = cvInput.headline == null
    ? textOf(PROFILE.headline, language)
    : requireText(cvInput.headline, 'cv.headline', 120);
  const summary = cvInput.summary == null
    ? textOf(PROFILE.summary, language)
    : requireText(cvInput.summary, 'cv.summary', 700);

  const skills = selectIds(
    cvInput.skills,
    DEFAULT_SKILL_ORDER,
    new Set(DEFAULT_SKILL_ORDER),
    'cv.skills',
    { min: 1 }
  );
  const experienceOrder = selectIds(
    cvInput.experienceOrder,
    DEFAULT_EXPERIENCE_ORDER,
    new Set(EXPERIENCE.map((role) => role.id)),
    'cv.experienceOrder',
    { min: 1 }
  );
  const bulletSelection = parseBulletSelection(cvInput.bullets, experienceOrder);
  const highlights = parseHighlights(cvInput.highlightBullets, experienceOrder, bulletSelection);

  const educationDetails = selectIds(
    cvInput.educationDetails,
    DEFAULT_EDUCATION_DETAILS,
    new Set(DEFAULT_EDUCATION_DETAILS),
    'cv.educationDetails',
    { min: 0 }
  );
  const interests = selectIds(
    cvInput.interests,
    INTERESTS,
    new Set(INTERESTS),
    'cv.interests',
    { min: 0 }
  );
  const otherIds = selectIds(
    cvInput.otherInfo,
    DEFAULT_OTHER_INFO,
    new Set(DEFAULT_OTHER_INFO),
    'cv.otherInfo',
    { min: 0 }
  );

  const experience = experienceOrder.map((roleId) => {
    const role = EXPERIENCE.find((item) => item.id === roleId);
    const selected = bulletSelection.get(roleId) ?? role.bullets.map((bullet) => bullet.id);
    const highlighted = highlights.filter((id) => selected.includes(id));
    const orderedIds = [
      ...highlighted,
      ...selected.filter((id) => !highlighted.includes(id)),
    ];
    return {
      id: role.id,
      title: textOf(role.title, language),
      company: role.company,
      location: textOf(role.location, language),
      dates: formatDateRange(role.startDate, role.endDate, role.current, language),
      bullets: orderedIds.map((id) => {
        const bullet = role.bullets.find((item) => item.id === id);
        return {
          id,
          text: textOf(bullet.text, language),
          highlight: highlighted.includes(id),
        };
      }),
    };
  });

  const education = EDUCATION.map((entry) => ({
    degree: textOf(entry.degree, language),
    institution: textOf(entry.institution, language),
    location: textOf(entry.location, language),
    dates: formatDateRange(entry.startDate, entry.endDate, entry.current, language),
    details: educationDetails.map((id) => textOf(entry.details.find((detail) => detail.id === id).text, language)),
  }));

  return {
    language,
    labels,
    fullName: PROFILE.fullName,
    headline,
    summary,
    contact: {
      email: PROFILE.email,
      phone: PROFILE.phone,
      location: textOf(PROFILE.location, language),
      linkedin: PROFILE.linkedin,
      github: PROFILE.github,
    },
    skills,
    languages: LANGUAGES.map((languageEntry) => ({
      name: languageEntry.name,
      level: textOf(languageEntry.level, language),
    })),
    interests,
    experience,
    education,
    other: otherIds.map((id) => textOf(OTHER_INFO.find((item) => item.id === id).text, language)),
  };
}

function buildLetter(letterInput, { language, company, role }) {
  rejectUnknown(
    letterInput,
    ['recipientName', 'recipientTitle', 'date', 'paragraphs', 'hooks', 'signature'],
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
  const date = formatLetterDate(requireText(letterInput.date, 'coverLetter.date', 40), language);
  const signature = letterInput.signature == null
    ? PROFILE.fullName
    : requireText(letterInput.signature, 'coverLetter.signature', 80);

  const labels = LABELS[language];
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
    date,
    subject: labels.subject(role),
    greeting: recipientName ? labels.greetingNamed(recipientName) : labels.greetingTeam,
    paragraphs,
    hooks,
    closing: labels.closing,
    signature,
  };
}

function parseBulletSelection(value, experienceOrder) {
  if (value == null) return new Map();
  const source = asObject(value, 'cv.bullets');
  const allowedRoles = new Set(experienceOrder);
  const selection = new Map();
  for (const [roleId, ids] of Object.entries(source)) {
    if (!EXPERIENCE.some((role) => role.id === roleId)) {
      throw new Error(`Unknown experience id in cv.bullets: "${roleId}". Allowed: ${EXPERIENCE.map((role) => role.id).join(', ')}`);
    }
    if (!allowedRoles.has(roleId)) {
      throw new Error(`cv.bullets includes "${roleId}", which is not in cv.experienceOrder`);
    }
    const role = EXPERIENCE.find((item) => item.id === roleId);
    const allowed = new Set(role.bullets.map((bullet) => bullet.id));
    selection.set(roleId, selectIds(ids, null, allowed, `cv.bullets.${roleId}`, { min: 1 }));
  }
  return selection;
}

function parseHighlights(value, experienceOrder, bulletSelection) {
  const highlights = value == null
    ? DEFAULT_HIGHLIGHTS
    : selectIds(value, null, new Set(DEFAULT_HIGHLIGHTS.concat(allBulletIds())), 'cv.highlightBullets', { min: 0 });

  const known = new Set(allBulletIds());
  for (const id of highlights) {
    if (!known.has(id)) {
      throw new Error(`Unknown bullet id in cv.highlightBullets: "${id}". Allowed: ${allBulletIds().join(', ')}`);
    }
    const owner = bulletById(id);
    if (!experienceOrder.includes(owner.role.id)) {
      throw new Error(`cv.highlightBullets includes "${id}", but experience "${owner.role.id}" is not selected`);
    }
    const selected = bulletSelection.get(owner.role.id);
    if (selected && !selected.includes(id)) {
      throw new Error(`cv.highlightBullets includes "${id}", but that bullet is not selected in cv.bullets.${owner.role.id}`);
    }
  }

  if (value == null) {
    return highlights.filter((id) => {
      const owner = bulletById(id);
      if (!experienceOrder.includes(owner.role.id)) return false;
      const selected = bulletSelection.get(owner.role.id);
      return !selected || selected.includes(id);
    });
  }
  return highlights;
}

function allBulletIds() {
  return EXPERIENCE.flatMap((role) => role.bullets.map((bullet) => bullet.id));
}

function selectIds(value, fallback, allowed, label, { min }) {
  if (value == null) {
    if (fallback == null) throw new Error(`${label} is required`);
    return [...fallback];
  }
  if (!Array.isArray(value)) throw new Error(`${label} must be an array of strings`);
  const ids = value.map((item, index) => {
    if (typeof item !== 'string' || !item.trim()) {
      throw new Error(`${label}[${index}] must be a non-empty string`);
    }
    return item.trim();
  });
  if (new Set(ids).size !== ids.length) throw new Error(`${label} contains duplicates`);
  if (ids.length < min) throw new Error(`${label} must include at least ${min} item(s)`);
  for (const id of ids) {
    if (!allowed.has(id)) {
      throw new Error(`Unknown id in ${label}: "${id}". Allowed: ${[...allowed].join(', ')}`);
    }
  }
  return ids;
}

function asStringArray(value, label, { min, max, itemMax }) {
  if (!Array.isArray(value)) throw new Error(`${label} must be an array of strings`);
  if (value.length < min || value.length > max) {
    throw new Error(`${label} must contain ${min} to ${max} item(s)`);
  }
  return value.map((item, index) => requireText(item, `${label}[${index}]`, itemMax));
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

function asObject(value, label) {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value;
}

function rejectUnknown(source, allowed, label) {
  for (const key of Object.keys(source)) {
    if (!allowed.includes(key)) throw new Error(`Unknown property ${label}.${key}`);
  }
}

function requireText(value, label, max) {
  if (typeof value !== 'string') throw new Error(`${label} must be a string`);
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${label} must not be empty`);
  if (trimmed.length > max) throw new Error(`${label} must be at most ${max} characters`);
  return trimmed;
}

function optionalText(value, label, max) {
  if (typeof value !== 'string') throw new Error(`${label} must be a string`);
  const trimmed = value.trim();
  if (trimmed.length > max) throw new Error(`${label} must be at most ${max} characters`);
  return trimmed;
}

export function fileSlug(value) {
  const slug = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w.]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  if (!slug) throw new Error(`Cannot build a file name from "${value}"`);
  return slug;
}

export function outputFileNames(company, role) {
  const companySlug = fileSlug(company);
  const roleSlug = fileSlug(role);
  return {
    cv: `CV_${companySlug}_${roleSlug}.pdf`,
    coverLetter: `CoverLetter_${companySlug}_${roleSlug}.pdf`,
  };
}
