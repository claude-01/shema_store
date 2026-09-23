/**
 * SHEMA STORE - Checkout
 * Handle checkout process and WhatsApp integration
 */

document.addEventListener('DOMContentLoaded', async () => {
    if (!isLoggedIn()) {
        redirectToLogin();
        return;
    }

    try {
        const cart = await api.getCart().catch(() => ({ items: [] }));
        const user = await api.getCurrentUser().catch(() => ({ user: null }));
        const currentUser = user?.user || user || null;
        const customerName = [currentUser?.first_name, currentUser?.last_name].filter(Boolean).join(' ') || 'Customer';
        const deliveryLocation = localStorage.getItem('delivery_location') || localStorage.getItem('delivery_city') || 'Not specified';
        const settings = await api.getStoreSettings().catch(() => ({}));
        const number = formatWhatsAppNumber(settings?.whatsapp_number || window.storeSettings?.whatsapp_number || '0793087491');

        if (!number) {
            showAlert('WhatsApp number not configured', 'error');
            return;
        }

        const lines = [];
        lines.push(`Hello ${settings?.store_name || settings?.name || 'SHEMA STORE'} 👋`);
        lines.push('');
        lines.push('I would like to place an order.');
        lines.push('');
        lines.push('🛒 ORDER DETAILS');
        lines.push('');

        (cart.items || []).forEach((item, index) => {
            const itemName = item.name || `Item ${index + 1}`;
            const qty = item.quantity || 1;
            const price = Number(item.price || 0);
            lines.push(`${index + 1}. ${itemName}`);
            lines.push(`Quantity: ${qty}`);
            lines.push(`Price: ${formatCurrency(price)}${qty > 1 ? ' each' : ''}`);
            lines.push('');
        });

        lines.push('--------------------');
        lines.push(`Subtotal: ${formatCurrency(cart.subtotal || cart.total || 0)}`);
        if (Number(cart.shipping || 0) > 0) {
            lines.push(`Shipping: ${formatCurrency(cart.shipping)}`);
        }
        lines.push(`Total: ${formatCurrency(cart.total || cart.subtotal || 0)}`);
        lines.push('');
        lines.push('📍 DELIVERY');
        lines.push(`Location: ${deliveryLocation}`);
        if (currentUser?.phone) lines.push(`Phone: ${currentUser.phone}`);
        if (customerName && customerName !== 'Customer') lines.push(`Customer: ${customerName}`);
        lines.push('');
        lines.push('Please confirm availability and delivery time.');
        lines.push('Thank you.');

        const whatsappURL = `https://wa.me/${number}?text=${encodeURIComponent(lines.join('\n'))}`;
        window.open(whatsappURL, '_blank');
        showAlert('Opening WhatsApp order chat...', 'success');
    } catch (error) {
        showAlert('Error preparing checkout', 'error');
        console.error(error);
    }
});

function formatWhatsAppNumber(value) {
    const digits = String(value || '').replace(/\D/g, '');
    if (!digits) return '';
    return digits.startsWith('250') ? digits : `250${digits.replace(/^0/, '')}`;
}
