# Leadgen-Video – Standalone Deployment

Isolated leadgen page for GitHub Pages. Self-contained, no other site pages or content.

## Build

From project root:

```bash
npm run build:leadgen
```

Output: `dist-leadgen/` with `index.html` and assets.

## Prerequisites

- Demo video hosted on S3 (see [Host demo video on S3](#host-demo-video-on-s3)). The video URL is configured in `hero.htm` and `head-links.htm`.

## Host demo video on S3

`soots-website-demo-1.mp4` exceeds GitHub’s 100 MB limit. Host it on AWS S3, then update the URL in the leadgen-video code.

### 1. Create an S3 bucket

1. AWS Console → S3 → **Create bucket**
2. Bucket name: e.g. `soots-assets` or `soots-landing-assets`
3. Region: choose one close to your users
4. Uncheck **Block all public access** (or configure for public objects)
5. Create bucket

### 2. Enable public access

1. Bucket → **Permissions** → **Block public access** → **Edit**
2. Uncheck **Block all public access** and confirm
3. **Permissions** → **Bucket policy** → **Edit**, paste:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

Replace `YOUR-BUCKET-NAME` with your bucket name.

### 3. Upload the video

1. Bucket → **Objects** → **Upload**
2. Select `soots-website-demo-1.mp4` (from project root)
3. Upload

### 4. Set Content-Type

1. Click the uploaded object
2. **Actions** → **Edit metadata**
3. Add metadata: Key `Content-Type`, Value `video/mp4`
4. Save

### 5. Get the public URL

Format:

```
https://YOUR-BUCKET-NAME.s3.REGION.amazonaws.com/soots-website-demo-1.mp4
```

Example:

```
https://soots-assets.s3.us-east-1.amazonaws.com/soots-website-demo-1.mp4
```

If using CloudFront or a custom domain, use that URL instead.

### 6. Update the leadgen-video URL

Set the video URL in:

- `leadgen-video/hero.htm` – `<source src="...">` for the demo video
- `leadgen-video/head-links.htm` – `contentUrl` in the VideoObject JSON-LD schema

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
