// Calculator Tabs JavaScript
class CalculatorTabs {
    constructor() {
        this.init();
    }
    
    init() {
        this.bindTabEvents();
        this.setActiveTab('basic'); // Set default active tab
    }
    
    /**
     * Bind tab button events
     */
    bindTabEvents() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const tabName = event.target.dataset.tab;
                this.setActiveTab(tabName);
            });
        });
        
        // Handle keyboard navigation
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Tab' && event.ctrlKey) {
                event.preventDefault();
                this.switchToNextTab();
            }
        });
    }
    
    /**
     * Set active tab
     */
    setActiveTab(tabName) {
        // Remove active class from all tabs and contents
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('tab-btn--active');
        });
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('tab-content--active');
        });
        
        // Add active class to selected tab and content
        const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
        const activeContent = document.getElementById(`${tabName}-tab`);
        
        if (activeButton && activeContent) {
            activeButton.classList.add('tab-btn--active');
            activeContent.classList.add('tab-content--active');
            
            // Update URL hash for bookmarking
            history.replaceState(null, null, `#${tabName}`);
            
            // Focus on first input in the active tab
            setTimeout(() => {
                const firstInput = activeContent.querySelector('input[type="number"]');
                if (firstInput) {
                    firstInput.focus();
                }
            }, 100);
        }
    }
    
    /**
     * Switch to next tab (for keyboard navigation)
     */
    switchToNextTab() {
        const tabs = ['basic', 'standardized', 'studentized', 'batch'];
        const currentTab = document.querySelector('.tab-btn--active').dataset.tab;
        const currentIndex = tabs.indexOf(currentTab);
        const nextIndex = (currentIndex + 1) % tabs.length;
        
        this.setActiveTab(tabs[nextIndex]);
    }
    
    /**
     * Get current active tab
     */
    getCurrentTab() {
        const activeButton = document.querySelector('.tab-btn--active');
        return activeButton ? activeButton.dataset.tab : 'basic';
    }
}

// Initialize tabs when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.CalculatorTabs = new CalculatorTabs();
    
    // Check for hash in URL to set initial tab
    const hash = window.location.hash.substring(1);
    const validTabs = ['basic', 'standardized', 'studentized', 'batch'];
    
    if (hash && validTabs.includes(hash)) {
        window.CalculatorTabs.setActiveTab(hash);
    }
}); 