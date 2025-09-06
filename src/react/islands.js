// src/react/islands.js
import GitHubCalendar from './GitHubCalendar.jsx'; // static import (bundled in main)

const registry = {
    // wrap in a resolved promise so the rest of your loader code still works
    GitHubCalendar: async () => ({ default: GitHubCalendar }),

    // other islands can stay dynamic for code-splitting, e.g.:
    // ProjectsGrid: () => import('./ProjectsGrid.jsx'),
};

export default registry;
