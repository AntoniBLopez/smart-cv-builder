export type TemplateId =
  | 'professional'
  | 'classic'
  | 'modern'
  | 'creative'
  | 'executive'
  | 'private-service';

export type FontFamily = 'Roboto' | 'Open Sans' | 'Lato' | 'Merriweather' | 'Montserrat' | 'Inter';

export type PhotoShape = 'circle' | 'square' | 'rounded';

export interface CvTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  backgroundColor: string;
  sidebarColor: string;
  fontFamily: FontFamily;
  fontSize: number;
  lineHeight: number;
  sectionSpacing: number;
  photoShape: PhotoShape;
  showPhoto: boolean;
  sidebarWidth: number;
}

export interface ContactVisibility {
  email: boolean;
  phone: boolean;
  location: boolean;
  linkedin: boolean;
  github: boolean;
  website: boolean;
}

export interface ContactInfo {
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
  visibility: ContactVisibility;
}

export const DEFAULT_CONTACT_VISIBILITY: ContactVisibility = {
  email: true,
  phone: true,
  location: true,
  linkedin: true,
  github: true,
  website: true,
};

export interface Skill {
  id: string;
  name: string;
}

export interface Language {
  id: string;
  name: string;
  level: string;
}

export interface Interest {
  id: string;
  name: string;
}

export interface ExperienceEntry {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  achievements: string[];
}

export interface EducationDetail {
  id: string;
  text: string;
  visible: boolean;
}

export interface EducationEntry {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  description: EducationDetail[];
}

export interface CvSection {
  id: string;
  type: 'experience' | 'education' | 'skills' | 'languages' | 'interests' | 'summary' | 'other';
  label: string;
  visible: boolean;
  order: number;
}

export interface CvData {
  id: string;
  name: string;
  updatedAt: string;
  templateId: TemplateId;
  theme: CvTheme;
  sections: CvSection[];
  personalInfo: {
    fullName: string;
    title: string;
    summary: string;
    photoUrl: string;
  };
  contact: ContactInfo;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: Skill[];
  languages: Language[];
  interests: Interest[];
  otherInfo: string[];
}

export interface CvLibrary {
  activeId: string;
  documents: CvData[];
}

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  description: string;
  previewClass: string;
}

export const DEFAULT_THEME: CvTheme = {
  primaryColor: '#5D9CEC',
  secondaryColor: '#4A89DC',
  accentColor: '#E8F2FF',
  textColor: '#2C3E50',
  backgroundColor: '#FFFFFF',
  sidebarColor: '#F8FAFC',
  fontFamily: 'Roboto',
  fontSize: 14,
  lineHeight: 1.5,
  sectionSpacing: 24,
  photoShape: 'circle',
  showPhoto: true,
  sidebarWidth: 28,
};

export const TEMPLATES: TemplateMeta[] = [
  { id: 'professional', name: 'Professional', description: 'Two-column layout with sidebar', previewClass: 'preview-professional' },
  { id: 'classic', name: 'Classic', description: 'Traditional single-column format', previewClass: 'preview-classic' },
  { id: 'modern', name: 'Modern', description: 'Clean minimal design', previewClass: 'preview-modern' },
  { id: 'creative', name: 'Creative', description: 'Bold asymmetric layout', previewClass: 'preview-creative' },
  { id: 'executive', name: 'Executive', description: 'Elegant dark header style', previewClass: 'preview-executive' },
  {
    id: 'private-service',
    name: 'Private Service',
    description: 'Discreet one-page layout for private household roles',
    previewClass: 'preview-private-service',
  },
];

/** Quiet palette for ultra-luxury private service CVs (no flashy accents). */
export const PRIVATE_SERVICE_THEME: CvTheme = {
  primaryColor: '#2c2a26',
  secondaryColor: '#5c5852',
  accentColor: '#f3f1ec',
  textColor: '#1f1d1a',
  backgroundColor: '#ffffff',
  sidebarColor: '#f7f5f1',
  fontFamily: 'Merriweather',
  fontSize: 12.5,
  lineHeight: 1.45,
  sectionSpacing: 18,
  photoShape: 'square',
  showPhoto: false,
  sidebarWidth: 28,
};

export const FONT_OPTIONS: FontFamily[] = ['Roboto', 'Open Sans', 'Lato', 'Merriweather', 'Montserrat', 'Inter'];

export function createId(): string {
  return crypto.randomUUID();
}

export function createDefaultCv(name = 'Mi CV'): CvData {
  return {
    id: createId(),
    name,
    updatedAt: new Date().toISOString(),
    templateId: 'professional',
    theme: { ...DEFAULT_THEME },
    sections: [
      { id: createId(), type: 'summary', label: 'Summary', visible: true, order: 0 },
      { id: createId(), type: 'experience', label: 'Work Experience', visible: true, order: 1 },
      { id: createId(), type: 'education', label: 'Education', visible: true, order: 2 },
      { id: createId(), type: 'skills', label: 'Skills', visible: true, order: 3 },
      { id: createId(), type: 'languages', label: 'Languages', visible: true, order: 4 },
      { id: createId(), type: 'interests', label: 'Interests', visible: true, order: 5 },
      { id: createId(), type: 'other', label: 'Other Information', visible: true, order: 6 },
    ],
    personalInfo: {
      fullName: 'Antoni Bassols López',
      title: 'Full-Stack Developer',
      summary:
        'I develop responsive, scalable, and maintainable websites, prioritizing a user-friendly UX/UI.',
      photoUrl: '/images/photo-cv.jpg?v=3',
    },
    contact: {
      email: 'antonilopezdev@gmail.com',
      phone: '+34 691788761',
      location: 'Barcelona, Spain',
      linkedin: 'linkedin.com/in/antoniblopez',
      github: 'github.com/AntoniBLopez',
      website: '',
      visibility: { ...DEFAULT_CONTACT_VISIBILITY },
    },
    experience: [
      {
        id: createId(),
        title: 'Full-Stack Developer / Technical Lead',
        company: 'Forvis Mazars',
        location: 'Barcelona, Spain',
        startDate: '10/2025',
        endDate: '03/2026',
        current: false,
        achievements: [
          'Applied modern stack including React 19, TypeScript, Node.js, GraphQL/LangChain, Codex/Cursor for rapid development, Azure for files management and app deployment, and Scrum/Kanban via Jira/Confluence to deliver scalable AI-integrated features using CI/CD.',
          'Leading technical direction for a team of 4 developers on a key internal platform project, conducting thorough code reviews and pull request approvals to ensure high code quality, maintainability, and alignment with React 19/TypeScript best practices.',
          'Developing an internal collaboration platform for the entire company and external clients, enabling secure document management, task tracking, request handling, and automated AI agent workflows for streamlined communication and process efficiency.',
        ],
      },
      {
        id: createId(),
        title: 'FrontEnd Developer',
        company: 'eXplorins',
        location: 'Barcelona, Spain',
        startDate: '07/2023',
        endDate: '10/2025',
        current: false,
        achievements: [
          'I used Angular 19 with TypeScript, DDD methodology, and Playwright for E2E testing.',
          "I created software that implements AI for facial recognition (face-api.js) and gesture recognition (Google's MediaPipe Gesture Recognizer) for an Andorran government project. I worked directly with the client and managed the project, adapting to their needs.",
          'I developed an application for Benetton using REST API, and built a dashboard with data analysis for data visualization in an understandable and engaging format.',
        ],
      },
      {
        id: createId(),
        title: 'FullStack Developer',
        company: 'Freelancer & Solopreneur',
        location: 'Barcelona, Spain',
        startDate: '11/2021',
        endDate: 'Present',
        current: true,
        achievements: [
          'Built an educational app (like Duolingo) with Next.js, TypeScript, MongoDB, and Stripe, currently serving over 80 clients using Text-to-Speech AI API (ElevenLabs) with a cloned voice that helps students pronounce Spanish words. Link: bocabla.com',
          'Developed a FullStack project for the music industry using React, TypeScript, Node.js, and Express.js and implemented WebSockets to update changes in real-time.',
        ],
      },
    ],
    education: [
      {
        id: createId(),
        degree: 'Software Engineer',
        institution: 'Self-taught student',
        location: '',
        startDate: '11/2021',
        endDate: 'Present',
        description: [
          {
            id: createId(),
            text: 'Oracle Cloud Infrastructure AI Foundations (Oracle Certified Foundation Associate)',
            visible: true,
          },
          {
            id: createId(),
            text: 'CS50x Harvard Certificate + Algorithms and Data Structures',
            visible: true,
          },
          {
            id: createId(),
            text: 'Software Training at the Platzi Academy + Familiarity with Jest & Cypress Testing Framework',
            visible: true,
          },
          {
            id: createId(),
            text: 'HTML5, CSS3, JavaScript, Angular, React, Redux, Next.js, TypeScript, Tailwind, Figma, Git, Postman, Express.js, Node.js, MongoDB, Stripe, Azure, entre otros...',
            visible: true,
          },
        ],
      },
    ],
    skills: [
      { id: createId(), name: 'Angular' },
      { id: createId(), name: 'React' },
      { id: createId(), name: 'Next.js' },
      { id: createId(), name: 'JavaScript' },
      { id: createId(), name: 'TypeScript' },
      { id: createId(), name: 'Figma' },
      { id: createId(), name: 'Lovable' },
      { id: createId(), name: 'Cursor' },
      { id: createId(), name: 'Node.js' },
      { id: createId(), name: 'MongoDB' },
      { id: createId(), name: 'Databases SQL & NoSQL' },
      { id: createId(), name: 'Git with GitHub & GitLab' },
      { id: createId(), name: 'Diligent' },
      { id: createId(), name: 'Methodical' },
      { id: createId(), name: 'Ambitious' },
    ],
    languages: [
      { id: createId(), name: 'Català', level: 'Native Proficiency' },
      { id: createId(), name: 'Castellano', level: 'Native Proficiency' },
      { id: createId(), name: 'English', level: 'Full Professional Proficiency' },
    ],
    interests: [
      { id: createId(), name: 'AI' },
      { id: createId(), name: 'ML' },
      { id: createId(), name: 'DL' },
      { id: createId(), name: 'GenAI' },
      { id: createId(), name: 'LLM' },
    ],
    otherInfo: [
      'I motivate teammates to achieve shared goals, fostering a positive work environment.',
      'Business vision and proactivity in contributing ideas.',
    ],
  };
}

/**
 * Preset CV for private chauffeur / household service roles.
 * Content is tailored to HNW private-service postings; adapt dates and employers to your real experience.
 */
export function createPrivateServiceCv(name = 'CV Chófer personal'): CvData {
  return {
    id: createId(),
    name,
    updatedAt: new Date().toISOString(),
    templateId: 'private-service',
    theme: { ...PRIVATE_SERVICE_THEME },
    sections: [
      { id: createId(), type: 'summary', label: 'Perfil profesional', visible: true, order: 0 },
      { id: createId(), type: 'experience', label: 'Experiencia laboral', visible: true, order: 1 },
      { id: createId(), type: 'education', label: 'Formación y licencias', visible: true, order: 2 },
      { id: createId(), type: 'languages', label: 'Idiomas', visible: true, order: 3 },
      { id: createId(), type: 'skills', label: 'Competencias clave', visible: true, order: 4 },
      { id: createId(), type: 'other', label: 'Disponibilidad', visible: true, order: 5 },
      { id: createId(), type: 'interests', label: 'Intereses', visible: false, order: 6 },
    ],
    personalInfo: {
      fullName: 'Antoni Bassols López',
      title:
        'Chófer personal · Carné B vigente · +3 años en servicio privado · Disponibilidad freelance / on-call',
      summary:
        'Chófer personal con más de 3 años de experiencia en servicio privado y ejecutivo de alto nivel. Especializado en transporte discreto, puntual y anticipativo para hogares HNW y clientes exigentes en Barcelona y alrededores. Combino dominio impecable de la conducción, conocimiento exhaustivo de la ciudad y absoluta confidencialidad. Disponible de forma flexible (madrugadas, noches y última hora) con el mismo estándar de excelencia en cada servicio.',
      photoUrl: '',
    },
    contact: {
      email: 'antonilopezdev@gmail.com',
      phone: '+34 691788761',
      location: 'Barcelona, España',
      linkedin: '',
      github: '',
      website: '',
      visibility: {
        email: true,
        phone: true,
        location: true,
        linkedin: false,
        github: false,
        website: false,
      },
    },
    experience: [
      {
        id: createId(),
        title: 'Chófer personal (freelance / on-call)',
        company: 'Hogares privados HNW y servicio ejecutivo',
        location: 'Barcelona y alrededores',
        startDate: '06/2023',
        endDate: '',
        current: true,
        achievements: [
          'Proporcionar transporte seguro, cómodo y puntual al principal, familiares y huéspedes por Barcelona y alrededores.',
          'Planificar rutas y horarios con antelación, anticipando tráfico, eventos y cambios de última hora; llegada sistemática con margen de tiempo.',
          'Mantener la flota en condiciones impecables: limpieza, mantenimiento periódico y documentación siempre al día.',
          'Apoyar la logística entre propiedades del hogar (transporte de objetos y paquetes) y coordinar con el resto del personal según necesidad.',
          'Mantener discreción absoluta respecto a agenda, desplazamientos y asuntos personales en todo momento.',
          'Adaptarse con serenidad a mañanas tempranas, tardes-noche y solicitudes de última hora, manteniendo el mismo nivel de excelencia en cada colaboración.',
        ],
      },
    ],
    education: [
      {
        id: createId(),
        degree: 'Carné de conducir B — vigente y válido en España',
        institution: 'Historial de conducción limpio',
        location: '',
        startDate: '',
        endDate: '',
        description: [
          {
            id: createId(),
            text: 'Sin infracciones relevantes. Experiencia consolidada al volante en entorno urbano e interurbano.',
            visible: true,
          },
          {
            id: createId(),
            text: 'Gestión documental de vehículos: ITV, seguros y revisiones al día.',
            visible: true,
          },
        ],
      },
    ],
    skills: [
      { id: createId(), name: 'Conocimiento profundo de Barcelona y alrededores' },
      { id: createId(), name: 'Anticipación de necesidades y gestión de imprevistos' },
      { id: createId(), name: 'Discreción y confidencialidad absolutas' },
      { id: createId(), name: 'Flexibilidad horaria total (on-call)' },
      { id: createId(), name: 'Mantenimiento de vehículos y gestión documental' },
      { id: createId(), name: 'Presencia calmada en entornos de ultra-lujo' },
      { id: createId(), name: 'Planificación de rutas bajo presión de tiempo' },
      { id: createId(), name: 'Coordinación logística con personal de hogar' },
    ],
    languages: [
      { id: createId(), name: 'Español', level: 'Nativo' },
      { id: createId(), name: 'Catalán', level: 'Nativo' },
      { id: createId(), name: 'Inglés', level: 'B2' },
    ],
    interests: [],
    otherInfo: [
      'Disponibilidad completa para servicios on-call según el calendario del hogar, incluyendo mañanas tempranas, tardes-noche y fines de semana.',
      'Referencias disponibles bajo petición.',
    ],
  };
}

/** Deep clone of a CV with new ids — keeps content, theme, order and visibility. */
export function cloneCv(source: CvData, name?: string): CvData {
  const copy = structuredClone(source) as CvData;
  copy.id = createId();
  copy.name = name?.trim() || `${source.name || 'Mi CV'} (copia)`;
  copy.updatedAt = new Date().toISOString();
  copy.sections = copy.sections.map((s) => ({ ...s, id: createId() }));
  copy.experience = copy.experience.map((e) => ({ ...e, id: createId() }));
  copy.education = copy.education.map((e) => ({
    ...e,
    id: createId(),
    description: normalizeEducationDetails(e.description).map((d) => ({ ...d, id: createId() })),
  }));
  copy.skills = copy.skills.map((s) => ({ ...s, id: createId() }));
  copy.languages = copy.languages.map((l) => ({ ...l, id: createId() }));
  copy.interests = copy.interests.map((i) => ({ ...i, id: createId() }));
  return copy;
}

export function normalizeEducationDetails(
  details: Array<EducationDetail | string> | undefined
): EducationDetail[] {
  if (!Array.isArray(details)) return [];
  return details.map((item) => {
    if (typeof item === 'string') {
      return { id: createId(), text: item, visible: true };
    }
    return {
      id: item.id || createId(),
      text: item.text ?? '',
      visible: item.visible !== false,
    };
  });
}

export function normalizeCv(raw: Partial<CvData> & { otherInfo?: string[] | string }): CvData {
  const base = createDefaultCv();
  const merged = { ...base, ...raw } as CvData;
  if (!merged.name) {
    merged.name = 'Mi CV';
  }
  if (!merged.updatedAt) {
    merged.updatedAt = new Date().toISOString();
  }
  if (!merged.id) {
    merged.id = createId();
  }
  if (!Array.isArray(merged.otherInfo)) {
    merged.otherInfo =
      typeof raw.otherInfo === 'string' && raw.otherInfo
        ? [raw.otherInfo]
        : base.otherInfo;
  }
  merged.education = (merged.education ?? []).map((edu) => ({
    ...edu,
    description: normalizeEducationDetails(
      edu.description as unknown as Array<EducationDetail | string>
    ),
  }));
  merged.contact = normalizeContact(merged.contact);
  return merged;
}

export function normalizeContact(
  raw: Partial<ContactInfo> | undefined
): ContactInfo {
  const base = createDefaultCv().contact;
  const visibility = {
    ...DEFAULT_CONTACT_VISIBILITY,
    ...(raw?.visibility || {}),
  };
  return {
    email: raw?.email ?? base.email,
    phone: raw?.phone ?? base.phone,
    location: raw?.location ?? base.location,
    linkedin: raw?.linkedin ?? base.linkedin,
    github: raw?.github ?? base.github,
    website: raw?.website ?? base.website,
    visibility,
  };
}
