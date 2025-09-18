document.addEventListener('DOMContentLoaded', function() {
    // FAQ functionality
    const faqItems = document.querySelectorAll('.faq-item');
    const searchInput = document.getElementById('faqSearch');
    const categoryBtns = document.querySelectorAll('.category-btn');
    const faqCategories = document.querySelectorAll('.faq-category');

    // Toggle FAQ items
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active', !isActive);
        });
    });

    // Search functionality
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question h3').textContent.toLowerCase();
            const answer = item.querySelector('.faq-answer p').textContent.toLowerCase();
            const category = item.closest('.faq-category');
            
            if (question.includes(searchTerm) || answer.includes(searchTerm)) {
                item.style.display = 'block';
                category.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
        
        // Hide empty categories
        faqCategories.forEach(category => {
            const visibleItems = category.querySelectorAll('.faq-item[style*="block"], .faq-item:not([style*="none"])');
            if (visibleItems.length === 0) {
                category.style.display = 'none';
            }
        });
    });

    // Category filtering
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.category;
            
            // Update active button
            categoryBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Filter FAQ items
            faqCategories.forEach(faqCategory => {
                const categoryData = faqCategory.dataset.category;
                
                if (category === 'all' || categoryData === category) {
                    faqCategory.style.display = 'block';
                    const items = faqCategory.querySelectorAll('.faq-item');
                    items.forEach(item => {
                        item.style.display = 'block';
                    });
                } else {
                    faqCategory.style.display = 'none';
                }
            });
            
            // Clear search when filtering by category
            searchInput.value = '';
        });
    });

    // Mobile navigation toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add animation to FAQ items on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe FAQ items for animation
    faqItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(item);
    });

    // Add keyboard navigation for FAQ items
    faqItems.forEach((item, index) => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                question.click();
            }
            
            // Arrow key navigation
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const nextItem = faqItems[index + 1];
                if (nextItem) {
                    nextItem.querySelector('.faq-question').focus();
                }
            }
            
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prevItem = faqItems[index - 1];
                if (prevItem) {
                    prevItem.querySelector('.faq-question').focus();
                }
            }
        });
        
        // Make FAQ questions focusable
        question.setAttribute('tabindex', '0');
        question.setAttribute('role', 'button');
        question.setAttribute('aria-expanded', 'false');
        
        // Update aria-expanded when toggled
        question.addEventListener('click', function() {
            const isActive = item.classList.contains('active');
            this.setAttribute('aria-expanded', isActive);
        });
    });

    // Add loading animation
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
    });

    // Add search suggestions (optional enhancement)
    const searchSuggestions = [
        'كيف أحجز رحلة؟',
        'ما هي طرق الدفع؟',
        'هل الخدمة آمنة؟',
        'كيف ألغي الحجز؟',
        'ما هي ساعات العمل؟',
        'هل يوجد تطبيق جوال؟'
    ];

    searchInput.addEventListener('focus', function() {
        // Could add dropdown with suggestions here
    });

    // Add analytics tracking (placeholder)
    function trackFAQInteraction(action, question) {
        console.log(`FAQ ${action}: ${question}`);
        // Here you would send data to your analytics service
    }

    // Track FAQ interactions
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question h3').textContent;
        
        item.addEventListener('click', function() {
            const isActive = this.classList.contains('active');
            trackFAQInteraction(isActive ? 'opened' : 'closed', question);
        });
    });

    // Track search queries
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            if (this.value.trim()) {
                trackFAQInteraction('searched', this.value);
            }
        }, 500);
    });

    // Track category filters
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            trackFAQInteraction('filtered', this.dataset.category);
        });
    });
});
