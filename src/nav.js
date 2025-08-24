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
    // achievements is no longer used for gating visibility, but we keep the node for layout if needed.
    const achievements = document.querySelector(".achievements");

    if (!toggle || !menu || !header) return;

    let lastScroll = window.scrollY;

    const hamburgerIcon = "url('/images/menu-toggle/menu.svg')";
    const closeIcon = "url('/images/menu-toggle/close.svg')";
    const headerHideOffset = 280; // how far past the hero before we hide on scroll-down

    // initial UI state
    toggle.style.backgroundImage = hamburgerIcon;
    toggle.classList.add("visible-toggle");
    nameLabel?.classList.add("visible-toggle");
    mobileThemeContainer?.classList.add("visible-toggle");

    // helpers
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

    function showMobileChrome() {
        [toggle, nameLabel, mobileThemeContainer].forEach((el) => {
            el?.classList.remove("hidden-toggle", "shifted-up", "visible-delay");
            el?.classList.add("visible-toggle");
        });
        [topBar, menu].forEach((el) => el?.classList.remove("shifted-up"));
    }

    function hideMobileChrome() {
        [toggle, nameLabel, mobileThemeContainer].forEach((el) => {
            el?.classList.remove("visible-toggle", "visible-delay");
            el?.classList.add("hidden-toggle");
        });
    }

    function forceShowNav() {
        showMobileChrome();
        lastScroll = window.scrollY; // reset scroll baseline after jumps
    }

    // toggle (hamburger) click
    toggle.addEventListener("click", () => {
        const isOpen = menu.getAttribute("data-active") === "true";
        const newState = !isOpen;

        menu.setAttribute("data-active", String(newState));
        toggle.setAttribute("aria-expanded", String(newState));
        toggle.style.backgroundImage = newState ? closeIcon : hamburgerIcon;

        if (newState) {
            // ensure everything is visible when opening
            showMobileChrome();
        }
    });

    // close menu + make controls visible when a menu link is clicked (anchor jump)
    menu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            menu.setAttribute("data-active", "false");
            toggle.setAttribute("aria-expanded", "false");
            toggle.style.backgroundImage = hamburgerIcon;

            // force nav back to visible state after the jump
            showMobileChrome();

            // sync scroll baseline to the new position
            lastScroll = window.scrollY;
        });
    });

    // bring nav back whenever the URL hash changes (e.g., #contact)
    window.addEventListener("hashchange", forceShowNav);

    // main scroll logic
    const handleMobileScroll = throttle(() => {
        const currentScroll = window.scrollY;
        const scrollingDown = currentScroll > lastScroll;
        const scrollingUp = currentScroll < lastScroll;
        const atTop = currentScroll <= 0;
        const isOpen = menu.getAttribute("data-active") === "true";

        const passedHeader =
            currentScroll > header.offsetTop + header.offsetHeight - headerHideOffset;

        // if menu is open, temporarily disable transitions (optional)
        if (isOpen) {
            document.body.setAttribute("data-scrolling", "true");
            clearTimeout(window._navScrollTimer);
            window._navScrollTimer = setTimeout(() => {
                document.body.removeAttribute("data-scrolling");
            }, 150);
        }

        // hide on scroll down after passing hero
        if (scrollingDown && passedHeader) {
            hideMobileChrome();
            if (isOpen) {
                [topBar, menu, toggle, nameLabel, mobileThemeContainer].forEach((el) =>
                    el?.classList.add("shifted-up")
                );
            }
        }

        // show again anywhere on scroll-up, or at top
        if (scrollingUp || atTop) {
            [toggle, nameLabel, mobileThemeContainer].forEach((el) => {
                el?.classList.remove("hidden-toggle");
                el?.classList.add("visible-toggle");
            });

            if (isOpen) {
                [topBar, menu, toggle, nameLabel, mobileThemeContainer].forEach((el) =>
                    el?.classList.remove("shifted-up")
                );
                [toggle, nameLabel, mobileThemeContainer].forEach((el) =>
                    el?.classList.add("visible-delay")
                );
            } else {
                [toggle, nameLabel, mobileThemeContainer].forEach((el) =>
                    el?.classList.remove("visible-delay", "shifted-up")
                );
            }
        }

        lastScroll = currentScroll;
    }, 50);

    window.addEventListener("scroll", handleMobileScroll, { passive: true });
});
