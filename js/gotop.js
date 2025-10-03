// Плавная прокрутка наверх
document.getElementById('toTop').addEventListener('click', function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Показывать/скрывать кнопку при прокрутке
window.addEventListener('scroll', function() {
    const toTopButton = document.getElementById('toTop');
    if (window.pageYOffset > 300) {
        toTopButton.style.display = 'flex';
    } else {
        toTopButton.style.display = 'none';
    }
});