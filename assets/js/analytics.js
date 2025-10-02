/* Tool Belt - Performance Monitoring and Analytics */
/* Comprehensive tracking for user behavior, performance metrics, and tool usage */

class ToolBeltAnalytics {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();
        this.metrics = {
            pageLoads: 0,
            toolUsage: {},
            errors: [],
            performance: {},
            userInteractions: []
        };
        
        this.init();
    }

    /**
     * Initialize analytics tracking
     */
    init() {
        this.trackPageLoad();
        this.trackUserInteractions();
        this.trackErrors();
        this.trackScrollDepth();
        this.trackTimeOnPage();
        this.setupBeforeUnload();
        
        console.log('ToolBelt Analytics initialized');
    }

    /**
     * Generate unique session ID
     * @returns {string} Session ID
     */
    generateSessionId() {
        return 'tb_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Track page load performance
     */
    trackPageLoad() {
        this.metrics.pageLoads++;
        
        // Track initial page load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.recordPageLoadTime();
            });
        } else {
            this.recordPageLoadTime();
        }

        // Track full page load
        window.addEventListener('load', () => {
            this.recordFullPageLoadTime();
        });
    }

    /**
     * Record page load time metrics
     */
    recordPageLoadTime() {
        if (window.performance && window.performance.timing) {
            const timing = window.performance.timing;
            const metrics = {
                dns: timing.domainLookupEnd - timing.domainLookupStart,
                connect: timing.connectEnd - timing.connectStart,
                request: timing.responseEnd - timing.requestStart,
                domLoad: timing.domContentLoadedEventEnd - timing.navigationStart,
                pageLoad: timing.loadEventEnd - timing.navigationStart,
                timestamp: Date.now()
            };
            
            this.metrics.performance.pageLoad = metrics;
            this.sendAnalytics('page_load', metrics);
        }
    }

    /**
     * Record full page load time
     */
    recordFullPageLoadTime() {
        if (window.performance && window.performance.getEntriesByType) {
            const perfData = window.performance.getEntriesByType('navigation')[0];
            if (perfData) {
                const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
                this.metrics.performance.fullLoad = {
                    loadTime: loadTime,
                    transferSize: perfData.transferSize || 0,
                    encodedBodySize: perfData.encodedBodySize || 0,
                    decodedBodySize: perfData.decodedBodySize || 0
                };
            }
        }
    }

    /**
     * Track user interactions
     */
    trackUserInteractions() {
        // Track clicks on important elements
        document.addEventListener('click', (e) => {
            const target = e.target;
            let elementInfo = null;

            // Track tool card clicks
            if (target.closest('.tool-card')) {
                const card = target.closest('.tool-card');
                const toolName = card.querySelector('.tool-title')?.textContent || 'Unknown';
                elementInfo = {
                    type: 'tool_card_click',
                    tool: toolName,
                    available: card.classList.contains('available')
                };
            }
            // Track button clicks
            else if (target.matches('button') || target.closest('button')) {
                const button = target.matches('button') ? target : target.closest('button');
                elementInfo = {
                    type: 'button_click',
                    text: button.textContent?.trim() || 'Unknown',
                    className: button.className
                };
            }
            // Track form interactions
            else if (target.matches('input, select, textarea')) {
                elementInfo = {
                    type: 'form_interaction',
                    inputType: target.type || target.tagName.toLowerCase(),
                    id: target.id || 'unnamed'
                };
            }

            if (elementInfo) {
                this.recordInteraction(elementInfo);
            }
        });

        // Track scroll depth
        this.trackScrollDepth();

        // Track time on page
        this.trackTimeOnPage();
    }

    /**
     * Track scroll depth for engagement measurement
     */
    trackScrollDepth() {
        let maxScroll = 0;
        const throttledScroll = this.throttle(() => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
            );
            
            if (scrollPercent > maxScroll && scrollPercent <= 100) {
                maxScroll = scrollPercent;
                
                // Track milestones
                if (maxScroll >= 25 && maxScroll < 50 && !this.metrics.scroll25) {
                    this.metrics.scroll25 = true;
                    this.sendAnalytics('scroll_depth', { depth: 25 });
                } else if (maxScroll >= 50 && maxScroll < 75 && !this.metrics.scroll50) {
                    this.metrics.scroll50 = true;
                    this.sendAnalytics('scroll_depth', { depth: 50 });
                } else if (maxScroll >= 75 && maxScroll < 90 && !this.metrics.scroll75) {
                    this.metrics.scroll75 = true;
                    this.sendAnalytics('scroll_depth', { depth: 75 });
                } else if (maxScroll >= 90 && !this.metrics.scroll90) {
                    this.metrics.scroll90 = true;
                    this.sendAnalytics('scroll_depth', { depth: 90 });
                }
            }
        }, 500);

        window.addEventListener('scroll', throttledScroll);
    }

    /**
     * Track time spent on page
     */
    trackTimeOnPage() {
        // Track active time (when page is visible)
        let activeTime = 0;
        let lastActiveTime = Date.now();
        let isActive = !document.hidden;

        const updateActiveTime = () => {
            if (isActive) {
                const now = Date.now();
                activeTime += now - lastActiveTime;
                lastActiveTime = now;
            }
        };

        document.addEventListener('visibilitychange', () => {
            updateActiveTime();
            isActive = !document.hidden;
            lastActiveTime = Date.now();
        });

        // Send active time every 30 seconds
        setInterval(() => {
            updateActiveTime();
            this.metrics.activeTime = Math.round(activeTime / 1000); // Convert to seconds
        }, 30000);
    }

    /**
     * Track JavaScript errors
     */
    trackErrors() {
        window.addEventListener('error', (e) => {
            const errorInfo = {
                message: e.message,
                filename: e.filename,
                line: e.lineno,
                column: e.colno,
                timestamp: Date.now(),
                userAgent: navigator.userAgent,
                url: window.location.href
            };
            
            this.metrics.errors.push(errorInfo);
            this.sendAnalytics('javascript_error', errorInfo);
        });

        window.addEventListener('unhandledrejection', (e) => {
            const errorInfo = {
                message: e.reason?.message || 'Unhandled Promise Rejection',
                type: 'promise_rejection',
                timestamp: Date.now(),
                url: window.location.href
            };
            
            this.metrics.errors.push(errorInfo);
            this.sendAnalytics('promise_rejection', errorInfo);
        });
    }

    /**
     * Track tool usage
     * @param {string} toolName - Name of the tool
     * @param {Object} additionalData - Additional tracking data
     */
    trackToolUsage(toolName, additionalData = {}) {
        if (!this.metrics.toolUsage[toolName]) {
            this.metrics.toolUsage[toolName] = {
                count: 0,
                firstUse: Date.now(),
                lastUse: null
            };
        }
        
        this.metrics.toolUsage[toolName].count++;
        this.metrics.toolUsage[toolName].lastUse = Date.now();
        
        this.sendAnalytics('tool_usage', {
            tool: toolName,
            count: this.metrics.toolUsage[toolName].count,
            ...additionalData
        });
    }

    /**
     * Track custom events
     * @param {string} eventName - Name of the event
     * @param {Object} data - Event data
     */
    trackEvent(eventName, data = {}) {
        const eventInfo = {
            event: eventName,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            url: window.location.href,
            ...data
        };
        
        this.sendAnalytics('custom_event', eventInfo);
    }

    /**
     * Record user interaction
     * @param {Object} interaction - Interaction details
     */
    recordInteraction(interaction) {
        const interactionData = {
            ...interaction,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            url: window.location.href
        };
        
        this.metrics.userInteractions.push(interactionData);
        
        // Keep only last 100 interactions
        if (this.metrics.userInteractions.length > 100) {
            this.metrics.userInteractions.shift();
        }
    }

    /**
     * Send analytics data to storage and external services
     * @param {string} eventType - Type of event
     * @param {Object} data - Event data
     */
    sendAnalytics(eventType, data) {
        const analyticsData = {
            eventType: eventType,
            data: data,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            url: window.location.href,
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };

        // Store locally
        this.storeLocally(analyticsData);

        // Send to external analytics if available
        if (typeof gtag !== 'undefined') {
            gtag('event', eventType, data);
        }

        // Send to custom analytics endpoint if configured
        if (window.ANALYTICS_ENDPOINT) {
            this.sendToEndpoint(analyticsData);
        }
    }

    /**
     * Store analytics data locally
     * @param {Object} data - Analytics data
     */
    storeLocally(data) {
        try {
            const key = 'toolbelt_analytics';
            let analytics = JSON.parse(localStorage.getItem(key) || '[]');
            
            analytics.push(data);
            
            // Keep only last 500 entries to prevent storage overflow
            if (analytics.length > 500) {
                analytics = analytics.slice(-500);
            }
            
            localStorage.setItem(key, JSON.stringify(analytics));
        } catch (error) {
            console.warn('Failed to store analytics locally:', error);
        }
    }

    /**
     * Send analytics to external endpoint
     * @param {Object} data - Analytics data
     */
    async sendToEndpoint(data) {
        try {
            await fetch(window.ANALYTICS_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
        } catch (error) {
            console.warn('Failed to send analytics to endpoint:', error);
        }
    }

    /**
     * Setup before unload tracking
     */
    setupBeforeUnload() {
        window.addEventListener('beforeunload', () => {
            const sessionSummary = {
                sessionId: this.sessionId,
                duration: Date.now() - this.startTime,
                pageLoads: this.metrics.pageLoads,
                toolsUsed: Object.keys(this.metrics.toolUsage).length,
                interactions: this.metrics.userInteractions.length,
                errors: this.metrics.errors.length,
                activeTime: this.metrics.activeTime || 0
            };
            
            this.sendAnalytics('session_end', sessionSummary);
        });
    }

    /**
     * Get analytics summary
     * @returns {Object} Analytics summary
     */
    getSummary() {
        return {
            sessionId: this.sessionId,
            sessionDuration: Date.now() - this.startTime,
            metrics: this.metrics,
            performance: this.metrics.performance
        };
    }

    /**
     * Export analytics data
     * @returns {string} JSON string of analytics data
     */
    exportData() {
        const allData = JSON.parse(localStorage.getItem('toolbelt_analytics') || '[]');
        return JSON.stringify(allData, null, 2);
    }

    /**
     * Clear analytics data
     */
    clearData() {
        localStorage.removeItem('toolbelt_analytics');
        this.metrics = {
            pageLoads: 0,
            toolUsage: {},
            errors: [],
            performance: {},
            userInteractions: []
        };
    }

    /**
     * Throttle function calls
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} Throttled function
     */
    throttle(func, limit) {
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

    /**
     * Get performance recommendations
     * @returns {Array} Array of performance recommendations
     */
    getPerformanceRecommendations() {
        const recommendations = [];
        const perf = this.metrics.performance;
        
        if (perf.pageLoad && perf.pageLoad.pageLoad > 3000) {
            recommendations.push('Page load time is slow (>3s). Consider optimizing images and scripts.');
        }
        
        if (perf.fullLoad && perf.fullLoad.transferSize > 1024 * 1024) {
            recommendations.push('Large transfer size detected (>1MB). Consider code splitting and compression.');
        }
        
        if (this.metrics.errors.length > 0) {
            recommendations.push(`${this.metrics.errors.length} JavaScript errors detected. Check console for details.`);
        }
        
        return recommendations;
    }
}

// Initialize global analytics when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.ToolBeltAnalytics = new ToolBeltAnalytics();
    
    // Expose useful methods globally
    window.trackEvent = function(eventName, data) {
        if (window.ToolBeltAnalytics && window.ToolBeltAnalytics.trackEvent) {
            window.ToolBeltAnalytics.trackEvent(eventName, data);
        }
    };

    window.trackToolUsage = function(toolName, data) {
        if (window.ToolBeltAnalytics && window.ToolBeltAnalytics.trackToolUsage) {
            window.ToolBeltAnalytics.trackToolUsage(toolName, data);
        }
    };
});

// Initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
    // DOM is still loading, wait for DOMContentLoaded
} else {
    // DOM is already loaded
    window.ToolBeltAnalytics = new ToolBeltAnalytics();
    
    // Expose useful methods globally
    window.trackEvent = function(eventName, data) {
        if (window.ToolBeltAnalytics && window.ToolBeltAnalytics.trackEvent) {
            window.ToolBeltAnalytics.trackEvent(eventName, data);
        }
    };

    window.trackToolUsage = function(toolName, data) {
        if (window.ToolBeltAnalytics && window.ToolBeltAnalytics.trackToolUsage) {
            window.ToolBeltAnalytics.trackToolUsage(toolName, data);
        }
    };
}

// Auto-export analytics data for debugging (in development)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.exportAnalytics = () => {
        console.log('Analytics Data:', window.ToolBeltAnalytics.exportData());
        return window.ToolBeltAnalytics.getSummary();
    };
}