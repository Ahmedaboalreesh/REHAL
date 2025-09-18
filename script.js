// REHAL Platform JavaScript Functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initializeApp();
});

function initializeApp() {
    setupUserTypeSelection();
    setupRouteForm();
    setupMobileNavigation();
    setupDateInput();
    setupFormValidation();
}

// User Type Selection Functionality
function setupUserTypeSelection() {
    const userTypeOptions = document.querySelectorAll('.user-type-option');
    
    userTypeOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from all options
            userTypeOptions.forEach(opt => opt.classList.remove('active'));
            
            // Add active class to clicked option
            this.classList.add('active');
            
            // Store selected user type
            const userType = this.dataset.type;
            localStorage.setItem('selectedUserType', userType);
            
            // Update form based on user type
            updateFormForUserType(userType);
        });
    });
}

function updateFormForUserType(userType) {
    const destinationSelect = document.getElementById('destination');
    const timeSelect = document.getElementById('time');
    
    if (userType === 'student') {
        // For students, prioritize university destinations
        const universityOptions = destinationSelect.querySelectorAll('option[value*="ksu"], option[value*="imamu"], option[value*="ksau"], option[value*="psu"]');
        universityOptions.forEach(option => {
            option.style.fontWeight = 'bold';
            option.style.color = '#667eea';
        });
        
        // Set default times for students (morning and afternoon)
        timeSelect.innerHTML = `
            <option value="">اختر وقت الرحلة</option>
            <option value="06:00">6:00 صباحاً</option>
            <option value="06:30">6:30 صباحاً</option>
            <option value="07:00">7:00 صباحاً</option>
            <option value="07:30">7:30 صباحاً</option>
            <option value="08:00">8:00 صباحاً</option>
            <option value="08:30">8:30 صباحاً</option>
            <option value="09:00">9:00 صباحاً</option>
            <option value="15:00">3:00 مساءً</option>
            <option value="15:30">3:30 مساءً</option>
            <option value="16:00">4:00 مساءً</option>
            <option value="16:30">4:30 مساءً</option>
            <option value="17:00">5:00 مساءً</option>
            <option value="17:30">5:30 مساءً</option>
            <option value="18:00">6:00 مساءً</option>
        `;
    } else if (userType === 'worker') {
        // For workers, prioritize business districts
        const businessOptions = destinationSelect.querySelectorAll('option[value*="center"], option[value*="olaya"], option[value*="malaz"]');
        businessOptions.forEach(option => {
            option.style.fontWeight = 'bold';
            option.style.color = '#667eea';
        });
        
        // Set default times for workers (early morning and evening)
        timeSelect.innerHTML = `
            <option value="">اختر وقت الرحلة</option>
            <option value="06:00">6:00 صباحاً</option>
            <option value="06:30">6:30 صباحاً</option>
            <option value="07:00">7:00 صباحاً</option>
            <option value="07:30">7:30 صباحاً</option>
            <option value="08:00">8:00 صباحاً</option>
            <option value="08:30">8:30 صباحاً</option>
            <option value="17:00">5:00 مساءً</option>
            <option value="17:30">5:30 مساءً</option>
            <option value="18:00">6:00 مساءً</option>
            <option value="18:30">6:30 مساءً</option>
            <option value="19:00">7:00 مساءً</option>
        `;
    }
}

// Route Form Functionality
function setupRouteForm() {
    const routeForm = document.getElementById('routeForm');
    const departureSelect = document.getElementById('departure');
    const destinationSelect = document.getElementById('destination');
    
    // Handle form submission
    routeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleRouteSearch();
    });
    
    // Handle departure selection change
    departureSelect.addEventListener('change', function() {
        updateDestinationOptions(this.value);
    });
    
    // Handle destination selection change
    destinationSelect.addEventListener('change', function() {
        validateRouteSelection();
    });
}

function updateDestinationOptions(selectedDeparture) {
    const destinationSelect = document.getElementById('destination');
    const options = destinationSelect.querySelectorAll('option');
    
    // Reset all options
    options.forEach(option => {
        option.disabled = false;
        option.style.color = '';
    });
    
    // Disable the selected departure option in destination
    if (selectedDeparture) {
        const departureOption = destinationSelect.querySelector(`option[value="${selectedDeparture}"]`);
        if (departureOption) {
            departureOption.disabled = true;
            departureOption.style.color = '#ccc';
        }
    }
}

function validateRouteSelection() {
    const departure = document.getElementById('departure').value;
    const destination = document.getElementById('destination').value;
    
    if (departure && destination && departure === destination) {
        showNotification('لا يمكن اختيار نفس المنطقة للمغادرة والوصول', 'error');
        document.getElementById('destination').value = '';
    }
}

function handleRouteSearch() {
    const formData = new FormData(document.getElementById('routeForm'));
    const userType = localStorage.getItem('selectedUserType');
    
    if (!userType) {
        showNotification('يرجى اختيار نوع المستخدمة أولاً', 'error');
        return;
    }
    
    const routeData = {
        userType: userType,
        departure: formData.get('departure'),
        destination: formData.get('destination'),
        date: formData.get('date'),
        time: formData.get('time')
    };
    
    // Validate form data
    if (!routeData.departure || !routeData.destination || !routeData.date || !routeData.time) {
        showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    // Simulate route search
    searchRoutes(routeData);
}

function searchRoutes(routeData) {
    showLoadingState();
    
    // Simulate API call
    setTimeout(() => {
        hideLoadingState();
        const routes = generateMockRoutes(routeData);
        displaySearchResults(routes, routeData);
    }, 2000);
}

function generateMockRoutes(routeData) {
    const routes = [];
    const routeCount = Math.floor(Math.random() * 3) + 1; // 1-3 routes
    
    for (let i = 0; i < routeCount; i++) {
        const route = {
            id: `route_${i + 1}`,
            departure: routeData.departure,
            destination: routeData.destination,
            date: routeData.date,
            time: routeData.time,
            duration: Math.floor(Math.random() * 30) + 20, // 20-50 minutes
            price: Math.floor(Math.random() * 20) + 15, // 15-35 SAR
            driver: {
                name: `السائقة ${i + 1}`,
                rating: (Math.random() * 1 + 4).toFixed(1), // 4.0-5.0
                experience: Math.floor(Math.random() * 5) + 2 // 2-6 years
            },
            vehicle: {
                type: 'ميكروباص',
                capacity: 12,
                features: ['تكييف', 'واي فاي', 'مقاعد مريحة']
            },
            availableSeats: Math.floor(Math.random() * 8) + 1 // 1-8 seats
        };
        routes.push(route);
    }
    
    return routes;
}

function displaySearchResults(routes, searchData) {
    const resultsHTML = `
        <div class="search-results">
            <h3>نتائج البحث</h3>
            <div class="search-info">
                <p><strong>من:</strong> ${getLocationName(searchData.departure)}</p>
                <p><strong>إلى:</strong> ${getLocationName(searchData.destination)}</p>
                <p><strong>التاريخ:</strong> ${formatDate(searchData.date)}</p>
                <p><strong>الوقت:</strong> ${searchData.time}</p>
            </div>
            <div class="routes-list">
                ${routes.map(route => createRouteCard(route)).join('')}
            </div>
        </div>
    `;
    
    // Insert results after the booking form
    const bookingCard = document.querySelector('.booking-card');
    const existingResults = document.querySelector('.search-results');
    
    if (existingResults) {
        existingResults.remove();
    }
    
    bookingCard.insertAdjacentHTML('afterend', resultsHTML);
    
    // Scroll to results
    document.querySelector('.search-results').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

function createRouteCard(route) {
    return `
        <div class="route-card">
            <div class="route-header">
                <div class="route-time">
                    <i class="fas fa-clock"></i>
                    <span>${route.time}</span>
                </div>
                <div class="route-duration">
                    <i class="fas fa-route"></i>
                    <span>${route.duration} دقيقة</span>
                </div>
                <div class="route-price">
                    <span class="price">${route.price} ريال</span>
                </div>
            </div>
            <div class="route-details">
                <div class="driver-info">
                    <h4>${route.driver.name}</h4>
                    <div class="rating">
                        <i class="fas fa-star"></i>
                        <span>${route.driver.rating}</span>
                        <span class="experience">(${route.driver.experience} سنوات خبرة)</span>
                    </div>
                </div>
                <div class="vehicle-info">
                    <p><i class="fas fa-bus"></i> ${route.vehicle.type} - ${route.vehicle.capacity} مقعد</p>
                    <p><i class="fas fa-users"></i> ${route.availableSeats} مقاعد متاحة</p>
                </div>
                <div class="vehicle-features">
                    ${route.vehicle.features.map(feature => `<span class="feature">${feature}</span>`).join('')}
                </div>
            </div>
            <div class="route-actions">
                <button class="book-route-btn" onclick="bookRoute('${route.id}')">
                    <i class="fas fa-check"></i>
                    احجز الآن
                </button>
                <button class="view-details-btn" onclick="viewRouteDetails('${route.id}')">
                    <i class="fas fa-info-circle"></i>
                    التفاصيل
                </button>
            </div>
        </div>
    `;
}

function getLocationName(locationCode) {
    const locations = {
        'riyadh-center': 'وسط الرياض',
        'riyadh-north': 'شمال الرياض',
        'riyadh-south': 'جنوب الرياض',
        'riyadh-east': 'شرق الرياض',
        'riyadh-west': 'غرب الرياض',
        'olaya': 'العليا',
        'malaz': 'الملز',
        'nasim': 'النسيم',
        'shifa': 'الشفا',
        'hittin': 'حطين',
        'al-nakheel': 'النخيل',
        'ksu': 'جامعة الملك سعود',
        'imamu': 'جامعة الإمام محمد بن سعود',
        'ksau': 'جامعة الملك سعود للعلوم الصحية',
        'psu': 'جامعة الأميرة نورة'
    };
    return locations[locationCode] || locationCode;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    };
    return date.toLocaleDateString('ar-SA', options);
}

// Mobile Navigation
function setupMobileNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }
}

// Date Input Setup
function setupDateInput() {
    const dateInput = document.getElementById('date');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Set minimum date to tomorrow
    dateInput.min = tomorrow.toISOString().split('T')[0];
    
    // Set default date to tomorrow
    dateInput.value = tomorrow.toISOString().split('T')[0];
}

// Form Validation
function setupFormValidation() {
    const form = document.getElementById('routeForm');
    const inputs = form.querySelectorAll('input, select');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            clearFieldError(this);
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'هذا الحقل مطلوب';
    }
    
    if (field.type === 'date' && value) {
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            isValid = false;
            errorMessage = 'لا يمكن اختيار تاريخ في الماضي';
        }
    }
    
    if (isValid) {
        clearFieldError(field);
    } else {
        showFieldError(field, errorMessage);
    }
    
    return isValid;
}

function showFieldError(field, message) {
    clearFieldError(field);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
    field.classList.add('error');
}

function clearFieldError(field) {
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
    field.classList.remove('error');
}

// Utility Functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button class="close-notification" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

function showLoadingState() {
    const bookBtn = document.querySelector('.book-btn');
    const originalText = bookBtn.innerHTML;
    
    bookBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري البحث...';
    bookBtn.disabled = true;
    
    // Store original text for restoration
    bookBtn.dataset.originalText = originalText;
}

function hideLoadingState() {
    const bookBtn = document.querySelector('.book-btn');
    const originalText = bookBtn.dataset.originalText;
    
    bookBtn.innerHTML = originalText;
    bookBtn.disabled = false;
}

// Route Booking Functions
function bookRoute(routeId) {
    const userType = localStorage.getItem('selectedUserType');
    
    if (!userType) {
        showNotification('يرجى اختيار نوع المستخدمة أولاً', 'error');
        return;
    }
    
    // In a real application, this would redirect to a booking page
    showNotification('سيتم توجيهك إلى صفحة الحجز قريباً', 'info');
    
    // Simulate redirect
    setTimeout(() => {
        alert(`حجز الرحلة ${routeId} - سيتم إضافة صفحة الحجز قريباً`);
    }, 1000);
}

function viewRouteDetails(routeId) {
    // In a real application, this would show a modal with route details
    showNotification('سيتم إضافة صفحة التفاصيل قريباً', 'info');
}

// Contact Form Handling
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('.contact-form form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const name = formData.get('name') || this.querySelector('input[type="text"]').value;
            const email = formData.get('email') || this.querySelector('input[type="email"]').value;
            const message = formData.get('message') || this.querySelector('textarea').value;
            
            if (!name || !email || !message) {
                showNotification('يرجى ملء جميع الحقول', 'error');
                return;
            }
            
            // Simulate form submission
            showLoadingState();
            
            setTimeout(() => {
                hideLoadingState();
                showNotification('تم إرسال رسالتك بنجاح، سنتواصل معك قريباً', 'success');
                this.reset();
            }, 2000);
        });
    }
});

// Smooth Scrolling for Navigation Links
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

// Add CSS for additional elements
const additionalStyles = `
    .search-results {
        background: white;
        border-radius: 20px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        padding: 2rem;
        margin: 2rem auto;
        max-width: 800px;
    }
    
    .search-results h3 {
        text-align: center;
        color: #333;
        margin-bottom: 1.5rem;
        font-size: 1.8rem;
    }
    
    .search-info {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 10px;
        margin-bottom: 2rem;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
    }
    
    .search-info p {
        margin: 0;
        color: #555;
    }
    
    .routes-list {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }
    
    .route-card {
        border: 2px solid #e0e0e0;
        border-radius: 15px;
        padding: 1.5rem;
        transition: all 0.3s ease;
    }
    
    .route-card:hover {
        border-color: #667eea;
        box-shadow: 0 5px 15px rgba(102, 126, 234, 0.2);
    }
    
    .route-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #e0e0e0;
    }
    
    .route-time, .route-duration {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #555;
    }
    
    .route-price .price {
        font-size: 1.5rem;
        font-weight: 700;
        color: #667eea;
    }
    
    .route-details {
        margin-bottom: 1.5rem;
    }
    
    .driver-info h4 {
        color: #333;
        margin-bottom: 0.5rem;
    }
    
    .rating {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #ffd700;
    }
    
    .experience {
        color: #666;
        font-size: 0.9rem;
    }
    
    .vehicle-info {
        margin: 1rem 0;
        color: #555;
    }
    
    .vehicle-info p {
        margin: 0.5rem 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .vehicle-features {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
    }
    
    .feature {
        background: #667eea;
        color: white;
        padding: 0.3rem 0.8rem;
        border-radius: 15px;
        font-size: 0.8rem;
    }
    
    .route-actions {
        display: flex;
        gap: 1rem;
    }
    
    .book-route-btn, .view-details-btn {
        flex: 1;
        padding: 0.8rem;
        border: none;
        border-radius: 10px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
    }
    
    .book-route-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }
    
    .book-route-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }
    
    .view-details-btn {
        background: #f8f9fa;
        color: #667eea;
        border: 2px solid #667eea;
    }
    
    .view-details-btn:hover {
        background: #667eea;
        color: white;
    }
    
    .notification {
        position: fixed;
        top: 100px;
        right: 20px;
        background: white;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        padding: 1rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        z-index: 10000;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    }
    
    .notification-error {
        border-right: 4px solid #dc3545;
    }
    
    .notification-success {
        border-right: 4px solid #28a745;
    }
    
    .notification-info {
        border-right: 4px solid #17a2b8;
    }
    
    .close-notification {
        background: none;
        border: none;
        cursor: pointer;
        color: #666;
        padding: 0;
        margin-right: auto;
    }
    
    .field-error {
        color: #dc3545;
        font-size: 0.9rem;
        margin-top: 0.5rem;
    }
    
    .form-group input.error,
    .form-group select.error {
        border-color: #dc3545;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @media (max-width: 768px) {
        .route-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
        }
        
        .route-actions {
            flex-direction: column;
        }
        
        .notification {
            right: 10px;
            left: 10px;
            max-width: none;
        }
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
