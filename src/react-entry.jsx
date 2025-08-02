import { createRoot } from 'react-dom/client';
import GitHubCalendar from './react/GitHubCalendar.jsx';

document.addEventListener("DOMContentLoaded", () => {
    const target = document.getElementById("github-root");
    if (!target) return;

    const root = createRoot(target);
    root.render(<GitHubCalendar />);
});

