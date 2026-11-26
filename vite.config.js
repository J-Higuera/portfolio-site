import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import { cpSync, rmSync } from 'node:fs';

export default defineConfig(({ command }) => {
    // Never serve editable/private material from a production build, even when
    // the owner keeps an ignored DOCX alongside the public PDF locally.
    let publicDir = 'public';
    if (command === 'build') {
        publicDir = resolve(__dirname, 'node_modules/.cache/portfolio-public');
        rmSync(publicDir, { recursive: true, force: true });
        cpSync(resolve(__dirname, 'public'), publicDir, {
            recursive: true,
            filter: (source) => !/(?:\.docx$|(?:^|[\\/])(?:robotics-review|portraits?|qa|review)(?:[\\/]|$))/i.test(source),
        });
    }
    return {
        plugins: [react()],
        publicDir,
        base: '/',
        build: {
            rollupOptions: {
                input: {
                    main: resolve(__dirname, 'index.html'),
                    projects: resolve(__dirname, 'pages/movie_project.html'),
                    project2: resolve(__dirname, 'pages/2nd_project.html'),
                    project3: resolve(__dirname, 'pages/3rd_project.html'),
                    project4: resolve(__dirname, 'pages/neutron-dashboard.html'),
                    existingProject4: resolve(__dirname, 'pages/4th_project.html'),
                    about: resolve(__dirname, 'pages/about.html'),
                    contact: resolve(__dirname, 'pages/contact.html'),
                }
            }
        }
    };
});
