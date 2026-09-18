/**
 * SHEMA STORE - Checkout
 * Handle checkout process and WhatsApp integration
 */

document.addEventListener('DOMContentLoaded', () => {
    if (!isLoggedIn()) {
        redirectToLogin();
        return;
    }

    loadCheckoutData();
    attachCheckoutFormListeners();
});

/**
 * Load checkout data
 */
async function loadCheckoutData() {
    try {
        const cart = await api.getCart();
        const user = await api.getCurrentUser();
        displayCheckoutForm(user, cart);
    } catch (error) {
        showAlert('Error loading checkout', 'error');
        console.error(error);
    }
}

/**
 * Display checkout form
 */
function displayCheckoutForm(user, cart) {
    // To be implemented
    console.log('Checkout form displayed');
}

/**
 * Attach form listeners
 */
function attachCheckoutFormListeners() {
    const form = document.querySelector('#checkoutForm');
    if (form) {
        form.addEventListener('submit', handleCheckout);
    }
}

/**
 * Handle checkout submission
 */
async function handleCheckout(e) {
    e.preventDefault();

    const orderData = {
        customerName: document.querySelector('input[name="name"]')?.value,
        phone: document.querySelector('input[name="phone"]')?.value,
        deliveryLocation: document.querySelector('input[name="location"]')?.value,
        note: document.querySelector('textarea[name="note"]')?.value
    };

    try {
        const cart = await api.getCart();
        const whatsappMessage = generateWhatsAppMessage(orderData, cart);
        
        // Open WhatsApp
        openWhatsApp(whatsappMessage);
        
        // Clear cart after order
        await api.clearCart();
        showAlert('Order sent via WhatsApp!', 'success');
        
    } catch (error) {
        showAlert('Error processing checkout', 'error');
        console.error(error);
    }
}

/**
 * Generate WhatsApp Message
 */
function generateWhatsAppMessage(orderData, cart) {
    const storeName = window.storeSettings?.name || 'our store';
    
    let message = `Hello ${storeName} 👋\n\n`;
    message += `I would like to place an order.\n\n`;
    
    message += `Products:\n`;
    cart.items.forEach(item => {
        message += `${item.name} — ${item.quantity} × ${formatCurrency(item.price)}\n`;
    });
    
    message += `\nTotal: ${formatCurrency(cart.total)}\n\n`;
    
    message += `Customer:\n`;
    message += `Name: ${orderData.customerName}\n`;
    message += `Phone: ${orderData.phone}\n`;
    message += `Location: ${orderData.deliveryLocation}\n`;
    
    if (orderData.note) {
        message += `\nNote:\n${orderData.note}`;
    }
    
    message += `\n\nThank you.`;
    
    return message;
}

/**
 * Open WhatsApp
 */
function openWhatsApp(message) {
    const whatsappNumber = window.storeSettings?.whatsapp_number || window.storeSettings?.whatsappNumber || '0793087491';
    const phone = formatWhatsAppNumber(whatsappNumber);
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${phone}?text=${encodedMessage}`;
    
    window.open(whatsappURL, '_blank');
}

function formatWhatsAppNumber(value) {
    const digits = String(value || '').replace(/\D/g, '');
    if (!digits) return '';
    return digits.startsWith('250') ? digits : `250${digits.replace(/^0/, '')}`;
}
