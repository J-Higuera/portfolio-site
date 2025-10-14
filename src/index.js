//======================================================
//              HERO TYPEWRITER 
//=====================================================
document.addEventListener("DOMContentLoaded", () => {
    const phrases = ["apps.", "games.", "websites.", "tools."];
    const textElement = document.getElementById("hero-text");
    if (!textElement) return;

    // Fix the container width to the widest phrase so nothing else moves.
    const measurer = document.createElement("span");
    measurer.style.cssText =
        "position:absolute;visibility:hidden;white-space:nowrap;font:inherit;";
    document.body.appendChild(measurer);

    let maxPx = 0;
    for (const p of phrases) {
        measurer.textContent = p;
        maxPx = Math.max(maxPx, measurer.offsetWidth);
    }
    textElement.style.width = maxPx + "px";
    document.body.removeChild(measurer);

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
                setTimeout(type, 1200);
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
        setTimeout(type, isDeleting ? 80 : 110);
    }

    type();
});
//==========================================
//       Mobile Skills Animation 
//==========================================
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

//=====================================
//      Skills Conveyor belt
//=====================================
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

//============================================
//         HOBBIES OVERLAY (Desktop) 
//=============================================
document.addEventListener("DOMContentLoaded", () => {

    const track = document.querySelector(".about-hobbies-desktop .hobbies-carousel .track");
    if (!track) return;

    // Make all card images non-draggable so dragging the ghost image never steals the click
    track.querySelectorAll(".rail-card img").forEach(img => {
        img.setAttribute("draggable", "false");
    });

    const preloadHobbyImages = () => {
        const imgs = track.querySelectorAll(".rail-card img");
        for (const el of imgs) {
            const url = el.currentSrc || el.src;
            if (!url) continue;
            const pre = new Image();
            pre.src = url;
            pre.decoding = "async";
            pre.fetchPriority = "low";
            pre.decode?.().catch(() => { });
        }
    };
    // Use idle time if available to stay off the critical path
    (window.requestIdleCallback || ((cb) => setTimeout(cb, 1)))(preloadHobbyImages);

    const buildOverlay = (card) => {
        const existing = document.querySelector(".hobby-overlay");
        if (existing) existing.dispatchEvent(new CustomEvent("request-close", { bubbles: true }));

        const lockScroll = (lock) => {
            document.documentElement.classList.toggle("lock-scroll", lock);
            document.body.classList.toggle("lock-scroll", lock);
        };

        const backdrop = document.createElement("div");
        backdrop.className = "hobby-backdrop";

        const modal = document.createElement("div");
        modal.className = "hobby-overlay";
        modal.setAttribute("data-hobby", card.dataset.hobby || "");

        const content = document.createElement("div");
        content.className = "hobby-content";

        // clone the currently used image resource to guarantee cache hit
        const srcImg = card.querySelector("img");
        if (srcImg) {
            const img = document.createElement("img");
            img.src = srcImg.currentSrc || srcImg.src;
            if (srcImg.referrerPolicy) img.referrerPolicy = srcImg.referrerPolicy;
            if (srcImg.crossOrigin) img.crossOrigin = srcImg.crossOrigin;
            img.decoding = "async";
            img.fetchPriority = "high";
            content.appendChild(img);
        }

        const h4 = card.querySelector("h4")?.cloneNode(true);
        const p = card.querySelector("p")?.cloneNode(true);
        if (h4) content.appendChild(h4);
        if (p) content.appendChild(p);

        modal.appendChild(content);
        document.body.append(backdrop, modal);

        // Show (disable transitions for 1 frame to avoid initial fade-in delay)
        backdrop.style.transition = "none";
        modal.style.transition = "none";
        backdrop.classList.add("show");
        modal.classList.add("show");
        content.classList.add("appear");
        lockScroll(true);
        requestAnimationFrame(() => { backdrop.style.transition = ""; modal.style.transition = ""; });

        const close = () => {
            if (!document.body.contains(modal)) return;
            backdrop.classList.remove("show");
            modal.classList.remove("show");
            let done = false;
            const finish = () => {
                if (done) return;
                done = true;
                backdrop.remove();
                modal.remove();
                lockScroll(false);
            };
            modal.addEventListener("transitionend", finish, { once: true });
            setTimeout(finish, 1600); // safety timeout
        };

        backdrop.addEventListener("click", close);
        modal.addEventListener("request-close", close);
        modal.addEventListener("click", close);
        const onEsc = (e) => (e.key === "Escape") && close();
        document.addEventListener("keydown", onEsc, { once: true });

        return close;
    };

    const cards = Array.from(track.querySelectorAll(".rail-card"));
    cards.forEach((card) => { card.tabIndex ||= 0; });

    const desktop = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const WHEEL_SPEED = 0.45; // lower = slower; tune 0.25–0.55

    if (desktop) {
        track.addEventListener("wheel", (e) => {
            const dx = Math.abs(e.deltaX) >= Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
            if (dx === 0) return;
            e.preventDefault(); // prevent native jumpiness
            track.scrollLeft += dx * WHEEL_SPEED;
        }, { passive: false });
    }

    let pointerDown = false;
    let moved = false;
    let startX = 0;
    let scrolledSinceDown = false;

    track.addEventListener("pointerdown", (e) => {
        pointerDown = true;
        moved = false;
        scrolledSinceDown = false;
        startX = e.clientX;
    }, { passive: true });

    track.addEventListener("pointermove", (e) => {
        if (!pointerDown) return;
        if (Math.abs(e.clientX - startX) > 6) moved = true; // jitter tolerance
    }, { passive: true });

    track.addEventListener("pointerup", () => { pointerDown = false; }, { passive: true });
    track.addEventListener("pointercancel", () => { pointerDown = false; }, { passive: true });

    track.addEventListener("scroll", () => {
        if (pointerDown) scrolledSinceDown = true;
    });

    track.addEventListener("click", (e) => {
        // Ignore clicks on explicit "hit" links inside cards
        const hit = e.target.closest(".rail-card .hit");
        if (hit) { e.preventDefault(); e.stopPropagation(); return; }

        const card = e.target.closest(".rail-card");
        if (!card) return;

        // If the click followed a scroll gesture, do nothing
        if (moved || scrolledSinceDown) return;

        buildOverlay(card);
    });

    track.addEventListener("keydown", (e) => {
        if (e.code !== "Enter" && e.code !== "Space") return;
        const card = e.target.closest(".rail-card");
        if (!card) return;
        e.preventDefault();
        buildOverlay(card);
    });
});


//============================================
//         HOBBIES OVERLAY (Mobile) 
//=============================================
document.addEventListener("DOMContentLoaded", () => {
    // --- 1) Preload & decode every hobby image so overlay paints instantly ---
    const preloadHobbyImages = async () => {
        const imgs = document.querySelectorAll(".about-hobbies-mobile .hobbies-carousel .rail-card img");
        imgs.forEach((el) => {
            // Pick the exact resource the browser already chose for this viewport
            const url = el.currentSrc || el.src;
            if (!url) return;

            // Warm HTTP cache & decode into the image decode cache
            const pre = new Image();
            pre.src = url;
            pre.decoding = "async";          // don't block main thread
            pre.fetchPriority = "low";       // avoid competing with critical resources
            // Fire and forget; decode resolves instantly if already decoded
            pre.decode?.().catch(() => { });
        });
    };
    preloadHobbyImages();

    // --- 2) Builder: show overlay for a given card (no image delay/blink) ---
    const buildOverlay = (card) => {
        // Close any existing overlay first (so transitions don't overlap)
        const existing = document.querySelector(".hobby-overlay");
        if (existing) {
            existing.dispatchEvent(new CustomEvent("request-close", { bubbles: true }));
        }

        // Helpers
        const lockScroll = (lock) => {
            document.documentElement.classList.toggle("lock-scroll", lock);
            document.body.classList.toggle("lock-scroll", lock);
        };

        // Elements
        const backdrop = document.createElement("div");
        backdrop.className = "hobby-backdrop";

        const modal = document.createElement("div");
        modal.className = "hobby-overlay";
        modal.setAttribute("data-hobby", card.dataset.hobby || "");

        const content = document.createElement("div");
        content.className = "hobby-content";

        // --- Clone the exact same image candidate the card is currently displaying ---
        const srcImg = card.querySelector("img");
        if (srcImg) {
            const img = document.createElement("img");

            // Use the exact chosen resource to guarantee cache hit & avoid re-evaluation
            const chosen = srcImg.currentSrc || srcImg.src;
            img.src = chosen;

            // Preserve attributes that might affect rendering
            if (srcImg.referrerPolicy) img.referrerPolicy = srcImg.referrerPolicy;
            if (srcImg.crossOrigin) img.crossOrigin = srcImg.crossOrigin;

            // Prefer async decode to avoid blocking; we already pre-decoded above
            img.decoding = "async";
            img.fetchPriority = "high"; // now that we're opening overlay, prioritize this paint

            // Append immediately — if decoded, it paints this frame; if not, the dim layer hides any micro-lag
            content.appendChild(img);
        }

        // Title & text
        const h4 = card.querySelector("h4")?.cloneNode(true);
        const p = card.querySelector("p")?.cloneNode(true);
        if (h4) content.appendChild(h4);
        if (p) content.appendChild(p);

        modal.appendChild(content);
        document.body.append(backdrop, modal);

        // Instant show for backdrop/overlay (disable their transitions for 1 paint)
        backdrop.style.transition = "none";
        modal.style.transition = "none";

        // Show: panel/backdrop visible; content fades in (opacity only)
        backdrop.classList.add("show");
        modal.classList.add("show");
        content.classList.add("appear");
        lockScroll(true);

        // Re-enable transitions so closing fades out smoothly
        requestAnimationFrame(() => {
            backdrop.style.transition = "";
            modal.style.transition = "";
        });

        // Close handler: ONLY fade out panel/backdrop by removing .show
        const close = () => {
            if (!document.body.contains(modal)) return; // already removed
            backdrop.classList.remove("show");
            modal.classList.remove("show");

            // After overlay transition completes, cleanup
            let done = false;
            const finish = () => {
                if (done) return;
                done = true;
                backdrop.remove();
                modal.remove();
                lockScroll(false);
            };
            modal.addEventListener("transitionend", finish, { once: true });
            setTimeout(finish, 1600); // safety: slightly > your overlay transition
        };

        // Wire closers
        backdrop.addEventListener("click", close);
        modal.addEventListener("request-close", close);
        // Tap anywhere to close (remove this if you want interior clicks to do nothing)
        modal.addEventListener("click", close);

        // ESC to close
        const onEsc = (e) => (e.key === "Escape") && close();
        document.addEventListener("keydown", onEsc, { once: true });

        return close;
    };

    // --- 3) Mobile wiring: open overlay on tap ---
    const track = document.querySelector(".about-hobbies-mobile .hobbies-carousel .track");
    if (!track) return;

    // If you have .hit anchors inside cards, prevent navigation
    track.querySelectorAll(".rail-card .hit").forEach(a => {
        a.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); }, { passive: false });
    });

    const cards = Array.from(track.querySelectorAll(".rail-card"));
    cards.forEach((card, idx) => {
        card.addEventListener("click", () => {
            const open = document.querySelector(".hobby-overlay");
            if (open) {
                const openId = open.getAttribute("data-hobby") || "";
                const thisId = card.dataset.hobby || String(idx);
                if (openId === thisId) {
                    open.dispatchEvent(new CustomEvent("request-close", { bubbles: true }));
                    return;
                }
                open.dispatchEvent(new CustomEvent("request-close", { bubbles: true }));
                setTimeout(() => buildOverlay(card), 0);
                return;
            }
            buildOverlay(card);
        }, { passive: true });
    });
});
//===================================================================
//HOBBIES RAIL TOUCH FALLBACK (for no-hover devices on desktop rail)  
//===================================================================
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


// ==========================================
// 5) CERTIFICATE / DEGREE IMAGE ZOOM                                         
// =================================================
document.addEventListener("DOMContentLoaded", () => {
    const row = document.querySelector(".certificate-row");
    if (!row) return;

    let isAnimating = false;

    // open via delegation so ALL images work
    row.addEventListener("click", (ev) => {
        const img = ev.target.closest("img");
        if (!img || !row.contains(img)) return;
        if (document.querySelector(".zoom-backdrop") || isAnimating) return;
        isAnimating = true;

        const rect = img.getBoundingClientRect();
        const computed = getComputedStyle(img);

        // Backdrop
        const backdrop = document.createElement("div");
        backdrop.className = "zoom-backdrop";
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
        Object.assign(img.style, {
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            maxWidth: "90vw",
            maxHeight: "90vh",
            width: "auto",
            height: "auto",
            zIndex: "1001",
            transition: "opacity 0.8s ease",
            opacity: "0"
            // no cursor change
        });

        // unified close routine, bound to both targets
        const close = () => {
            if (isAnimating) return;
            isAnimating = true;

            img.style.transition = "opacity 0.6s ease";
            img.style.opacity = "0";
            backdrop.classList.remove("show");

            setTimeout(() => {
                // clean up inline styles and classes
                img.removeAttribute("style");
                img.classList.remove("zoomed-real");
                placeholder.replaceWith(img);

                // fade back in at original spot
                img.style.opacity = "0";
                requestAnimationFrame(() => {
                    img.style.transition = "opacity 0.6s ease";
                    img.style.opacity = "1";
                });

                // remove listeners + backdrop
                backdrop.removeEventListener("click", close);
                img.removeEventListener("click", close);
                backdrop.remove();

                setTimeout(() => { isAnimating = false; }, 600);
            }, 600);
        };

        requestAnimationFrame(() => {
            backdrop.classList.add("show");
            img.style.opacity = "1";
            setTimeout(() => { isAnimating = false; }, 800);
        });

        // Close on backdrop **and** on the zoomed image itself
        backdrop.addEventListener("click", close);
        img.addEventListener("click", close);

        // Optional: Escape to close
        const onKey = (e) => { if (e.key === "Escape") close(); };
        document.addEventListener("keydown", onKey, { once: true });
    });
});



