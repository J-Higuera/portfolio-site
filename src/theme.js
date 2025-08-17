// document.addEventListener("DOMContentLoaded", () => {
//     // ==================== Theme Switch Setup ====================

//     // Reference to the <body> for theme class toggling
//     const body = document.body;

//     // Buttons for toggling theme on desktop and mobile
//     const desktopToggle = document.getElementById("themeToggleDesktop");
//     const mobileToggle = document.getElementById("themeToggleMobile");

//     // === Load and apply previously saved theme from localStorage ===
//     const savedTheme = localStorage.getItem("theme");

//     if (savedTheme === "light") {
//         // If the last chosen theme was light mode, apply it now
//         body.classList.add("light-mode");

//         // Update both toggles' label to show "ON"
//         desktopToggle.querySelector(".switch-thumb").textContent = "ON";
//         mobileToggle.querySelector(".switch-thumb").textContent = "ON";
//     } else {
//         // Default or dark mode: set toggle text to "OFF"
//         desktopToggle.querySelector(".switch-thumb").textContent = "OFF";
//         mobileToggle.querySelector(".switch-thumb").textContent = "OFF";
//     }

//     // === Theme toggle function ===
//     function toggleTheme() {
//         // Toggle the "light-mode" class on <body>
//         const isLight = body.classList.toggle("light-mode");

//         // Store the selected mode in localStorage
//         localStorage.setItem("theme", isLight ? "light" : "dark");

//         // Update switch label text for both toggles
//         desktopToggle.querySelector(".switch-thumb").textContent = isLight ? "ON" : "OFF";
//         mobileToggle.querySelector(".switch-thumb").textContent = isLight ? "ON" : "OFF";
//     }

//     // === Event listeners to trigger toggle on click ===
//     desktopToggle.addEventListener("click", toggleTheme);
//     mobileToggle.addEventListener("click", toggleTheme);
// });