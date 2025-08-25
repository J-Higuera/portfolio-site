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

/* ======================== Mobile Nav ======================== */
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
    let ticking = false;     // rAF gate
    let chromeHidden = false;     // current chrome visibility
    let headerBottom = 0;         // cached threshold
    let lastYForDir = lastScroll;
    const DIR_DEADZONE = 4;

    const hamburgerIcon = "url('/images/menu-toggle/menu.svg')";
    const closeIcon = "url('/images/menu-toggle/close.svg')";
    const headerHideOffset = 280;

    const CHROME = [toggle, nameLabel, mobileThemeContainer];
    const MOVERS = [topBar, menu, toggle, nameLabel, mobileThemeContainer];

    // --------- perf helpers: only react to transitions on the MENU itself ---------
    function beginMenuAnimation(el) {
        el.classList.add("is-animating");
        clearTimeout(el._animTO);
        el._animTO = setTimeout(() => el.classList.remove("is-animating"), 600);
    }
    function endMenuAnimation(el) {
        el.classList.remove("is-animating");
        clearTimeout(el._animTO);
    }
    if (!menu._wired) {
        menu._wired = true;
        menu.addEventListener("transitionstart", (e) => {
            // Ignore bubbled transitions from children (e.g., link hover scale)
            if (e.target !== menu) return;
            if (e.propertyName === "transform" || e.propertyName === "opacity") beginMenuAnimation(menu);
        });
        menu.addEventListener("transitionend", (e) => {
            if (e.target !== menu) return;
            if (e.propertyName === "transform" || e.propertyName === "opacity") endMenuAnimation(menu);
        });
    }

    // --------- geometry (cache per viewport change) ---------
    function measure() {
        const rect = header.getBoundingClientRect();
        headerBottom = (rect.top + window.scrollY) + rect.height - headerHideOffset;
    }
    measure();
    window.addEventListener("load", measure, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    window.addEventListener("orientationchange", () => setTimeout(measure, 250), { passive: true });

    // --------- chrome show/hide ---------
    function showChrome() {
        CHROME.forEach(el => {
            el?.classList.remove("hidden-toggle", "shifted-up", "visible-delay");
            el?.classList.add("visible-toggle");
        });
        MOVERS.forEach(el => el?.classList.remove("shifted-up"));
        chromeHidden = false;
    }
    function hideChrome() {
        CHROME.forEach(el => {
            el?.classList.remove("visible-toggle", "visible-delay");
            el?.classList.add("hidden-toggle");
        });
        chromeHidden = true;
    }
    function forceShowNav() {
        showChrome();
        lastScroll = window.scrollY || 0;
        lastYForDir = lastScroll;
    }

    // --------- helpers for open/close + background scroll lock ---------
    function lockBackgroundScroll(lock) {
        document.documentElement.classList.toggle("lock-scroll", !!lock);
        document.body.classList.toggle("lock-scroll", !!lock);
    }
    function setMenuOpen(state) {
        menu.setAttribute("data-active", String(state));
        toggle.setAttribute("aria-expanded", String(state));
        toggle.style.backgroundImage = state ? closeIcon : hamburgerIcon;
        lockBackgroundScroll(state);
        // Ensure the bottom item is reachable if content is tall:
        if (state) {
            // Scroll menu to top on open so last item isn't clipped
            menu.scrollTop = 0;
        }
    }

    // --------- toggle (hamburger) ---------
    toggle.addEventListener("click", () => {
        const isOpen = menu.getAttribute("data-active") === "true";
        const newState = !isOpen;
        setMenuOpen(newState);
        if (newState) showChrome();
    });

    // Close menu on link click; keep chrome visible after anchor jump
    menu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            setMenuOpen(false);
            forceShowNav();
        });
    });

    // Also show again on hash change (e.g., #contact)
    window.addEventListener("hashchange", forceShowNav);

    // --------- scroll (single rAF with hysteresis) ---------
    function onScrollRAF() {
        ticking = false;

        const y = Math.max(0, window.scrollY || 0);
        const dy = y - lastYForDir;
        const isOpen = menu.getAttribute("data-active") === "true";

        const scrollingDown = dy > DIR_DEADZONE;
        const scrollingUp = dy < -DIR_DEADZONE;
        const atTop = y <= 0;

        // Hide on scroll down after passing hero
        if (scrollingDown && y > headerBottom) {
            if (!chromeHidden) {
                hideChrome();
                if (isOpen) MOVERS.forEach(el => el?.classList.add("shifted-up"));
            }
        }

        // Show anywhere on scroll-up or at top
        if ((scrollingUp || atTop) && chromeHidden) {
            CHROME.forEach(el => {
                el?.classList.remove("hidden-toggle");
                el?.classList.add("visible-toggle");
            });

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


