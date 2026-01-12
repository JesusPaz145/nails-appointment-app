// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [react()],
  vite: {
    server: {
      // Permitir hosts de desarrollo y producción
      allowedHosts: [ 'localhost', 'nails.yisustech.com', 'www.nails.yisustech.com' ],
      host: '0.0.0.0',
    },
    preview: {
      // Hosts permitidos para preview/producción
      allowedHosts: [ 'nails.yisustech.com', 'www.nails.yisustech.com' ],
      host: '0.0.0.0',
    }
  }
});