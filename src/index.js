/* ========================================================================== */
/* 1) HERO TYPEWRITER                                                         */
/* ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
    const phrases = ["apps.", "games.", "websites.", "tools.", "systems."];
    const textElement = document.getElementById("hero-text");

    // Guard so a missing #hero-text doesn't crash anything else.
    if (!textElement) return;

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
});


/* ========================================================================== */
/* 2) SKILLS CONVEYOR + MAGNIFY (Desktop)                                     */
/* ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
    const wrapper = document.querySelector(".skills-wrapper");
    const track = document.querySelector(".skills-track");
    if (!wrapper || !track) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const icons = wrapper.querySelectorAll(".skills-grid img");

    let inView = false;
    let magnifying = false;
    let rafId = null;

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
});


// ========================================================================== 
// 3) HOBBIES OVERLAY (Mobile): buildOverlay + click
//      - Image is now inside .hobby-content so the FADE actually applies
// ========================================================================== 
document.addEventListener("DOMContentLoaded", () => {
    // ---- Builder (self-contained) ----
    const buildOverlay = (card) => {
        // If another overlay is open, request it to close first
        const existing = document.querySelector('.hobby-overlay');
        if (existing) {
            existing.dispatchEvent(new CustomEvent('request-close', { bubbles: true }));
        }

        // Helpers local to this function
        const lockScroll = (lock) => {
            document.documentElement.classList.toggle('lock-scroll', lock);
            document.body.classList.toggle('lock-scroll', lock);
        };
        const cleanupOnTransitionEnd = (el, fn) => {
            let done = false;
            const finish = () => { if (done) return; done = true; fn(); };
            el.addEventListener('transitionend', finish, { once: true });
            // Fallback in case transitionend doesn’t fire (e.g., reduced motion)
            setTimeout(finish, 350);
        };

        // Backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'hobby-backdrop';

        // Modal
        const modal = document.createElement('div');
        modal.className = 'hobby-overlay';
        modal.setAttribute('data-hobby', card.dataset.hobby || '');

        // Content wrapper that does the smooth fade (IMAGE MOVED INSIDE HERE)
        const content = document.createElement('div');
        content.className = 'hobby-content';

        // Clone content (make image eager so it appears immediately, but it will fade with content)
        const srcImg = card.querySelector('img');
        if (srcImg) {
            const img = srcImg.cloneNode(true);
            img.removeAttribute('loading');
            img.setAttribute('decoding', 'sync');
            img.setAttribute('fetchpriority', 'high');
            content.appendChild(img);                 // << was modal.appendChild(img)
        }

        const h4 = card.querySelector('h4')?.cloneNode(true);
        const p = card.querySelector('p')?.cloneNode(true);
        if (h4) content.appendChild(h4);
        if (p) content.appendChild(p);

        modal.appendChild(content);
        document.body.append(backdrop, modal);

        // Instant show for backdrop/overlay; content handles the visible fade
        backdrop.style.transition = 'none';
        modal.style.transition = 'none';
        backdrop.classList.add('show');
        modal.classList.add('show');

        // Kick off the content fade animation (affects image + text now)
        content.classList.add('appear');

        // Lock scroll after attaching elements
        lockScroll(true);

        // Next frame: restore transitions so closing fades out
        requestAnimationFrame(() => {
            backdrop.style.transition = '';
            modal.style.transition = '';
        });

        // Close logic
        const close = () => {
            if (!document.body.contains(modal)) return; // already cleaned up
            backdrop.classList.remove('show');
            modal.classList.remove('show');

            cleanupOnTransitionEnd(modal, () => {
                backdrop.remove();
                modal.remove();
                lockScroll(false);
            });
        };

        // Wire up closers
        backdrop.addEventListener('click', close);
        modal.addEventListener('request-close', close);
        // Optional: tap anywhere on modal to close (remove if you want inner clicks inert)
        modal.addEventListener('click', close);

        // ESC to close
        const onEsc = (e) => (e.key === 'Escape') && close();
        document.addEventListener('keydown', onEsc, { once: true });

        return close;
    };

    // ---- Mobile wiring: open overlay on tap ----
    const track = document.querySelector('.about-hobbies-mobile .hobbies-carousel .track');
    if (!track) return;

    track.querySelectorAll('.rail-card .hit').forEach(a => {
        a.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); }, { passive: false });
    });

    const cards = Array.from(track.querySelectorAll('.rail-card'));
    cards.forEach((card, idx) => {
        card.addEventListener('click', () => {
            const open = document.querySelector('.hobby-overlay');
            if (open) {
                const openId = open.getAttribute('data-hobby') || '';
                const thisId = card.dataset.hobby || String(idx);
                if (openId === thisId) {
                    open.dispatchEvent(new CustomEvent('request-close', { bubbles: true }));
                    return;
                }
                open.dispatchEvent(new CustomEvent('request-close', { bubbles: true }));
                setTimeout(() => buildOverlay(card), 0);
                return;
            }
            buildOverlay(card);
        }, { passive: true });
    });
});

// ========================================================================== 
// 4) HOBBIES RAIL TOUCH FALLBACK (for no-hover devices on desktop rail)      
// ========================================================================== 
document.addEventListener("DOMContentLoaded", () => {
    const rail = document.querySelector('.hobbies-rail');
    if (!rail) return;

    // If we're on a real desktop pointer (hover + fine), rely on hover only.
    const hasRealHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (hasRealHover) {
        rail.querySelectorAll('.rail-card.active').forEach(c => c.classList.remove('active'));
        return;
    }

    // Touch / no-hover devices: tap to toggle an active card in-rail
    const cards = Array.from(rail.querySelectorAll('.rail-card'));
    const clear = () => cards.forEach(c => c.classList.remove('active'));

    cards.forEach(card => {
        card.addEventListener('click', () => {
            const wasActive = card.classList.contains('active');
            clear();
            if (!wasActive) card.classList.add('active');
        }, { passive: true });
    });

    // Tap outside the rail to close
    document.addEventListener('click', (e) => {
        if (!rail.contains(e.target)) clear();
    }, { passive: true });
});


// ========================================================================== 
// 5) CERTIFICATE / DEGREE IMAGE ZOOM                                         
// ========================================================================== 
document.addEventListener("DOMContentLoaded", () => {
    const images = document.querySelectorAll(".certificate-row img");
    if (!images.length) return;

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

            // Placeholder to prevent layout jump
            const placeholder = document.createElement("div");
            ["display", "verticalAlign", "marginTop", "marginRight", "marginBottom", "marginLeft"]
                .forEach(prop => { placeholder.style[prop] = computed[prop]; });
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
});
