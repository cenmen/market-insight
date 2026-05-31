---
name: kami
description: Typeset polished Chinese and English documents and static product pages with the bundled Kami templates. Use when Codex is asked to create, rewrite, or format resumes, CVs, one-pagers, executive summaries, white papers, long-form reports, formal letters, portfolios, slide decks, PPT/PDF-style presentations, equity reports, investment memos, changelogs, release-note documents, landing pages, product pages, or when the user asks in Chinese or English for "做 PDF", "排版", "一页纸", "白皮书", "作品集", "简历", "PPT", "slides", "markdown slides", "落地页", "官网", "make this presentable", or "turn this into a PDF".
---

# Kami

Kami is a Codex skill for turning raw material into well-typeset deliverables using the files in this skill directory. It favors a warm parchment canvas, ink-blue accent, serif typography, and compact editorial rhythm.

## Directory Map

- `assets/templates/`: editable HTML and PPTX template sources.
- `assets/diagrams/`: inline SVG diagram primitives for reports and decks.
- `assets/fonts/`: bundled local fonts used by templates.
- `assets/images/` and `assets/illustrations/`: reusable visual assets.
- `references/design.md`: visual system, page rhythm, template rules.
- `references/writing.md`: document structures and writing patterns.
- `references/resume-writing.md`: resume-specific content guidance.
- `references/diagrams.md`: diagram selection and anti-patterns.
- `references/production.md`: rendering and WeasyPrint pitfalls.
- `references/brand-profile.md`: optional local brand profile behavior.
- `scripts/build.py`: render/check helper for HTML/PDF/PPTX outputs.
- `scripts/stabilize.py`: deterministic overflow and layout adjustment helper.
- `scripts/ensure-fonts.sh`: optional font recovery helper.

Load only the references needed for the current task. Do not read the entire skill unless the request requires it.

## Workflow

1. Identify the deliverable: document type, language, output format, page or length target, audience, and source material.
2. Choose the nearest existing template. Do not create a new template unless none fits.
3. Copy the chosen template into the user's requested output path or the default project-local output path below, then replace placeholders and commented content blocks.
4. Preserve the Kami design language unless the user provides a brand profile or explicit visual direction.
5. Use primary or user-provided sources for current facts, companies, products, people, releases, market data, and financial numbers.
6. For diagrams inside documents or slides, read `references/diagrams.md`, choose a primitive from `assets/diagrams/`, and embed the SVG in a `<figure>` with an insight-led caption.
7. For PDF output, prefer the WeasyPrint HTML templates. Use `slides.py` / `slides-en.py` only when the user explicitly needs an editable PPTX deck. Use Marp only if the user explicitly asks for markdown slides and suitable Marp assets exist.
8. After finishing, tell the user what changed and provide manual verification commands instead of running preview, build, test, lint, or self-validation commands when the local project rules prohibit them.

## Output Convention

When used inside this project, write generated artifacts under the project root `output/` directory unless the user explicitly provides another path.

Use these subdirectories by artifact type:

| Artifact | Directory |
| --- | --- |
| HTML / landing page | `output/html/` |
| PDF | `output/pdf/` |
| PPTX | `output/pptx/` |
| PNG / JPG / SVG images | `output/images/` |
| Source markdown or notes | `output/source/` |

Create missing subdirectories as needed. Name every generated file with the current date in full-width Chinese parentheses before the extension:

```text
你好（2026-05-31）.pdf
产品一页纸（2026-05-31）.html
市场洞察 slides（2026-05-31）.pptx
```

If multiple files would have the same name, append a short suffix before the date, such as `你好-v2（2026-05-31）.pdf`. Keep `output/` ignored by Git.

For every generated document, page, deck, footer, author metadata, byline, and disclaimer attribution, use `抖音 · ETF主线侦探` as the visible creator identity unless the user explicitly provides another identity. Do not include `Codex`, `Kami`, or AI-agent names in generated visible text or author metadata. Template-internal implementation references such as font CDN URLs may keep their original paths.

## Language And Template Selection

Match the user's language when possible.

| Request language | HTML templates | Slides PDF templates | Editable slides |
| --- | --- | --- | --- |
| Chinese | `*.html` | `slides-weasy.html` | `slides.py` |
| English | `*-en.html` | `slides-weasy-en.html` | `slides-en.py` |
| Other languages | Ask whether to use the Chinese or English template family | Ask before choosing | Ask before choosing |

Document type map:

| User intent | Template family |
| --- | --- |
| one-pager, 方案, executive summary | `one-pager*` |
| white paper, 白皮书, long report, annual summary | `long-doc*` |
| formal letter, memo, recommendation, resignation | `letter*` |
| portfolio, case studies, 作品集 | `portfolio*` |
| resume, CV, 简历, 履歴書 | `resume*` |
| slides, PPT, deck, presentation | `slides-weasy*` or `slides*.py` |
| equity report, investment memo, stock analysis | `equity-report*` |
| ETF analysis, ETF 点评, ETF 主线分析, 基金持仓分析 | `etf-report` |
| changelog, release-note document, 版本记录 | `changelog*` |
| landing page, 官网, product page | `landing-page*` |

Ask one compact question only when two template families genuinely fit or the output language/format materially changes the work.

## Brand Profile

If present, read `~/.config/kami/brand.md` first, with `~/.kami/brand.md` as a legacy fallback. Then read `references/brand-profile.md` only if a profile exists or the user asks for brand customization.

Precedence: explicit user request > editorial judgment > brand habit notes > profile defaults > built-in Kami defaults. Never let the profile override the current conversation.

## Materials

For branded work, check whether the user provided or referenced the necessary materials:

| Need | Required when |
| --- | --- |
| Logo | branded document, deck, or landing page |
| Product image | physical product, venue, or object |
| UI screenshot | SaaS, app, website, or tool |
| Brand colors | brand-sensitive one-pager, portfolio, deck, or landing page |

If material is missing, state the gap briefly. Do not invent logos, fake screenshots, or generic brand assets.

## Design Rules

- Page background: `#f5f4ed`; avoid pure white.
- Accent: ink blue `#1B365D`, used sparingly.
- Grays should be warm, not blue-gray.
- Keep one serif-led type system per page; `--sans` usually aliases the serif.
- Avoid bold-heavy typography; Kami templates generally use serif weight 500 for headings.
- Use solid hex tag backgrounds, not rgba, because WeasyPrint can render translucent tags poorly.
- Use restrained borders and whisper shadows; avoid hard drop shadows.
- Keep landing pages static, responsive, and ready to serve as HTML.

Read `references/design.md` before substantial visual changes, and `references/production.md` before fixing print/PDF rendering issues.

## Script Use

Do not run scripts automatically when the active project rules forbid validation. When allowed, useful commands are:

```bash
python3 .codex/skills/kami/scripts/build.py --check
python3 .codex/skills/kami/scripts/build.py --verify resume-en
python3 .codex/skills/kami/scripts/stabilize.py resume-en --write --strict --report
bash .codex/skills/kami/scripts/ensure-fonts.sh
```

If running scripts from inside the skill directory, omit the `.codex/skills/kami/` prefix.
