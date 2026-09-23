/**
 * SHEMA STORE - Shopping Cart
 * Handle cart operations
 */

document.addEventListener('DOMContentLoaded', () => {
    loadCart();
});

/**
 * Load and display shopping cart
 */
async function loadCart() {
    try {
        const raw = localStorage.getItem('shema_cart');
        const local = raw ? JSON.parse(raw) : { items: [] };
        // resolve product details from backend to ensure prices are accurate
        const items = await Promise.all(local.items.map(async (it) => {
            try {
                const product = await api.getProduct(it.productId);
                const p = product && product.product ? product.product : product;
                return {
                    id: it.productId,
                    name: p.name || 'Product',
                    quantity: it.quantity || 1,
                    size: it.size || '',
                    price: Number(p.price || 0),
                    image: (p.image || p.image_path) ? (p.image || p.image_path) : '/assets/images/placeholders/product.jpg'
                };
            } catch (err) {
                return { id: it.productId, name: 'Product', quantity: it.quantity || 1, size: it.size || '', price: 0, image: '/images/download.jpg' };
            }
        }));

        const subtotal = items.reduce((s, it) => s + (it.price * (it.quantity || 1)), 0);

        // determine delivery info from localStorage
        const deliveryCity = localStorage.getItem('delivery_location') || 'Unknown';
        let shipping = 0; let est = '';
        try {
            const resp = await fetch('/api/delivery-zones');
            const data = await resp.json();
            const zone = (data.zones || []).find(z => z.city === deliveryCity) || null;
            if (zone) {
                shipping = Number(zone.fee || 0);
                est = `${zone.min_days}–${zone.max_days} days`;
            }
        } catch (err) {
            // ignore
        }

        const cart = { items, subtotal, shipping, tax: 0, total: subtotal + shipping, deliveryCity, est };
        displayCart(cart);
    } catch (error) {
        showAlert('Error loading cart', 'error');
        console.error(error);
    }
}

/**
 * Display cart items
 */
function displayCart(cart) {
    const container = document.querySelector('.cart-items');
    const summary = document.querySelector('.cart-summary');

    if (!cart.items || cart.items.length === 0) {
        container.innerHTML = '<p>Your cart is empty. <a href="products.html">Continue shopping</a></p>';
        summary.innerHTML = '';
        return;
    }

    container.innerHTML = cart.items.map(item => `
        <div class="cart-item" data-item-id="${item.id}">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                ${item.size ? `<div class="cart-item-size">Size: ${item.size}</div>` : ''}
                <div class="cart-item-price">${formatCurrency(item.price)}</div>
                <div class="cart-item-quantity">
                    <button class="qty-btn" data-action="decrease" data-id="${item.id}" data-new="${item.quantity - 1}">-</button>
                    <input type="number" value="${item.quantity}" readonly>
                    <button class="qty-btn" data-action="increase" data-id="${item.id}" data-new="${item.quantity + 1}">+</button>
                </div>
            </div>
            <div class="cart-item-total">
                ${formatCurrency(item.price * item.quantity)}
            </div>
            <button class="btn btn-danger" data-action="remove" data-id="${item.id}">Remove</button>
        </div>
    `).join('');

    // attach delegated click handler for cart item buttons
    container.removeEventListener('click', cartItemsClickHandler);
    container.addEventListener('click', cartItemsClickHandler);


function cartItemsClickHandler(e) {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const id = Number(btn.dataset.id);
    if (action === 'decrease' || action === 'increase') {
        const newQty = Number(btn.dataset.new);
        updateQuantity(id, newQty);
    } else if (action === 'remove') {
        removeFromCart(id);
    }
}
    displayCartSummary(cart);
}

/**
 * Display cart summary
 */
function displayCartSummary(cart) {
    const summary = document.querySelector('.cart-summary');
    
    summary.innerHTML = `
        <div class="card">
            <h3>Order Summary</h3>
            <div class="summary-row">
                <span>Subtotal:</span>
                <span>${formatCurrency(cart.subtotal || 0)}</span>
            </div>
            <div class="summary-row">
                <span>Shipping:</span>
                <span>${formatCurrency(cart.shipping || 0)}</span>
            </div>
            <div class="summary-row">
                <span>Tax:</span>
                <span>${formatCurrency(cart.tax || 0)}</span>
            </div>
            <hr>
            <div class="summary-row total">
                <span>Total:</span>
                <span>${formatCurrency(cart.total || 0)}</span>
            </div>
            <button class="btn btn-primary btn-block" id="orderAllBtn">
                Order All on WhatsApp
            </button>
            <a href="products.html" class="btn btn-secondary btn-block">
                Continue Shopping
            </a>
        </div>
    `;

    document.getElementById('orderAllBtn')?.addEventListener('click', () => openDirectWhatsAppOrder(cart));
}

async function resolveOrderCustomerProfile() {
    const currentUser = window.currentUser || null;
    const firstName = currentUser?.first_name || currentUser?.firstName || '';
    const lastName = currentUser?.last_name || currentUser?.lastName || '';
    const location = localStorage.getItem('delivery_location') || localStorage.getItem('delivery_city') || localStorage.getItem('deliveryCity') || 'Not specified';

    return {
        name: [firstName, lastName].filter(Boolean).join(' ') || 'Customer',
        phone: currentUser?.phone || '',
        location
    };
}

async function openDirectWhatsAppOrder(cart) {
    const customer = await resolveOrderCustomerProfile();

    try {
        const settings = await api.getStoreSettings().catch(() => ({}));
        const storeName = settings?.store_name || settings?.name || 'SHEMA STORE';
        const number = formatWhatsAppNumber(settings?.whatsapp_number || window.storeSettings?.whatsapp_number || '0793087491');

        if (!number) {
            alert('Store WhatsApp number not configured');
            return;
        }

        const lines = [];
        lines.push(`Hello ${storeName} 👋`);
        lines.push('');
        lines.push('I would like to place an order.');
        lines.push('');
        lines.push('🛒 ORDER DETAILS');
        lines.push('');

        (cart.items || []).forEach((item, index) => {
            const itemName = item.name || `Item ${index + 1}`;
            const quantity = item.quantity || 1;
            const price = Number(item.price || 0);
            lines.push(`${index + 1}. ${itemName}`);
            lines.push(`Quantity: ${quantity}`);
            lines.push(`Price: ${formatCurrency(price)}${quantity > 1 ? ' each' : ''}`);
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
        lines.push(`Location: ${customer.location || 'Not specified'}`);
        if (customer.phone) lines.push(`Phone: ${customer.phone}`);
        if (customer.name && customer.name !== 'Customer') lines.push(`Customer: ${customer.name}`);
        lines.push('');
        lines.push('Please confirm availability, delivery fee, and delivery time.');
        lines.push('Thank you.');

        const message = lines.join('\n');
        const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    } catch (err) {
        console.error(err);
        alert('Failed to prepare WhatsApp message');
    }
}

function formatWhatsAppNumber(value) {
    const digits = String(value || '').replace(/\D/g, '');
    if (!digits) return '';
    return digits.startsWith('250') ? digits : `250${digits.replace(/^0/, '')}`;
}

/**
 * Update item quantity
 */
async function updateQuantity(itemId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(itemId);
        return;
    }

    try {
        if (window.api && typeof api.updateCartItem === 'function') {
            await api.updateCartItem(itemId, newQuantity);
        } else {
            // localStorage fallback
            const raw = localStorage.getItem('shema_cart');
            const cart = raw ? JSON.parse(raw) : { items: [] };
            const it = cart.items.find(i => Number(i.productId) === Number(itemId));
            if (it) it.quantity = newQuantity;
            localStorage.setItem('shema_cart', JSON.stringify(cart));
        }
        loadCart();
    } catch (error) {
        showAlert('Error updating cart', 'error');
        console.error(error);
    }
}

/**
 * Remove item from cart
 */
async function removeFromCart(itemId) {
    try {
        if (window.api && typeof api.removeFromCart === 'function') {
            await api.removeFromCart(itemId);
        } else {
            const raw = localStorage.getItem('shema_cart');
            const cart = raw ? JSON.parse(raw) : { items: [] };
            cart.items = cart.items.filter(i => Number(i.productId) !== Number(itemId));
            localStorage.setItem('shema_cart', JSON.stringify(cart));
        }
        loadCart();
        showAlert('Item removed from cart', 'success');
    } catch (error) {
        showAlert('Error removing item', 'error');
        console.error(error);
    }
}

/**
 * Proceed to checkout
 */
function proceedToCheckout() {
    if (!isLoggedIn()) {
        redirectToLogin();
    } else {
        window.location.href = 'checkout.html';
    }
}

/**
 * Clear entire cart
 */
async function clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
        try {
            await api.clearCart();
            loadCart();
            showAlert('Cart cleared', 'success');
        } catch (error) {
            showAlert('Error clearing cart', 'error');
            console.error(error);
        }
    }
}
