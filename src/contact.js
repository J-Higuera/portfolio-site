// contact.js
document.addEventListener("DOMContentLoaded", () => {
    const contactSection = document.getElementById("contact");

    if (!contactSection) return;

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                import('../css/contact.css');
                observer.disconnect(); // Load once
            }
        });
    }, {
        threshold: 0.1
    });

    observer.observe(contactSection);
});
