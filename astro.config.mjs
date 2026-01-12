// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  vite: {
    server: {
      // Para el modo desarrollo (npm run dev)
      allowedHosts: ['nails.yisustech.com', 'localhost'],
    },
    preview: {
      // Para el modo producción/preview (npm run preview)
      allowedHosts: ['nails.yisustech.com'],
    }
  }
});