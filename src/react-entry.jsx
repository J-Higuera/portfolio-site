import React from 'react';
import ReactDOM from 'react-dom/client';
import GitHubContributions from './react/GitHubCalendar';

ReactDOM.createRoot(document.getElementById('github-root')).render(
    <React.StrictMode>
        <GitHubContributions />
    </React.StrictMode>
);
