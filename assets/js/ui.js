/* Tool Belt - Shared UI and Navigation Module */
/* Common functions for UI interactions, navigation, and user experience */

/**
 * Tool Navigation and UI Enhancement Module
 */
class ToolBeltUI {
    constructor() {
        this.init();
    }

    /**
     * Initialize UI enhancements
     */
    init() {
        this.setupKeyboardNavigation();
        this.setupToolCardEffects();
        this.setupParallaxHeader();
        this.trackPageLoad();
    }

    /**
     * Navigate to a tool with analytics tracking
     * @param {string} toolPath - Path to the tool
     * @param {string} toolName - Name of the tool for tracking
     */
    navigateToTool(toolPath, toolName = null) {
        // Extract tool name from path if not provided
        if (!toolName && toolPath) {
            toolName = toolPath.replace(/[\/\-\.html]/g, ' ').trim();
        }
        
        // Track tool usage if analytics are available
        if (typeof this.trackToolUsage === 'function' && toolName) {
            this.trackToolUsage(toolName);
        }
        
        // Navigate to tool
        if (toolPath.startsWith('http') || toolPath.startsWith('//')) {
            window.open(toolPath, '_blank');
        } else {
            window.location.href = toolPath;
        }
    }

    /**
     * Setup keyboard navigation for tool cards
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && document.activeElement.classList.contains('tool-card')) {
                const toolPath = document.activeElement.getAttribute('data-tool-path') ||
                               document.activeElement.getAttribute('onclick')?.match(/navigateToTool\(['"`]([^'"`]+)['"`]\)/)?.[1];
                
                if (toolPath) {
                    this.navigateToTool(toolPath);
                }
            }
        });

        // Make tool cards focusable
        this.makeToolCardsFocusable();
    }

    /**
     * Make tool cards focusable for accessibility
     */
    makeToolCardsFocusable() {
        const toolCards = document.querySelectorAll('.tool-card.available');
        toolCards.forEach(card => {
            if (!card.hasAttribute('tabindex')) {
                card.setAttribute('tabindex', '0');
                card.setAttribute('role', 'button');
                
                // Get tool name for aria-label
                const toolTitle = card.querySelector('.tool-title')?.textContent || 'tool';
                card.setAttribute('aria-label', `Navigate to ${toolTitle}`);
            }
        });
    }

    /**
     * Setup interactive effects for tool cards
     */
    setupToolCardEffects() {
        const cards = document.querySelectorAll('.tool-card');
        
        cards.forEach(card => {
            // Add click animation for available tools
            if (card.classList.contains('available')) {
                card.addEventListener('click', () => {
                    this.animateCardClick(card);
                });
            }

            // Add hover sound effect placeholder
            card.addEventListener('mouseenter', () => {
                if (card.classList.contains('available')) {
                    console.log('Tool card hovered:', card.querySelector('.tool-title')?.textContent);
                }
            });
        });
    }

    /**
     * Animate card click for visual feedback
     * @param {HTMLElement} card - Card element to animate
     */
    animateCardClick(card) {
        card.style.transform = 'scale(0.98)';
        setTimeout(() => {
            card.style.transform = '';
        }, 150);
    }

    /**
     * Setup parallax effect for header
     */
    setupParallaxHeader() {
        const header = document.querySelector('.header');
        if (!header) return;

        const handleScroll = this.debounce(() => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            header.style.transform = `translateY(${rate}px)`;
        }, 10);

        window.addEventListener('scroll', handleScroll);
    }

    /**
     * Track page load performance
     */
    trackPageLoad() {
        window.addEventListener('load', () => {
            if (window.performance && window.performance.getEntriesByType) {
                const perfData = window.performance.getEntriesByType('navigation')[0];
                if (perfData) {
                    const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
                    console.log(`Page load time: ${loadTime}ms`);
                    
                    // Send to analytics if available
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'timing_complete', {
                            name: 'page_load',
                            value: Math.round(loadTime)
                        });
                    }
                }
            }
        });
    }

    /**
     * Track tool usage for analytics
     * @param {string} toolName - Name of the tool being accessed
     */
    trackToolUsage(toolName) {
        const timestamp = new Date().toISOString();
        console.log(`Tool accessed: ${toolName} at ${timestamp}`);
        
        // Send to analytics if available
        if (typeof gtag !== 'undefined') {
            gtag('event', 'tool_access', {
                tool_name: toolName,
                timestamp: timestamp
            });
        }
        
        // Store in localStorage for internal analytics
        try {
            const analytics = JSON.parse(localStorage.getItem('toolbelt_analytics') || '[]');
            analytics.push({
                tool: toolName,
                timestamp: timestamp,
                userAgent: navigator.userAgent,
                referrer: document.referrer
            });
            
            // Keep only last 100 entries
            if (analytics.length > 100) {
                analytics.splice(0, analytics.length - 100);
            }
            
            localStorage.setItem('toolbelt_analytics', JSON.stringify(analytics));
        } catch (error) {
            console.warn('Failed to store analytics:', error);
        }
    }

    /**
     * Debounce function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Show loading indicator
     * @param {string} message - Loading message
     * @returns {HTMLElement} Loading element
     */
    showLoading(message = 'Loading...') {
        const loader = document.createElement('div');
        loader.className = 'loading-indicator';
        loader.innerHTML = `
            <div class="loading-spinner"></div>
            <p>${message}</p>
        `;
        
        Object.assign(loader.style, {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            zIndex: '10000',
            textAlign: 'center'
        });
        
        document.body.appendChild(loader);
        return loader;
    }

    /**
     * Hide loading indicator
     * @param {HTMLElement} loader - Loading element to remove
     */
    hideLoading(loader) {
        if (loader && loader.parentNode) {
            loader.parentNode.removeChild(loader);
        }
    }

    /**
     * Get tool suggestions based on usage patterns
     * @returns {string} Random tool suggestion
     */
    suggestNewTool() {
        const suggestions = [
            'Loan Calculator',
            'Energy Efficiency Calculator', 
            'Paint Coverage Calculator',
            'Landscaping Planner',
            'Equipment Rental Tracker',
            'Material Waste Calculator',
            'Project Timeline Planner',
            'Budget Tracker',
            'Unit Converter Tool',
            'Tax Calculator'
        ];
        
        const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
        console.log(`Future tool suggestion: ${randomSuggestion}`);
        
        return randomSuggestion;
    }

    /**
     * Enhanced smooth scroll to element
     * @param {string|HTMLElement} target - CSS selector or element
     * @param {number} offset - Offset in pixels
     */
    scrollTo(target, offset = 0) {
        const element = typeof target === 'string' ? document.querySelector(target) : target;
        if (!element) return;

        const targetPosition = element.offsetTop - offset;
        
        if ('scrollBehavior' in document.documentElement.style) {
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        } else {
            // Fallback for older browsers
            this.smoothScrollTo(targetPosition);
        }
    }

    /**
     * Manual smooth scroll implementation for older browsers
     * @param {number} target - Target scroll position
     */
    smoothScrollTo(target) {
        const start = window.pageYOffset;
        const distance = target - start;
        const duration = 500;
        let startTime = null;

        const animation = (currentTime) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            // Easing function
            const ease = progress * (2 - progress);
            
            window.scrollTo(0, start + distance * ease);

            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        };

        requestAnimationFrame(animation);
    }
}

/**
 * LocalStorage Management Module
 */
class ToolBeltStorage {
    constructor(namespace = 'toolbelt') {
        this.namespace = namespace;
    }

    /**
     * Save data to localStorage with error handling
     * @param {string} key - Storage key
     * @param {any} data - Data to store
     * @returns {boolean} Success status
     */
    save(key, data) {
        try {
            const prefixedKey = `${this.namespace}_${key}`;
            localStorage.setItem(prefixedKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
            if (typeof showNotification === 'function') {
                showNotification('Failed to save data. Storage may be full.', 'warning');
            }
            return false;
        }
    }

    /**
     * Load data from localStorage with error handling
     * @param {string} key - Storage key
     * @param {any} defaultValue - Default value if not found
     * @returns {any} Loaded data or default value
     */
    load(key, defaultValue = null) {
        try {
            const prefixedKey = `${this.namespace}_${key}`;
            const saved = localStorage.getItem(prefixedKey);
            return saved ? JSON.parse(saved) : defaultValue;
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            return defaultValue;
        }
    }

    /**
     * Remove data from localStorage
     * @param {string} key - Storage key
     * @returns {boolean} Success status
     */
    remove(key) {
        try {
            const prefixedKey = `${this.namespace}_${key}`;
            localStorage.removeItem(prefixedKey);
            return true;
        } catch (error) {
            console.error('Failed to remove from localStorage:', error);
            return false;
        }
    }

    /**
     * Clear all data for this namespace
     * @returns {boolean} Success status
     */
    clear() {
        try {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(`${this.namespace}_`)) {
                    keysToRemove.push(key);
                }
            }
            
            keysToRemove.forEach(key => localStorage.removeItem(key));
            return true;
        } catch (error) {
            console.error('Failed to clear localStorage:', error);
            return false;
        }
    }

    /**
     * Get storage usage information
     * @returns {Object} Storage usage stats
     */
    getStorageInfo() {
        try {
            let totalSize = 0;
            let namespaceSize = 0;
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const value = localStorage.getItem(key);
                const size = (key.length + value.length) * 2; // UTF-16 = 2 bytes per char
                
                totalSize += size;
                if (key.startsWith(`${this.namespace}_`)) {
                    namespaceSize += size;
                }
            }
            
            return {
                totalSize: totalSize,
                namespaceSize: namespaceSize,
                totalSizeFormatted: this.formatBytes(totalSize),
                namespaceSizeFormatted: this.formatBytes(namespaceSize)
            };
        } catch (error) {
            console.error('Failed to get storage info:', error);
            return null;
        }
    }

    /**
     * Format bytes to human readable format
     * @param {number} bytes - Number of bytes
     * @returns {string} Formatted string
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize global instances
window.ToolBeltUI = new ToolBeltUI();
window.ToolBeltStorage = new ToolBeltStorage();

// Backward compatibility - expose navigation function globally
window.navigateToTool = function(toolPath, toolName) {
    window.ToolBeltUI.navigateToTool(toolPath, toolName);
};

// Auto-initialize on DOM content loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('ToolBelt UI initialized');
    });
} else {
    console.log('ToolBelt UI initialized');
}