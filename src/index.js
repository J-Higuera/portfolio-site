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

    /* =================== Hobbies rail: mobile overlay behavior =================== */
    (() => {
        const WIRED = new WeakSet();                         // prevent duplicate bindings
        const mq = window.matchMedia('(max-width: 720px)');
        function wireRail(rail) {
            if (!rail || WIRED.has(rail)) return;
            WIRED.add(rail);
            // ensure single overlay element (for outside click + dim)
            let overlay = rail.querySelector('.rail-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'rail-overlay';
                rail.appendChild(overlay);
            }
            const closeAll = () => {
                rail.classList.remove('has-open');
                rail.querySelectorAll('.is-open').forEach(el => {
                    el.classList.remove('is-open');
                    el.style.removeProperty('--open-top');
                });
            };
            // collapse when clicking the dim veil
            const onOverlayClick = () => { if (mq.matches) closeAll(); };
            overlay.addEventListener('click', onOverlayClick);

            rail.querySelectorAll('.rail-card').forEach(card => {
                const openAtSameRow = () => {
                    const railRect = rail.getBoundingClientRect();
                    const cardRect = card.getBoundingClientRect();
                    card.style.setProperty('--open-top', `${cardRect.top - railRect.top}px`);
                };
                const activate = (e) => {
                    if (!mq.matches) return;                // only on mobile
                    if (e.target.closest('a')) return;      // allow links inside
                    const isOpen = card.classList.contains('is-open');
                    closeAll();
                    if (!isOpen) {
                        openAtSameRow();                      // pin to current row
                        rail.classList.add('has-open');
                        card.classList.add('is-open');
                    }
                };
                card.addEventListener('click', activate);
                card.addEventListener('keydown', (e) => {
                    if (!mq.matches) return;
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(e); }
                    if (e.key === 'Escape') { closeAll(); card.blur(); }
                });
            });
            // keep the overlay card pinned on rotate/resize; clear when exiting mobile
            const onResize = () => {
                if (!mq.matches) { closeAll(); return; }
                const open = rail.querySelector('.rail-card.is-open');
                if (open) {
                    const railRect = rail.getBoundingClientRect();
                    const cardRect = open.getBoundingClientRect();
                    open.style.setProperty('--open-top', `${cardRect.top - railRect.top}px`);
                }
            };
            window.addEventListener('resize', onResize);
            // click anywhere outside the rail to collapse
            const onDocClick = (e) => {
                if (!mq.matches) return;
                if (rail.contains(e.target)) return;
                closeAll();
            };
            document.addEventListener('click', onDocClick, { capture: true });
            // optional: a simple teardown if you ever remove the rail dynamically
            rail.addEventListener('raildestroy', () => {
                overlay.removeEventListener('click', onOverlayClick);
                window.removeEventListener('resize', onResize);
                document.removeEventListener('click', onDocClick, { capture: true });
            });
        }
        function initHobbiesRail(root = document) {
            root.querySelectorAll('.hobbies-rail').forEach(wireRail);
        }
        // auto-init once the DOM is ready, regardless of where this file is loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => initHobbiesRail());
        } else {
            initHobbiesRail();
        }
        // optional: expose for re-initializing after dynamic inserts
        window.initHobbiesRail = initHobbiesRail;
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
