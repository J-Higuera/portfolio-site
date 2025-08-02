
//======================== Hero Text Animation ==================================
// === Hero Text Typewriter Animation ===
document.addEventListener("DOMContentLoaded", () => {
    const phrases = ["apps.", "games.", "websites.", "tools.", "systems."];
    const textElement = document.getElementById("hero-text");

    let currentPhrase = 0;
    let currentLetter = 0;
    let isDeleting = false;

    function type() {
        const word = phrases[currentPhrase];

        // Update only the hero-text span
        if (!isDeleting) {
            textElement.textContent = word.substring(0, currentLetter + 1);
            currentLetter++;

            if (currentLetter === word.length) {
                isDeleting = true;
                setTimeout(type, 1500);
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


//============================ Skills ==================================
document.addEventListener("DOMContentLoaded", () => {
    // === Mobile Skills Animation ===
    const mobileSkillsSection = document.querySelector(".skills1.mobile-only");
    const mobileIcons = mobileSkillsSection?.querySelectorAll(".skills-grid img") || [];

    if (mobileSkillsSection) {
        const mobileObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    mobileSkillsSection.classList.add("animate");
                    mobileIcons.forEach((icon) => icon.classList.add("show"));
                } else {
                    mobileSkillsSection.classList.remove("animate");
                    mobileIcons.forEach((icon) => icon.classList.remove("show"));
                }
            });
        }, { threshold: 0.3 });

        mobileObserver.observe(mobileSkillsSection);
    }

    // === Desktop Conveyor Belt Animation ===
    const wrapper = document.querySelector(".skills-wrapper");
    const track = document.querySelector(".skills-track");
    if (!wrapper || !track) return;

    let hasStarted = false;

    const desktopObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasStarted) {
                track.style.animation = "conveyor 45s linear infinite";
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

    desktopObserver.observe(wrapper);

    const icons = wrapper.querySelectorAll(".skills-grid img");
    let isMagnifying = false;

    const magnify = () => {
        if (window.innerWidth < 900) {
            isMagnifying = false;
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
                scale = 1 + (1 - distance / maxDistance) * 0.22;
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
            icons.forEach(icon => {
                icon.style.transform = "scale(1)";
                icon.style.filter = "drop-shadow(0 0 0.6px rgba(255, 255, 255, 0)) drop-shadow(0 0 2px rgba(255, 255, 255, 0))";
            });
        }
    };

    checkMagnify();
    window.addEventListener("resize", checkMagnify);
});


// ============================ Achievements ==================================
// === View degree ===
document.addEventListener("DOMContentLoaded", () => {
    // Select all certificate images inside the .certificate-row container
    const images = document.querySelectorAll(".certificate-row img");
    let isAnimating = false; // Flag to prevent overlapping animations

    // Loop over each certificate image
    images.forEach((img) => {
        img.addEventListener("click", () => {
            // === prevent zoom if another image is already open ===
            if (document.querySelector(".zoom-backdrop") || isAnimating) return;
            isAnimating = true;

            // === Get original position and style of image ===
            const computed = getComputedStyle(img);// for placeholder copy

            // === Create a semi-transparent dark background (modal effect) ===
            const backdrop = document.createElement("div");
            backdrop.classList.add("zoom-backdrop");
            document.body.appendChild(backdrop);

            // === Create a placeholder to keep layout from shifting ===
            const placeholder = document.createElement("div");
            // Copy critical layout styles from the image to placeholder
            ["width", "height", "display", "verticalAlign", "marginTop", "marginRight", "marginBottom", "marginLeft"].forEach(prop => {
                placeholder.style[prop] = computed[prop];
            });

            // === Insert placeholder where the image was, and move image to <body> ===
            img.parentNode.insertBefore(placeholder, img);
            document.body.appendChild(img);

            // === Prepare image styles for fullscreen zoom ===
            img.classList.add("zoomed-real"); // Optional class for styling (like cursor, border, etc.)
            img.style.position = "fixed";
            img.style.top = "50%";
            img.style.left = "50%";
            img.style.transform = "translate(-50%, -50%)";
            img.style.maxWidth = "90vw";
            img.style.maxHeight = "90vh";
            img.style.width = "auto";
            img.style.height = "auto";
            img.style.zIndex = "1001"; // On top of all other content
            img.style.transition = "opacity 0.8s ease";
            img.style.opacity = "0"; // Start invisible

            // === Trigger zoom-in animation ===
            requestAnimationFrame(() => {
                backdrop.classList.add("show"); // Fades in backdrop
                img.style.opacity = "1"; // Fades in image
                setTimeout(() => isAnimating = false, 800); // Reset flag after animation
            });

            // === Handle backdrop click (zoom-out) ===
            backdrop.addEventListener("click", () => {
                if (isAnimating) return;
                isAnimating = true;

                // Fade image out
                img.style.transition = "opacity 0.6s ease";
                img.style.opacity = "0";
                backdrop.classList.remove("show");

                setTimeout(() => {
                    // === Restore image to original location ===
                    img.removeAttribute("style");// Clears inline zoom styles
                    img.classList.remove("zoomed-real");
                    placeholder.replaceWith(img); // Put image back in layout
                    img.style.opacity = "0"; // Start hidden for fade-in

                    // === Fade it back in for smooth return ===
                    requestAnimationFrame(() => {
                        img.style.transition = "opacity 0.6s ease";
                        img.style.opacity = "1";
                    });

                    // Remove the backdrop from DOM
                    backdrop.remove();

                    setTimeout(() => isAnimating = false, 600); // Reset flag
                }, 600); // Duration matches fade-out
            });
        });
    });
});