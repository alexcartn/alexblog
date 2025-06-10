# Guidelines for contributors

This repository contains the source for a Hugo-based personal website.
Follow these instructions when working in this project.

## Setup

1. After cloning, run `git submodule update --init --recursive` to pull the
   `apero` theme.
2. Ensure you have the Hugo extended binary installed. Version 0.123 or newer
   is recommended.

## Development

- To preview the site locally run:
  ```bash
  hugo serve -D
  ```
  This includes draft content.
- Build the production version with:
  ```bash
  hugo --minify
  ```

The generated HTML lives in the `public/` directory which is versioned in this
repository. Commit the updated `public/` directory when your changes affect the
site output.

## Content and code style

- Write posts in the `content/` directory using Markdown with YAML front matter.
- Indent HTML, Markdown lists, and TOML/YAML blocks with **two spaces**.
- Keep commit messages concise and written in English.

## Tests

Run `hugo --minify` before submitting a pull request to ensure the site builds
without errors.
