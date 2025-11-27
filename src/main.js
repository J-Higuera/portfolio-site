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

    if (!loader) {
        // no loader, just unlock immediately
        document.documentElement.classList.remove('loading');
        document.body.classList.remove('loading');
        return;
    }

    // start fade-out
    loader.classList.add('done');

    const finish = () => {
        loader.remove();
        // ✅ only now unlock scroll
        document.documentElement.classList.remove('loading');
        document.body.classList.remove('loading');
    };

    loader.addEventListener('transitionend', finish, { once: true });
    // safety timeout in case transitionend doesn’t fire
    setTimeout(finish, 1500);
});

