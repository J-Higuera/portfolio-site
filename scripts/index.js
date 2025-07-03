
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
        await delay(1200); // adjust to taste: 500–1500ms feels nice

        for (let card of achievementCards) {
            card.classList.add("animate");
            await delay(1200); // your normal stagger
        }
    }


    // === Skills sequence ===
    async function runSkillsSequence() {
        while (skillsRunning) {
            skillsContainer.classList.add("animate"); // glow + border
            for (let icon of skillsIcons) {
                if (!skillsRunning) break; // stop mid-loop if user scrolls away
                icon.classList.add("animate");
                await delay(1000);
                icon.classList.remove("animate");
            }
            skillsContainer.classList.remove("animate");
            await delay(1700);
        }
    }

    // === Delay helper ===
    function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    // === Run Achievements once on page load too ===
    runAchievementsSequence();
});






