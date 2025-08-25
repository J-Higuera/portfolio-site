"use strict";

/* ======================== Desktop Nav ======================== */
document.addEventListener("DOMContentLoaded", () => {
    const navbar = document.querySelector("nav.sticky-nav");
    if (!navbar) return;

    let lastScrollY = window.scrollY;

    function throttle(fn, wait) {
        let lastCall = 0;
        return function (...args) {
            const now = Date.now();
            if (now - lastCall >= wait) {
                lastCall = now;
                fn.apply(this, args);
            }
        };
    }

    const handleDesktopScroll = throttle(() => {
        const currentScroll = window.scrollY;
        const scrollingDown = currentScroll > lastScrollY && currentScroll > 100;
        const scrollingUp = currentScroll < lastScrollY;

        if (scrollingDown) {
            navbar.classList.remove("visible-toggle");
            navbar.classList.add("hidden-toggle");
        }

        if (scrollingUp || currentScroll <= 0) {
            navbar.classList.remove("hidden-toggle");
            navbar.classList.add("visible-toggle");
        }

        lastScrollY = currentScroll;
    }, 50);

    window.addEventListener("scroll", handleDesktopScroll, { passive: true });
});

/* ======================== Mobile Nav (clean) ======================== */
document.addEventListener("DOMContentLoaded", () => {
    const mobileThemeContainer = document.querySelector(".mobile-theme-toggle");
    const toggle = document.querySelector(".mobile-toggle");
    const nameLabel = document.querySelector(".mobile-name");
    const topBar = document.querySelector(".mobile-top-bar");
    const menu = document.getElementById("mobileMenu");
    const header = document.querySelector(".hero");
    if (!toggle || !menu || !header) return;

    // --- state ---
    let lastScroll = window.scrollY || 0;
    let ticking = false;             // rAF gate
    let chromeHidden = false;             // whether UI chrome is hidden
    let headerBottom = 0;                 // px from doc top where hero ends (minus offset)
    let lastYForDir = lastScroll;
    const DIR_DEADZONE = 4;               // px hysteresis to avoid flicker
    const HEADER_HIDE_OFFSET = 280;

    const HAMBURGER = "url('/images/menu-toggle/menu.svg')";
    const CLOSE = "url('/images/menu-toggle/close.svg')";

    // elements affected together
    const CHROME = [toggle, nameLabel, mobileThemeContainer];
    const MOVERS = [topBar, menu, toggle, nameLabel, mobileThemeContainer];

    // ----- geometry -----
    function measure() {
        const r = header.getBoundingClientRect();
        headerBottom = (r.top + window.scrollY) + r.height - HEADER_HIDE_OFFSET;
    }
    measure();
    window.addEventListener("load", measure, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    window.addEventListener("orientationchange", () => setTimeout(measure, 250), { passive: true });

    // ----- chrome show/hide -----
    function showChrome() {
        CHROME.forEach(el => el?.classList.remove("hidden-toggle", "shifted-up", "visible-delay"));
        MOVERS.forEach(el => el?.classList.remove("shifted-up"));
        chromeHidden = false;
    }
    function hideChrome() {
        CHROME.forEach(el => el?.classList.add("hidden-toggle"));
        chromeHidden = true;
    }
    function forceShowNav() {
        showChrome();
        lastScroll = window.scrollY || 0;
        lastYForDir = lastScroll;
    }

    // ----- open/close -----
    function setMenuOpen(open) {
        menu.setAttribute("data-active", String(open));
        toggle.setAttribute("aria-expanded", String(open));
        toggle.style.backgroundImage = open ? CLOSE : HAMBURGER;
        if (open) menu.scrollTop = 0; // ensure bottom link isn’t clipped on open
    }

    toggle.addEventListener("click", () => {
        const isOpen = menu.getAttribute("data-active") === "true";
        const next = !isOpen;
        setMenuOpen(next);
        if (next) showChrome();
    });

    // Close after clicking a link; keep chrome visible after the jump
    menu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            setMenuOpen(false);
            forceShowNav();
        });
    });

    // Also fix state after hash changes (e.g., #contact)
    window.addEventListener("hashchange", forceShowNav);

    // ----- scroll (single rAF with hysteresis) -----
    function onScrollRAF() {
        ticking = false;

        const y = Math.max(0, window.scrollY || 0);
        const dy = y - lastYForDir;
        const scrollingDown = dy > DIR_DEADZONE;
        const scrollingUp = dy < -DIR_DEADZONE;
        const atTop = y <= 0;
        const isOpen = menu.getAttribute("data-active") === "true";

        // hide on scroll down after passing hero
        if (scrollingDown && y > headerBottom) {
            if (!chromeHidden) {
                hideChrome();
                if (isOpen) MOVERS.forEach(el => el?.classList.add("shifted-up"));
            }
        }

        // show anywhere on scroll up or at top
        if ((scrollingUp || atTop) && chromeHidden) {
            CHROME.forEach(el => el?.classList.remove("hidden-toggle"));
            if (isOpen) {
                MOVERS.forEach(el => el?.classList.remove("shifted-up"));
                CHROME.forEach(el => el?.classList.add("visible-delay"));
            } else {
                CHROME.forEach(el => el?.classList.remove("visible-delay", "shifted-up"));
            }
            chromeHidden = false;
        }

        if (Math.abs(dy) > DIR_DEADZONE) lastYForDir = y;
    }

    window.addEventListener("scroll", () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(onScrollRAF);
        }
    }, { passive: true });
});



