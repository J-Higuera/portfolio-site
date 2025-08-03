import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import { createHtmlPlugin } from 'vite-plugin-html';
import Critters from 'critters';

export default defineConfig({
    plugins: [
        react(),
        createHtmlPlugin(), // enables HTML injection and minification
        {
            name: 'inline-critical-css',
            enforce: 'post',
            apply: 'build',
            async generateBundle(_, bundle) {
                const critters = new Critters({ path: './dist' });

                for (const fileName of Object.keys(bundle)) {
                    const file = bundle[fileName];
                    if (file.type === 'asset' && file.fileName.endsWith('.html')) {
                        file.source = await critters.process(file.source);
                    }
                }
            }
        }
    ],
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
            }
        }
    }
});
