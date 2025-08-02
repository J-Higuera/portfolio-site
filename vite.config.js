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
                projects: resolve(__dirname, 'pages/movie_project.html'),
                about: resolve(__dirname, 'pages/about.html'),
                contact: resolve(__dirname, 'pages/contact.html'),
                project2: resolve(__dirname, 'pages/2nd_project.html'),
                project3: resolve(__dirname, 'pages/3rd_project.html'),
                project4: resolve(__dirname, 'pages/4th_project.html'),
                reactEntry: './src/react-entry.jsx' // ensure it's split
            }
        }
    }
});