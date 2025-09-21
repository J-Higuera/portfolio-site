import { createRoot } from 'react-dom/client';
import DockWidget from './react/DockWidget.jsx';

// helper: mount only when visible
function mountOnVisible(rootId, loader, options = { rootMargin: '200px' }) {
    const el = document.getElementById(rootId);
    if (!el) return;

    const io = new IntersectionObserver(async ([entry], obs) => {
        if (!entry.isIntersecting) return;
        obs.disconnect();

        const { default: Comp } = await loader();
        createRoot(el).render(<Comp />);
    }, options);

    io.observe(el);
}

document.addEventListener('DOMContentLoaded', () => {
    // Dock
    const dockTarget = document.getElementById('dock-root');
    if (dockTarget) createRoot(dockTarget).render(<DockWidget />);

    // Skills-Grid
    const skillsTarget = document.getElementById('skills-dock-root');
    if (skillsTarget) createRoot(skillsTarget).render(<SkillsGrid />);

    // GitHub calendar (lazy-loaded)
    mountOnVisible('github-root', () => import('./react/GitHubCalendar.jsx'));
});
