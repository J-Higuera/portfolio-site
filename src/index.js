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

    /* ╔══════════════════════════════════════════════════════════════════╗
       ║ MODULE A — HOBBIES: Mobile overlay (carousel thumbnails → modal) ║
       ╚══════════════════════════════════════════════════════════════════╝ */
    // ==== About section Hobbies Cards (MOBILE OVERLAY — no blink) =================
    (() => {
        const track = document.querySelector('.about-hobbies-mobile .hobbies-carousel .track');
        if (!track) return;

        const cards = [...track.querySelectorAll('.rail-card')];
        let openId = null;

        // Let taps through if you have .hit anchors on the cards.
        track.querySelectorAll('.rail-card .hit').forEach(a => {
            a.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); }, { passive: false });
        });

        // ---------- build once: backdrop + overlay shell ----------
        const backdrop = document.createElement('div');
        backdrop.className = 'hobby-backdrop';

        const overlay = document.createElement('div');
        overlay.className = 'hobby-overlay';

        // inner structure so text & image fade together
        const oImg = new Image();
        const oTitle = document.createElement('h4');
        const oText = document.createElement('p');

        // keep these elements stable to avoid layout/paint thrash
        overlay.append(oImg, oTitle, oText);
        document.body.append(backdrop, overlay);

        // scroll lock helper (do after we start the fade to dodge a pre-fade reflow)
        const lockScroll = (lock) => {
            document.documentElement.classList.toggle('lock-scroll', lock);
            document.body.classList.toggle('lock-scroll', lock);
        };

        // ---------- predecode all thumbnail images in the background ----------
        const decodedURL = new Map();   // card -> decoded URL string
        const decodeURL = (url) => new Promise((res) => {
            const i = new Image();
            i.decoding = 'async';
            i.loading = 'eager';
            i.src = url;
            (i.decode?.() || Promise.resolve()).catch(() => { }).finally(res);
        });

        cards.forEach(card => {
            const img = card.querySelector('img');
            if (!img) return;
            const url = img.currentSrc || img.src;
            if (!url || decodedURL.has(card)) return;
            decodeURL(url).then(() => decodedURL.set(card, url));
        });

        // ---------- open/close ----------
        const close = () => {
            backdrop.classList.remove('show');
            overlay.classList.remove('show');
            overlay.addEventListener('transitionend', () => {
                // clear content to keep memory low, but keep nodes mounted
                oImg.removeAttribute('src');
                oTitle.textContent = '';
                oText.textContent = '';
            }, { once: true });
            openId = null;
            lockScroll(false);
        };

        backdrop.addEventListener('click', close);
        overlay.addEventListener('click', close);
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

        // small movement threshold so swipes don’t trigger taps
        const MOVE_TOL = 10;
        cards.forEach(card => {
            let startX = 0, startY = 0, moved = false;

            const onDown = (e) => {
                moved = false;
                const pt = e.touches?.[0] || e;
                startX = pt.clientX; startY = pt.clientY;
            };
            const onMove = (e) => {
                const pt = e.touches?.[0] || e;
                if (Math.abs(pt.clientX - startX) > MOVE_TOL || Math.abs(pt.clientY - startY) > MOVE_TOL) moved = true;
            };
            const onUp = async () => {
                if (moved) return;

                const id = card.dataset.hobby || cards.indexOf(card);

                // toggle off if same one
                if (openId === id) { close(); return; }
                if (openId != null) close();

                // fill overlay content (title/text are cloned once into static nodes)
                const srcImg = card.querySelector('img');
                const title = card.querySelector('h4');
                const text = card.querySelector('p');

                oTitle.textContent = title ? title.textContent : '';
                oText.textContent = text ? text.textContent : '';

                // choose predecoded URL if we have it
                const url = (srcImg && (decodedURL.get(card) || srcImg.currentSrc || srcImg.src)) || '';

                // set image src first; if not decoded yet, wait up to ~50ms then show anyway
                if (url) oImg.src = url;

                // force initial styles to stick (opacity:0)
                // eslint-disable-next-line no-unused-expressions
                backdrop.offsetWidth; overlay.offsetWidth;

                backdrop.classList.add('show');
                overlay.classList.add('show');

                // lock scroll right after we’ve kicked the fade, so no pre-fade jump
                requestAnimationFrame(() => lockScroll(true));

                // try to sync the image decode so the fade looks uniform
                try {
                    const controller = new AbortController();
                    const timeout = setTimeout(() => controller.abort(), 50);
                    await (oImg.decode?.() || Promise.resolve());
                    clearTimeout(timeout);
                } catch { /* ignore */ }

                openId = id;
            };

            // Pointer events where available
            if (window.PointerEvent) {
                card.addEventListener('pointerdown', onDown, { passive: true });
                card.addEventListener('pointermove', onMove, { passive: true });
                card.addEventListener('pointerup', onUp, { passive: true });
            } else {
                card.addEventListener('touchstart', onDown, { passive: true });
                card.addEventListener('touchmove', onMove, { passive: true });
                card.addEventListener('touchend', onUp, { passive: true });
                card.addEventListener('click', () => { if (!moved) onUp(); }, { passive: true });
            }
        });
    })();

    /* ╔══════════════════════════════════════════════════════════════════╗
       ║ MODULE B — HOBBIES: Desktop/touch fallback (expand cards by tap) ║
       ╚══════════════════════════════════════════════════════════════════╝ */
    (function HobbiesDesktopClickFallback() {
        // Scope to the desktop rail (NOT the mobile carousel).
        const rail = document.querySelector('.hobbies-rail');
        if (!rail) return;

        // If the device actually supports hover with a fine pointer, we do nothing here.
        const hasRealHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        if (hasRealHover) {
            // Safety: if something previously set .active, clear it to avoid “sticking”.
            rail.querySelectorAll('.rail-card.active').forEach(c => c.classList.remove('active'));
            return;
        }

        // Touch / no-hover fallback: clicking expands one card, tapping outside closes.
        const cards = Array.from(rail.querySelectorAll('.rail-card'));
        const clear = () => cards.forEach(c => c.classList.remove('active'));

        cards.forEach(card => {
            card.addEventListener('click', () => {
                const wasActive = card.classList.contains('active');
                clear();
                if (!wasActive) card.classList.add('active'); // toggle on
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
