document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const desktopToggle = document.getElementById("themeToggleDesktop");
    const mobileToggle = document.getElementById("themeToggleMobile");

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
        body.classList.add("light-mode");
        desktopToggle.querySelector(".switch-thumb").textContent = "ON";
        mobileToggle.querySelector(".switch-thumb").textContent = "ON";
    } else {
        desktopToggle.querySelector(".switch-thumb").textContent = "OFF";
        mobileToggle.querySelector(".switch-thumb").textContent = "OFF";
    }

    function toggleTheme() {
        const isLight = body.classList.toggle("light-mode");
        localStorage.setItem("theme", isLight ? "light" : "dark");
        desktopToggle.querySelector(".switch-thumb").textContent = isLight ? "ON" : "OFF";
        mobileToggle.querySelector(".switch-thumb").textContent = isLight ? "ON" : "OFF";
    }

    desktopToggle.addEventListener("click", toggleTheme);
    mobileToggle.addEventListener("click", toggleTheme);
});
