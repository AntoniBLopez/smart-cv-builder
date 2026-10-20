/**
 * Canonical facts for the frontend CV.
 * English strings are copied from `createDefaultCv()` in `src/app/models/cv.model.ts`.
 * Spanish strings are translations of those same facts (same employers, dates, and claims).
 * Nothing here is inferred from a job posting.
 */

export const PROFILE = {
  fullName: 'Antoni Bassols López',
  email: 'antonilopezdev@gmail.com',
  phone: '+34 691788761',
  linkedin: 'linkedin.com/in/antoniblopez',
  github: 'github.com/AntoniBLopez',
  location: { en: 'Barcelona, Spain', es: 'Barcelona, España' },
  headline: { en: 'Frontend Developer', es: 'Desarrollador Frontend' },
  summary: {
    en: 'I develop responsive, scalable, and maintainable websites, prioritizing a user-friendly UX/UI. Recent interface work includes Angular 19 and TypeScript at eXplorins (including a Benetton dashboard), React 19 and TypeScript at Forvis Mazars, and a Next.js educational app at bocabla.com.',
    es: 'Desarrollo sitios web responsive, escalables y mantenibles, priorizando una UX/UI fácil de usar. El trabajo de interfaz reciente incluye Angular 19 y TypeScript en eXplorins (incluido un dashboard para Benetton), React 19 y TypeScript en Forvis Mazars, y una app educativa con Next.js en bocabla.com.',
  },
};

export const LABELS = {
  en: {
    skills: 'Skills',
    languages: 'Languages',
    interests: 'Interests',
    experience: 'Work Experience',
    education: 'Education',
    achievements: 'Achievements',
    knowledge: 'Knowledge',
    other: 'Other Information',
    present: 'Present',
    greetingNamed: (name) => `Dear ${name},`,
    greetingTeam: 'Dear Hiring Team,',
    subject: (role) => `Application for the ${role} position`,
    closing: 'Kind regards,',
  },
  es: {
    skills: 'Competencias',
    languages: 'Idiomas',
    interests: 'Intereses',
    experience: 'Experiencia',
    education: 'Formación',
    achievements: 'Logros',
    knowledge: 'Conocimientos',
    other: 'Otra información',
    present: 'Actualidad',
    greetingNamed: (name) => `Estimado/a ${name}:`,
    greetingTeam: 'Estimado equipo de selección:',
    subject: (role) => `Candidatura para el puesto de ${role}`,
    closing: 'Un saludo,',
  },
};

const LEVELS = {
  'Native Proficiency': { en: 'Native Proficiency', es: 'Competencia nativa' },
  'Full Professional Proficiency': {
    en: 'Full Professional Proficiency',
    es: 'Competencia profesional completa',
  },
};

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

export const SKILLS = DEFAULT_SKILL_ORDER.map((name) => ({ id: name, name }));

export const LANGUAGES = [
  { id: 'catala', name: 'Català', level: LEVELS['Native Proficiency'] },
  { id: 'castellano', name: 'Castellano', level: LEVELS['Native Proficiency'] },
  { id: 'english', name: 'English', level: LEVELS['Full Professional Proficiency'] },
];

export const INTERESTS = ['AI', 'ML', 'DL', 'GenAI', 'LLM'];

export const DEFAULT_EXPERIENCE_ORDER = ['explorins', 'mazars', 'freelancer'];

export const DEFAULT_HIGHLIGHTS = [
  'explorins-angular',
  'explorins-benetton',
  'mazars-stack',
  'freelancer-bocabla',
];

export const EXPERIENCE = [
  {
    id: 'explorins',
    title: { en: 'FrontEnd Developer', es: 'Desarrollador Frontend' },
    company: 'eXplorins',
    location: { en: 'Barcelona, Spain', es: 'Barcelona, España' },
    startDate: '07/2023',
    endDate: '10/2025',
    current: false,
    bullets: [
      {
        id: 'explorins-angular',
        text: {
          en: 'I used Angular 19 with TypeScript, DDD methodology, and Playwright for E2E testing.',
          es: 'Utilicé Angular 19 con TypeScript, metodología DDD y Playwright para pruebas E2E.',
        },
      },
      {
        id: 'explorins-ai',
        text: {
          en: "I created software that implements AI for facial recognition (face-api.js) and gesture recognition (Google's MediaPipe Gesture Recognizer) for an Andorran government project. I worked directly with the client and managed the project, adapting to their needs.",
          es: 'Creé software que implementa IA para reconocimiento facial (face-api.js) y reconocimiento de gestos (MediaPipe Gesture Recognizer de Google) para un proyecto del gobierno de Andorra. Trabajé directamente con el cliente y gestioné el proyecto, adaptándome a sus necesidades.',
        },
      },
      {
        id: 'explorins-benetton',
        text: {
          en: 'I developed an application for Benetton using REST API, and built a dashboard with data analysis for data visualization in an understandable and engaging format.',
          es: 'Desarrollé una aplicación para Benetton usando REST API y construí un dashboard de análisis de datos para visualizarlos de forma comprensible y atractiva.',
        },
      },
    ],
  },
  {
    id: 'mazars',
    title: {
      en: 'Full-Stack Developer / Technical Lead',
      es: 'Desarrollador Full-Stack / Líder técnico',
    },
    company: 'Forvis Mazars',
    location: { en: 'Barcelona, Spain', es: 'Barcelona, España' },
    startDate: '10/2025',
    endDate: '03/2026',
    current: false,
    bullets: [
      {
        id: 'mazars-stack',
        text: {
          en: 'Applied modern stack including React 19, TypeScript, Node.js, GraphQL/LangChain, Codex/Cursor for rapid development, Azure for files management and app deployment, and Scrum/Kanban via Jira/Confluence to deliver scalable AI-integrated features using CI/CD.',
          es: 'Apliqué un stack moderno que incluye React 19, TypeScript, Node.js, GraphQL/LangChain, Codex/Cursor para desarrollo rápido, Azure para la gestión de archivos y el despliegue de la app, y Scrum/Kanban con Jira/Confluence para entregar funcionalidades escalables integradas con IA mediante CI/CD.',
        },
      },
      {
        id: 'mazars-lead',
        text: {
          en: 'Leading technical direction for a team of 4 developers on a key internal platform project, conducting thorough code reviews and pull request approvals to ensure high code quality, maintainability, and alignment with React 19/TypeScript best practices.',
          es: 'Liderando la dirección técnica de un equipo de 4 desarrolladores en un proyecto clave de plataforma interna, con revisiones de código y aprobación de pull requests para asegurar calidad, mantenibilidad y alineación con las buenas prácticas de React 19/TypeScript.',
        },
      },
      {
        id: 'mazars-platform',
        text: {
          en: 'Developing an internal collaboration platform for the entire company and external clients, enabling secure document management, task tracking, request handling, and automated AI agent workflows for streamlined communication and process efficiency.',
          es: 'Desarrollando una plataforma interna de colaboración para toda la empresa y clientes externos, que permite gestión segura de documentos, seguimiento de tareas, gestión de solicitudes y flujos automatizados con agentes de IA.',
        },
      },
    ],
  },
  {
    id: 'freelancer',
    title: { en: 'FullStack Developer', es: 'Desarrollador FullStack' },
    company: 'Freelancer & Solopreneur',
    location: { en: 'Barcelona, Spain', es: 'Barcelona, España' },
    startDate: '11/2021',
    endDate: 'Present',
    current: true,
    bullets: [
      {
        id: 'freelancer-bocabla',
        text: {
          en: 'Built an educational app (like Duolingo) with Next.js, TypeScript, MongoDB, and Stripe, currently serving over 80 clients using Text-to-Speech AI API (ElevenLabs) with a cloned voice that helps students pronounce Spanish words. Link: bocabla.com',
          es: 'Construí una app educativa (como Duolingo) con Next.js, TypeScript, MongoDB y Stripe, que atiende a más de 80 clientes, usando una API de Text-to-Speech (ElevenLabs) con una voz clonada que ayuda a pronunciar palabras en español. Enlace: bocabla.com',
        },
      },
      {
        id: 'freelancer-music',
        text: {
          en: 'Developed a FullStack project for the music industry using React, TypeScript, Node.js, and Express.js and implemented WebSockets to update changes in real-time.',
          es: 'Desarrollé un proyecto FullStack para la industria musical con React, TypeScript, Node.js y Express.js e implementé WebSockets para actualizar los cambios en tiempo real.',
        },
      },
    ],
  },
];

export const EDUCATION = [
  {
    id: 'self-taught',
    degree: { en: 'Software Engineer', es: 'Ingeniero de software' },
    institution: { en: 'Self-taught student', es: 'Estudiante autodidacta' },
    location: '',
    startDate: '11/2021',
    endDate: 'Present',
    current: false,
    details: [
      {
        id: 'edu-oracle',
        text: {
          en: 'Oracle Cloud Infrastructure AI Foundations (Oracle Certified Foundation Associate)',
          es: 'Oracle Cloud Infrastructure AI Foundations (Oracle Certified Foundation Associate)',
        },
      },
      {
        id: 'edu-cs50',
        text: {
          en: 'CS50x Harvard Certificate + Algorithms and Data Structures',
          es: 'Certificado CS50x de Harvard + Algoritmos y estructuras de datos',
        },
      },
      {
        id: 'edu-platzi',
        text: {
          en: 'Software Training at the Platzi Academy + Familiarity with Jest & Cypress Testing Framework',
          es: 'Formación de software en Platzi Academy + familiaridad con los frameworks de testing Jest y Cypress',
        },
      },
      {
        id: 'edu-stack',
        text: {
          en: 'HTML5, CSS3, JavaScript, Angular, React, Redux, Next.js, TypeScript, Tailwind, Figma, Git, Postman, Express.js, Node.js, MongoDB, Stripe, Azure, entre otros...',
          es: 'HTML5, CSS3, JavaScript, Angular, React, Redux, Next.js, TypeScript, Tailwind, Figma, Git, Postman, Express.js, Node.js, MongoDB, Stripe, Azure, entre otros...',
        },
      },
    ],
  },
];

export const DEFAULT_EDUCATION_DETAILS = EDUCATION[0].details.map((detail) => detail.id);

export const OTHER_INFO = [
  {
    id: 'other-team',
    text: {
      en: 'I motivate teammates to achieve shared goals, fostering a positive work environment.',
      es: 'Motivo a los compañeros para alcanzar objetivos compartidos, fomentando un entorno de trabajo positivo.',
    },
  },
  {
    id: 'other-business',
    text: {
      en: 'Business vision and proactivity in contributing ideas.',
      es: 'Visión de negocio y proactividad al aportar ideas.',
    },
  },
];

export const DEFAULT_OTHER_INFO = OTHER_INFO.map((item) => item.id);

export function textOf(value, language) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  return value[language] ?? value.en ?? '';
}

export function formatDateRange(start, end, current, language) {
  const present = LABELS[language].present;
  let endLabel = current ? present : end || '';
  if (endLabel === 'Present') endLabel = present;
  if (!start && !endLabel) return '';
  if (!start) return endLabel;
  if (!endLabel) return start;
  return `${start} – ${endLabel}`;
}

export function bulletById(id) {
  for (const role of EXPERIENCE) {
    const bullet = role.bullets.find((item) => item.id === id);
    if (bullet) return { role, bullet };
  }
  return null;
}

export function catalog() {
  return {
    skills: DEFAULT_SKILL_ORDER,
    experience: EXPERIENCE.map((role) => ({
      id: role.id,
      company: role.company,
      title: role.title,
      bullets: role.bullets.map((bullet) => bullet.id),
    })),
    highlights: DEFAULT_HIGHLIGHTS,
    educationDetails: DEFAULT_EDUCATION_DETAILS,
    interests: INTERESTS,
    otherInfo: DEFAULT_OTHER_INFO,
    languages: ['en', 'es'],
  };
}
