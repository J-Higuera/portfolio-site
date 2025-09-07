import { createRoot } from 'react-dom/client';
import DockWidget from './react/DockWidget.jsx';
import SkillsGrid from './react/skills/SkillsGrid.jsx';

document.addEventListener('DOMContentLoaded', () => {
    // GitHub calendar

    // Dock
    const dockTarget = document.getElementById('dock-root');
    if (dockTarget) createRoot(dockTarget).render(<DockWidget />);

    // Skills-Grid
    const skillsTarget = document.getElementById('skills-dock-root');
    if (skillsTarget) createRoot(skillsTarget).render(<SkillsGrid />);
});
