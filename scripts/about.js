function toggleContent(element) {
    const content = element.nextElementSibling;
    const arrow = element.querySelector('.arrow');
    const parentSection = element.parentElement;

    if (content.style.maxHeight) {
        content.style.maxHeight = null;
        arrow.textContent = "▼";
        parentSection.classList.remove('expanded');
    } else {
        content.style.maxHeight = content.scrollHeight + "px";
        arrow.textContent = "▲";
        parentSection.classList.add('expanded');
    }
}

