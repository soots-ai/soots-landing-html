import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';
import { minify } from 'terser';
import { defineConfig } from 'vite';
import injectHTML from 'vite-plugin-html-inject';

const getHtmlEntries = () => {
  const pagesDir = path.resolve(__dirname, '');
  const entries = {};
  
  // Define the specific pages we want to build with their desired output names
  const pagesToBuild = {
    'leadgen-video': 'leadgen-video.html',
    'lead-generation': 'lead-generation.html', 
    'contact': 'contact-us-page.html',
    'signup': 'signup.html',
    'faq': 'faq-page.html',
    'pricing': 'pricing-page.html',
    'terms-conditions': 'terms-conditions-page.html',
    'privacy-policy': 'privacy-page.html',
    'refund-policy': 'refund-policy-page.html',
    'gdpr-compliance': 'gdpr-page.html'
  };
  
  // Only include the specified pages
  Object.entries(pagesToBuild).forEach(([outputName, inputFile]) => {
    const inputPath = path.resolve(pagesDir, inputFile);
    if (fs.existsSync(inputPath)) {
      entries[outputName] = inputPath;
    }
  });

  return entries;
};

const jsToBottomNoModule = () => {
  return {
    name: 'no-attribute',
    transformIndexHtml(html) {
      html = html.replace(`type="module" crossorigin`, '');
      let scriptTag = html.match(/<script[^>]*>(.*?)<\/script[^>]*>/)[0];
      html = html.replace(scriptTag, '');
      html = html.replace('<!-- SCRIPT -->', scriptTag);
      return html;
    },
  };
};

const cssCrossOriginRemove = () => {
  return {
    name: 'css-cross-origin-remove',
    transformIndexHtml(html) {
      return html.replace(
        /(<link[^>]*rel=["']stylesheet["'][^>]*?)\s+crossorigin(?:=["'][^"']*["'])?/g,
        '$1'
      );
    },
  };
};

const renameOutputFiles = () => {
  return {
    name: 'rename-output-files',
    generateBundle(options, bundle) {
      // Define the mapping of input files to desired output names
      const fileMapping = {
        'faq-page.html': 'faq.html',
        'terms-conditions-page.html': 'terms-conditions.html',
        'privacy-page.html': 'privacy-policy.html',
        'refund-policy-page.html': 'refund-policy.html',
        'gdpr-page.html': 'gdpr-compliance.html'
      };

      // Rename files in the bundle
      Object.keys(bundle).forEach(fileName => {
        if (fileName.endsWith('.html')) {
          const originalName = fileName;
          const newName = fileMapping[originalName] || originalName;
          
          if (newName !== originalName) {
            const file = bundle[fileName];
            delete bundle[fileName];
            bundle[newName] = file;
          }
        }
      });
    },
  };
};

const cleanUrlDevServer = () => {
  return {
    name: 'clean-url-dev-server',
    configureServer(server) {
      // Only apply in development mode
      if (process.env.NODE_ENV === 'production') return;

      // Define clean URL mappings
      const cleanUrlMappings = {
        '/faq': '/faq-page.html',
        '/pricing': '/pricing-page.html',
        '/terms-conditions': '/terms-conditions-page.html',
        '/privacy-policy': '/privacy-page.html',
        '/refund-policy': '/refund-policy-page.html',
        '/gdpr-compliance': '/gdpr-page.html',
        '/contact': '/contact-us-page.html',
        '/signup': '/signup.html'
      };

      // Add middleware to handle clean URLs
      server.middlewares.use((req, res, next) => {
        const pathname = req.url?.split('?')[0] || req.url;
        const search = req.url?.includes('?') ? '?' + req.url.split('?')[1] : '';
        
        // Special case: root URL serves leadgen-video page (ignore query params)
        if (pathname === '/' || pathname === '') {
          req.url = '/leadgen-video.html' + search;
          console.log(`🔄 Root URL rewrite: / → /leadgen-video.html`);
          next();
          return;
        }
        
        // Check if this is a clean URL that needs mapping
        if (cleanUrlMappings[pathname]) {
          req.url = cleanUrlMappings[pathname] + search;
          console.log(`🔄 Clean URL rewrite: ${pathname} → ${cleanUrlMappings[pathname]}`);
        }
        
        next();
      });
    },
  };
};

const vendorMinifier = () => {
  return {
    name: 'vendor-minifier',
    async generateBundle(options, bundle) {
      // Minify vendor scripts after build
      const vendorDir = path.resolve(__dirname, 'dist/vendor');

      if (fs.existsSync(vendorDir)) {
        const vendorFiles = fs.readdirSync(vendorDir);

        for (const file of vendorFiles) {
          if (file.endsWith('.js')) {
            const filePath = path.join(vendorDir, file);
            const content = fs.readFileSync(filePath, 'utf8');

            try {
              // Use Terser for advanced minification
              const minified = await minify(content, {
                compress: {
                  drop_console: false, // Keep console logs for debugging
                  drop_debugger: true,
                  pure_funcs: ['console.log'], // Remove console.log calls
                  passes: 2,
                },
                mangle: {
                  toplevel: false, // Don't mangle top-level names to avoid breaking
                },
                format: {
                  comments: /@license|@preserve|@format|@version/i, // Preserve license comments
                },
                sourceMap: false,
              });

              // Write minified content back
              fs.writeFileSync(filePath, minified.code);

              // Calculate size reduction
              const originalSize = content.length;
              const minifiedSize = minified.code.length;
              const reduction = (((originalSize - minifiedSize) / originalSize) * 100).toFixed(1);

              console.log(`✅ Minified vendor script: ${file} (${reduction}% smaller)`);
            } catch (error) {
              console.warn(`⚠️ Failed to minify ${file}:`, error.message);
              // Fallback to basic minification
              const basicMinified = content
                .replace(/\/\/(?!.*@license|.*@preserve|.*@format|.*@version).*$/gm, '')
                .replace(/\/\*[\s\S]*?\*\/(?!.*@license|.*@preserve|.*@format|.*@version)/g, '')
                .replace(/\s+/g, ' ')
                .replace(/\s*([{}();,=+\-*/<>!&|])\s*/g, '$1')
                .replace(/\s+$/gm, '')
                .replace(/^\s*[\r\n]/gm, '')
                .trim();

              fs.writeFileSync(filePath, basicMinified);
              console.log(`✅ Basic minified vendor script: ${file}`);
            }
          }
        }
      }
    },
  };
};

export default defineConfig({
  plugins: [
    tailwindcss(),
    injectHTML({
      tagName: 'Component',
    }),
    jsToBottomNoModule(),
    cssCrossOriginRemove(),
    cleanUrlDevServer(), // Add clean URL support for development
    renameOutputFiles(),
    vendorMinifier(),
  ],
  build: {
    rollupOptions: {
      input: getHtmlEntries(),
      output: {
        entryFileNames: 'assets/main.js',
        assetFileNames: (assetInfo) => {
          return `assets/${assetInfo.name || '[name].[ext]'}`;
        },
      },
    },
    minify: false,
    modulePreload: false,
    cssMinify: false,
    assetsDir: 'assets',
  },
  server: {
    open: true,
  },
  base: './',
});
