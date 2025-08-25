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

    let lastScroll = window.scrollY;
    let ticking = false;          // rAF gate
    let isHidden = false;         // current chrome visibility
    let headerBottom = 0;         // cached threshold

    const hamburgerIcon = "url('/images/menu-toggle/menu.svg')";
    const closeIcon = "url('/images/menu-toggle/close.svg')";
    const headerHideOffset = 280; // same behavior as before

    // ---------- helpers ----------
    const uiEls = [toggle, nameLabel, mobileThemeContainer];

    function showMobileChrome() {
        uiEls.forEach(el => {
            el?.classList.remove("hidden-toggle", "shifted-up", "visible-delay");
            el?.classList.add("visible-toggle");
        });
        [topBar, menu].forEach(el => el?.classList.remove("shifted-up"));
    }

    function hideMobileChrome() {
        uiEls.forEach(el => {
            el?.classList.remove("visible-toggle", "visible-delay");
            el?.classList.add("hidden-toggle");
        });
    }

    function forceShowNav() {
        showMobileChrome();
        isHidden = false;
        lastScroll = window.scrollY; // reset baseline after jumps
    }

    // cache geometry once per viewport change (not every scroll)
    function measure() {
        const rect = header.getBoundingClientRect();
        headerBottom = rect.top + window.scrollY + rect.height - headerHideOffset;
    }

    measure();
    window.addEventListener("resize", measure, { passive: true });
    window.addEventListener("orientationchange", () => setTimeout(measure, 250), { passive: true });

    // ---------- toggle (hamburger) ----------
    toggle.addEventListener("click", () => {
        const isOpen = menu.getAttribute("data-active") === "true";
        const newState = !isOpen;

        menu.setAttribute("data-active", String(newState));
        toggle.setAttribute("aria-expanded", String(newState));
        toggle.style.backgroundImage = newState ? closeIcon : hamburgerIcon;

        if (newState) showMobileChrome(); // same behavior
    });

    // close menu on link click; keep chrome visible after jump
    menu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            menu.setAttribute("data-active", "false");
            toggle.setAttribute("aria-expanded", "false");
            toggle.style.backgroundImage = hamburgerIcon;
            forceShowNav();
        });
    });

    // also show again on hash change
    window.addEventListener("hashchange", forceShowNav);

    // ---------- scroll (single rAF; same thresholds/feel) ----------
    function onScrollRAF() {
        ticking = false;

        const y = window.scrollY;
        const scrollingDown = y > lastScroll;
        const scrollingUp = y < lastScroll;
        const atTop = y <= 0;
        const isOpen = menu.getAttribute("data-active") === "true";

        // hide on scroll down after passing hero
        if (scrollingDown && y > headerBottom) {
            if (!isHidden) {
                hideMobileChrome();
                if (isOpen) [topBar, menu, toggle, nameLabel, mobileThemeContainer]
                    .forEach(el => el?.classList.add("shifted-up"));
                isHidden = true;
            }
        }

        // show again anywhere on scroll-up, or at top
        if ((scrollingUp || atTop) && isHidden) {
            uiEls.forEach(el => {
                el?.classList.remove("hidden-toggle");
                el?.classList.add("visible-toggle");
            });

            if (isOpen) {
                [topBar, menu, toggle, nameLabel, mobileThemeContainer]
                    .forEach(el => el?.classList.remove("shifted-up"));
                uiEls.forEach(el => el?.classList.add("visible-delay"));
            } else {
                uiEls.forEach(el => el?.classList.remove("visible-delay", "shifted-up"));
            }

            isHidden = false;
        }

        lastScroll = y;
    }

    window.addEventListener("scroll", () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(onScrollRAF);
        }
    }, { passive: true });
});

