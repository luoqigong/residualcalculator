// Main JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    initMobileNavigation();
    
    // Smooth scrolling for anchor links
    initSmoothScrolling();
    
    // Active navigation link highlighting
    updateActiveNavigation();
    
    // Form validation
    initFormValidation();
});

/**
 * Initialize mobile navigation functionality
 */
function initMobileNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const body = document.body;
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            const isOpen = navToggle.classList.contains('nav__toggle--open');
            
            if (isOpen) {
                // Close menu
                navToggle.classList.remove('nav__toggle--open');
                navMenu.classList.remove('nav__menu--open');
                body.classList.remove('menu-open');
                
                // Re-enable body scroll
                body.style.overflow = '';
                body.style.position = '';
                body.style.width = '';
            } else {
                // Open menu
                navToggle.classList.add('nav__toggle--open');
                navMenu.classList.add('nav__menu--open');
                body.classList.add('menu-open');
                
                // Prevent body scroll on mobile
                if (window.innerWidth <= 768) {
                    body.style.overflow = 'hidden';
                    body.style.position = 'fixed';
                    body.style.width = '100%';
                }
            }
        });
        
        // Close mobile menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('.nav__link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navToggle.classList.remove('nav__toggle--open');
                navMenu.classList.remove('nav__menu--open');
                body.classList.remove('menu-open');
                
                // Re-enable body scroll
                body.style.overflow = '';
                body.style.position = '';
                body.style.width = '';
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!navToggle.contains(event.target) && !navMenu.contains(event.target)) {
                navToggle.classList.remove('nav__toggle--open');
                navMenu.classList.remove('nav__menu--open');
                body.classList.remove('menu-open');
                
                // Re-enable body scroll
                body.style.overflow = '';
                body.style.position = '';
                body.style.width = '';
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                // Reset mobile menu state on desktop
                navToggle.classList.remove('nav__toggle--open');
                navMenu.classList.remove('nav__menu--open');
                body.classList.remove('menu-open');
                
                // Re-enable body scroll
                body.style.overflow = '';
                body.style.position = '';
                body.style.width = '';
            }
        });
        
        // Add touch feedback for mobile
        if ('ontouchstart' in window) {
            navToggle.addEventListener('touchstart', function() {
                this.style.opacity = '0.7';
            });
            
            navToggle.addEventListener('touchend', function() {
                this.style.opacity = '1';
            });
        }
    }
}

/**
 * Initialize smooth scrolling for anchor links
 */
function initSmoothScrolling() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 20;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Update active navigation link based on current page
 */
function updateActiveNavigation() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav__link');
    
    navLinks.forEach(link => {
        link.classList.remove('nav__link--active');
        
        const linkPath = new URL(link.href).pathname;
        if (linkPath === currentPath || (currentPath === '/' && linkPath === '/')) {
            link.classList.add('nav__link--active');
        }
    });
}

/**
 * Initialize form validation
 */
function initFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                if (this.classList.contains('error')) {
                    validateField(this);
                }
            });
        });
        
        form.addEventListener('submit', function(event) {
            let isValid = true;
            
            inputs.forEach(input => {
                if (!validateField(input)) {
                    isValid = false;
                }
            });
            
            if (!isValid) {
                event.preventDefault();
            }
        });
    });
}

/**
 * Validate individual form field
 */
function validateField(field) {
    const value = field.value.trim();
    const fieldType = field.type;
    const isRequired = field.hasAttribute('required');
    
    // Remove existing error state
    field.classList.remove('error');
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    let isValid = true;
    let errorMessage = '';
    
    // Required field validation
    if (isRequired && !value) {
        isValid = false;
        errorMessage = 'This field is required.';
    }
    
    // Number field validation
    if (fieldType === 'number' && value) {
        if (isNaN(value) || !isFinite(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid number.';
        }
    }
    
    // Email field validation
    if (fieldType === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address.';
        }
    }
    
    // Display error if validation failed
    if (!isValid) {
        field.classList.add('error');
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = errorMessage;
        field.parentNode.appendChild(errorElement);
    }
    
    return isValid;
}

/**
 * Show loading state on button
 */
function showButtonLoading(button, text = 'Processing...') {
    button.disabled = true;
    button.setAttribute('data-original-text', button.textContent);
    button.textContent = text;
    button.classList.add('loading');
}

/**
 * Hide loading state on button
 */
function hideButtonLoading(button) {
    button.disabled = false;
    const originalText = button.getAttribute('data-original-text');
    if (originalText) {
        button.textContent = originalText;
        button.removeAttribute('data-original-text');
    }
    button.classList.remove('loading');
}

/**
 * Show notification message
 */
function showNotification(message, type = 'info', duration = 3000) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
        <div class="notification__content">
            <span class="notification__message">${message}</span>
            <button class="notification__close" aria-label="Close notification">×</button>
        </div>
    `;
    
    // Add styles for notification (if not already in CSS)
    if (!document.querySelector('style[data-notification-styles]')) {
        const style = document.createElement('style');
        style.setAttribute('data-notification-styles', 'true');
        style.textContent = `
            .notification {
                position: fixed;
                top: 90px;
                right: 20px;
                z-index: 1001;
                min-width: 300px;
                max-width: 500px;
                padding: 1rem;
                border-radius: 8px;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                background: white;
                border-left: 4px solid var(--primary-color);
                animation: slideInRight 0.3s ease;
            }
            
            .notification--success {
                border-left-color: var(--success-color);
            }
            
            .notification--error {
                border-left-color: var(--error-color);
            }
            
            .notification__content {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: 1rem;
            }
            
            .notification__message {
                flex: 1;
                font-size: 0.9rem;
                line-height: 1.4;
            }
            
            .notification__close {
                background: none;
                border: none;
                font-size: 1.2rem;
                cursor: pointer;
                color: var(--secondary-color);
                padding: 0;
                line-height: 1;
            }
            
            .notification__close:hover {
                color: var(--text-color);
            }
            
            @keyframes slideInRight {
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
                .notification {
                    right: 10px;
                    left: 10px;
                    min-width: auto;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Close button functionality
    const closeButton = notification.querySelector('.notification__close');
    closeButton.addEventListener('click', function() {
        notification.remove();
    });
    
    // Auto-remove after duration
    if (duration > 0) {
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, duration);
    }
}

/**
 * Format number for display
 */
function formatNumber(number, decimals = 4) {
    if (typeof number !== 'number' || isNaN(number)) {
        return 'Invalid';
    }
    
    // Round to specified decimal places
    const rounded = Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
    
    // Format with appropriate decimal places
    return rounded.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals
    });
}

/**
 * Copy text to clipboard
 */
async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const result = document.execCommand('copy');
            textArea.remove();
            return result;
        }
    } catch (error) {
        console.error('Failed to copy text:', error);
        return false;
    }
}

/**
 * Debounce function to limit function calls
 */
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

/**
 * Throttle function to limit function calls
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Export functions for use in other modules
window.MainUtils = {
    showButtonLoading,
    hideButtonLoading,
    showNotification,
    formatNumber,
    copyToClipboard,
    debounce,
    throttle,
    validateField
}; 