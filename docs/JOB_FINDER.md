# Job Finder CV and cover letter

This path is for the Job Finder bot. It turns a small JSON file into a tailored frontend CV and a one-page cover letter. Layout and PDF rendering happen here. There is no LLM call and no browser UI.

The existing editor templates (Professional, Classic, Modern, Creative, Executive, Private Service) are unchanged. Facts come from `createDefaultCv()` in `src/app/models/cv.model.ts`. English bullets are copied verbatim. Spanish text is a translation of those same facts. A job JSON can reorder and select that catalog. It cannot add an employer, a date, or a skill that is not already listed.

The CV uses the Professional palette (`#5D9CEC`, Roboto) and the default portrait `public/images/profile.jpg`. Highlighted bullets are the same text in bold, moved to the top of that role.

The cover letter is a separate business letter, not a second CV page. It keeps Roboto and a small copy of the same portrait, and uses a navy accent (`#1B3A4B`) instead of the CV blue. Structure: letterhead, date, recipient block, optional `Re:` / `Asunto:` line, salutation, body, optional hooks, closing and signature. Body text is left-aligned, about 11pt, with roughly one-inch margins and a blank line between paragraphs, which is the usual one-page cover-letter format (about 250–400 words).

## Command

From the repo root:

```bash
npm run generate -- --input job-finder/example.job.json --out ./output
```

`pnpm run generate` works the same way. The script writes:

- `output/CV_<Company>_<Role>.pdf`
- `output/CoverLetter_<Company>_<Role>.pdf`

Spaces in the company and role become underscores. The example files are `CV_Example_Studio_Frontend_Developer.pdf` and `CoverLetter_Example_Studio_Frontend_Developer.pdf`.

Stdout is JSON with `ok`, `files` and `pages`. The cover letter must be exactly one page; if the paragraphs are too long the command exits with an error. Chrome or Chromium has to be on the machine (or `CHROME_PATH`). Generation does not call the network.

Print the allowed ids:

```bash
npm run generate -- --catalog
```

## Input

Schema: `job-finder/schema.json`. Example, with fictional company and letter text labelled `EXAMPLE`: `job-finder/example.job.json`.

```json
{
  "language": "en",
  "company": "Example Studio",
  "role": "Frontend Developer",
  "cv": {
    "headline": "Frontend Developer",
    "summary": "Optional. Omit to use the frontend summary already in the catalog.",
    "skills": ["Angular", "TypeScript", "React"],
    "experienceOrder": ["explorins", "mazars", "freelancer"],
    "bullets": {
      "explorins": ["explorins-angular", "explorins-benetton"]
    },
    "highlightBullets": ["explorins-angular", "explorins-benetton"]
  },
  "coverLetter": {
    "recipientName": "Example Hiring Manager",
    "recipientTitle": "Head of Engineering",
    "date": "2026-10-20",
    "paragraphs": ["First short paragraph.", "Second short paragraph."],
    "hooks": ["Optional short hook."],
    "signature": "Antoni Bassols López"
  }
}
```

| Field | Required | What it does |
| --- | --- | --- |
| `language` | no | `en` (default) or `es`. Switches labels and catalog wording. |
| `company`, `role` | yes | Used in the letter and in the PDF file names. |
| `cv.headline`, `cv.summary` | no | Replace the default frontend headline and summary. |
| `cv.skills` | no | Skill names to show, in order. Must be from the catalog. |
| `cv.experienceOrder` | no | Role ids to show, in order. Omitted roles are left out. |
| `cv.bullets` | no | Map of role id to bullet ids. Omitted roles keep every bullet. |
| `cv.highlightBullets` | no | Bullet ids to render bold and first inside their role. |
| `cv.educationDetails`, `cv.interests`, `cv.otherInfo` | no | Subsets, in the order given. An empty array hides that block. |
| `coverLetter.paragraphs` | yes | 2 to 4 paragraphs supplied by the caller. Three or four, totalling about 250–400 words, fit one page. |
| `coverLetter.hooks` | no | Up to 4 short bullets, set as a normal list under the paragraphs. |
| `coverLetter.date` | yes | `YYYY-MM-DD` or an already formatted date string. |
| `coverLetter.recipientName`, `recipientTitle`, `recipientCity`, `signature` | no | Name, title and city form the recipient block. With no name, the greeting is the generic hiring-manager line. The signature defaults to Antoni's name. |
| `coverLetter.subject` | no | Subject line. Omit it for `Re: <role>` in English or `Asunto: <role>` in Spanish. `""` hides the line. |
| `coverLetter.accentColor` | no | `#RRGGBB` for the letter only. Default `#1B3A4B`. |
| `coverLetter.showPhoto` | no | Small portrait in the letterhead. Default `true`. |

### Catalog ids

Experience:

| Id | Employer | Bullets |
| --- | --- | --- |
| `explorins` | eXplorins · FrontEnd Developer · 07/2023–10/2025 | `explorins-angular`, `explorins-ai`, `explorins-benetton` |
| `mazars` | Forvis Mazars · Full-Stack Developer / Technical Lead · 10/2025–03/2026 | `mazars-stack`, `mazars-lead`, `mazars-platform` |
| `freelancer` | Freelancer & Solopreneur · FullStack Developer · 11/2021–Present | `freelancer-bocabla`, `freelancer-music` |

Skills: Angular, React, Next.js, JavaScript, TypeScript, Figma, Lovable, Cursor, Node.js, MongoDB, Databases SQL & NoSQL, Git with GitHub & GitLab, Diligent, Methodical, Ambitious.

Education details: `edu-oracle`, `edu-cs50`, `edu-platzi`, `edu-stack`.

Interests: AI, ML, DL, GenAI, LLM.

Other: `other-team`, `other-business`.

If `cv` is omitted, the sample frontend CV is used: eXplorins first, frontend skills first, and `explorins-angular`, `explorins-benetton`, `mazars-stack`, `freelancer-bocabla` highlighted.

Check the rules without Chrome:

```bash
npm run test:job-finder
```
