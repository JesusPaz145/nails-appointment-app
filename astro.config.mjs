// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  vite: {
    preview: {
      // Allow the production host(s) so Vite preview won't block requests from them
      allowedHosts: [ 'nails.yisustech.com' ],
    },
    server: {
      // Allow local development hosts too
      allowedHosts: [ 'localhost', 'nails.yisustech.com' ],
    }
  }
});
