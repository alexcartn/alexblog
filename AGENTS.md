# Guidelines for contributors

This repository contains the source for a personal blog built with Astro and
deployed on Netlify.

## Setup

1. Install Node.js 22.22 or newer.
2. Run `npm install`.

## Development

- Preview locally with hot reload:
  ```bash
  npm run dev
  ```
- Build the production site into `dist/`:
  ```bash
  npm run build
  ```
  `dist/` is not versioned. Netlify runs `npm run build` on every push to `main`
  (see `netlify.toml`).

## Content

- Articles live in `src/content/blog/<slug>/index.md`, projects in
  `src/content/project/<slug>/index.md`, simple pages in `src/content/pages/`.
  The folder name is the URL: `src/content/blog/cp_model/` becomes `/blog/cp_model/`.
- Write Markdown with YAML front matter. Raw HTML is allowed in Markdown.
- Required front matter for articles and projects: `title`, `date`, `topic`.
  `topic` is one of Performance, Santé, Data, Management or Divers (it drives the
  filters on the home page). Optional: `subtitle`, `excerpt`, `description`,
  `categories`, `tags`, `cover` (image next to the Markdown file, used for
  thumbnails and sharing), `featured: true` (the "À la une" card on the home
  page, one article at a time), `links` (buttons on project pages), `draft`.
- Put images in the same folder as the Markdown file, in lowercase, and reference
  them with a relative path (`![](graph.png)`). Names are case sensitive on Netlify.
- Interactive widgets are plain HTML placeholders in the Markdown, loaded only on
  pages that contain them:
  - `<div class="wgt wgt-wprime" data-cp="220" data-w="27" data-p="255" data-d="0"></div>`
  - `<div class="wgt wgt-respiration" data-rythme="6" data-duree="5"></div>`
  - `<div class="wgt wgt-pauses" data-intervalle="60" data-pause="2"></div>`

  Their code is in `src/scripts/widgets/` and their style in `src/styles/widgets.css`.
- The Ctrl K search reads `/search-index.json`, generated from the content at build time.

## Code style

- Indent HTML, Astro, CSS, JS, Markdown lists and YAML with **two spaces**.
- Keep commit messages concise and written in English.

## Tests

Run `npm run build` before submitting a pull request to ensure the site builds
without errors.
