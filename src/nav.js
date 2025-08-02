// =============================== Nav ===============================

document.addEventListener("DOMContentLoaded", () => {
    // =================== Desktop Sticky Nav ===================
    // Grabs the desktop navbar element
    const navbar = document.querySelector("nav.sticky-nav");
    let lastScrollY = window.scrollY;

    // On scroll, show or hide the navbar based on scroll direction
    window.addEventListener("scroll", () => {
        const currentScroll = window.scrollY;

        if (currentScroll > lastScrollY && currentScroll > 100) {
            // User is scrolling down past 100px — hide nav
            navbar.classList.add("hidden");
        } else {
            // Scrolling up or near top — show nav
            navbar.classList.remove("hidden");
        }

        lastScrollY = currentScroll;
    });

    // =================== Mobile Nav & Toggle ===================
    const mobileThemeContainer = document.querySelector(".mobile-theme-toggle");
    const toggle = document.querySelector(".mobile-toggle");
    const nameLabel = document.querySelector(".mobile-name");
    const topBar = document.querySelector(".mobile-top-bar");
    const menu = document.getElementById("mobileMenu");
    const header = document.querySelector(".hero");
    const achievements = document.querySelector(".achievements");

    let lastScroll = window.scrollY;

    // Menu icon URLs
    const hamburgerIcon = "url('/images/menu-toggle/menu.svg')";
    const closeIcon = "url('/images/menu-toggle/close.svg')";

    // Set default icon & initial visibility classes
    toggle.style.backgroundImage = hamburgerIcon;
    toggle.classList.add("visible-toggle");
    nameLabel?.classList.add("visible-toggle");
    mobileThemeContainer?.classList.add("visible-toggle");

    // === Menu toggle click handler ===
    toggle.addEventListener("click", () => {
        const isOpen = menu.getAttribute("data-active") === "true";
        const newState = !isOpen;

        // Update state
        menu.setAttribute("data-active", newState);
        toggle.setAttribute("aria-expanded", newState);
        toggle.style.backgroundImage = newState ? closeIcon : hamburgerIcon;

        // Show elements when opening menu
        if (newState) {
            [toggle, nameLabel, mobileThemeContainer].forEach(el => {
                el?.classList.remove("hidden-toggle");
                el?.classList.add("visible-toggle");
            });

            // Reset position if previously shifted up
            [topBar, menu, toggle, nameLabel, mobileThemeContainer].forEach(el => {
                el?.classList.remove("shifted-up");
            });
        }
    });

    // === Auto close menu when a nav link is clicked ===
    menu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            menu.setAttribute("data-active", "false");
            toggle.setAttribute("aria-expanded", "false");
            toggle.style.backgroundImage = hamburgerIcon;
        });
    });

    // === Scroll handler for mobile nav ===
    window.addEventListener("scroll", () => {
        const currentScroll = window.scrollY;
        const scrollingDown = currentScroll > lastScroll;
        const scrollingUp = currentScroll < lastScroll;
        const atTop = currentScroll <= 0;
        const isOpen = menu.getAttribute("data-active") === "true";

        // Used to determine when nav fades out
        const passedHeader = currentScroll > (header.offsetTop + header.offsetHeight - 280);
        const beforeAchievements = currentScroll < (achievements.offsetTop + 1430);

        // === Hide mobile nav UI when scrolling down past hero ===
        if (scrollingDown && passedHeader) {
            [toggle, nameLabel, mobileThemeContainer].forEach(el => {
                el?.classList.remove("visible-toggle", "visible-delay");
                el?.classList.add("hidden-toggle");
            });

            if (isOpen) {
                // Shift up mobile nav if menu is open
                [topBar, menu, toggle, nameLabel, mobileThemeContainer].forEach(el => {
                    el?.classList.add("shifted-up");
                });
            }
        }

        // === Reveal mobile nav when scrolling up or at top ===
        if ((scrollingUp && beforeAchievements) || atTop) {
            [toggle, nameLabel, mobileThemeContainer].forEach(el => {
                el?.classList.remove("hidden-toggle");
                el?.classList.add("visible-toggle");
            });

            if (isOpen) {
                // Fade in items if menu is open
                [toggle, nameLabel, mobileThemeContainer].forEach(el => {
                    el?.classList.add("visible-delay");
                });

                // Restore position
                [topBar, menu, toggle, nameLabel, mobileThemeContainer].forEach(el => {
                    el?.classList.remove("shifted-up");
                });
            } else {
                // Clean up delay/shift classes when menu is closed
                [toggle, nameLabel, mobileThemeContainer].forEach(el => {
                    el?.classList.remove("visible-delay", "shifted-up");
                });
            }
        }

        lastScroll = currentScroll;
    });
});