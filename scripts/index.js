// === Sticky Nav ===
document.addEventListener("DOMContentLoaded", () => {
    const navbar = document.querySelector("nav.sticky-nav");
    let lastScrollY = window.scrollY;

    window.addEventListener("scroll", () => {
        const currentScroll = window.scrollY;

        if (currentScroll > lastScrollY && currentScroll > 100) {
            navbar.classList.add("hidden");
        } else {
            navbar.classList.remove("hidden");
        }

        lastScrollY = currentScroll;
    });
});

// === Achievements ===
document.addEventListener("DOMContentLoaded", () => {
    const achievementsSection = document.querySelector(".achievements");
    const achievementCards = document.querySelectorAll(".achievements-card");

    let achievementsRunning = false;

    const achievementsObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !achievementsRunning) {
                    achievementsRunning = true;
                    runAchievementsSequence();
                } else if (!entry.isIntersecting) {
                    achievementsRunning = false;
                    achievementCards.forEach((card) => card.classList.remove("animate"));
                }
            });
        },
        { threshold: 0.3 }
    );

    achievementsObserver.observe(achievementsSection);

    async function runAchievementsSequence() {
        await delay(800);
        for (let card of achievementCards) {
            card.classList.add("animate");
            await delay(1000);
        }
    }

    function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    runAchievementsSequence();
});

// === Skills-mobile ===
document.addEventListener("DOMContentLoaded", () => {
    const skillsSection = document.querySelector(".skills");
    const skillsIcons = document.querySelectorAll(".skills-grid img");

    const skillsObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                skillsSection.classList.add("animate");
                skillsIcons.forEach((icon) => icon.classList.add("show"));
            } else {
                skillsSection.classList.remove("animate");
                skillsIcons.forEach((icon) => icon.classList.remove("show"));
            }
        });
    }, { threshold: 0.3 });

    skillsObserver.observe(skillsSection);
});

// === skills-desktop conveyor belt animation === 
document.addEventListener("DOMContentLoaded", () => {
    const wrapper = document.querySelector(".skills-wrapper");
    const track = document.querySelector(".skills-track");

    // Only run if both exist
    if (!wrapper || !track) return;

    let hasStarted = false;

    // Observer: when section is visible, start conveyor animation & glow
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasStarted) {
                track.style.animation = "conveyor 35s linear infinite";
                hasStarted = true;

                const skillsSection = wrapper.closest('.skills');
                if (skillsSection) {
                    skillsSection.classList.add('active');
                }
            }
        });
    }, {
        threshold: 0.2
    });

    observer.observe(wrapper);

    // Smooth magnifying glass effect with dynamic window size handling
    const icons = wrapper.querySelectorAll(".skills-grid img");
    let isMagnifying = false;

    const magnify = () => {
        if (window.innerWidth < 900) {
            isMagnifying = false; // stop loop
            return;
        }

        const wrapRect = wrapper.getBoundingClientRect();
        const centerX = wrapRect.left + wrapRect.width / 2 + 40;

        icons.forEach(icon => {
            const rect = icon.getBoundingClientRect();
            const iconCenter = rect.left + rect.width / 2;
            const distance = Math.abs(centerX - iconCenter);
            const maxDistance = wrapRect.width / 3;

            let scale = 1;
            if (distance < maxDistance) {
                scale = 1 + (1 - distance / maxDistance) * 0.4;
                icon.style.filter = "drop-shadow(0 0 1.3px rgba(97, 97, 97, 0.65)) drop-shadow(0 0 0.7px rgba(141, 141, 141, 0.65))";
            } else {
                icon.style.filter = "drop-shadow(0 0 0.6px rgba(255, 255, 255, 0)) drop-shadow(0 0 1px rgba(255, 255, 255, 0))";
            }

            icon.style.transform = `scale(${scale})`;
        });

        if (isMagnifying) {
            requestAnimationFrame(magnify);
        }
    };

    const checkMagnify = () => {
        if (window.innerWidth >= 900 && !isMagnifying) {
            isMagnifying = true;
            magnify();
        } else if (window.innerWidth < 900 && isMagnifying) {
            isMagnifying = false;
            // Reset icons instantly for mobile
            icons.forEach(icon => {
                icon.style.transform = "scale(1)";
                icon.style.filter = "drop-shadow(0 0 0.6px rgba(255, 255, 255, 0)) drop-shadow(0 0 2px rgba(255, 255, 255, 0))";
            });
        }
    };

    // Run on load
    checkMagnify();

    // Run on resize
    window.addEventListener("resize", checkMagnify);
});












