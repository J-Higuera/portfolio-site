import { createRoot } from 'react-dom/client';
import DockWidget from './react/DockWidget.jsx';

// ─── Lazy mount helper ────────────────────────────────────────────────────────
// Mounts a component only when its container scrolls into view.

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

// ─── Bootstrap ───────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    // Dock
    const dockTarget = document.getElementById('dock-root');
    if (dockTarget) createRoot(dockTarget).render(<DockWidget />);

    // GitHub calendar (lazy-loaded)
    mountOnVisible('github-root', () => import('./react/GitHubCalendar.jsx'));
});