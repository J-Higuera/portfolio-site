(() => {
    const STORAGE_KEY = "fxMode"; // "auto" | "high" | "lite"
    const root = document.documentElement;

    // ----- Manual override support -----
    function getUserMode() {
        return localStorage.getItem(STORAGE_KEY) || "auto";
    }

    function applyMode(mode) {
        root.classList.toggle("fx-high", mode === "high");
        root.classList.toggle("fx-lite", mode === "lite"); // optional, if you want
    }

    // Expose a tiny API so you can hook a UI toggle later
    window.setFxMode = (mode) => {
        localStorage.setItem(STORAGE_KEY, mode); // "auto" | "high" | "lite"
        init(); // re-run decision
    };

    // ----- Respect reduced motion -----
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");

    // ----- Core measurement -----
    function measureFrames({ durationMs = 2000 } = {}) {
        return new Promise((resolve) => {
            const times = [];
            let last = performance.now();
            const start = last;

            function frame(now) {
                const dt = now - last;
                last = now;

                // ignore the first couple frames (warmup)
                if (now - start > 150) times.push(dt);

                if (now - start < durationMs) {
                    requestAnimationFrame(frame);
                } else {
                    // Compute FPS and jank metrics
                    const avg = times.reduce((a, b) => a + b, 0) / times.length;
                    const fps = 1000 / avg;

                    // % of frames slower than 20ms (misses 60fps budget of 16.6ms)
                    const slow20 = times.filter((t) => t > 20).length / times.length;

                    // 95th percentile frame time (captures spikes)
                    const sorted = [...times].sort((a, b) => a - b);
                    const p95 = sorted[Math.floor(sorted.length * 0.95)] || avg;

                    resolve({ fps, slow20, p95, samples: times.length });
                }
            }

            requestAnimationFrame(frame);
        });
    }

    // Measure during scroll too (real-world)
    function measureDuringScroll() {
        return new Promise((resolve) => {
            let active = true;
            let timer;

            const onScroll = () => {
                if (!active) return;
                clearTimeout(timer);
                // stop measuring shortly after scrolling stops
                timer = setTimeout(() => {
                    active = false;
                    resolve();
                }, 200);
            };

            window.addEventListener("scroll", onScroll, { passive: true });

            // Trigger a small programmatic scroll nudge if page is tall enough
            // (helps if user doesn't scroll)
            const canScroll = document.documentElement.scrollHeight > innerHeight + 200;
            if (canScroll) window.scrollBy({ top: 120, left: 0, behavior: "instant" });

            // If no scroll happens, resolve after a timeout
            setTimeout(() => {
                active = false;
                window.removeEventListener("scroll", onScroll);
                resolve();
            }, 1200);
        });
    }

    async function decideAuto() {
        // If user prefers reduced motion, never go high
        if (reduceMotion?.matches) return "lite";

        // Baseline idle measure
        const idle = await measureFrames({ durationMs: 1800 });

        // Short scroll interaction measure
        await measureDuringScroll();
        const scroll = await measureFrames({ durationMs: 1400 });

        // Decision thresholds (tuned for 60Hz smoothness)
        // High only if: near-60fps AND low jank spikes
        const idleGood = idle.fps >= 58 && idle.slow20 <= 0.10 && idle.p95 <= 22;
        const scrollGood = scroll.fps >= 57 && scroll.slow20 <= 0.12 && scroll.p95 <= 24;

        return (idleGood && scrollGood) ? "high" : "lite";
    }

    async function init() {
        const mode = getUserMode();

        if (mode === "high" || mode === "lite") {
            applyMode(mode);
            return;
        }

        // Auto: start lite, then promote if safe
        applyMode("lite");

        // Wait until after initial load/paint so you don't worsen startup
        requestAnimationFrame(async () => {
            const autoMode = await decideAuto();
            applyMode(autoMode);
        });
    }

    init();
})();
