import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to recursively find all .html files
function findHtmlFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...findHtmlFiles(fullPath));
    } else if (item.endsWith('.html')) {
      files.push(fullPath);
    }
  }

  return files;
}

// Function to rename HTML files to clean URLs and create folder structure
function renameHtmlFiles() {
  const distDir = path.join(__dirname, 'dist');
  
  // Define the mapping of files to rename
  const fileMapping = {
    'faq-page.html': 'faq.html',
    'terms-conditions-page.html': 'terms-conditions.html',
    'privacy-page.html': 'privacy-policy.html',
    'refund-policy-page.html': 'refund-policy.html',
    'gdpr-page.html': 'gdpr-compliance.html',
    'contact-us-page.html': 'contact.html'
  };

  // Rename files
  Object.entries(fileMapping).forEach(([oldName, newName]) => {
    const oldPath = path.join(distDir, oldName);
    const newPath = path.join(distDir, newName);
    
    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
      console.log(`Renamed ${oldName} to ${newName}`);
    }
  });

      // Create folder structure for clean URLs
      const cleanUrlMappings = {
        'lead-generation.html': 'index', // Lead generation becomes the root index
        'signup.html': 'signup',
        'faq.html': 'faq',
        'terms-conditions.html': 'terms-conditions',
        'privacy-policy.html': 'privacy-policy',
        'refund-policy.html': 'refund-policy',
        'gdpr-compliance.html': 'gdpr-compliance',
        'contact.html': 'contact'
      };

  // Create folders and move files to index.html inside each folder
  Object.entries(cleanUrlMappings).forEach(([htmlFile, folderName]) => {
    const htmlPath = path.join(distDir, htmlFile);
    
        if (fs.existsSync(htmlPath)) {
          // Special case: lead-generation.html becomes the root index.html
          if (htmlFile === 'lead-generation.html') {
            const rootIndexPath = path.join(distDir, 'index.html');
            fs.renameSync(htmlPath, rootIndexPath);
            console.log(`Moved ${htmlFile} to root index.html`);
            return;
          }

          // Create folder
          const folderPath = path.join(distDir, folderName);
          if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
            console.log(`Created folder: ${folderName}`);
          }

          // Move file to folder/index.html
          const newFilePath = path.join(folderPath, 'index.html');
          fs.renameSync(htmlPath, newFilePath);
          console.log(`Moved ${htmlFile} to ${folderName}/index.html`);
        }
  });

  // Update all HTML files to reference the new clean URLs and fix asset paths
  const htmlFiles = findHtmlFiles(distDir);
  
  htmlFiles.forEach((filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    // Update internal links to use clean URLs
    Object.entries(fileMapping).forEach(([oldName, newName]) => {
      const oldLink = `href="./${oldName}"`;
      const newLink = `href="./${newName}"`;
      
      if (content.includes(oldLink)) {
        content = content.replace(new RegExp(oldLink, 'g'), newLink);
        updated = true;
      }
    });

        // Update links to use clean URLs with folder structure
        const cleanUrlUpdates = {
          'href="./signup.html"': 'href="./signup"',
          'href="./faq.html"': 'href="./faq"',
          'href="./terms-conditions.html"': 'href="./terms-conditions"',
          'href="./privacy-policy.html"': 'href="./privacy-policy"',
          'href="./refund-policy.html"': 'href="./refund-policy"',
          'href="./gdpr-compliance.html"': 'href="./gdpr-compliance"',
          'href="./contact.html"': 'href="./contact"'
        };

    Object.entries(cleanUrlUpdates).forEach(([oldLink, newLink]) => {
      if (content.includes(oldLink)) {
        content = content.replace(new RegExp(oldLink, 'g'), newLink);
        updated = true;
      }
    });

    // Fix asset paths for files in subfolders
    const relativePath = path.relative(distDir, path.dirname(filePath));
    if (relativePath && relativePath !== '.') {
      // This file is in a subfolder, need to fix asset paths
      const assetPathPrefix = '../'.repeat(relativePath.split(path.sep).length);
      console.log(`Processing ${path.basename(filePath)} in ${relativePath}, prefix: ${assetPathPrefix}`);
      
      // Fix CSS and JS asset paths
      const assetUpdates = {
        'href="./assets/': `href="${assetPathPrefix}assets/`,
        'src="./assets/': `src="${assetPathPrefix}assets/`,
        'href="./vendor/': `href="${assetPathPrefix}vendor/`,
        'src="./vendor/': `src="${assetPathPrefix}vendor/`,
        'href="./images/': `href="${assetPathPrefix}images/`,
        'src="./images/': `src="${assetPathPrefix}images/`,
        'href="./fonts/': `href="${assetPathPrefix}fonts/`,
        'src="./fonts/': `src="${assetPathPrefix}fonts/`,
        'href="./video/': `href="${assetPathPrefix}video/`,
        'src="./video/': `src="${assetPathPrefix}video/`,
        'href="./favicon': `href="${assetPathPrefix}favicon`,
        'href="./apple-touch-icon': `href="${assetPathPrefix}apple-touch-icon`,
        'href="./site.webmanifest"': `href="${assetPathPrefix}site.webmanifest"`
      };

      // Also fix specific asset files without trailing slashes
      const specificAssetUpdates = {
        'href="./assets/main.css"': `href="${assetPathPrefix}assets/main.css"`,
        'src="./assets/main.js"': `src="${assetPathPrefix}assets/main.js"`,
        'href="./assets/main.css"': `href="${assetPathPrefix}assets/main.css"`,
        'src="./assets/main.js"': `src="${assetPathPrefix}assets/main.js"`
      };

      Object.entries(assetUpdates).forEach(([oldPath, newPath]) => {
        if (content.includes(oldPath)) {
          // Escape special regex characters and replace globally
          const escapedPath = oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          content = content.replace(new RegExp(escapedPath, 'g'), newPath);
          updated = true;
        }
      });

      // Also process specific asset files
      Object.entries(specificAssetUpdates).forEach(([oldPath, newPath]) => {
        console.log(`Checking for ${oldPath} in ${path.basename(filePath)}`);
        if (content.includes(oldPath)) {
          console.log(`Found ${oldPath} in ${path.basename(filePath)}, replacing with ${newPath}`);
          // Escape special regex characters and replace globally
          const escapedPath = oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          content = content.replace(new RegExp(escapedPath, 'g'), newPath);
          updated = true;
        } else {
          console.log(`NOT found ${oldPath} in ${path.basename(filePath)}`);
        }
      });
    }

    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated internal links and asset paths in ${path.basename(filePath)}`);
    }
  });
}

// Function to rename JavaScript file and update HTML references
function fixJavaScriptFile() {
  const assetsDir = path.join(__dirname, 'dist', 'assets');

  // Find the JavaScript file with hash
  const files = fs.readdirSync(assetsDir);
  const jsFile = files.find((file) => file.startsWith('main') && file.endsWith('.js'));

  if (jsFile && jsFile !== 'main.js') {
    const oldPath = path.join(assetsDir, jsFile);
    const newPath = path.join(assetsDir, 'main.js');

    // Rename the file
    fs.renameSync(oldPath, newPath);
    console.log(`Renamed ${jsFile} to main.js`);

    // Update all HTML files to reference main.js and inject script tag
    const htmlFiles = findHtmlFiles(path.join(__dirname, 'dist'));

    htmlFiles.forEach((filePath) => {
      let content = fs.readFileSync(filePath, 'utf8');

      // Replace the old filename with main.js
      content = content.replace(new RegExp(jsFile, 'g'), 'main.js');

      // Inject the main.js script tag if it's missing
      if (content.includes('<!-- SCRIPT -->') && !content.includes('src="./assets/main.js"')) {
        content = content.replace('<!-- SCRIPT -->', '<script src="./assets/main.js"></script>');
      }

      // Add CSS link if it's missing
      if (!content.includes('href="./assets/main.css"')) {
        content = content.replace(
          /(<link\s+href="https:\/\/fonts\.googleapis\.com\/css2[^>]*>\s*)/,
          '$1<link rel="stylesheet" href="./assets/main.css" />\n'
        );
      }

      fs.writeFileSync(filePath, content, 'utf8');
    });
  } else {
    console.log('No JavaScript file found to rename or already named main.js');
  }
}

// Run the script
renameHtmlFiles();
fixJavaScriptFile();
