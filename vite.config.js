import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    base: '/',
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                projects: resolve(__dirname, 'public/pages/projects.html'),
                about: resolve(__dirname, 'public/pages/about.html'),
                contact: resolve(__dirname, 'public/pages/contact.html')
            }
        }
    }
});