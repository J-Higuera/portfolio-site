import { createRoot } from 'react-dom/client';

document.addEventListener("DOMContentLoaded", () => {
    const target = document.getElementById("github-root");
    if (!target) return;

    const idle = window.requestIdleCallback || function (cb) {
        setTimeout(cb, 1);
    };

    const observer = new IntersectionObserver(
        (entries, observer) => {
            const entry = entries[0];
            if (entry.isIntersecting) {
                idle(() => {
                    import("./react/GitHubCalendar.jsx").then(({ default: GitHubCalendar }) => {
                        const root = createRoot(target);
                        root.render(<GitHubCalendar />);
                    });
                });

                observer.unobserve(entry.target);
            }
        },
        {
            threshold: 0,
            rootMargin: "100px 0px" // Triggers before fully visible — useful on mobile
        }
    );

    observer.observe(target);
});
