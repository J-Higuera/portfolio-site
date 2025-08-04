// =============================== Nav ===============================
document.addEventListener("DOMContentLoaded", () => {
    const navbar = document.querySelector("nav.sticky-nav");
    let lastScrollY = window.scrollY;

    const mobileThemeContainer = document.querySelector(".mobile-theme-toggle");
    const toggle = document.querySelector(".mobile-toggle");
    const nameLabel = document.querySelector(".mobile-name");
    const topBar = document.querySelector(".mobile-top-bar");
    const menu = document.getElementById("mobileMenu");
    const header = document.querySelector(".hero");
    const achievements = document.querySelector(".achievements");

    let lastScroll = window.scrollY;

    const hamburgerIcon = "url('/images/menu-toggle/menu.svg')";
    const closeIcon = "url('/images/menu-toggle/close.svg')";

    toggle.style.backgroundImage = hamburgerIcon;
    toggle.classList.add("visible-toggle");
    nameLabel?.classList.add("visible-toggle");
    mobileThemeContainer?.classList.add("visible-toggle");

    toggle.addEventListener("click", () => {
        const isOpen = menu.getAttribute("data-active") === "true";
        const newState = !isOpen;

        menu.setAttribute("data-active", newState);
        toggle.setAttribute("aria-expanded", newState);
        toggle.style.backgroundImage = newState ? closeIcon : hamburgerIcon;

        if (newState) {
            [toggle, nameLabel, mobileThemeContainer].forEach(el => {
                el?.classList.remove("hidden-toggle");
                el?.classList.add("visible-toggle");
            });

            [topBar, menu, toggle, nameLabel, mobileThemeContainer].forEach(el => {
                el?.classList.remove("shifted-up");
            });
        }
    });

    menu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            menu.setAttribute("data-active", "false");
            toggle.setAttribute("aria-expanded", "false");
            toggle.style.backgroundImage = hamburgerIcon;
        });
    });

    // =================== Throttle Utility ===================
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

    // =================== Desktop Scroll Handler (mobile-style)
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

    // =================== Mobile Scroll Handler ===================
    const handleMobileScroll = throttle(() => {
        const currentScroll = window.scrollY;
        const scrollingDown = currentScroll > lastScroll;
        const scrollingUp = currentScroll < lastScroll;
        const atTop = currentScroll <= 0;
        const isOpen = menu.getAttribute("data-active") === "true";

        const passedHeader = currentScroll > (header.offsetTop + header.offsetHeight - 280);
        const beforeAchievements = currentScroll < (achievements.offsetTop + 1430);

        if (scrollingDown && passedHeader) {
            [toggle, nameLabel, mobileThemeContainer].forEach(el => {
                el?.classList.remove("visible-toggle", "visible-delay");
                el?.classList.add("hidden-toggle");
            });

            if (isOpen) {
                [topBar, menu, toggle, nameLabel, mobileThemeContainer].forEach(el => {
                    el?.classList.add("shifted-up");
                });
            }
        }

        if ((scrollingUp && beforeAchievements) || atTop) {
            [toggle, nameLabel, mobileThemeContainer].forEach(el => {
                el?.classList.remove("hidden-toggle");
                el?.classList.add("visible-toggle");
            });

            if (isOpen) {
                [toggle, nameLabel, mobileThemeContainer].forEach(el => {
                    el?.classList.add("visible-delay");
                });

                [topBar, menu, toggle, nameLabel, mobileThemeContainer].forEach(el => {
                    el?.classList.remove("shifted-up");
                });
            } else {
                [toggle, nameLabel, mobileThemeContainer].forEach(el => {
                    el?.classList.remove("visible-delay", "shifted-up");
                });
            }
        }

        lastScroll = currentScroll;
    }, 50);
    window.addEventListener("scroll", handleMobileScroll, { passive: true });
});
