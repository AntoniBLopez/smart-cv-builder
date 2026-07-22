/**
 * Light company research from job description URLs / company mentions.
 * Fetches public pages when possible; failures are non-fatal.
 */

const URL_RE = /https?:\/\/[^\s)\]>"']+/gi;

function stripHtml(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function uniqueUrls(urls) {
  const seen = new Set();
  const out = [];
  for (const u of urls) {
    try {
      const parsed = new URL(u.replace(/[.,;]+$/, ''));
      if (!['http:', 'https:'].includes(parsed.protocol)) continue;
      const key = parsed.origin + parsed.pathname;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(parsed.toString());
    } catch {
      /* skip */
    }
  }
  return out;
}

async function fetchText(url, timeoutMs = 6000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; CVBuilderBot/1.0; +https://localhost)',
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });
    if (!res.ok) return null;
    const ctype = res.headers.get('content-type') || '';
    if (!ctype.includes('text') && !ctype.includes('html')) return null;
    const html = await res.text();
    const text = stripHtml(html).slice(0, 6000);
    return text || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function researchFromJobDescription(jobDescription) {
  const jd = String(jobDescription || '');
  const urls = uniqueUrls(jd.match(URL_RE) || []).slice(0, 4);
  const pages = [];

  for (const url of urls) {
    const text = await fetchText(url);
    if (text) {
      pages.push({ url, excerpt: text });
    }
  }

  return {
    urlsFound: urls,
    pages,
    note:
      pages.length > 0
        ? 'Fetched public page excerpts from URLs found in the job description.'
        : 'No fetchable company URLs found in the job description; analyze from JD text and known company context only.',
  };
}
