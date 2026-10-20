#!/usr/bin/env node
import { readFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { buildJob, outputFileNames } from './apply-input.mjs';
import { catalog } from './profile.mjs';
import { htmlToPdf, pdfPageCount } from './pdf.mjs';
import { renderCvHtml } from './render-cv.mjs';
import { renderLetterHtml } from './render-letter.mjs';

const HELP = `Usage:
  npm run generate -- --input job.json --out ./output

Writes CV_<Company>_<Role>.pdf and CoverLetter_<Company>_<Role>.pdf.
No network calls and no LLM. Chrome/Chromium is used only to print HTML to PDF.

Options:
  --input <file>   Job JSON (see job-finder/schema.json and docs/JOB_FINDER.md)
  --out <dir>      Output directory (created if needed)
  --catalog        Print the selectable skill, experience and bullet ids as JSON
  --help           Show this help
`;

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write(HELP);
    return;
  }
  if (args.catalog) {
    process.stdout.write(`${JSON.stringify(catalog(), null, 2)}\n`);
    return;
  }
  if (!args.input || !args.outDir) {
    throw new Error('Both --input and --out are required.\n' + HELP);
  }

  const raw = await readFile(resolve(args.input), 'utf8');
  let json;
  try {
    json = JSON.parse(raw);
  } catch (error) {
    throw new Error(`Could not parse ${args.input}: ${error.message}`);
  }

  const job = buildJob(json);
  const names = outputFileNames(job.company, job.role);
  const outDir = resolve(args.outDir);
  await mkdir(outDir, { recursive: true });

  const cvPath = resolve(outDir, names.cv);
  const letterPath = resolve(outDir, names.coverLetter);
  const cvPdf = await htmlToPdf(renderCvHtml(job.cv), cvPath);
  const letterPdf = await htmlToPdf(renderLetterHtml(job.letter), letterPath);
  const letterPages = pdfPageCount(letterPdf);

  if (letterPages !== 1) {
    throw new Error(
      `Cover letter is ${letterPages} pages. Keep coverLetter.paragraphs to 2-4 short paragraphs so it stays on one page.`
    );
  }

  const result = {
    ok: true,
    language: job.language,
    company: job.company,
    role: job.role,
    files: [cvPath, letterPath],
    pages: {
      cv: pdfPageCount(cvPdf),
      coverLetter: letterPages,
    },
  };
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

function parseArgs(argv) {
  const args = { input: '', outDir: '', help: false, catalog: false };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--help' || token === '-h') args.help = true;
    else if (token === '--catalog') args.catalog = true;
    else if (token === '--input') args.input = requireValue(argv, ++index, token);
    else if (token.startsWith('--input=')) args.input = token.slice('--input='.length);
    else if (token === '--out') args.outDir = requireValue(argv, ++index, token);
    else if (token.startsWith('--out=')) args.outDir = token.slice('--out='.length);
    else throw new Error(`Unknown argument: ${token}\n${HELP}`);
  }
  return args;
}

function requireValue(argv, index, flag) {
  const value = argv[index];
  if (!value || value.startsWith('--')) throw new Error(`${flag} needs a value`);
  return value;
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
