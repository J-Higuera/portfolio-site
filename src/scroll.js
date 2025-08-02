document.addEventListener("DOMContentLoaded", () => {
    // ==================== Smooth Scroll ====================
    document.querySelectorAll('a.scroll-link').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (!target) return;

            const offset = 0;
            const top = target.getBoundingClientRect().top + window.pageYOffset - offset;

            window.scrollTo({
                top,
                behavior: 'smooth'
            });
        });
    });
});

// ==================== Preloader Progress Bar ====================
window.addEventListener("load", () => {
    const preloader = document.getElementById("preloader");
    const fill = document.querySelector(".progress-fill");
    const percentText = document.getElementById("progress-percent");

    if (!preloader || !fill || !percentText) return;

    let progress = 0;
    const updateSpeed = 16; // ~60fps

    const updateProgress = () => {
        if (progress < 100) {
            // Simulate natural loading steps
            progress += Math.random() * 2;
            progress = Math.min(progress, 100);

            fill.style.width = `${Math.floor(progress)}%`;
            percentText.textContent = `${Math.floor(progress)}%`;
        }

        // Check both progress and real document readiness
        if (progress >= 100 && document.readyState === "complete") {
            fill.style.width = "100%";
            percentText.textContent = "100%";

            // Fade out preloader naturally
            preloader.classList.add("fade-out");

            // Fully remove after transition
            setTimeout(() => {
                preloader.style.display = "none";
                document.documentElement.classList.remove("loading");
                document.body.classList.remove("loading");
            }, 500); // match CSS transition time
        } else {
            requestAnimationFrame(updateProgress); // keep updating
        }
    };

    // Start the loop
    requestAnimationFrame(updateProgress);
});

