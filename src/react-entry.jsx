import React from "react";
import { createRoot } from "react-dom/client";

document.addEventListener("DOMContentLoaded", () => {
    requestIdleCallback(() => {
        import("./react/GitHubCalendar.jsx").then(({ default: GitHubCalendar }) => {
            const root = createRoot(document.getElementById("github-root"));
            root.render(<GitHubCalendar />);
        });
    });
});
