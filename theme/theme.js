document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;

    const desktopToggle = document.getElementById("themeToggleDesktop");
    const mobileToggle = document.getElementById("themeToggleMobile");

    const desktopThumb = desktopToggle.querySelector(".switch-thumb");
    const mobileThumb = mobileToggle.querySelector(".switch-thumb");

    function updateTheme(isLight) {
        if (isLight) {
            body.classList.add("light-mode");
            localStorage.setItem("theme", "light");
            desktopThumb.textContent = "ON";
            mobileThumb.textContent = "ON";
        } else {
            body.classList.remove("light-mode");
            localStorage.setItem("theme", "dark");
            desktopThumb.textContent = "OFF";
            mobileThumb.textContent = "OFF";
        }
    }

    // Load saved
    const savedTheme = localStorage.getItem("theme");
    updateTheme(savedTheme === "light");

    // Both toggles click do same thing
    [desktopToggle, mobileToggle].forEach(toggle => {
        toggle.addEventListener("click", () => {
            const isLight = !body.classList.contains("light-mode");
            updateTheme(isLight);
        });
    });
});
