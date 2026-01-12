// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [react()],
  vite: {
    server: {
      // TEMP: permitir todos los hosts para debug. Revertir a lista específica cuando esté ok.
      allowedHosts: true,
      host: '0.0.0.0',
    },
    preview: {
      // TEMP: permitir todos los hosts para debug. Revertir a lista específica cuando esté ok.
      allowedHosts: true,
      host: '0.0.0.0',
    }
  }
});