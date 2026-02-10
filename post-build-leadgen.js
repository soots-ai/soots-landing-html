import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, 'dist-leadgen');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

// Rename leadgen-video.html to index.html
const leadgenHtml = path.join(distDir, 'leadgen-video.html');
if (fs.existsSync(leadgenHtml)) {
  fs.renameSync(leadgenHtml, path.join(distDir, 'index.html'));
  console.log('Created index.html from leadgen-video.html');
}

// Copy leadgen-video/integrations (not in public)
const integrationsSrc = path.join(__dirname, 'leadgen-video', 'integrations');
const integrationsDest = path.join(distDir, 'leadgen-video', 'integrations');
if (fs.existsSync(integrationsSrc)) {
  copyRecursive(integrationsSrc, integrationsDest);
  console.log('Copied leadgen-video/integrations');
}

// Copy leadgen-video/favicon.png as leadgen favicon
const faviconSrc = path.join(__dirname, 'leadgen-video', 'favicon.png');
if (fs.existsSync(faviconSrc)) {
  fs.copyFileSync(faviconSrc, path.join(distDir, 'favicon.png'));
  fs.copyFileSync(faviconSrc, path.join(distDir, 'favicon-96x96.png'));
  fs.copyFileSync(faviconSrc, path.join(distDir, 'apple-touch-icon.png'));
  console.log('Copied leadgen-video/favicon.png');
}

// Fix main.js reference in HTML (post-build may rename hashed file)
const htmlFiles = ['index.html'].map((f) => path.join(distDir, f));
for (const filePath of htmlFiles) {
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf8');
  const jsMatch = content.match(/src="([^"]*main[^"]*\.js)"/);
  if (jsMatch && jsMatch[1] !== './assets/main.js') {
    content = content.replace(jsMatch[1], './assets/main.js');
    fs.writeFileSync(filePath, content);
  }
}
