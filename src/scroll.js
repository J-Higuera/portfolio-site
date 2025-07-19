document.addEventListener("DOMContentLoaded", () => {
    // Smooth Scroll
    document.querySelectorAll('a.scroll-link').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (!target) return;
            const offset = 0;
            const topPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;

            window.scrollTo({
                top: topPosition,
                behavior: 'smooth'
            });
        });
    });

    // Preloader Progress
    const fill = document.querySelector(".progress-fill");
    const percentText = document.getElementById("progress-percent");
    const preloader = document.getElementById("preloader");

    let progress = 0;
    let simulatedTotal = 10;

    const updateProgress = () => {
        if (progress < simulatedTotal) {
            progress += Math.random() * 2;
            progress = Math.min(progress, simulatedTotal);
        }

        fill.style.width = `${Math.floor(progress)}%`;
        percentText.textContent = `${Math.floor(progress)}%`;

        if (document.readyState === "complete" && progress >= simulatedTotal) {
            progress = 100;
            fill.style.width = "100%";
            percentText.textContent = "100%";

            setTimeout(() => {
                preloader.classList.add("fade-out");
                setTimeout(() => {
                    preloader.style.display = "none";
                    document.documentElement.classList.remove("loading");
                    requestAnimationFrame(() => {
                        document.body.classList.add("content-loaded");
                    });
                }, 500);
            }, 400);
        } else {
            requestAnimationFrame(updateProgress);
        }
    };

    updateProgress();

    // Intersection Observer for Reveal Animations
    const observer = new IntersectionObserver((entries, observerInstance) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("fade-in");
                observerInstance.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15
    });

    document.querySelectorAll('.hidden-on-load').forEach(el => {
        observer.observe(el);
    });
});

