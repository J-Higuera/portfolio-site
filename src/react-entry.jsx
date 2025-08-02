import React from 'react';
import ReactDOM from 'react-dom/client';
import GitHubContributions from './react/GitHubCalendar';

const root = document.getElementById('github-root');
if (root) {
    ReactDOM.createRoot(root).render(
        <React.StrictMode>
            <GitHubContributions />
        </React.StrictMode>
    );
}
