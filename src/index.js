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

    /* ===== Mobile Hobbies: Snap Carousel — Swipe + Tap-to-Reveal (stable) ===== */
    (() => {
        const rail = document.querySelector('.about-hobbies-mobile .hobbies-rail[data-carousel]');
        const dotsWrap = document.querySelector('.about-hobbies-mobile .hobby-dots');
        if (!rail || !dotsWrap) return;

        const cards = Array.from(rail.querySelectorAll('.rail-card'));
        if (!cards.length) return;

        // Build dots
        dotsWrap.innerHTML = cards.map((_, i) =>
            `<button type="button" aria-label="Go to hobby ${i + 1}"></button>`).join('');
        const dots = Array.from(dotsWrap.children);

        const centerOf = (el) => el.offsetLeft + el.offsetWidth / 2;

        let activeIdx = 0;
        let raf = null;
        let ignoreNextDocClick = false;   // <-- fixes "opens then instantly closes"

        const snapTo = (i, smooth = true) => {
            const card = cards[i];
            const left = card.offsetLeft - (rail.clientWidth - card.offsetWidth) / 2;
            rail.scrollTo({ left, behavior: smooth ? 'smooth' : 'auto' });
        };

        const nearestIndex = () => {
            const center = rail.scrollLeft + rail.clientWidth / 2;
            let idx = 0, best = Infinity;
            cards.forEach((c, i) => {
                const d = Math.abs(center - centerOf(c));
                if (d < best) { best = d; idx = i; }
            });
            return idx;
        };

        const setActive = (idx) => {
            activeIdx = idx;
            dots.forEach((d, i) => d.classList.toggle('is-active', i === activeIdx));
        };

        const hideAllText = () => cards.forEach(c => c.classList.remove('show-text'));

        // Dots -> snap, keep text hidden
        dots.forEach((d, i) => d.addEventListener('click', () => {
            hideAllText();
            snapTo(i);
            setActive(i);
        }, { passive: true }));

        // rAF-coalesced scroll updates
        rail.addEventListener('scroll', () => {
            if (raf) return;
            raf = requestAnimationFrame(() => {
                raf = null;
                setActive(nearestIndex());
            });
        }, { passive: true });

        // ----- Gesture handling (pointer events) -----
        let startX = 0, startY = 0, startT = 0, moved = false;

        const onPointerDown = (e) => {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            startX = e.clientX; startY = e.clientY; startT = performance.now(); moved = false;
            hideAllText(); // keep the image clean during a swipe start
        };

        const onPointerMove = (e) => {
            if (e.pressure === 0) return; // not active
            const dx = Math.abs(e.clientX - startX);
            const dy = Math.abs(e.clientY - startY);
            if (dx > 5 || dy > 5) moved = true; // classify as a move (swipe)
        };

        const onPointerUp = (e) => {
            // classify gesture
            const dx = Math.abs(e.clientX - startX);
            const dy = Math.abs(e.clientY - startY);
            const dt = performance.now() - startT;

            const TAP_MAX_MOVE = 10;
            const TAP_MAX_TIME = 300;

            const isTap = dx < TAP_MAX_MOVE && dy < TAP_MAX_MOVE && dt < TAP_MAX_TIME;

            // Vertical swipe? don't force snap; let the page scroll naturally.
            if (!isTap && dy > dx) return;

            // Horizontal swipe end: snap to nearest card
            if (!isTap && dx >= dy) {
                snapTo(nearestIndex());
                return;
            }
            // Tap: toggle text on the centered card
            const idx = nearestIndex();
            const card = cards[idx];
            const isOpen = card.classList.contains('show-text');
            hideAllText();
            if (!isOpen) {
                snapTo(idx);                        // ensure centered
                card.classList.add('show-text');    // CSS shows text + dims
                setActive(idx);
                ignoreNextDocClick = true;          // prevent the global click from closing it immediately
                setTimeout(() => { ignoreNextDocClick = false; }, 0);
            }
        };

        rail.addEventListener('pointerdown', onPointerDown, { passive: true });
        rail.addEventListener('pointermove', onPointerMove, { passive: true });
        rail.addEventListener('pointerup', onPointerUp, { passive: true });
        rail.addEventListener('pointercancel', () => { moved = false; }, { passive: true });

        // Click on a specific card (mouse users) -> toggle text
        cards.forEach((card, i) => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('a')) return;
                const isOpen = card.classList.contains('show-text');
                hideAllText();
                if (!isOpen) {
                    snapTo(i);
                    card.classList.add('show-text');
                    setActive(i);
                    ignoreNextDocClick = true;
                    setTimeout(() => { ignoreNextDocClick = false; }, 0);
                }
            });
        });

        // Outside click collapses, but ignore the click that just opened
        document.addEventListener('click', (e) => {
            if (ignoreNextDocClick) return;
            if (rail.contains(e.target)) return;
            hideAllText();
        });

        // Resize/orientation: keep centered and close text
        let resizeRaf = null;
        window.addEventListener('resize', () => {
            if (resizeRaf) return;
            resizeRaf = requestAnimationFrame(() => {
                resizeRaf = null;
                hideAllText();
                snapTo(activeIdx, false);
                setActive(nearestIndex());
            });
        });

        // Init
        snapTo(0, false);
        setActive(0);
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
