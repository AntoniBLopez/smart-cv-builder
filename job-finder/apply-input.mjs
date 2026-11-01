import { buildLetter } from './letter.mjs';
import {
  DEFAULT_EDUCATION_DETAILS,
  DEFAULT_EXPERIENCE_ORDER,
  DEFAULT_HIGHLIGHTS,
  DEFAULT_OTHER_INFO,
  DEFAULT_SKILL_ORDER,
  skillIds,
  skillLabel,
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
import { asObject, rejectUnknown, requireText } from './text.mjs';

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
  const hasLetter = Object.hasOwn(source, 'coverLetter');
  const letter = hasLetter
    ? buildLetter(asObject(source.coverLetter, 'coverLetter'), { language, company, role })
    : null;

  return {
    language,
    company,
    role,
    cv: buildCv(cvInput, language),
    letter,
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
    new Set(skillIds()),
    'cv.skills',
    { min: 1 }
  ).map((id) => skillLabel(id, language));
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

/** File names the generator will write. The cover letter is included only when the input had `coverLetter`. */
export function plannedFiles(job) {
  const names = outputFileNames(job.company, job.role);
  return job.letter ? [names.cv, names.coverLetter] : [names.cv];
}
