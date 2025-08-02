import { createRoot } from 'react-dom/client';

document.addEventListener("DOMContentLoaded", () => {
    const target = document.getElementById("github-root");
    if (!target) return;

    const observer = new IntersectionObserver(
        (entries, observer) => {
            const entry = entries[0];
            if (entry.isIntersecting) {
                import("./react/GitHubCalendar.jsx").then(({ default: GitHubCalendar }) => {
                    const root = createRoot(target);
                    root.render(<GitHubCalendar />);
                });

                observer.unobserve(entry.target);
            }
        },
        {
            threshold: 0,
            rootMargin: "100px 0px" // Preload ~100px early for seamless entry
        }
    );

    observer.observe(target);
});
