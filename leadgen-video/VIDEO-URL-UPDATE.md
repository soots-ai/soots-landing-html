# How to Update the Demo Video URL

Once the demo video is hosted (e.g. on S3) and you have the public URL, update these two files:

## 1. `leadgen-video/hero.htm`

Find the line:

```html
<source src="./soots-website-demo-1.mp4" type="video/mp4" />
```

Replace with (use your actual URL):

```html
<source src="https://YOUR-BUCKET-NAME.s3.REGION.amazonaws.com/soots-website-demo-1.mp4" type="video/mp4" />
```

## 2. `leadgen-video/head-links.htm`

Find the line in the JSON-LD schema:

```json
"contentUrl": "https://soots.ai/soots-website-demo-1.mp4",
```

Replace with (use your actual URL):

```json
"contentUrl": "https://YOUR-BUCKET-NAME.s3.REGION.amazonaws.com/soots-website-demo-1.mp4",
```

---

## Example

If your S3 URL is `https://soots-assets.s3.us-east-1.amazonaws.com/soots-website-demo-1.mp4`:

**hero.htm:**

```html
<source src="https://soots-assets.s3.us-east-1.amazonaws.com/soots-website-demo-1.mp4" type="video/mp4" />
```

**head-links.htm:**

```json
"contentUrl": "https://soots-assets.s3.us-east-1.amazonaws.com/soots-website-demo-1.mp4",
```

---

## After updating

1. Run `npm run build:leadgen` from the project root
2. Deploy the `dist-leadgen/` contents
