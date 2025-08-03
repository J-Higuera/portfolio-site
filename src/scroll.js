// ==================== Smooth Scroll ====================
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('a.scroll-link').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (!target) return;

            const offset = 0;
            const top = target.getBoundingClientRect().top + window.pageYOffset - offset;

            window.scrollTo({
                top,
                behavior: 'smooth'
            });
        });
    });
});
