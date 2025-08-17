// document.addEventListener('DOMContentLoaded', () => {

//     const cards = document.querySelectorAll('.project-card');
//     const observerOptions = { threshold: 0.2 };

//     // Debounce IntersectionObserver for optimal scroll performance
//     const observer = new IntersectionObserver((entries, observer) => {
//         const visibleEntries = entries.filter(entry => entry.isIntersecting);

//         visibleEntries.forEach((entry, index) => {
//             setTimeout(() => {
//                 entry.target.classList.add('visible');
//                 observer.unobserve(entry.target);
//             }, index * 150); // same staggered 150ms interval
//         });
//     }, observerOptions);

//     cards.forEach(card => observer.observe(card));
// });
