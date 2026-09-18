/**
 * SHEMA STORE - Helper Utilities
 */

/**
 * Format price in RWF currency
 */
function formatPrice(price) {
    return new Intl.NumberFormat('en-RW', {
        style: 'currency',
        currency: 'RWF'
    }).format(price);
}

/**
 * Generate random string
 */
function generateRandomString(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Paginate array
 */
function paginate(array, pageNumber = 1, pageSize = 10) {
    const startIndex = (pageNumber - 1) * pageSize;
    return {
        data: array.slice(startIndex, startIndex + pageSize),
        total: array.length,
        pages: Math.ceil(array.length / pageSize),
        currentPage: pageNumber
    };
}

module.exports = {
    formatPrice,
    generateRandomString,
    paginate
};
