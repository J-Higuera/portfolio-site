
//sticky nav
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




//Scroll-triggered Section Animations 

document.addEventListener("DOMContentLoaded", () => {
    // === Get sections & elements ===
    const achievementsSection = document.querySelector(".achievements");
    const achievementCards = document.querySelectorAll(".achievements-card");

    const skillsSection = document.querySelector(".skills");
    const skillsContainer = document.querySelector(".skills");
    const skillsIcons = document.querySelectorAll(".skills-grid img");

    let achievementsRunning = false;
    let skillsRunning = false;

    // Achievements Observer
    const achievementsObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !achievementsRunning) {
                    achievementsRunning = true;
                    skillsRunning = false; // stop skills loop if needed
                    runAchievementsSequence();
                } else if (!entry.isIntersecting) {
                    achievementsRunning = false;
                    // Reset so they can re-animate on next scroll in
                    achievementCards.forEach((card) => card.classList.remove("animate"));
                }
            });
        },
        { threshold: 0.3 }
    );

    achievementsObserver.observe(achievementsSection);

    // === Skills Observer 
    const skillsObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !skillsRunning) {
                    skillsRunning = true;
                    achievementsRunning = false; // stop achievements if needed
                    runSkillsSequence();
                } else if (!entry.isIntersecting) {
                    skillsRunning = false;
                }
            });
        },
        { threshold: 0.3 }
    );

    skillsObserver.observe(skillsSection);

    // === Achievements sequence ===
    async function runAchievementsSequence() {
        // Add a pause BEFORE starting the first card
        await delay(800); // adjust to taste: 500–1500ms feels nice

        for (let card of achievementCards) {
            card.classList.add("animate");
            await delay(1000); // your normal stagger
        }
    }


    // === Skills sequence ===
    async function runSkillsSequence() {
        while (skillsRunning) {
            skillsContainer.classList.add("animate");
            skillsIcons.forEach(icon => icon.classList.add("pulse"));
            await delay(5000); // how long you want it to run per cycle
            if (!skillsRunning) break;
            skillsIcons.forEach(icon => icon.classList.remove("pulse"));
            skillsContainer.classList.remove("animate");
            await delay(1000); // pause before repeating
        }
    }
    // === Delay helper ===
    function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    // === Run Achievements once on page load too ===
    runAchievementsSequence();
});

document.addEventListener("DOMContentLoaded", () => {
    const skillsSection = document.querySelector(".skills");
    const skillsGrid = document.querySelector(".skills-grid");
    const skillsIcons = document.querySelectorAll(".skills-grid img");

    let skillsRunning = false;

    const skillsObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !skillsRunning) {
                    skillsRunning = true;
                    runSkillsSequence();
                } else if (!entry.isIntersecting) {
                    skillsRunning = false;
                    // Reset for next scroll
                    skillsGrid.classList.remove("expand");
                    skillsIcons.forEach(icon => {
                        icon.classList.remove("show");
                        icon.classList.remove("pulse");
                    });
                }
            });
        },
        { threshold: 0.3 }
    );

    skillsObserver.observe(skillsSection);

    async function runSkillsSequence() {
        // Reset
        skillsGrid.classList.remove("expand");
        skillsIcons.forEach(icon => {
            icon.classList.remove("show");
            icon.classList.remove("pulse");
        });

        // Show one by one in the center
        for (let icon of skillsIcons) {
            icon.classList.add("show");
            await delay(300);  // fade in
            icon.classList.remove("show");
            await delay(300);  // fade out gap
        }

        // Expand outward
        skillsGrid.classList.add("expand");

        // Wait for expand to finish
        await delay(1300);

        // Then start pulse
        skillsIcons.forEach(icon => icon.classList.add("pulse"));
    }

    function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
});








