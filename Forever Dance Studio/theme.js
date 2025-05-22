// DOM Elements
const themeToggle = document.querySelector('.theme-toggle');
const body = document.body;

// Check for saved theme preference
if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    document.querySelector('.fa-moon').style.display = 'none';
    document.querySelector('.fa-sun').style.display = 'block';
}

// Theme Toggle
themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
        document.querySelector('.fa-moon').style.display = 'none';
        document.querySelector('.fa-sun').style.display = 'block';
    } else {
        localStorage.setItem('theme', 'light');
        document.querySelector('.fa-moon').style.display = 'block';
        document.querySelector('.fa-sun').style.display = 'none';
    }
});