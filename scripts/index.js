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

document.addEventListener('DOMContentLoaded', () => {
    const section = document.querySelector('.grid-wrapper'); // parent section
    const cards = document.querySelectorAll('.achievements-card');
    const skills = document.querySelector('.skills');
    const icons = document.querySelectorAll('.skills-grid img');

    let running = false;

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting && window.innerWidth <= 768 && !running) {
                running = true;
                runSequence();
            }
        });
    }, { threshold: 0.3 });

    observer.observe(section);

    async function runSequence() {
        // Animate cards
        for (let card of cards) {
            card.classList.add('animate');
            await delay(1000);
            card.classList.remove('animate');
        }

        // Activate skills container glow
        skills.classList.add('animate');

        // Animate icons
        for (let icon of icons) {
            icon.classList.add('animate');
            await delay(1000);
            icon.classList.remove('animate');
        }

        // Deactivate skills container glow
        skills.classList.remove('animate');

        // Loop after short pause
        await delay(1500);
        runSequence();
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
});




