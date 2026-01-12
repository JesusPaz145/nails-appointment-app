// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  vite: {
    preview: {
      allowedHosts: ["nails.yisustech.com", ".yisustech.com"],
    },
    server: {
      allowedHosts: ["nails.yisustech.com", ".yisustech.com"],
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        }
      }
    }
  }
});
