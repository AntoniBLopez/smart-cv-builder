import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { researchFromJobDescription } from '../services/company-research.js';
import {
  ATS_ADAPT_SYSTEM_PROMPT,
  completeJsonWithFailover,
} from '../services/ai-client.js';

const router = Router();

router.use(requireAuth);

/** Strip heavy/binary fields so prompts stay within token limits. */
function sanitizeCv(cv) {
  if (!cv || typeof cv !== 'object') return {};
  const clone = structuredClone(cv);
  if (clone.personalInfo?.photoUrl?.startsWith('data:')) {
    clone.personalInfo.photoUrl = '[photo omitted]';
  }
  delete clone.userId;
  return clone;
}

/** Merge AI text adaptations onto the original CV, preserving structure/ids. */
function mergeAdaptedCv(original, patch) {
  const next = structuredClone(original);
  if (patch?.personalInfo) {
    if (typeof patch.personalInfo.title === 'string') {
      next.personalInfo.title = patch.personalInfo.title;
    }
    if (typeof patch.personalInfo.summary === 'string') {
      next.personalInfo.summary = patch.personalInfo.summary;
    }
  }

  if (Array.isArray(patch?.experience)) {
    const byId = new Map(patch.experience.map((e) => [e.id, e]));
    next.experience = (next.experience || []).map((exp) => {
      const p = byId.get(exp.id);
      if (!p) return exp;
      return {
        ...exp,
        title: typeof p.title === 'string' ? p.title : exp.title,
        achievements: Array.isArray(p.achievements) ? p.achievements.map(String) : exp.achievements,
      };
    });
  }

  if (Array.isArray(patch?.skills)) {
    const byId = new Map(patch.skills.map((s) => [s.id, s]));
    const kept = (next.skills || []).map((skill) => {
      const p = byId.get(skill.id);
      if (!p) return skill;
      return { ...skill, name: typeof p.name === 'string' ? p.name : skill.name };
    });
    const existingIds = new Set(kept.map((s) => s.id));
    for (const s of patch.skills) {
      if (!s?.id || existingIds.has(s.id)) continue;
      if (typeof s.name === 'string' && s.name.trim()) {
        kept.push({ id: String(s.id), name: s.name.trim() });
      }
    }
    next.skills = kept;
  }

  if (Array.isArray(patch?.education)) {
    const byId = new Map(patch.education.map((e) => [e.id, e]));
    next.education = (next.education || []).map((edu) => {
      const p = byId.get(edu.id);
      if (!p || !Array.isArray(p.description)) return edu;
      const descById = new Map(p.description.map((d) => [d.id, d]));
      return {
        ...edu,
        description: (edu.description || []).map((d) => {
          const pd = descById.get(d.id);
          if (!pd || typeof pd.text !== 'string') return d;
          return { ...d, text: pd.text };
        }),
      };
    });
  }

  if (Array.isArray(patch?.otherInfo)) {
    next.otherInfo = patch.otherInfo.map(String);
  }

  return next;
}

function cvToPlainText(cv) {
  const lines = [];
  const p = cv.personalInfo || {};
  lines.push(`${p.fullName || ''} — ${p.title || ''}`.trim());
  if (p.summary) lines.push(`Summary: ${p.summary}`);
  const c = cv.contact || {};
  const vis = c.visibility || {};
  const contactBits = [];
  if (c.email && vis.email !== false) contactBits.push('Email: ' + c.email);
  if (c.phone && vis.phone !== false) contactBits.push('Phone: ' + c.phone);
  if (c.location && vis.location !== false) contactBits.push('Location: ' + c.location);
  if (c.linkedin && vis.linkedin !== false) contactBits.push('LinkedIn: ' + c.linkedin);
  if (c.github && vis.github !== false) contactBits.push('GitHub: ' + c.github);
  if (c.website && vis.website !== false) contactBits.push('Web: ' + c.website);
  if (contactBits.length) lines.push(contactBits.join(' | '));
  for (const exp of cv.experience || []) {
    lines.push(
      `Experience: ${exp.title} @ ${exp.company} (${exp.startDate || ''} - ${exp.current ? 'Present' : exp.endDate || ''})`
    );
    for (const a of exp.achievements || []) lines.push(`- ${a}`);
  }
  for (const edu of cv.education || []) {
    lines.push(`Education: ${edu.degree} — ${edu.institution}`);
    for (const d of edu.description || []) {
      if (d.visible !== false && d.text) lines.push(`- ${d.text}`);
    }
  }
  if (cv.skills?.length) lines.push('Skills: ' + cv.skills.map((s) => s.name).join(', '));
  if (cv.languages?.length) {
    lines.push(
      'Languages: ' + cv.languages.map((l) => `${l.name} (${l.level})`).join(', ')
    );
  }
  if (cv.otherInfo?.length) lines.push('Other: ' + cv.otherInfo.join(' | '));
  return lines.filter(Boolean).join('\n');
}

router.post('/ats-analyze', async (req, res) => {
  try {
    const jobDescription = String(req.body?.jobDescription || '').trim();
    const cv = sanitizeCv(req.body?.cv);
    const companyUrl = String(req.body?.companyUrl || '').trim();

    if (!jobDescription || jobDescription.length < 40) {
      return res.status(400).json({
        message: 'Please paste a job description (at least ~40 characters).',
      });
    }
    if (!cv || !cv.personalInfo) {
      return res.status(400).json({ message: 'CV data is required' });
    }

    let researchJd = jobDescription;
    if (companyUrl) {
      researchJd = `${jobDescription}\n\nCompany website: ${companyUrl}`;
    }

    const research = await researchFromJobDescription(researchJd);
    const plainCv = cvToPlainText(cv);

    const userPrompt = `## Job Description (primary source)
${jobDescription}

## Optional company URL from user
${companyUrl || '(none)'}

## Company / page research
${JSON.stringify(research, null, 2)}

## CV as plain text (ATS-like text extract)
${plainCv}

## CV as JSON
${JSON.stringify(cv, null, 2)}

Analyze ATS fit and return the JSON schema specified.`;

    const result = await completeJsonWithFailover(userPrompt);

    return res.json({
      analysis: result.analysis,
      meta: {
        used: result.used,
        research: {
          urlsFound: research.urlsFound,
          pagesFetched: research.pages.length,
          note: research.note,
        },
        failedAttempts: result.attempts.length,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(502).json({
      message: error?.message || 'AI analysis failed',
    });
  }
});

router.post('/ats-adapt', async (req, res) => {
  try {
    const jobDescription = String(req.body?.jobDescription || '').trim();
    const cv = sanitizeCv(req.body?.cv);
    const companyUrl = String(req.body?.companyUrl || '').trim();
    const analysis = req.body?.analysis || null;

    if (!jobDescription || jobDescription.length < 40) {
      return res.status(400).json({
        message: 'Please paste a job description (at least ~40 characters).',
      });
    }
    if (!cv || !cv.personalInfo) {
      return res.status(400).json({ message: 'CV data is required' });
    }

    const plainCv = cvToPlainText(cv);
    const userPrompt = `## Job Description (primary source)
${jobDescription}

## Optional company URL
${companyUrl || '(none)'}

## Prior ATS analysis (use as guidance, do not invent beyond CV facts)
${analysis ? JSON.stringify(analysis, null, 2) : '(none)'}

## CV as plain text
${plainCv}

## CV JSON (preserve all ids; only rewrite allowed text fields)
${JSON.stringify(cv, null, 2)}

Adapt the CV conservatively for this role and return the JSON schema specified.`;

    const result = await completeJsonWithFailover(userPrompt, ATS_ADAPT_SYSTEM_PROMPT);
    const adaptedCv = mergeAdaptedCv(cv, result.analysis);

    // Restore real photo if it was stripped for the prompt
    if (req.body?.cv?.personalInfo?.photoUrl) {
      adaptedCv.personalInfo.photoUrl = req.body.cv.personalInfo.photoUrl;
    }

    return res.json({
      adaptedCv,
      meta: {
        used: result.used,
        failedAttempts: result.attempts.length,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(502).json({
      message: error?.message || 'AI adaptation failed',
    });
  }
});

export default router;
