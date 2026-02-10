# Leadgen-Video – Standalone Deployment

Isolated leadgen page for GitHub Pages. Self-contained, no other site pages or content.

## Build

From project root:

```bash
npm run build:leadgen
```

Output: `dist-leadgen/` with `index.html` and assets.

## Prerequisites

- `soots-website-demo-1.mp4` in `public/` at project root

## Deploy to GitHub Pages

1. Push the contents of `dist-leadgen/` to your GitHub Pages repo.
2. Or deploy via GitHub Actions:

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build:leadgen
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist-leadgen
```

## Preview

```bash
npm run preview:leadgen
```

Serves `dist-leadgen/` at `http://localhost:4173`.

## URL parameters

`?v=cs` (and other `v` values) are passed through to the form and sent with submissions.
