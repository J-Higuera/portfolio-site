document.addEventListener("DOMContentLoaded", () => {
    const navbar = document.querySelector("nav.sticky-nav");
    let lastScrollY = window.scrollY;

    window.addEventListener("scroll", () => {
        const currentScroll = window.scrollY;

        if (currentScroll > lastScrollY && currentScroll > 100) {
            // Scrolling down
            navbar.classList.add("hidden");
        } else {
            // Scrolling up
            navbar.classList.remove("hidden");
        }

        lastScrollY = currentScroll;
    });
});





