import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/usr/local/bin/google-chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean);

export async function htmlToPdf(html, pdfPath) {
  const chrome = CHROME_CANDIDATES.find((candidate) => existsSync(candidate));
  if (!chrome) {
    throw new Error(
      'Google Chrome or Chromium is required to write PDFs. Set CHROME_PATH to the browser binary.'
    );
  }

  const absolutePdf = resolve(pdfPath);
  const dir = await mkdtemp(join(tmpdir(), 'job-finder-'));
  const htmlPath = join(dir, 'document.html');
  const userData = join(dir, 'chrome-profile');
  await writeFile(htmlPath, html, 'utf8');

  try {
    await run(chrome, [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--no-pdf-header-footer',
      '--hide-scrollbars',
      `--user-data-dir=${userData}`,
      `--print-to-pdf=${absolutePdf}`,
      htmlPath,
    ]);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }

  if (!existsSync(absolutePdf)) {
    throw new Error(`Chrome finished without writing ${absolutePdf}`);
  }
  return readFile(absolutePdf);
}

export function pdfPageCount(buffer) {
  const text = buffer.toString('latin1');
  const matches = text.match(/\/Type\s*\/Page(?!s)/g);
  return matches ? matches.length : 0;
}

function run(command, args) {
  return new Promise((resolveRun, reject) => {
    // Headless Chrome prints the PDF and then keeps the DevTools port open, so
    // the process does not exit on its own. Stop it once the file is written.
    const child = spawn(command, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: true,
    });
    let output = '';
    let settled = false;
    const stop = () => {
      try {
        process.kill(-child.pid, 'SIGKILL');
      } catch {
        child.kill('SIGKILL');
      }
    };
    const finish = (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      stop();
      if (error) reject(error);
      else resolveRun();
    };
    const timer = setTimeout(() => {
      finish(new Error(`Chrome timed out while writing the PDF. ${output.slice(-400)}`));
    }, 30000);
    const onData = (chunk) => {
      output += chunk.toString();
      if (output.includes('bytes written to file')) finish();
    };
    child.stdout.on('data', onData);
    child.stderr.on('data', onData);
    child.on('error', (error) => finish(error));
    child.on('close', (code) => {
      if (output.includes('bytes written to file')) finish();
      else if (code === 0) finish();
      else finish(new Error(`Chrome exited ${code}: ${output.slice(-800)}`));
    });
  });
}
