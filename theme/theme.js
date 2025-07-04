document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const toggleSwitch = document.getElementById("themeToggle");
    const switchThumb = toggleSwitch.querySelector(".switch-thumb");

    // Apply saved preference and update thumb text
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
        body.classList.add("light-mode");
        switchThumb.textContent = "ON";
    } else {
        switchThumb.textContent = "OFF";
    }

    toggleSwitch.addEventListener("click", () => {
        const isLight = body.classList.toggle("light-mode");
        localStorage.setItem("theme", isLight ? "light" : "dark");
        switchThumb.textContent = isLight ? "ON" : "OFF";
    });
});



