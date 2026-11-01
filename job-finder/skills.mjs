/**
 * Closed skill catalog for Job Finder.
 * `en` is the id accepted in `cv.skills`. `es` is the label on a Spanish CV.
 * Names already on the default CV keep the same label in both languages.
 * DEFAULT_SKILL_ORDER is what is printed when `cv.skills` is omitted.
 */

function skill(en, es = en) {
  return { en, es };
}

export const SKILL_CATALOG = [
  skill('Angular'),
  skill('React'),
  skill('Next.js'),
  skill('JavaScript'),
  skill('TypeScript'),
  skill('Figma'),
  skill('Lovable'),
  skill('Cursor'),
  skill('Node.js'),
  skill('MongoDB'),
  skill('Databases SQL & NoSQL'),
  skill('Git with GitHub & GitLab'),
  skill('Diligent'),
  skill('Methodical'),
  skill('Ambitious'),
  skill('Tailwind CSS'),
  skill('Vue'),
  skill('Redux / Redux Toolkit'),
  skill('Zustand'),
  skill('RxJS'),
  skill('NgRx'),
  skill('GraphQL / Apollo'),
  skill('SASS / SCSS'),
  skill('Styled Components'),
  skill('Material UI / Angular Material'),
  skill('Storybook'),
  skill('Jest'),
  skill('Vitest'),
  skill('Testing Library'),
  skill('Cypress'),
  skill('Playwright'),
  skill('Vite'),
  skill('Webpack'),
  skill('CI/CD (GitHub Actions / GitLab CI)'),
  skill('Vercel'),
  skill('Express'),
  skill('PostgreSQL'),
  skill('Firebase / Supabase'),
  skill('REST APIs', 'APIs REST'),
  skill('PWA / Service Workers'),
  skill('Three.js / WebGL'),
  skill('i18n', 'Internacionalización (i18n)'),
  skill('Accessibility (WCAG)', 'Accesibilidad (WCAG)'),
  skill('Scrum / Agile'),
];

/** Frontend-first order of the skills already listed on the default CV. */
export const DEFAULT_SKILL_ORDER = [
  'Angular',
  'React',
  'Next.js',
  'JavaScript',
  'TypeScript',
  'Figma',
  'Lovable',
  'Cursor',
  'Node.js',
  'MongoDB',
  'Databases SQL & NoSQL',
  'Git with GitHub & GitLab',
  'Diligent',
  'Methodical',
  'Ambitious',
];

const BY_ID = new Map(SKILL_CATALOG.map((entry) => [entry.en, entry]));

if (BY_ID.size !== SKILL_CATALOG.length) {
  throw new Error('Skill catalog ids must be unique');
}
for (const id of DEFAULT_SKILL_ORDER) {
  if (!BY_ID.has(id)) throw new Error(`Default skill missing from catalog: ${id}`);
}

export function skillIds() {
  return SKILL_CATALOG.map((entry) => entry.en);
}

export function skillLabel(id, language) {
  const entry = BY_ID.get(id);
  if (!entry) return id;
  return language === 'es' ? entry.es : entry.en;
}
