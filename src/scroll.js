document.addEventListener("DOMContentLoaded", () => {
    // ==================== Smooth Scroll ====================
    // Applies to <a> elements with class "scroll-link"
    document.querySelectorAll('a.scroll-link').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault(); // Prevent default jump behavior

            // Get the target section from the href (e.g. "#about")
            const target = document.querySelector(this.getAttribute('href'));
            if (!target) return; // If no matching section, do nothing

            const offset = 0; // You can adjust this if you have sticky headers
            const topPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;

            // Smooth scroll to the target section
            window.scrollTo({
                top: topPosition,
                behavior: 'smooth'
            });
        });
    });

    // ==================== Preloader Progress Bar ====================
    // Elements used for loading progress
    const fill = document.querySelector(".progress-fill");        // Fills the loading bar
    const percentText = document.getElementById("progress-percent"); // Shows % text
    const preloader = document.getElementById("preloader");       // Fullscreen preloader container

    let progress = 0;
    let simulatedTotal = 10; // Simulated 100% progress mapped to "10"

    // === Updates the progress bar smoothly over time ===
    const updateProgress = () => {
        if (progress < simulatedTotal) {
            // Randomly increase progress between 0–2 units per frame
            progress += Math.random() * 2;
            progress = Math.min(progress, simulatedTotal); // Cap at simulated max
        }

        // Apply to DOM: fill width and % text
        fill.style.width = `${Math.floor(progress)}%`;
        percentText.textContent = `${Math.floor(progress)}%`;

        // Once page is fully loaded and simulated bar reaches 100%
        if (document.readyState === "complete" && progress >= simulatedTotal) {
            progress = 100;
            fill.style.width = "100%";
            percentText.textContent = "100%";

            // Fade out animation
            setTimeout(() => {
                preloader.classList.add("fade-out");

                // Fully remove the preloader from view after fade
                setTimeout(() => {
                    preloader.style.display = "none";

                    // Remove "loading" class to re-enable scrolling and effects
                    document.documentElement.classList.remove("loading");

                    // Apply a class for further transition effects (e.g. fade-in body)
                    requestAnimationFrame(() => {
                        document.body.classList.add("content-loaded");
                    });
                }, 500); // Fade duration
            }, 400); // Delay before fade starts
        } else {
            // Keep updating on next animation frame
            requestAnimationFrame(updateProgress);
        }
    };

    // === Start progress update loop ===
    updateProgress();
});




