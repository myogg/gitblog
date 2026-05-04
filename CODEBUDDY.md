# CODEBUDDY.md

This file provides guidance to CodeBuddy Code when working with code in this repository.

## Project Overview

A GitHub Issues-based static blog system. Blog posts are GitHub Issues in `myogg/gitblog`, labels serve as categories/tags. Python scripts generate a static HTML site deployed to GitHub Pages.

## Commands

```bash
# Install dependencies (PyGithub, feedgen, marko, markdown, jinja2, edge-tts, boto3)
pip install -r requirements.txt

# Generate local preview with mock data (no GitHub token needed)
python generate_preview.py
# Then: python -m http.server 8000

# Generate full site with real GitHub data (requires G_TT env var)
# Windows PowerShell:
$env:G_TT="your_github_token"
python generate_page.py

# Generate README.md and issue backups
python main.py <github_token> <repo_name> [--issue_number NUMBER]

# Generate TTS audio for articles
python tts_generate.py              # R2 mode (default)
python tts_generate.py --local      # Local file mode
python tts_generate.py --issue 30   # Single issue

# Clear stale API cache (6-hour TTL)
del github_cache.json
```

## Environment Variables

| Variable | Used By | Purpose |
|----------|---------|---------|
| `G_TT` | `generate_page.py`, `tts_generate.py`, `main.py` | GitHub personal access token (needs `repo` scope) |
| `GITHUB_NAME` / `GITHUB_EMAIL` | `generate_page.py` | RSS feed author info |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL` | `tts_generate.py` | Cloudflare R2 storage for TTS audio |
| `GISCUS_REPO_ID`, `GISCUS_CATEGORY_ID` | `generate_page.py` | Giscus config (currently unused; Waline is active) |

## Architecture

### Data Flow

```
GitHub Issues (content source, labels = categories)
    │
    ├─→ main.py ──→ README.md, BACKUP/*.md, feed.xml
    │
    ├─→ tts_generate.py ──→ tts_cache.json (audio URL mapping)
    │                          + R2/static/tts/*.mp3 (audio files)
    │
    └─→ generate_page.py ──→ articles/*.html, tags/*.html, blog.html,
                              search.html, about.html, index.html,
                              static/search-index.json, sitemap.xml, robots.txt
```

`generate_page.py` consumes `tts_cache.json` from `tts_generate.py` to add audio players to articles.

### Key Scripts (all at repo root)

- **`main.py`** — Reads issues, generates categorized `README.md` (the repo landing page), `feed.xml` RSS feed, and `BACKUP/*.md` backups. Ignores labels "Friends" and "TODO". Collapses sections with >5 articles.
- **`generate_page.py`** — Full static site generator. Fetches issues via GitHub API with 6-hour JSON cache (`github_cache.json`). Parses `<!-- more -->` for summaries, YAML/simple `tags:` for content tags. Builds paginated blog (20/page), article pages with prev/next + related articles, tag pages, search index, sitemap. Uses Jinja2 templates.
- **`tts_generate.py`** — Edge TTS with `zh-CN-XiaoxiaoNeural` voice (5000 char limit). Uploads to Cloudflare R2 via boto3 or saves locally. Outputs `tts_cache.json`.
- **`generate_preview.py`** — Local preview with mock data, no API needed.

### Templates (`templates/`)

All extend `base.html`. Use `base_path` variable for relative path resolution (`"../"` for articles/tags pages).

| Template | Purpose |
|----------|---------|
| `base.html` | Master layout: header (banner with logo, description, search, icon links + theme toggle), nav (Home/About), footer |
| `blog.html` | Article listing with title + date cards, pagination (20/page) |
| `article.html` | Full article: content, prev/next, related, TTS player, Waline comments (`https://waline.134688.xyz`), reading progress bar, medium-zoom |
| `tag.html` | Tag badge + article list |
| `search.html` | Client-side search via `static/search-index.json` |
| `about.html` | Bio, motto, links grid |

### Static Assets (`static/`)

- `style.css` — "Puma" theme, CSS custom properties (`--puma-*`), dark mode via `data-theme="dark"`, accent `#27ae60`, 900px max-width, 768px/480px breakpoints. Primary font: Noto Sans SC (思源黑体).
- `script.js` — Theme toggle, header scroll, back-to-top, RSS URL copy
- `assets/images/` — Banner, about photo, project screenshots

### Generated Output (do not manually edit)

- `index.html` — Redirect to `blog.html`
- `articles/article-{number}.html`
- `tags/{safe_name}.html`
- `blog.html`, `blog-page-{N}.html`
- `static/search-index.json`
- `sitemap.xml`, `robots.txt`
- `feed.xml`
- `README.md`
- `BACKUP/*.md`

## GitHub Actions Workflows

| Workflow | Trigger | What it runs |
|----------|---------|---------------|
| `generate_readme.yml` | Issue open/edit, comment, push to main on `main.py`, `workflow_dispatch` | `main.py` → commits BACKUP/*.md |
| `deploy.yml` | `workflow_dispatch` or `issues.labeled` | `tts_generate.py` → `generate_page.py` → deploy to GitHub Pages |
| `debug_issue_trigger.yml` | Issue events | Debug logging only |

`generate_readme.yml` only runs if the issue author is the repo owner.

## Important Details

- Custom domain: `myogg.hidns.co` (via `CNAME`)
- Cloudflare Worker at `cloudflare/worker/` provides on-demand TTS via WebSocket to Edge TTS, stores in R2
- Comment system is **Waline** (not Giscus), though Giscus env var infrastructure exists in code
- `generate_safe_name()` creates URL-safe slugs for label names with uniqueness tracking
- `add_lazy_loading_to_images()` adds `loading="lazy"` to all `<img>` tags in generated HTML
- Article content tags can be specified via YAML frontmatter `tags:` or a simple `tags: tag1, tag2` line
- When modifying templates or CSS, use `python generate_preview.py` then `python -m http.server 8000` to preview locally without a GitHub token
