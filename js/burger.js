// Бургер-меню
function myFunction(x) {
    x.classList.toggle("change");
    document.querySelector('.nav-items').classList.toggle('active');
}

// Закрытие меню при клике на ссылку
document.querySelectorAll('.nav-items a').forEach(link => {
    link.addEventListener('click', function() {
        document.querySelector('.nav-button').classList.remove('change');
        document.querySelector('.nav-items').classList.remove('active');
    });
});

// Закрытие меню при клике вне его области
document.addEventListener('click', function(event) {
    const nav = document.querySelector('.nav-items');
    const burger = document.querySelector('.nav-button');
    
    if (!nav.contains(event.target) && !burger.contains(event.target) && nav.classList.contains('active')) {
        burger.classList.remove('change');
        nav.classList.remove('active');
    }
});