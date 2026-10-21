import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { buildJob, outputFileNames } from './apply-input.mjs';
import { EXPERIENCE } from './profile.mjs';
import { renderCvHtml } from './render-cv.mjs';
import { renderLetterHtml } from './render-letter.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const cvSource = readFileSync(join(root, '../src/app/models/cv.model.ts'), 'utf8');
const schema = JSON.parse(readFileSync(join(root, 'schema.json'), 'utf8'));
const example = JSON.parse(readFileSync(join(root, 'example.job.json'), 'utf8'));

const letter = {
  date: '2026-10-20',
  paragraphs: ['Example paragraph one for the test.', 'Example paragraph two for the test.'],
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
    cv: { skills: ['Vue'] },
    coverLetter: letter,
  }), /Unknown id in cv\.skills/);
});

test('example input produces the documented file names', () => {
  const job = buildJob(example);
  assert.equal(job.company, 'Example Studio');
  assert.deepEqual(outputFileNames(job.company, job.role), {
    cv: 'CV_Example_Studio_Frontend_Developer.pdf',
    coverLetter: 'CoverLetter_Example_Studio_Frontend_Developer.pdf',
  });
  assert.equal(schema.properties.company.type, 'string');
  assert.deepEqual(
    schema.$defs.cv.properties.experienceOrder.items.enum,
    ['explorins', 'mazars', 'freelancer']
  );
});
