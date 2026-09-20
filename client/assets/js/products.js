/**
 * SHEMA STORE - Products Page
 * Handle product listing, filtering, and search
 */

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.startsWith('/category/')) return;
    loadProductsPage();
    document.getElementById('productsSort')?.addEventListener('change', () => loadProducts(getActiveProductFilters()));
});

async function loadProductsPage() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        const categories = await api.getCategories().catch(() => []);
        sidebar.innerHTML = buildSidebarHtml(Array.isArray(categories) ? categories : []);
        setupFilterListeners();
    }

    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || '';
    const category = params.get('category') || '';
    const filters = { ...(q ? { q } : {}), ...(category ? { searchCategory: category } : {}) };
    window.productSearchFilters = filters;
    updateSearchResultsHeading(q, category);
    loadProducts(filters);
}

function updateSearchResultsHeading(query, category) {
    const heading = document.querySelector('.products-results-heading h1');
    const summary = document.getElementById('productsSummary');
    if (!query || !heading) return;

    const categoryLabel = category ? ` in ${category.replace(/-/g, ' ')}` : '';
    heading.textContent = `Search results for “${query}”${categoryLabel}`;
    if (summary) summary.textContent = 'Searching our catalogue…';
}

function buildSidebarHtml(categories) {
    const items = categories.length ? categories : [
        { name: 'Electronics' },
        { name: 'Home' },
        { name: 'Fashion' },
        { name: 'Beauty' },
        { name: 'Office' }
    ];

    return `
        <div class="sidebar-card">
            <div class="filter-heading"><h3>Filter by</h3><button type="button" class="clear-filters">Clear</button></div>
            <div class="filter-group">
                <h4>Categories</h4>
                ${items.map((category, index) => `
                    <label class="check-row">
                        <input type="checkbox" data-filter="category" value="${category.id || index + 1}" />
                        <span>${category.name}</span>
                    </label>
                `).join('')}
            </div>
            <div class="filter-group">
                <h4>Price</h4>
                <label class="check-row"><input type="radio" name="price" value="under-25000" /> <span>Under RWF 25,000</span></label>
                <label class="check-row"><input type="radio" name="price" value="25000-50000" /> <span>RWF 25,000 - 50,000</span></label>
                <label class="check-row"><input type="radio" name="price" value="above-50000" /> <span>Above RWF 50,000</span></label>
            </div>
        </div>
    `;
}

async function loadProducts(filters = {}) {
    try {
        const container = document.querySelector('.products-grid');
        if (!container) return;

        container.innerHTML = '<div class="spinner"></div>';

        let response;
        if (filters.q) {
            response = await api.searchProducts(filters.q).catch(() => []);
        } else {
            response = await api.getProducts(filters).catch(() => []);
        }
        let products = response;
        products = Array.isArray(products) ? products : products.products || [];
        if (filters.searchCategory) {
            const category = filters.searchCategory.toLowerCase();
            products = products.filter((product) => [product.category, product.category_name, product.name, product.description]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()
                .includes(category));
        }
        products = sortProducts(products);

        if (products.length === 0) {
            container.innerHTML = '<div class="empty-state">No products found.</div>';
            const summary = document.getElementById('productsSummary');
            if (summary) summary.textContent = 'Try another product name or category.';
            return;
        }

        container.innerHTML = products.map(product => createProductCard(product)).join('');
        const summary = document.getElementById('productsSummary');
        if (summary) summary.textContent = `${products.length} product${products.length === 1 ? '' : 's'} available`;
        syncWishlistButtons();
        attachProductCardListeners();
    } catch (error) {
        console.error(error);
        showAlert('Error loading products', 'error');
    }
}

function getActiveProductFilters() {
    const filters = { ...(window.productSearchFilters || {}) };
    document.querySelectorAll('.sidebar input:checked').forEach((checkbox) => {
        const name = checkbox.dataset.filter || checkbox.name;
        if (!filters[name]) filters[name] = [];
        filters[name].push(checkbox.value);
    });
    return filters;
}

function sortProducts(products) {
    const sort = document.getElementById('productsSort')?.value || 'featured';
    return [...products].sort((left, right) => {
        if (sort === 'price-low') return Number(left.price || 0) - Number(right.price || 0);
        if (sort === 'price-high') return Number(right.price || 0) - Number(left.price || 0);
        if (sort === 'name') return String(left.name || '').localeCompare(String(right.name || ''));
        return Number(right.is_featured || 0) - Number(left.is_featured || 0);
    });
}

function createProductCard(product) {
    const image = resolveImagePath(product.image || product.image_path);
    const price = Number(product.price || 0);
    const stock = Number(product.stock || 0);
    const soldOut = stock <= 0;
    const description = product.description ? String(product.description).slice(0, 82) + (String(product.description).length > 82 ? '…' : '') : 'Premium everyday essentials for comfort, style, and convenience.';
    const colorOptions = Array.isArray(product.color_options) && product.color_options.length ? product.color_options.slice(0, 4).map(color => `<span class="color-dot" title="${color.name}"></span>`).join('') : '';

    return `
        <article class="product-card" data-product-id="${product.id}">
            <div class="product-image-wrap">
                <img src="${image}" alt="${product.name}" loading="lazy" onerror="this.onerror=null;this.src='/images/download.jpg'" />
            </div>
            <div class="product-body">
                <div class="badge-row">
                    <span class="badge">Featured</span>
                    <span class="stock-badge ${soldOut ? 'sold-out' : ''}">${soldOut ? 'Sold out' : `${stock} available`}</span>
                    <button type="button" class="wishlist-button" data-id="${product.id}" aria-label="Add to wishlist">
                        <span aria-hidden="true">♡</span>
                    </button>
                </div>
                <h3>${product.name}</h3>
                <p class="product-description">${description}</p>
                ${colorOptions ? `<div class="product-color-options">${colorOptions}</div>` : ''}
                <div class="product-price-row">
                    <strong>${formatCurrency(price)}</strong>
                    <span>${formatCurrency(price * 1.12)}</span>
                </div>
                <div class="product-actions-inline">
                    <a href="/product/${product.id}" class="btn btn-primary">View</a>
                    <button type="button" class="btn btn-secondary btn-add-cart" data-id="${product.id}" ${soldOut ? 'disabled' : ''}>${soldOut ? 'Sold out' : 'Add to cart'}</button>
                </div>
            </div>
        </article>
    `;
}

function resolveImagePath(imagePath) {
    if (!imagePath) return '/images/download.jpg';
    if (/^(https?:\/\/|data:)/i.test(imagePath) || imagePath.startsWith('/')) return imagePath;
    if (imagePath.includes('/')) return `/${imagePath}`;
    return `/images/${encodeURIComponent(imagePath)}`;
}

async function addToCart(productId) {
    try {
        if (!isLoggedIn()) {
            redirectToLogin();
            return;
        }

        const product = await api.getProduct(productId);
        const quantity = prompt(`Add ${product.name} to cart. How many?`, '1');
        if (!quantity || Number(quantity) <= 0) return;

        await api.addToCart(productId, Number(quantity));
        showAlert('Product added to cart.', 'success');
    } catch (error) {
        console.error(error);
        showAlert('Unable to add product to cart', 'error');
    }
}

function setupFilterListeners() {
    const filterElements = document.querySelectorAll('.sidebar input');
    filterElements.forEach((element) => {
        element.addEventListener('change', () => {
            loadProducts(getActiveProductFilters());
        });
    });

    document.querySelector('.clear-filters')?.addEventListener('click', () => {
        document.querySelectorAll('.sidebar input').forEach(input => { input.checked = false; });
        loadProducts(window.productSearchFilters || {});
    });
}

function attachProductCardListeners() {
    // card click navigates to product unless a button was clicked
    document.querySelectorAll('.product-card').forEach((card) => {
        card.removeEventListener('click', cardClickHandler);
        card.addEventListener('click', cardClickHandler);
    });

    // also attach listeners for add-to-cart buttons
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.removeEventListener('click', btnAddCartHandler);
        btn.addEventListener('click', btnAddCartHandler);
    });

    document.querySelectorAll('.wishlist-button').forEach((button) => {
        button.removeEventListener('click', wishlistButtonClickHandler);
        button.addEventListener('click', wishlistButtonClickHandler);
    });
}

function cardClickHandler(event) {
    if (event.target.closest('button')) return;
    const card = event.currentTarget;
    const productId = card.dataset.productId;
    if (productId) window.location.href = `/product/${productId}`;
}

function wishlistButtonClickHandler(event) {
    event.preventDefault();
    event.stopPropagation();
    const button = event.currentTarget;
    const productId = Number(button.dataset.id);
    if (!productId) return;
    toggleWishlist(productId, button);
}

function btnAddCartHandler(event) {
    event.stopPropagation();
    const id = event.currentTarget.dataset.id;
    if (id) addToCart(Number(id));
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-RW', {
        style: 'currency',
        currency: 'RWF'
    }).format(amount || 0);
}

function showAlert(message, type = 'info') {
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type}`;
    alertElement.textContent = message;

    const container = document.querySelector('.container') || document.body;
    if (container) {
        container.insertBefore(alertElement, container.firstChild);
    }

    setTimeout(() => alertElement.remove(), 5000);
}

function isLoggedIn() {
    return window.currentUser !== null && window.currentUser !== undefined;
}

function redirectToLogin() {
    window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname);
}

