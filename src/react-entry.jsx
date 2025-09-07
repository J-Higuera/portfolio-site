import { createRoot } from 'react-dom/client';
import GitHubCalendar from './react/GitHubCalendar.jsx';
import SkillsGrid from './react/skills/SkillsGrid.jsx';

document.addEventListener('DOMContentLoaded', () => {
    // GitHub calendar
    const calendarTarget = document.getElementById('github-root');
    if (calendarTarget) createRoot(calendarTarget).render(<GitHubCalendar />);



    // Skills-Grid
    const skillsTarget = document.getElementById('skills-dock-root');
    if (skillsTarget) createRoot(skillsTarget).render(<SkillsGrid />);
});
