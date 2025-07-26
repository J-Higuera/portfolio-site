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

// hero text animation
document.addEventListener("DOMContentLoaded", () => {
    const phrases = ["apps.", "games.", "websites.", "tools.", "systems."];
    const textElement = document.getElementById("hero-text");

    let currentPhrase = 0;
    let currentLetter = 0;
    let isDeleting = false;

    function type() {
        const word = phrases[currentPhrase];

        if (!isDeleting) {
            textElement.textContent = word.substring(0, currentLetter + 1);
            currentLetter++;

            if (currentLetter === word.length) {
                isDeleting = true;
                setTimeout(type, 1500); // Pause before deleting
                return;
            }
        } else {
            textElement.textContent = word.substring(0, currentLetter - 1);
            currentLetter--;

            if (currentLetter === 0) {
                isDeleting = false;
                currentPhrase = (currentPhrase + 1) % phrases.length;
            }
        }

        setTimeout(type, isDeleting ? 80 : 120);
    }

    type();
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
        await delay(700);
        for (let card of achievementCards) {
            card.classList.add("animate");
            await delay(600);
        }
    }

    function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    runAchievementsSequence();
});

// === View degree ===
document.addEventListener("DOMContentLoaded", () => {
    const images = document.querySelectorAll(".certificate-row img");

    images.forEach((img) => {
        img.addEventListener("click", () => {
            if (document.querySelector(".zoom-backdrop")) return;

            const rect = img.getBoundingClientRect();
            const scrollY = window.scrollY;
            const scrollX = window.scrollX;

            const originalTop = rect.top + scrollY;
            const originalLeft = rect.left + scrollX;

            // Backdrop
            const backdrop = document.createElement("div");
            backdrop.classList.add("zoom-backdrop");
            document.body.appendChild(backdrop);

            // Placeholder
            const placeholder = document.createElement("div");
            const imgStyle = getComputedStyle(img);
            placeholder.style.width = `${rect.width}px`;
            placeholder.style.height = `${rect.height}px`;
            placeholder.style.display = imgStyle.display;
            placeholder.style.verticalAlign = imgStyle.verticalAlign;
            placeholder.style.marginBottom = imgStyle.marginBottom;
            img.parentNode.insertBefore(placeholder, img);

            // Move real image to body
            document.body.appendChild(img);

            // Initial style for fixed positioning
            img.classList.add("zoomed-real");
            img.style.position = "fixed";
            img.style.top = `${rect.top}px`;
            img.style.left = `${rect.left}px`;
            img.style.width = `${rect.width}px`;
            img.style.height = `${rect.height}px`;
            img.style.zIndex = "1001";
            img.style.margin = "0";
            img.style.transition =
                "transform 0.6s ease, top 0.6s ease, left 0.6s ease, width 0.6s ease, height 0.6s ease, opacity 0.4s ease";
            img.style.willChange = "transform, opacity";
            img.style.imageRendering = "auto";
            img.style.backfaceVisibility = "hidden";

            requestAnimationFrame(() => {
                backdrop.classList.add("show");

                const viewportCenterX = window.innerWidth / 2;
                const viewportCenterY = window.innerHeight / 2;

                const imgCenterX = rect.left + scrollX + rect.width / 2;
                const imgCenterY = rect.top + scrollY + rect.height / 2;

                const translateX = viewportCenterX - imgCenterX + scrollX;
                const translateY = viewportCenterY - imgCenterY + scrollY;

                const scaleFactor = Math.min(
                    window.innerWidth * 0.8 / rect.width,
                    window.innerHeight * 0.8 / rect.height
                );

                img.dataset.originalTop = originalTop;
                img.dataset.originalLeft = originalLeft;
                img.dataset.scaleX = translateX;
                img.dataset.scaleY = translateY;
                img.dataset.scale = scaleFactor;

                img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleFactor})`;
            });

            // Zoom-out
            backdrop.addEventListener("click", () => {
                const placeRect = placeholder.getBoundingClientRect();

                const isInView =
                    placeRect.top >= 0 &&
                    placeRect.bottom <= window.innerHeight &&
                    placeRect.left >= 0 &&
                    placeRect.right <= window.innerWidth;

                if (isInView) {
                    const targetTop = parseFloat(img.dataset.originalTop);
                    const targetLeft = parseFloat(img.dataset.originalLeft);

                    img.style.transform = "translate(0px, 0px) scale(1)";
                    img.style.top = `${targetTop - window.scrollY}px`;
                    img.style.left = `${targetLeft - window.scrollX}px`;
                } else {
                    img.style.opacity = "0";
                    img.style.transform = "scale(0.8)";
                }

                backdrop.classList.remove("show");

                setTimeout(() => {
                    img.removeAttribute("style");
                    img.classList.remove("zoomed-real");
                    placeholder.replaceWith(img);
                    backdrop.remove();
                }, 600);
            });
        });
    });
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
                scale = 1 + (1 - distance / maxDistance) * 0.3;
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













