import { createRoot } from 'react-dom/client';
import registry from './react/islands';

function mount(el) {
    const name = el.getAttribute('data-react-island');
    const loader = registry[name];
    if (!loader) return;
    const propsAttr = el.getAttribute('data-props');
    const props = propsAttr ? JSON.parse(propsAttr) : {};

    loader().then(({ default: Comp }) => {
        const root = createRoot(el);
        root.render(<Comp {...props} />);
    });
}

// Hydrate only when visible to avoid blocking first paint
const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
        if (!e.isIntersecting) return;
        obs.unobserve(e.target);
        mount(e.target);
    });
});
document.querySelectorAll('[data-react-island]').forEach(el => io.observe(el));
