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

    // Tunables
    const desktop = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const EPS = 1;     // epsilon for overflow checks
    const SPEED = 1.25;  // lower = slower wheel movement
    const EASE = 0.15;  // easing factor (0.12–0.25 good)
    const JITTERPX = 6;     // click-vs-scroll pointer jitter tolerance


    // Helpers / state
    let target = track.scrollLeft;
    let raf = null;

    const hasOverflow = () => (track.scrollWidth - track.clientWidth) > EPS;

    const step = () => {
        const diff = target - track.scrollLeft;
        if (Math.abs(diff) < 0.4) { track.scrollLeft = target; raf = null; return; }
        track.scrollLeft += diff * EASE;
        raf = requestAnimationFrame(step);
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(step); };

    // Make images non-draggable + idle preload
    track.querySelectorAll(".rail-card img").forEach(img => img.setAttribute("draggable", "false"));

    const preload = () => {
        track.querySelectorAll(".rail-card img").forEach(el => {
            const url = el.currentSrc || el.src;
            if (!url) return;
            const pre = new Image();
            pre.src = url;
            pre.decoding = "async";
            pre.fetchPriority = "low";
            pre.decode?.().catch(() => { });
        });
    };
    (window.requestIdleCallback || ((cb) => setTimeout(cb, 1)))(preload);

    // Overlay (click-to-zoom)
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
            setTimeout(finish, 1600);
        };

        backdrop.addEventListener("click", close);
        modal.addEventListener("request-close", close);
        modal.addEventListener("click", close);
        const onEsc = (e) => (e.key === "Escape") && close();
        document.addEventListener("keydown", onEsc, { once: true });
    };

    // focusable cards
    track.querySelectorAll(".rail-card").forEach(c => { c.tabIndex ||= 0; });

    // Fit detection → center when no overflow
    // (we NEVER change overflow-x: auto; CSS just centers via .no-scroll)
    const updateMode = () => {
        const overflow = hasOverflow();
        track.classList.toggle("no-scroll", !overflow);
        target = Math.min(Math.max(0, target), Math.max(0, track.scrollWidth - track.clientWidth));
    };

    const ro = new ResizeObserver(() => {
        cancelAnimationFrame(updateMode._raf || 0);
        updateMode._raf = requestAnimationFrame(updateMode);
    });
    ro.observe(track);

    track.querySelectorAll("img").forEach(img => {
        const bump = () => requestAnimationFrame(updateMode);
        if (!img.complete) {
            img.addEventListener("load", bump, { once: true });
            img.addEventListener("error", bump, { once: true });
        }
    });

    if (document.fonts?.ready) document.fonts.ready.then(() => requestAnimationFrame(updateMode));
    window.addEventListener("resize", () => requestAnimationFrame(updateMode), { passive: true });
    window.addEventListener("load", updateMode);
    updateMode();

    // Smart wheel: ALWAYS drive the rail when overflow exists.
    // Only let page scroll at edges in the intended direction.
    if (desktop) {
        track.addEventListener("wheel", (e) => {
            const overflow = track.scrollWidth - track.clientWidth;
            if (overflow <= EPS) return; // everything fits → page scroll

            // Pick dominant axis (this makes classic mouse Y scroll drive X)
            const absX = Math.abs(e.deltaX), absY = Math.abs(e.deltaY);
            const raw = absX >= absY ? e.deltaX : e.deltaY;
            if (raw === 0) return;

            const max = overflow;
            const atStart = track.scrollLeft <= 0;
            const atEnd = track.scrollLeft >= max - 1;

            // At edges in the wheel direction? let page scroll
            if ((raw < 0 && atStart) || (raw > 0 && atEnd)) return;

            // We handle horizontal scrolling
            e.preventDefault();
            target = Math.min(max, Math.max(0, track.scrollLeft + raw * SPEED));
            schedule();
        }, { passive: false });

        // Keep target in sync with native horizontal scroll (e.g., trackpad)
        track.addEventListener("scroll", () => { if (!raf) target = track.scrollLeft; }, { passive: true });
    }

    // Click vs scroll guard + click-to-zoom
    let pointerDown = false, moved = false, downX = 0, downLeft = 0, justScrolled = false, scrollTimer;

    track.addEventListener("pointerdown", (e) => {
        pointerDown = true;
        moved = false;
        downX = e.clientX;
        downLeft = track.scrollLeft;
    }, { passive: true });

    track.addEventListener("pointermove", (e) => {
        if (!pointerDown) return;
        if (Math.abs(e.clientX - downX) > JITTERPX) moved = true;
    }, { passive: true });

    const clearPointer = () => { pointerDown = false; };
    track.addEventListener("pointerup", clearPointer, { passive: true });
    track.addEventListener("pointercancel", clearPointer, { passive: true });

    track.addEventListener("scroll", () => {
        justScrolled = true;
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => { justScrolled = false; }, 140);
    }, { passive: true });

    track.addEventListener("click", (e) => {
        if (e.target.closest(".rail-card .hit")) { e.preventDefault(); e.stopPropagation(); return; }
        const card = e.target.closest(".rail-card");
        if (!card) return;

        const scrolledDuringClick = Math.abs(track.scrollLeft - downLeft) > 1;
        if (moved || scrolledDuringClick || justScrolled) return;

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
    const track = document.querySelector(".about-hobbies-mobile .hobbies-carousel .track");
    if (!track) return;

    // ==============================
    // Tunables
    // ==============================
    const EPS = 1;           // overflow epsilon
    const JITTER = 6;        // tap vs swipe tolerance (px)
    const AXIS_LOCK = 1.1;   // require dx > dy*AXIS_LOCK to treat as horizontal pan

    // ==============================
    // Setup: non-draggable images + idle preload
    // ==============================
    track.querySelectorAll(".rail-card img").forEach(img => img.setAttribute("draggable", "false"));
    (window.requestIdleCallback || ((cb) => setTimeout(cb, 1)))(() => {
        track.querySelectorAll(".rail-card img").forEach(el => {
            const url = el.currentSrc || el.src;
            if (!url) return;
            const pre = new Image();
            pre.src = url;
            pre.decoding = "async";
            pre.fetchPriority = "low";
            pre.decode?.().catch(() => { });
        });
    });

    // ==============================
    // 1) Overlay (tap-to-zoom)
    // ==============================
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

        // show
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
            setTimeout(finish, 1600);
        };

        backdrop.addEventListener("click", close);
        modal.addEventListener("request-close", close);
        modal.addEventListener("click", close);
        const onEsc = (e) => (e.key === "Escape") && close();
        document.addEventListener("keydown", onEsc, { once: true });
    };

    // ==============================
    // 2) Fit detection → “no-scroll” when all items fit (never disable overflow-x)
    // ==============================
    const hasOverflow = () => (track.scrollWidth - track.clientWidth) > EPS;
    const updateMode = () => {
        track.classList.toggle("no-scroll", !hasOverflow());
    };

    const ro = new ResizeObserver(() => {
        cancelAnimationFrame(updateMode._raf || 0);
        updateMode._raf = requestAnimationFrame(updateMode);
    });
    ro.observe(track);

    const mo = new MutationObserver(() => requestAnimationFrame(updateMode));
    mo.observe(track, { childList: true, subtree: true, attributes: true, attributeFilter: ["style", "class"] });

    track.querySelectorAll("img").forEach(img => {
        const bump = () => requestAnimationFrame(updateMode);
        if (!img.complete) {
            img.addEventListener("load", bump, { once: true });
            img.addEventListener("error", bump, { once: true });
        }
    });

    if (document.fonts?.ready) document.fonts.ready.then(() => requestAnimationFrame(updateMode));
    window.addEventListener("resize", () => requestAnimationFrame(updateMode), { passive: true });
    window.addEventListener("load", updateMode);
    updateMode();

    // ==============================
    // 3) Smart touch-pan (like desktop wheel)
    //    - Only when rail overflows
    //    - Horizontal intent after small lock threshold
    //    - Lets page scroll at edges
    // ==============================
    let panning = false;
    let startX = 0, startY = 0, startLeft = 0;
    let moved = false;                 // for tap-vs-swipe guard
    let justScrolled = false, tGuard;  // small guard after scroll

    // Use pointer events (covers touch+pen). We don’t preventDefault on down; we decide in move.
    track.addEventListener("pointerdown", (e) => {
        if (e.pointerType !== "touch" && e.pointerType !== "pen") return; // mobile only
        if (!hasOverflow()) return; // nothing to pan
        panning = false;
        moved = false;
        startX = e.clientX;
        startY = e.clientY;
        startLeft = track.scrollLeft;
    }, { passive: true });

    track.addEventListener("pointermove", (e) => {
        if (e.pointerType !== "touch" && e.pointerType !== "pen") return;
        // If we never got a pointerdown (edge cases), ignore
        if (startX === undefined) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        // Decide when to lock to horizontal pan
        if (!panning) {
            if (Math.abs(dx) < JITTER && Math.abs(dy) < JITTER) return; // still jitter
            if (Math.abs(dx) > Math.abs(dy) * AXIS_LOCK) {
                // horizontal intent → start panning
                panning = true;
            } else {
                // mostly vertical → let page scroll; bail out
                return;
            }
        }

        // We are panning horizontally. Prevent vertical page scroll while panning.
        e.preventDefault();

        // Edge release: if you try to pan past the edges, stop panning so the page can move
        const max = track.scrollWidth - track.clientWidth;
        const nextLeft = startLeft - dx; // inverse because dragging right should reveal left content
        const atStart = track.scrollLeft <= 0 && nextLeft < 0;
        const atEnd = track.scrollLeft >= max && nextLeft > max;

        if (atStart || atEnd) return; // allow page to scroll instead

        moved = true;
        track.scrollLeft = Math.min(max, Math.max(0, nextLeft));
    }, { passive: false });

    const clearPan = () => { panning = false; startX = startY = undefined; };
    track.addEventListener("pointerup", clearPan, { passive: true });
    track.addEventListener("pointercancel", clearPan, { passive: true });

    // Guard clicks that follow a scroll (inertia)
    track.addEventListener("scroll", () => {
        justScrolled = true;
        clearTimeout(tGuard);
        tGuard = setTimeout(() => { justScrolled = false; }, 140);
    }, { passive: true });

    // ==============================
    // 4) Tap to zoom (delegated), with swipe guard
    // ==============================
    track.addEventListener("click", (e) => {
        if (e.target.closest(".rail-card .hit")) { e.preventDefault(); e.stopPropagation(); return; }
        const card = e.target.closest(".rail-card");
        if (!card) return;
        if (moved || justScrolled) return; // treat as scroll, not a tap
        buildOverlay(card);
    }, { passive: false });
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



