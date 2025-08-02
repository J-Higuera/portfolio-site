// ==================== Smooth Scroll ====================
document.addEventListener("DOMContentLoaded", () => {
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

// ==================== Preloader ====================
window.addEventListener("load", () => {
    const preloader = document.getElementById("preloader");
    const fill = document.querySelector(".progress-fill");
    const percentText = document.getElementById("progress-percent");

    if (!preloader || !fill || !percentText) return;

    let progress = 0;

    const updateProgress = () => {
        if (progress < 100) {
            progress += Math.random() * 2;
            progress = Math.min(progress, 100);
            fill.style.width = `${Math.floor(progress)}%`;
            percentText.textContent = `${Math.floor(progress)}%`;
            requestAnimationFrame(updateProgress);
        } else {
            fill.style.width = "100%";
            percentText.textContent = "100%";

            preloader.classList.add("fade-out");
            setTimeout(() => {
                preloader.style.display = "none";
                document.documentElement.classList.remove("loading");
                document.body.classList.remove("loading");
            }, 500);
        }
    };

    // Add loading class early (you must also place this in <html class="loading"> at first render)
    document.documentElement.classList.add("loading");
    document.body.classList.add("loading");

    requestAnimationFrame(updateProgress);
});
