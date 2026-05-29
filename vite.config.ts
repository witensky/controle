import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const projectRoot = path.resolve(__dirname).replace(/\\/g, '/');
    const normalizedRoot = projectRoot.replace(/^([a-z]):/i, (match, drive) => drive.toUpperCase() + ':');

    return {
      root: normalizedRoot,
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      build: {
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (!id.includes('node_modules')) return undefined;

              if (id.includes('react') || id.includes('@tanstack')) {
                return 'react-vendor';
              }

              if (id.includes('framer-motion')) {
                return 'motion-vendor';
              }

              if (id.includes('recharts') || id.includes('d3-')) {
                return 'charts-vendor';
              }

              if (id.includes('lucide-react') || id.includes('lodash-es')) {
                return 'ui-vendor';
              }

              return undefined;
            },
          },
        },
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
          'lodash': 'lodash-es',
        }
      }
    };
});
