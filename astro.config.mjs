// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  vite: {
    preview: {
      // Temporalmente permitir todos los hosts:
      allowedHosts: true,
    },
    server: {
      // Allow local development hosts too
      allowedHosts: [ 'localhost', 'nails.yisustech.com' ],
    }
  }
});
