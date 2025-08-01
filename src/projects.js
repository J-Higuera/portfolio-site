const observer = new IntersectionObserver((entries) => {
    let delay = 0;
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, delay);
            delay += 150; // 150ms between each card fade-in
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.2
});

document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.project-card');
    cards.forEach((card) => observer.observe(card));
});