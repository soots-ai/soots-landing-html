import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';
import baseConfig from './vite.config.js';

const leadgenInput = {
  'leadgen-video': path.resolve(__dirname, 'leadgen-video.html'),
};

export default defineConfig({
  ...baseConfig,
  build: {
    ...baseConfig.build,
    outDir: 'dist-leadgen',
    emptyOutDir: true,
    rollupOptions: {
      input: leadgenInput,
      output: {
        entryFileNames: 'assets/main.js',
        assetFileNames: (assetInfo) =>
          `assets/${assetInfo.name || '[name].[ext]'}`,
      },
    },
  },
});
