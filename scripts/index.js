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
    // Select elements
    const achievementsSection = document.querySelector('.achievements');
    const achievementCards = document.querySelectorAll('.achievements-card');

    const skillsSection = document.querySelector('.skills');
    const skillsContainer = document.querySelector('.skills');
    const skillsIcons = document.querySelectorAll('.skills-grid img');

    let achievementsRunning = false;
    let skillsRunning = false;

    // === Observer for achievements ===
    const achievementsObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !achievementsRunning) {
                achievementsRunning = true;
                runAchievementsSequence();
            } else if (!entry.isIntersecting) {
                achievementsRunning = false;
            }
        });
    }, { threshold: 0.3 });

    achievementsObserver.observe(achievementsSection);

    // === Observer for skills ===
    const skillsObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !skillsRunning) {
                skillsRunning = true;
                runSkillsSequence();
            } else if (!entry.isIntersecting) {
                skillsRunning = false;
            }
        });
    }, { threshold: 0.3 });

    skillsObserver.observe(skillsSection);

    // === Achievements sequence ===
    async function runAchievementsSequence() {
        while (achievementsRunning) {
            for (let card of achievementCards) {
                card.classList.add('animate');
                await delay(1000);
                card.classList.remove('animate');
            }
            await delay(1500); // pause before looping
        }
    }

    // === Skills sequence ===
    async function runSkillsSequence() {
        while (skillsRunning) {
            skillsContainer.classList.add('animate'); // add border + glow
            for (let icon of skillsIcons) {
                icon.classList.add('animate');
                await delay(1000);
                icon.classList.remove('animate');
            }
            skillsContainer.classList.remove('animate'); // remove glow
            await delay(1500);
        }
    }

    // === Delay helper ===
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
});





