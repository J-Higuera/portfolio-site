import { createRoot } from 'react-dom/client';
import GitHubCalendar from './react/GitHubCalendar.jsx';
import DockWidget from './react/DockWidget.jsx';

document.addEventListener('DOMContentLoaded', () => {
    // GitHub calendar
    const calendarTarget = document.getElementById('github-root');
    if (calendarTarget) createRoot(calendarTarget).render(<GitHubCalendar />);

    // Dock
    const dockTarget = document.getElementById('dock-root');
    if (dockTarget) createRoot(dockTarget).render(<DockWidget />);
});
