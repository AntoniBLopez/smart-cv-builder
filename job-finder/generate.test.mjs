import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { buildJob, outputFileNames, plannedFiles } from './apply-input.mjs';
import { EXPERIENCE, catalog } from './profile.mjs';
import { DEFAULT_SKILL_ORDER, skillIds } from './skills.mjs';
import { renderCvHtml } from './render-cv.mjs';
import { renderLetterHtml } from './render-letter.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const cvSource = readFileSync(join(root, '../src/app/models/cv.model.ts'), 'utf8');
const schema = JSON.parse(readFileSync(join(root, 'schema.json'), 'utf8'));
const example = JSON.parse(readFileSync(join(root, 'example.job.json'), 'utf8'));

const letter = {
  date: '2026-10-20',
  paragraphs: [
    'Example paragraph one for Example Studio.',
    'Example paragraph two for the test at Example Studio.',
  ],
};

test('english experience bullets are copied from the existing CV', () => {
  for (const role of EXPERIENCE) {
    for (const bullet of role.bullets) {
      assert.ok(
        cvSource.includes(bullet.text.en),
        `missing repo bullet ${bullet.id}`
      );
    }
  }
  assert.ok(cvSource.includes('Antoni Bassols López'));
  assert.ok(cvSource.includes('antonilopezdev@gmail.com'));
  assert.ok(cvSource.includes('/images/profile.jpg'));
});

test('defaults put the frontend role first and highlight interface bullets', () => {
  const job = buildJob({
    company: 'Example Studio',
    role: 'Frontend Developer',
    coverLetter: letter,
  });
  assert.equal(job.cv.headline, 'Frontend Developer');
  assert.deepEqual(
    job.cv.experience.map((role) => role.id),
    ['explorins', 'mazars', 'freelancer']
  );
  assert.equal(job.cv.skills[0], 'Angular');
  assert.equal(job.cv.experience[0].bullets[0].id, 'explorins-angular');
  assert.equal(job.cv.experience[0].bullets[0].highlight, true);
  assert.equal(job.cv.experience[0].company, 'eXplorins');
  assert.equal(job.cv.experience[0].dates, '07/2023 – 10/2025');
  assert.match(renderCvHtml(job.cv), /Antoni Bassols López/);
  assert.match(renderCvHtml(job.cv), /class="highlight"/);
});

test('spanish labels and dates do not change employers', () => {
  const job = buildJob({
    language: 'es',
    company: 'Example Studio',
    role: 'Frontend Developer',
    coverLetter: letter,
  });
  assert.equal(job.cv.labels.experience, 'Experiencia');
  assert.equal(job.cv.experience[1].company, 'Forvis Mazars');
  assert.equal(job.cv.experience[1].dates, '10/2025 – 03/2026');
  assert.equal(job.letter.date, '20 de octubre de 2026');
  assert.match(renderLetterHtml(job.letter), /Estimado\/a responsable de selección/);
  assert.match(renderLetterHtml(job.letter), /Asunto: Frontend Developer/);
});

test('selection reorders skills and bullets and rejects invented skills', () => {
  const job = buildJob({
    company: 'Example Studio',
    role: 'Frontend Developer',
    cv: {
      skills: ['TypeScript', 'Angular'],
      experienceOrder: ['freelancer', 'explorins'],
      bullets: { explorins: ['explorins-benetton', 'explorins-angular'] },
      highlightBullets: ['explorins-benetton'],
    },
    coverLetter: {
      ...letter,
      recipientName: 'Example Hiring Manager',
    },
  });
  assert.deepEqual(job.cv.skills, ['TypeScript', 'Angular']);
  assert.deepEqual(job.cv.experience.map((role) => role.id), ['freelancer', 'explorins']);
  assert.deepEqual(
    job.cv.experience[1].bullets.map((bullet) => bullet.id),
    ['explorins-benetton', 'explorins-angular']
  );
  assert.equal(job.cv.experience[1].bullets[0].highlight, true);
  assert.equal(job.letter.greeting, 'Dear Example Hiring Manager,');
  assert.equal(job.letter.subject, 'Re: Frontend Developer');
  assert.equal(job.letter.accentColor, '#1B3A4B');
  const letterHtml = renderLetterHtml(job.letter);
  assert.match(letterHtml, /Re: Frontend Developer/);
  assert.doesNotMatch(letterHtml, /skill-tag|section-title/);
  assert.match(renderCvHtml(job.cv), /#5D9CEC/);
  assert.throws(() => buildJob({
    company: 'Example Studio',
    role: 'Frontend Developer',
    cv: { skills: ['COBOL'] },
    coverLetter: letter,
  }), /Unknown id in cv\.skills/);
});

test('extended skills are selectable and omitted skills stay the default list', () => {
  const omitted = buildJob({
    company: 'Example Studio',
    role: 'Frontend Developer',
    coverLetter: letter,
  });
  assert.deepEqual(omitted.cv.skills, DEFAULT_SKILL_ORDER);
  assert.equal(omitted.cv.skills.includes('Vue'), false);

  const spanish = buildJob({
    language: 'es',
    company: 'Example Studio',
    role: 'Frontend Developer',
    coverLetter: letter,
  });
  assert.deepEqual(spanish.cv.skills, DEFAULT_SKILL_ORDER);

  const selected = buildJob({
    language: 'es',
    company: 'Example Studio',
    role: 'Frontend Developer',
    cv: {
      skills: ['Vue', 'Tailwind CSS', 'Playwright', 'Accessibility (WCAG)', 'REST APIs', 'i18n'],
    },
    coverLetter: letter,
  });
  assert.deepEqual(selected.cv.skills, [
    'Vue',
    'Tailwind CSS',
    'Playwright',
    'Accesibilidad (WCAG)',
    'APIs REST',
    'Internacionalización (i18n)',
  ]);
  assert.match(renderCvHtml(selected.cv), /Accesibilidad \(WCAG\)/);
  assert.deepEqual(catalog().skills, skillIds());
  assert.deepEqual(schema.$defs.cv.properties.skills.items.enum, skillIds());
  assert.ok(catalog().skills.includes('Scrum / Agile'));
});

test('example input produces the documented file names', () => {
  const job = buildJob(example);
  assert.equal(job.company, 'Example Studio');
  assert.deepEqual(outputFileNames(job.company, job.role), {
    cv: 'CV_Example_Studio_Frontend_Developer.pdf',
    coverLetter: 'CoverLetter_Example_Studio_Frontend_Developer.pdf',
  });
  assert.equal(schema.properties.company.type, 'string');
  assert.deepEqual(schema.required, ['company', 'role']);
  assert.deepEqual(plannedFiles(job), [
    'CV_Example_Studio_Frontend_Developer.pdf',
    'CoverLetter_Example_Studio_Frontend_Developer.pdf',
  ]);
  assert.deepEqual(
    schema.$defs.cv.properties.experienceOrder.items.enum,
    ['explorins', 'mazars', 'freelancer']
  );
});

test('omitting coverLetter plans a CV only', () => {
  const job = buildJob({
    company: 'Example Studio',
    role: 'Frontend Developer',
  });
  assert.equal(job.letter, null);
  assert.equal(job.cv.headline, 'Frontend Developer');
  assert.deepEqual(plannedFiles(job), ['CV_Example_Studio_Frontend_Developer.pdf']);
});

test('cover letter must name this company and not a known other target', () => {
  const base = {
    company: 'Northwind',
    role: 'Frontend Developer',
  };
  const dated = { date: '2026-10-20' };

  assert.throws(() => buildJob({
    ...base,
    coverLetter: {
      ...dated,
      paragraphs: [
        'I am writing to Example Studio about the frontend role.',
        'At eXplorins I used Angular and Playwright.',
      ],
    },
  }), /mentions "Example Studio" but company is "Northwind"/);

  assert.throws(() => buildJob({
    ...base,
    coverLetter: {
      ...dated,
      paragraphs: [
        'I am writing to Northwind about the frontend role.',
        'An earlier draft of this letter was for Example Studio.',
      ],
    },
  }), /mentions "Example Studio"/);

  assert.throws(() => buildJob({
    ...base,
    coverLetter: {
      ...dated,
      subject: 'Application',
      paragraphs: [
        'I build interfaces and I would like to join the team.',
        'At eXplorins and Forvis Mazars I shipped Angular and React.',
      ],
    },
  }), /does not mention company "Northwind"/);

  const namedInSubject = buildJob({
    ...base,
    coverLetter: {
      ...dated,
      subject: 'Application to Northwind',
      paragraphs: [
        'I build interfaces and I would like to join the team.',
        'At eXplorins and Forvis Mazars I shipped Angular and React for Benetton.',
      ],
    },
  });
  assert.equal(namedInSubject.letter.company, 'Northwind');
  assert.deepEqual(plannedFiles(namedInSubject), [
    'CV_Northwind_Frontend_Developer.pdf',
    'CoverLetter_Northwind_Frontend_Developer.pdf',
  ]);

  const namedInBody = buildJob({
    ...base,
    coverLetter: {
      ...dated,
      hooks: ['Angular at eXplorins'],
      paragraphs: [
        'I am writing to Northwind about the Frontend Developer role.',
        'At Forvis Mazars I used React, and at eXplorins I used Playwright.',
      ],
    },
  });
  assert.match(namedInBody.letter.paragraphs[1], /eXplorins/);
  assert.equal(namedInBody.letter.subject, 'Re: Frontend Developer');
});
