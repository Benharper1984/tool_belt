/* Tool Belt - Shared Utilities and Error Handling */
/* Common functions for validation, error handling, and browser compatibility */

/**
 * Display notification to user
 * @param {string} message - Message to display
 * @param {string} type - Type of notification ('success', 'error', 'warning', 'info')
 * @param {number} duration - Duration in milliseconds (default: 3000)
 */
function showNotification(message, type = 'info', duration = 3000) {
    // Remove existing notifications
    const existing = document.querySelectorAll('.notification');
    existing.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '600',
        fontSize: '14px',
        zIndex: '10000',
        maxWidth: '400px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        cursor: 'pointer'
    });
    
    // Set background color based on type
    const colors = {
        success: '#27ae60',
        error: '#e74c3c',
        warning: '#f39c12',
        info: '#3498db'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto-remove
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, duration);
    
    // Click to dismiss
    notification.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    });
}

/**
 * Validate and parse numeric input
 * @param {string} value - Input value to validate
 * @param {Object} options - Validation options
 * @returns {number|null} Parsed number or null if invalid
 */
function validateNumber(value, options = {}) {
    const {
        min = -Infinity,
        max = Infinity,
        allowDecimal = true,
        allowNegative = true
    } = options;
    
    if (typeof value !== 'string' && typeof value !== 'number') {
        return null;
    }
    
    const stringValue = String(value).trim();
    if (stringValue === '') return null;
    
    // Check for non-numeric characters (except decimal point and minus)
    const regex = allowDecimal ? /^-?\d*\.?\d+$/ : /^-?\d+$/;
    if (!regex.test(stringValue)) {
        return null;
    }
    
    const numValue = parseFloat(stringValue);
    
    if (isNaN(numValue)) return null;
    if (!allowNegative && numValue < 0) return null;
    if (numValue < min || numValue > max) return null;
    
    return numValue;
}

/**
 * Format currency value
 * @param {number} value - Numeric value
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {string} Formatted currency string
 */
function formatCurrency(value, currency = 'USD') {
    if (typeof value !== 'number' || isNaN(value)) {
        return '$0.00';
    }
    
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(value);
    } catch (error) {
        // Fallback for older browsers
        return `$${value.toFixed(2)}`;
    }
}

/**
 * Copy text to clipboard with fallback
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
async function copyToClipboard(text) {
    try {
        // Modern browsers with Clipboard API
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            showNotification('Copied to clipboard!', 'success');
            return true;
        }
        
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '-9999px';
        document.body.appendChild(textarea);
        
        textarea.focus();
        textarea.select();
        
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        
        if (success) {
            showNotification('Copied to clipboard!', 'success');
            return true;
        } else {
            throw new Error('Copy command failed');
        }
    } catch (error) {
        console.error('Copy to clipboard failed:', error);
        showNotification('Failed to copy to clipboard. Please copy manually.', 'error');
        return false;
    }
}

/**
 * Validate file input
 * @param {File} file - File object
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
function validateFile(file, options = {}) {
    const {
        maxSize = 5 * 1024 * 1024, // 5MB default
        allowedTypes = [],
        allowedExtensions = []
    } = options;
    
    const result = { valid: true, errors: [] };
    
    if (!file) {
        result.valid = false;
        result.errors.push('No file selected');
        return result;
    }
    
    // Check file size
    if (file.size > maxSize) {
        result.valid = false;
        result.errors.push(`File size too large. Maximum size: ${formatFileSize(maxSize)}`);
    }
    
    // Check file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        result.valid = false;
        result.errors.push(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
    }
    
    // Check file extension
    if (allowedExtensions.length > 0) {
        const extension = file.name.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(extension)) {
            result.valid = false;
            result.errors.push(`Invalid file extension. Allowed extensions: ${allowedExtensions.join(', ')}`);
        }
    }
    
    return result;
}

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Parse CSV content with error handling
 * @param {string} csvContent - CSV file content
 * @param {Object} options - Parsing options
 * @returns {Object} Parsed data or error
 */
function parseCSV(csvContent, options = {}) {
    const { hasHeader = true, delimiter = ',' } = options;
    
    try {
        if (!csvContent || typeof csvContent !== 'string') {
            return { success: false, error: 'Invalid CSV content' };
        }
        
        const lines = csvContent.trim().split('\n');
        if (lines.length === 0) {
            return { success: false, error: 'Empty CSV file' };
        }
        
        const result = { success: true, data: [], headers: [] };
        
        let startIndex = 0;
        if (hasHeader && lines.length > 0) {
            result.headers = parseCSVLine(lines[0], delimiter);
            startIndex = 1;
        }
        
        for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line) {
                const values = parseCSVLine(line, delimiter);
                if (hasHeader && result.headers.length > 0) {
                    const row = {};
                    result.headers.forEach((header, index) => {
                        row[header] = values[index] || '';
                    });
                    result.data.push(row);
                } else {
                    result.data.push(values);
                }
            }
        }
        
        return result;
    } catch (error) {
        return { success: false, error: `CSV parsing failed: ${error.message}` };
    }
}

/**
 * Parse a single CSV line handling quoted values
 * @param {string} line - CSV line
 * @param {string} delimiter - Field delimiter
 * @returns {Array} Parsed values
 */
function parseCSVLine(line, delimiter = ',') {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                // Escaped quote
                current += '"';
                i++; // Skip next quote
            } else {
                // Toggle quote mode
                inQuotes = !inQuotes;
            }
        } else if (char === delimiter && !inQuotes) {
            // Field separator
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current.trim());
    return result;
}

/**
 * Generate CSV content from data
 * @param {Array} data - Array of objects or arrays
 * @param {Array} headers - Optional headers
 * @returns {string} CSV content
 */
function generateCSV(data, headers = null) {
    try {
        if (!Array.isArray(data) || data.length === 0) {
            return '';
        }
        
        let csvContent = '';
        
        // Add headers if provided
        if (headers && Array.isArray(headers)) {
            csvContent += headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(',') + '\n';
        }
        
        // Add data rows
        data.forEach(row => {
            if (Array.isArray(row)) {
                csvContent += row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',') + '\n';
            } else if (typeof row === 'object') {
                const values = headers ? headers.map(h => row[h] || '') : Object.values(row);
                csvContent += values.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',') + '\n';
            }
        });
        
        return csvContent;
    } catch (error) {
        console.error('CSV generation failed:', error);
        return '';
    }
}

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
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
 * Sanitize HTML content to prevent XSS
 * @param {string} str - Input string
 * @returns {string} Sanitized string
 */
function sanitizeHTML(str) {
    if (typeof str !== 'string') return '';
    
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Add global error handler
 */
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    showNotification('An unexpected error occurred. Please try again.', 'error');
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    showNotification('An error occurred while processing your request.', 'error');
});

// Export functions for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showNotification,
        validateNumber,
        formatCurrency,
        copyToClipboard,
        validateFile,
        formatFileSize,
        parseCSV,
        parseCSVLine,
        generateCSV,
        debounce,
        sanitizeHTML
    };
}