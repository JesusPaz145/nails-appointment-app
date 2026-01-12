// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [react()],
  vite: {
    server: {
      allowedHosts: true, // Esto desactiva la comprobación estricta en dev
    },
    preview: {
      allowedHosts: true, // Esto desactiva la comprobación estricta en preview
    }
  }
});