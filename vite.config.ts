import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
<<<<<<< HEAD
          '@': path.resolve(__dirname, './src'),
          'lodash': 'lodash-es',
=======
          '@': path.resolve(__dirname, '.'),
>>>>>>> 453c6cc5cc6fc0fcbdf647c9e7a3d7f2c7f3bb55
        }
      }
    };
});
