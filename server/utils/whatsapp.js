/**
 * SHEMA STORE - WhatsApp Utility
 * Generate WhatsApp checkout messages
 */

/**
 * Format Rwanda phone number to international format
 */
function formatPhoneNumber(phone) {
    // Remove any non-digit characters
    phone = phone.replace(/\D/g, '');
    
    // If starts with 0, replace with 250
    if (phone.startsWith('0')) {
        phone = '250' + phone.substring(1);
    }
    
    // If doesn't start with 250, add it
    if (!phone.startsWith('250')) {
        phone = '250' + phone;
    }
    
    return phone;
}

/**
 * Generate WhatsApp message
 */
function generateWhatsAppMessage(order, customer = {}, products = []) {
    let message = `Hello SHEMA STORE 👋\n\n`;
    message += `I would like to place an order.\n\n`;

    message += `Products:\n`;
    products.forEach(product => {
        message += `${product.name} — ${product.quantity} × ${product.price}\n`;
    });

    message += `\nTotal: ${order.total}\n\n`;

    const customerLines = [];
    if (customer.name) customerLines.push(`Name: ${customer.name}`);
    if (customer.phone) customerLines.push(`Phone: ${customer.phone}`);
    if (customer.location) customerLines.push(`Location: ${customer.location}`);

    if (customerLines.length) {
        message += `Customer:\n`;
        message += `${customerLines.join('\n')}\n`;
    }

    if (customer.note) {
        message += `\nNote:\n${customer.note}`;
    }

    message += `\n\nThank you.`;

    return message;
}

module.exports = {
    formatPhoneNumber,
    generateWhatsAppMessage
};
