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
                    price: Number(p.price || 0),
                    image: (p.image || p.image_path) ? (p.image || p.image_path) : '/assets/images/placeholders/product.jpg'
                };
            } catch (err) {
                return { id: it.productId, name: 'Product', quantity: it.quantity || 1, price: 0, image: '/images/download.jpg' };
            }
        }));

        const subtotal = items.reduce((s, it) => s + (it.price * (it.quantity || 1)), 0);

        // determine delivery info from localStorage
        const deliveryCity = localStorage.getItem('delivery_location') || 'Unknown';
        let shipping = 0; let est = '';
        try {
            const resp = await fetch(`http://localhost:7070/api/delivery-zones`);
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

    document.getElementById('orderAllBtn')?.addEventListener('click', () => openOrderModal(cart));
}

function openOrderModal(cart) {
    // build modal to collect name, phone, address, instructions
    const existing = document.getElementById('orderModal');
    if (existing) existing.remove();
    const modal = document.createElement('div');
    modal.id = 'orderModal';
    modal.innerHTML = `
        <div class="modal-overlay" style="position:fixed;inset:0;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;z-index:9999">
            <div class="modal" style="background:#fff;padding:20px;border-radius:8px;max-width:520px;width:100%">
                <h3>Confirm your order</h3>
                <label>Name:</label>
                <input id="orderName" type="text" />
                <label>Phone:</label>
                <input id="orderPhone" type="text" placeholder="+250..." />
                <label>Delivery location:</label>
                <div><strong>${cart.deliveryCity}</strong> <button id="changeDelivery" class="btn btn-secondary">Change</button></div>
                <label>Detailed address:</label>
                <input id="orderAddress" type="text" />
                <label>Delivery instructions:</label>
                <textarea id="orderInstructions"></textarea>
                <div style="margin-top:12px;text-align:right">
                    <button id="cancelOrderModal" class="btn btn-secondary">Cancel</button>
                    <button id="continueToWhatsApp" class="btn btn-primary">Continue to WhatsApp</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('cancelOrderModal')?.addEventListener('click', () => modal.remove());
    document.getElementById('changeDelivery')?.addEventListener('click', () => { modal.remove(); document.getElementById('deliverBtn')?.click(); });
    document.getElementById('continueToWhatsApp')?.addEventListener('click', async () => {
        const name = document.getElementById('orderName')?.value || '';
        const phone = document.getElementById('orderPhone')?.value || '';
        const address = document.getElementById('orderAddress')?.value || '';
        const instructions = document.getElementById('orderInstructions')?.value || '';
        // generate message
        const lines = [];
        lines.push('ORDER REQUEST');
        lines.push('');
        lines.push('Hello 👋');
        lines.push('');
        lines.push('I would like to place an order.');
        lines.push('');
        lines.push('🛒 ORDER DETAILS');
        lines.push('');
        cart.items.forEach((it, idx) => {
            lines.push(`${idx + 1}. ${it.name}`);
            lines.push(`Quantity: ${it.quantity}`);
            lines.push(`Price: ${formatCurrency(it.price)}${it.quantity > 1 ? ' each' : ''}`);
            lines.push('');
        });
        lines.push('--------------------');
        lines.push('');
        lines.push(`Subtotal: ${formatCurrency(cart.subtotal)}`);
        lines.push('');
        lines.push('📍 DELIVERY');
        lines.push('');
        lines.push(`Location: ${cart.deliveryCity}`);
        if (address) lines.push(`Address: ${address}`);
        if (instructions) lines.push(`Instructions: ${instructions}`);
        lines.push('');
        lines.push('👤 CUSTOMER');
        lines.push('');
        if (name) lines.push(`Name: ${name}`);
        if (phone) lines.push(`Phone: ${phone}`);
        lines.push('');
        lines.push('Please confirm product availability, final delivery fee, and delivery time.');
        lines.push('');
        lines.push('Thank you.');

        let message = lines.join('\n');

        try {
            const settings = await api.getStoreSettings();
            const number = formatWhatsAppNumber(settings?.whatsapp_number || window.storeSettings?.whatsapp_number || '0793087491');
            if (!number) return alert('Store WhatsApp number not configured');
            const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
            modal.remove();
        } catch (err) {
            console.error(err);
            alert('Failed to prepare WhatsApp message');
        }
    });
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
