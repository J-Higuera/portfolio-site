import { createRoot } from 'react-dom/client';
import DockWidget from './react/DockWidget.jsx';
import SkillsGrid from './react/skills/SkillsGrid.jsx';
import GitHubCalendar from './react/GitHubCalendar.jsx';

document.addEventListener('DOMContentLoaded', () => {
    // GitHub calendar
    const calendarTarget = document.getElementById('github-root');
    if (calendarTarget) createRoot(calendarTarget).render(<GitHubCalendar />);

    // Dock
    const dockTarget = document.getElementById('dock-root');
    if (dockTarget) createRoot(dockTarget).render(<DockWidget />);

    // Skills-Grid
    const skillsTarget = document.getElementById('skills-dock-root');
    if (skillsTarget) createRoot(skillsTarget).render(<SkillsGrid />);
});
