import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import DockWidget from './react/DockWidget.jsx';

// ─── Intro Wrapper ────────────────────────────────────────────────────────────
// Mounts the chameleon intro overlay over the page.
// Once onComplete fires, it unmounts and the normal site is visible.

function IntroWrapper() {
    const [done, setDone] = useState(false);
    if (done) return null;
    return <ChameleonIntro onComplete={() => setDone(true)} />;
}

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
    // Chameleon intro — mount into a dedicated root injected into <body>
    const introEl = document.createElement('div');
    introEl.id = 'chameleon-intro-root';
    document.body.prepend(introEl);
    createRoot(introEl).render(<IntroWrapper />);

    // Dock
    const dockTarget = document.getElementById('dock-root');
    if (dockTarget) createRoot(dockTarget).render(<DockWidget />);

    // GitHub calendar (lazy-loaded)
    mountOnVisible('github-root', () => import('./react/GitHubCalendar.jsx'));
});
