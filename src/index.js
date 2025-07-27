
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

    // Select the main section and all tech icons inside the grid
    const skillsSection = document.querySelector(".skills");
    const skillsIcons = document.querySelectorAll(".skills-grid img");

    // Create an IntersectionObserver that triggers when the section enters the viewport
    const skillsObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // Section is visible: trigger animations
                skillsSection.classList.add("animate");           // for section glow or background animation
                skillsIcons.forEach((icon) => icon.classList.add("show")); // for fade-in + scale effect
            } else {
                // Section scrolled out of view: reset
                skillsSection.classList.remove("animate");
                skillsIcons.forEach((icon) => icon.classList.remove("show"));
            }
        });
    }, { threshold: 0.3 }); // Trigger when 30% of the section is visible

    // Start observing
    skillsObserver.observe(skillsSection);
});

// === Skills Desktop Conveyor Belt Animation ===

document.addEventListener("DOMContentLoaded", () => {
    // Select the container that holds the repeating icons
    const wrapper = document.querySelector(".skills-wrapper");
    const track = document.querySelector(".skills-track");

    // Stop if any key element is missing
    if (!wrapper || !track) return;

    let hasStarted = false;

    // Create observer to start animation once wrapper is in view
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasStarted) {
                // Start conveyor animation once when in view
                track.style.animation = "conveyor 35s linear infinite";
                hasStarted = true;

                // Optionally add glow or visual activation to section
                const skillsSection = wrapper.closest('.skills');
                if (skillsSection) {
                    skillsSection.classList.add('active');
                }
            }
        });
    }, {
        threshold: 0.2 // Trigger when 20% of wrapper is visible
    });

    observer.observe(wrapper);


    // Smooth magnifying glass effect with dynamic window size handling
    // Select all icons inside the desktop conveyor grid
    const icons = wrapper.querySelectorAll(".skills-grid img");
    let isMagnifying = false;

    // === Function to dynamically scale icons near center ===
    const magnify = () => {
        // Skip on small screens (mobile)
        if (window.innerWidth < 900) {
            isMagnifying = false;
            return;
        }

        // Determine center of the wrapper with a slight offset
        const wrapRect = wrapper.getBoundingClientRect();
        const centerX = wrapRect.left + wrapRect.width / 2 + 40;

        icons.forEach(icon => {
            const rect = icon.getBoundingClientRect();
            const iconCenter = rect.left + rect.width / 2;
            const distance = Math.abs(centerX - iconCenter);
            const maxDistance = wrapRect.width / 3;

            // Scale icons based on distance from center (max 1.3x)
            let scale = 1;
            if (distance < maxDistance) {
                scale = 1 + (1 - distance / maxDistance) * 0.3;
            }
            icon.style.transform = `scale(${scale})`;
        });

        // Keep loop running only if allowed
        if (isMagnifying) {
            requestAnimationFrame(magnify);
        }
    };

    // === Handles switching magnify effect on/off based on screen size ===
    const checkMagnify = () => {
        if (window.innerWidth >= 900 && !isMagnifying) {
            // Enable magnify on desktop
            isMagnifying = true;
            magnify();
        } else if (window.innerWidth < 900 && isMagnifying) {
            // Reset and disable magnify on mobile
            isMagnifying = false;
            icons.forEach(icon => {
                icon.style.transform = "scale(1)";
                icon.style.filter = "drop-shadow(0 0 0.6px rgba(255, 255, 255, 0)) drop-shadow(0 0 2px rgba(255, 255, 255, 0))";
            });
        }
    };

    // Run immediately on page load
    checkMagnify();

    // Also run on screen resize (to toggle mobile/desktop behavior)
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
            const rect = img.getBoundingClientRect(); // for animation reference
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















