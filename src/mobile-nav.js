document.addEventListener("DOMContentLoaded", () => {
    const mobileThemeContainer = document.querySelector(".mobile-theme-toggle");
    const toggle = document.querySelector(".mobile-toggle");
    const nameLabel = document.querySelector(".mobile-name");
    const topBar = document.querySelector(".mobile-top-bar");
    const menu = document.getElementById("mobileMenu");
    const header = document.querySelector(".hero");
    const about = document.getElementById("about");

    let lastScroll = window.scrollY;

    // Two possible paths
    const menuPaths = [
        "/public/images/menu-toggle/menu.svg",
        "/images/menu-toggle/menu.svg"
    ];
    const closePaths = [
        "/public/images/menu-toggle/close.svg",
        "/images/menu-toggle/close.svg"
    ];

    // Function to try loading the first path, fallback if error
    function loadFirstAvailable(paths, callback) {
        const img = new Image();
        let index = 0;

        function tryNext() {
            if (index >= paths.length) {
                callback(null); // all failed
                return;
            }
            img.src = paths[index];
            img.onload = () => callback(`url('${paths[index]}')`);
            img.onerror = () => {
                index++;
                tryNext();
            };
        }

        tryNext();
    }

    // Load both icons and continue setup after successful fetch
    loadFirstAvailable(menuPaths, (hamburgerIcon) => {
        loadFirstAvailable(closePaths, (closeIcon) => {
            // If either fails entirely, you can optionally set a default/fallback
            const hamburger = hamburgerIcon || "none";
            const close = closeIcon || "none";

            toggle.style.backgroundImage = hamburger;
            toggle.classList.add("visible-toggle");
            nameLabel?.classList.add("visible-toggle");
            mobileThemeContainer?.classList.add("visible-toggle");

            toggle.addEventListener("click", () => {
                const isOpen = menu.getAttribute("data-active") === "true";
                const newState = !isOpen;

                menu.setAttribute("data-active", newState);
                toggle.setAttribute("aria-expanded", newState);
                toggle.style.backgroundImage = newState ? close : hamburger;

                if (newState) {
                    toggle.classList.remove("hidden-toggle");
                    nameLabel?.classList.remove("hidden-toggle");
                    mobileThemeContainer?.classList.remove("hidden-toggle");

                    toggle.classList.add("visible-toggle");
                    nameLabel?.classList.add("visible-toggle");
                    mobileThemeContainer?.classList.add("visible-toggle");

                    topBar?.classList.remove("shifted-up");
                    menu.classList.remove("shifted-up");
                    toggle.classList.remove("shifted-up");
                    nameLabel?.classList.remove("shifted-up");
                    mobileThemeContainer?.classList.remove("shifted-up");
                }
            });

            menu.querySelectorAll("a").forEach(link => {
                link.addEventListener("click", () => {
                    menu.setAttribute("data-active", "false");
                    toggle.setAttribute("aria-expanded", "false");
                    toggle.style.backgroundImage = hamburger;
                });
            });

            window.addEventListener("scroll", () => {
                const currentScroll = window.scrollY;
                const scrollingDown = currentScroll > lastScroll;
                const scrollingUp = currentScroll < lastScroll;
                const atTop = currentScroll <= 0;
                const isOpen = menu.getAttribute("data-active") === "true";

                const passedHeader = currentScroll > (header.offsetTop + header.offsetHeight - 280);
                const beforeAbout = currentScroll < (about.offsetTop + 1430);

                if (scrollingDown && passedHeader) {
                    toggle.classList.remove("visible-toggle", "visible-delay");
                    toggle.classList.add("hidden-toggle");

                    nameLabel?.classList.remove("visible-toggle", "visible-delay");
                    nameLabel?.classList.add("hidden-toggle");

                    mobileThemeContainer?.classList.remove("visible-toggle", "visible-delay");
                    mobileThemeContainer?.classList.add("hidden-toggle");

                    if (isOpen) {
                        topBar?.classList.add("shifted-up");
                        menu.classList.add("shifted-up");
                        toggle.classList.add("shifted-up");
                        nameLabel?.classList.add("shifted-up");
                        mobileThemeContainer?.classList.add("shifted-up");
                    }
                }

                if ((scrollingUp && beforeAbout) || atTop) {
                    toggle.classList.remove("hidden-toggle");
                    nameLabel?.classList.remove("hidden-toggle");
                    mobileThemeContainer?.classList.remove("hidden-toggle");

                    toggle.classList.add("visible-toggle");
                    nameLabel?.classList.add("visible-toggle");
                    mobileThemeContainer?.classList.add("visible-toggle");

                    if (isOpen) {
                        toggle.classList.add("visible-delay");
                        nameLabel?.classList.add("visible-delay");
                        mobileThemeContainer?.classList.add("visible-delay");

                        topBar?.classList.remove("shifted-up");
                        menu.classList.remove("shifted-up");
                        toggle.classList.remove("shifted-up");
                        nameLabel?.classList.remove("shifted-up");
                        mobileThemeContainer?.classList.remove("shifted-up");
                    } else {
                        toggle.classList.remove("visible-delay");
                        nameLabel?.classList.remove("visible-delay");
                        mobileThemeContainer?.classList.remove("visible-delay");

                        mobileThemeContainer?.classList.remove("shifted-up");
                    }
                }

                lastScroll = currentScroll;
            });
        });
    });
});
