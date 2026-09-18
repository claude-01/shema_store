/**
 * SHEMA STORE - Wishlist
 * Handle user wishlist
 */

document.addEventListener('DOMContentLoaded', () => {
    loadWishlist();
});

/**
 * Load and display wishlist
 */
async function loadWishlist() {
    try {
        if (!isLoggedIn()) {
            redirectToLogin();
            return;
        }

        const wishlist = await api.getWishlist();
        displayWishlist(wishlist);
    } catch (error) {
        showAlert('Error loading wishlist', 'error');
        console.error(error);
    }
}

/**
 * Display wishlist items
 */
function displayWishlist(wishlist) {
    const container = document.querySelector('.wishlist-section');

    if (!wishlist || wishlist.length === 0) {
        container.innerHTML = '<p>Your wishlist is empty. <a href="products.html">Browse products</a></p>';
        return;
    }

    const html = `
        <div class="wishlist-grid">
            ${wishlist.map(item => createWishlistCard(item)).join('')}
        </div>
    `;

    container.innerHTML = html;
}

/**
 * Create wishlist card
 */
function createWishlistCard(product) {
    return `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">${formatCurrency(product.price)}</div>
                <div class="product-actions">
                    <button class="btn btn-primary" data-action="add-to-cart" data-id="${product.id}">
                        Add to Cart
                    </button>
                    <button class="btn btn-danger" data-action="remove-wishlist" data-id="${product.id}">
                        Remove
                    </button>
                </div>
            </div>
        </div>
    `;
}

// delegated handlers for wishlist actions
document.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const id = Number(btn.dataset.id);
    if (action === 'add-to-cart') {
        e.preventDefault();
        addToCart(id);
    } else if (action === 'remove-wishlist') {
        e.preventDefault();
        removeFromWishlist(id);
    }
});

/**
 * Remove from wishlist
 */
async function removeFromWishlist(productId) {
    try {
        await api.removeFromWishlist(productId);
        loadWishlist();
        showAlert('Product removed from wishlist', 'success');
    } catch (error) {
        showAlert('Error removing from wishlist', 'error');
        console.error(error);
    }
}

/**
 * Add to cart from wishlist
 */
async function addToCart(productId) {
    try {
        const quantity = prompt('How many would you like to add to cart?', 1);
        if (quantity && quantity > 0) {
            await api.addToCart(productId, parseInt(quantity));
            showAlert('Product added to cart', 'success');
        }
    } catch (error) {
        showAlert('Error adding to cart', 'error');
        console.error(error);
    }
}
