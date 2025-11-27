// Import other site scripts
import './index.js';
import './nav.js';
import './projects.js';
import './scroll.js';
import './theme.js';
import './react-entry.jsx';

// === Loading screen control ===
window.addEventListener('load', () => {
    const loader = document.getElementById('site-loader');

    // allow page scroll again
    document.documentElement.classList.remove('loading');
    document.body.classList.remove('loading');

    if (!loader) return;

    // fade out
    loader.classList.add('done');

    // remove from DOM after transition so it doesn’t eat clicks
    loader.addEventListener('transitionend', () => {
        loader.remove();
    }, { once: true });
});
