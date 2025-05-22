// DOM Elements
const galleryItems = document.querySelectorAll('.gallery-item');
const modal = document.querySelector('.gallery-modal');
const modalImg = document.querySelector('.modal-content');
const modalVideo = document.querySelector('.modal-video');
const modalCaption = document.querySelector('.modal-caption');
const closeBtn = document.querySelector('.close-modal');
const filterBtns = document.querySelectorAll('.gallery-filter-btn');

// Open Modal
galleryItems.forEach(item => {
    item.addEventListener('click', () => {
        modal.style.display = 'flex';
        
        const type = item.getAttribute('data-type');
        const src = item.querySelector('img').src;
        const caption = item.querySelector('.gallery-caption').textContent;
        
        if (type === 'image') {
            modalImg.style.display = 'block';
            modalVideo.style.display = 'none';
            modalImg.src = src;
        } else if (type === 'video') {
            modalImg.style.display = 'none';
            modalVideo.style.display = 'block';
            // Replace thumbnail with actual video
            const videoSrc = item.getAttribute('data-video');
            modalVideo.src = videoSrc;
            modalVideo.play();
        }
        
        modalCaption.textContent = caption;
    });
});

// Close Modal
closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    if (modalVideo.style.display === 'block') {
        modalVideo.pause();
    }
});

// Close Modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        if (modalVideo.style.display === 'block') {
            modalVideo.pause();
        }
    }
});

// Gallery Filtering
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        filterBtns.forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to clicked button
        btn.classList.add('active');
        
        // Get filter value
        const filterValue = btn.getAttribute('data-filter');
        
        // Filter gallery items
        galleryItems.forEach(item => {
            if (filterValue === 'all') {
                item.style.display = 'block';
            } else if (item.classList.contains(filterValue)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });
});

// Sort Gallery Items
document.getElementById('sort-select').addEventListener('change', function() {
    const sortValue = this.value;
    const galleryGrid = document.querySelector('.gallery-grid');
    const items = Array.from(galleryItems);
    
    if (sortValue === 'newest') {
        items.sort((a, b) => {
            const dateA = new Date(a.getAttribute('data-date'));
            const dateB = new Date(b.getAttribute('data-date'));
            return dateB - dateA;
        });
    } else if (sortValue === 'oldest') {
        items.sort((a, b) => {
            const dateA = new Date(a.getAttribute('data-date'));
            const dateB = new Date(b.getAttribute('data-date'));
            return dateA - dateB;
        });
    } else if (sortValue === 'event') {
        items.sort((a, b) => {
            const eventA = a.getAttribute('data-event');
            const eventB = b.getAttribute('data-event');
            return eventA.localeCompare(eventB);
        });
    }
    
    // Remove all items
    galleryItems.forEach(item => {
        item.remove();
    });
    
    // Append sorted items
    items.forEach(item => {
        galleryGrid.appendChild(item);
    });
});