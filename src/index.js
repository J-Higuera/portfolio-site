
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
// === View degree/certification ===
const images = document.querySelectorAll(".certificate-row img");
let isAnimating = false;

images.forEach((img) => {
    img.addEventListener("click", () => {
        if (document.querySelector(".zoom-backdrop") || isAnimating) return;
        isAnimating = true;

        const rect = img.getBoundingClientRect(); // get actual size
        const computed = getComputedStyle(img);

        // Backdrop
        const backdrop = document.createElement("div");
        backdrop.classList.add("zoom-backdrop");
        document.body.appendChild(backdrop);

        // Placeholder
        const placeholder = document.createElement("div");
        ["display", "verticalAlign", "marginTop", "marginRight", "marginBottom", "marginLeft"]
            .forEach(prop => {
                placeholder.style[prop] = computed[prop];
            });

        // NEW: lock width/height so text doesn’t move
        placeholder.style.width = rect.width + "px";
        placeholder.style.height = rect.height + "px";
        placeholder.style.flex = `0 0 ${rect.width}px`; // fixed flex-basis
        placeholder.style.flexShrink = "0";

        // Insert placeholder, move image to <body>
        img.parentNode.insertBefore(placeholder, img);
        document.body.appendChild(img);

        // Zoom styles
        img.classList.add("zoomed-real");
        img.style.position = "fixed";
        img.style.top = "50%";
        img.style.left = "50%";
        img.style.transform = "translate(-50%, -50%)";
        img.style.maxWidth = "90vw";
        img.style.maxHeight = "90vh";
        img.style.width = "auto";
        img.style.height = "auto";
        img.style.zIndex = "1001";
        img.style.transition = "opacity 0.8s ease";
        img.style.opacity = "0";

        requestAnimationFrame(() => {
            backdrop.classList.add("show");
            img.style.opacity = "1";
            setTimeout(() => isAnimating = false, 800);
        });

        // Close on backdrop click
        backdrop.addEventListener("click", () => {
            if (isAnimating) return;
            isAnimating = true;

            img.style.transition = "opacity 0.6s ease";
            img.style.opacity = "0";
            backdrop.classList.remove("show");

            setTimeout(() => {
                img.removeAttribute("style");
                img.classList.remove("zoomed-real");
                placeholder.replaceWith(img);
                img.style.opacity = "0";

                requestAnimationFrame(() => {
                    img.style.transition = "opacity 0.6s ease";
                    img.style.opacity = "1";
                });

                backdrop.remove();
                setTimeout(() => isAnimating = false, 600);
            }, 600);
        });
    });
});

