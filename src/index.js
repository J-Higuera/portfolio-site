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

    // === Desktop Conveyor Belt Animation ===
    const wrapper = document.querySelector(".skills-wrapper");
    const track = document.querySelector(".skills-track");

    if (wrapper && track) {
        const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const icons = wrapper.querySelectorAll(".skills-grid img");

        let inView = false, magnifying = false, rafId = null;

        // Ensure animation exists but starts paused
        if (!prefersReduced) {
            const cs = getComputedStyle(track);
            if (!cs.animationName || cs.animationName === "none") {
                track.style.animation = "conveyor 45s linear infinite";
            }
            track.style.animationPlayState = "paused";
        } else {
            track.style.animation = "none";
        }

        const setConveyorRunning = (run) => {
            if (prefersReduced) return;
            track.style.animationPlayState = run ? "running" : "paused";
            const skillsSection = wrapper.closest(".skills");
            if (skillsSection) skillsSection.classList.toggle("active", run);
        };

        const resetIcons = () => {
            icons.forEach(icon => {
                icon.style.transform = "scale(1)";
                icon.style.filter = "drop-shadow(0 0 0.6px rgba(255,255,255,0)) drop-shadow(0 0 2px rgba(255,255,255,0))";
            });
        };

        const magnifyStep = () => {
            if (!magnifying || !inView) return;

            const wrapRect = wrapper.getBoundingClientRect();
            const centerX = wrapRect.left + wrapRect.width / 2 + 40;
            const maxDistance = wrapRect.width / 3;

            icons.forEach(icon => {
                const r = icon.getBoundingClientRect();
                const iconCenter = r.left + r.width / 2;
                const d = Math.abs(centerX - iconCenter);
                const scale = d < maxDistance ? 1 + (1 - d / maxDistance) * 0.22 : 1;
                icon.style.transform = `scale(${scale})`;
            });

            rafId = requestAnimationFrame(magnifyStep);
        };

        const startMagnify = () => {
            if (magnifying || prefersReduced || window.innerWidth < 900) return;
            magnifying = true;
            rafId = requestAnimationFrame(magnifyStep);
        };

        const stopMagnify = () => {
            magnifying = false;
            if (rafId) cancelAnimationFrame(rafId);
            rafId = null;
            resetIcons();
        };

        const observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (entry.target !== wrapper) continue;
                inView = entry.isIntersecting && entry.intersectionRatio >= 0.2;
                setConveyorRunning(inView);
                if (inView && window.innerWidth >= 900) startMagnify(); else stopMagnify();
            }
        }, { threshold: [0, 0.2, 0.5, 1] });
        observer.observe(wrapper);

        // rAF-throttled resize
        let resizeRaf = null;
        const onResize = () => {
            if (resizeRaf) return;
            resizeRaf = requestAnimationFrame(() => {
                resizeRaf = null;
                if (!inView) { stopMagnify(); return; }
                if (window.innerWidth >= 900) startMagnify(); else stopMagnify();
            });
        };
        window.addEventListener("resize", onResize, { passive: true });

        // Pause on tab hide
        document.addEventListener("visibilitychange", () => {
            const visible = document.visibilityState === "visible";
            setConveyorRunning(visible && inView);
            if (visible && inView && window.innerWidth >= 900) startMagnify(); else stopMagnify();
        });
    }

    // ==== About section Hobbies Cards ============
    const buildOverlay = (card) => {
        // backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'hobby-backdrop';

        // modal
        const modal = document.createElement('div');
        modal.className = 'hobby-overlay';
        modal.setAttribute('data-hobby', card.dataset.hobby || '');

        // clone essential bits, but ensure the image is eager
        const srcImg = card.querySelector('img');
        if (srcImg) {
            const img = srcImg.cloneNode(true);
            img.removeAttribute('loading');          // don't keep lazy
            img.setAttribute('decoding', 'sync');    // decode ASAP
            img.setAttribute('fetchpriority', 'high');
            modal.appendChild(img);
        }
        const h4 = card.querySelector('h4')?.cloneNode(true);
        const p = card.querySelector('p')?.cloneNode(true);
        if (h4) modal.appendChild(h4);
        if (p) modal.appendChild(p);

        document.body.append(backdrop, modal);

        // Start transition in the SAME task (no RAF).
        // Force a reflow so the initial opacity:0 is committed,
        // then add .show and let CSS fade immediately.
        // eslint-disable-next-line no-unused-expressions
        backdrop.offsetWidth; modal.offsetWidth;

        backdrop.classList.add('show');
        modal.classList.add('show');

        const close = () => {
            backdrop.classList.remove('show');
            modal.classList.remove('show');
            modal.addEventListener('transitionend', () => {
                backdrop.remove();
                modal.remove();
            }, { once: true });
            openId = null;
            lockScroll(false);
        };

        backdrop.addEventListener('click', close);
        modal.addEventListener('click', close);
        const onEsc = (e) => (e.key === 'Escape') && close();
        document.addEventListener('keydown', onEsc, { once: true });

        return close;
    };

    // where you open it:
    lockScroll(true);
    openId = id;
    buildOverlay(card); // ← keep as-is; now fades immediately


    // === Hobbies rail: click fallback only when hover isn't available ===
    (() => {
        // Scope to your desktop rail. Adjust selector if needed.
        const rail = document.querySelector('.hobbies-rail');
        if (!rail) return;

        // Desktop with mouse: (hover: hover) && fine pointer
        const hasRealHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

        if (hasRealHover) {
            // On desktop we never toggle .active via click.
            // If anything previously set .active, clear it to avoid "sticking".
            rail.querySelectorAll('.rail-card.active').forEach(c => c.classList.remove('active'));
            return;
        }

        // Fallback for touch / no-hover devices
        const cards = Array.from(rail.querySelectorAll('.rail-card'));
        const clear = () => cards.forEach(c => c.classList.remove('active'));

        cards.forEach(card => {
            card.addEventListener('click', () => {
                const wasActive = card.classList.contains('active');
                clear();
                if (!wasActive) card.classList.add('active'); // open tapped card
            }, { passive: true });
        });

        // Tap outside the rail to close
        document.addEventListener('click', (e) => {
            if (!rail.contains(e.target)) clear();
        }, { passive: true });
    })();

    // === View degree/certification ===
    const images = document.querySelectorAll(".certificate-row img");
    let isAnimating = false;

    images.forEach((img) => {
        img.addEventListener("click", () => {
            if (document.querySelector(".zoom-backdrop") || isAnimating) return;
            isAnimating = true;

            const rect = img.getBoundingClientRect();
            const computed = getComputedStyle(img);

            // Backdrop
            const backdrop = document.createElement("div");
            backdrop.classList.add("zoom-backdrop");
            document.body.appendChild(backdrop);

            // Placeholder
            const placeholder = document.createElement("div");
            ["display", "verticalAlign", "marginTop", "marginRight", "marginBottom", "marginLeft"]
                .forEach(prop => { placeholder.style[prop] = computed[prop]; });

            // Lock size so layout doesn’t jump
            placeholder.style.width = rect.width + "px";
            placeholder.style.height = rect.height + "px";
            placeholder.style.flex = `0 0 ${rect.width}px`;
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
}); // <<< this was missing
