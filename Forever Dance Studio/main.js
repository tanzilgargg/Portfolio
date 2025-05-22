// DOM Elements
const themeToggle = document.querySelector('.theme-toggle');
const body = document.body;
const header = document.querySelector('header');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const counters = document.querySelectorAll('.counter');
const testimonials = document.querySelectorAll('.testimonial');
const dots = document.querySelectorAll('.dot');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');

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
    } else {
        localStorage.setItem('theme', 'light');
    }
});

// Sticky Header
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Mobile Menu Toggle
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// Counter Animation
function startCounters() {
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const count = +counter.innerText;
        const increment = target / 100;
        
        if (count < target) {
            counter.innerText = Math.ceil(count + increment);
            setTimeout(startCounters, 30);
        } else {
            counter.innerText = target;
        }
    });
}

// Testimonial Carousel
let currentTestimonial = 0;

function showTestimonial(index) {
    testimonials.forEach(testimonial => {
        testimonial.classList.remove('active');
    });
    
    dots.forEach(dot => {
        dot.classList.remove('active');
    });
    
    testimonials[index].classList.add('active');
    dots[index].classList.add('active');
}

// Next testimonial
nextBtn.addEventListener('click', () => {
    currentTestimonial++;
    if (currentTestimonial >= testimonials.length) {
        currentTestimonial = 0;
    }
    showTestimonial(currentTestimonial);
});

// Previous testimonial
prevBtn.addEventListener('click', () => {
    currentTestimonial--;
    if (currentTestimonial < 0) {
        currentTestimonial = testimonials.length - 1;
    }
    showTestimonial(currentTestimonial);
});

// Dot navigation
dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        currentTestimonial = index;
        showTestimonial(currentTestimonial);
    });
});

// Auto-rotate testimonials
setInterval(() => {
    currentTestimonial++;
    if (currentTestimonial >= testimonials.length) {
        currentTestimonial = 0;
    }
    showTestimonial(currentTestimonial);
}, 5000);

// Scroll Animation
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.bottom >= 0
    );
}

function handleScrollAnimation() {
    const elements = document.querySelectorAll('[data-aos]');
    
    elements.forEach(element => {
        if (isInViewport(element)) {
            element.classList.add('aos-animate');
        }
    });
    
    // Start counters when stats section is in view
    const statsSection = document.querySelector('.stats');
    if (isInViewport(statsSection)) {
        startCounters();
    }
}

// Add AOS classes for animation
document.addEventListener('DOMContentLoaded', () => {
    const elements = document.querySelectorAll('[data-aos]');
    
    elements.forEach(element => {
        element.classList.add('aos-init');
        const delay = element.getAttribute('data-aos-delay');
        if (delay) {
            element.style.transitionDelay = `${delay}ms`;
        }
    });
    
    handleScrollAnimation();
});

window.addEventListener('scroll', handleScrollAnimation);

// Save favorite classes to local storage
function saveFavoriteClass(className) {
    let favorites = JSON.parse(localStorage.getItem('favoriteClasses')) || [];
    
    if (!favorites.includes(className)) {
        favorites.push(className);
        localStorage.setItem('favoriteClasses', JSON.stringify(favorites));
        alert(`${className} added to favorites!`);
    } else {
        alert(`${className} is already in your favorites!`);
    }
}

// This function will be used in the classes page
window.saveFavoriteClass = saveFavoriteClass;