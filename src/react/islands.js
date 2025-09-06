// lazy map so each island becomes its own chunk
const registry = {
    GitHubCalendar: () => import('./GitHubCalendar.jsx'),
    // add more here...
};
export default registry;
