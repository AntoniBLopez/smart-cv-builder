/** Escape text for safe HTML insertion. */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Word-level LCS diff → HTML with <mark class="diff-add|diff-del">.
 * Used only for on-screen preview highlights (never for download).
 */
export function diffToHtml(original: string, adapted: string): string {
  const a = String(original ?? '');
  const b = String(adapted ?? '');
  if (a === b) return escapeHtml(b);
  if (!a) return `<mark class="diff-add">${escapeHtml(b)}</mark>`;
  if (!b) return `<mark class="diff-del">${escapeHtml(a)}</mark>`;

  const aTokens = tokenize(a);
  const bTokens = tokenize(b);
  const lcs = buildLcsTable(aTokens, bTokens);

  const parts: string[] = [];
  let i = aTokens.length;
  let j = bTokens.length;

  type Op = { type: 'eq' | 'add' | 'del'; text: string };
  const ops: Op[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && aTokens[i - 1] === bTokens[j - 1]) {
      ops.push({ type: 'eq', text: aTokens[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || lcs[i][j - 1] >= lcs[i - 1][j])) {
      ops.push({ type: 'add', text: bTokens[j - 1] });
      j--;
    } else if (i > 0) {
      ops.push({ type: 'del', text: aTokens[i - 1] });
      i--;
    }
  }

  ops.reverse();

  let buf = '';
  let mode: Op['type'] | null = null;

  const flush = () => {
    if (!buf || !mode) return;
    if (mode === 'eq') parts.push(escapeHtml(buf));
    else if (mode === 'add') parts.push(`<mark class="diff-add">${escapeHtml(buf)}</mark>`);
    else parts.push(`<mark class="diff-del">${escapeHtml(buf)}</mark>`);
    buf = '';
  };

  for (const op of ops) {
    if (op.type !== mode) {
      flush();
      mode = op.type;
    }
    buf += op.text;
  }
  flush();

  return parts.join('');
}

function tokenize(text: string): string[] {
  return text.match(/\s+|[^\s]+/g) || [];
}

function buildLcsTable(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp;
}
