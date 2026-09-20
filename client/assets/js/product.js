/**
 * SHEMA STORE - Product Details Page
 * Handle single product display and related products
 */

let currentProductId = null;
let displayedProduct = null;

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    currentProductId = params.get('id') || window.location.pathname.match(/^\/product\/(\d+)/)?.[1] || '1';
    loadProductDetails().then(loadRelatedProducts);
});

async function loadProductDetails() {
    try {
        const response = await api.getProduct(currentProductId).catch(() => null);
        const product = response && response.product ? response.product : response;

        if (!product) {
            displayFallbackProduct();
            return;
        }

        const imagesResponse = response && response.images ? response.images : [];
        const productWithImages = {
            ...product,
            images: imagesResponse.length ? imagesResponse.map((img) => img.image_path || img) : [product.image || product.image_path || 'assets/images/placeholders/product.jpg']
        };

        displayProductDetails(productWithImages);
        loadProductReviews();
    } catch (error) {
        console.error(error);
        showAlert('Error loading product', 'error');
        displayFallbackProduct();
    }
}

function displayFallbackProduct() {
    const container = document.querySelector('.product-details-section .container');
    if (!container) return;

    container.innerHTML = `
        <div class="product-detail-shell">
            <div class="product-gallery">
                <img src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80" alt="Featured product" class="product-main-image" />
            </div>
            <div class="product-detail-copy">
                <span class="eyebrow">Featured product</span>
                <h1>Smart Wireless Earbuds</h1>
                <div class="product-price-row"><strong>${formatCurrency(35000)}</strong> <span>${formatCurrency(45000)}</span></div>
                <p>Premium wireless earbuds with immersive sound, clear calls, and all-day comfort. Designed for music lovers and commuters on the go.</p>
                <div class="product-actions-row">
                    <input type="number" id="quantityInput" min="1" value="1" />
                    <button class="btn btn-primary" data-action="add-to-cart">Add to Cart</button>
                    <button class="btn btn-secondary" data-action="add-to-wishlist">Save</button>
                    <button class="btn btn-whatsapp" data-action="order-whatsapp">Order on WhatsApp</button>
                </div>
            </div>
        </div>
    `;

    // attach delegated handlers for actions on the product section
    const sectionEl = document.querySelector('.product-details-section .container');
    if (sectionEl) {
        sectionEl.removeEventListener('click', productSectionClickHandler);
        sectionEl.addEventListener('click', productSectionClickHandler);
        sectionEl.querySelectorAll('.product-thumbnail').forEach((thumbnail) => {
            thumbnail.addEventListener('mouseenter', () => changeMainImage(thumbnail.dataset.src));
            thumbnail.addEventListener('mouseleave', () => {
                const selected = sectionEl.querySelector('.product-thumbnail.is-selected');
                if (selected) changeMainImage(selected.dataset.src);
            });
        });
    }
}

function displayProductDetails(product) {
    const section = document.querySelector('.product-details-section .container');
    if (!section) return;

    displayedProduct = product;
    const images = product.images && product.images.length ? product.images : [product.image || product.image_path || '/images/download.jpg'];
    const mainImage = images[0];
    const sizes = Array.isArray(product.sizes) ? product.sizes : [];

    section.innerHTML = `
        <nav class="product-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span>›</span><a href="/products.html">Products</a><span>›</span><strong>${escapeProductText(product.name)}</strong></nav>
        <div class="product-detail-shell">
            <div class="product-gallery">
                <div class="product-gallery-stage">
                    <div class="product-thumbnails">
                    ${images.map((img, index) => `
                        <button type="button" class="product-thumbnail ${index === 0 ? 'is-selected' : ''}" data-src="${resolveImagePath(img)}" aria-label="View product color ${index + 1}">
                            <img src="${resolveImagePath(img)}" alt="${product.name} color ${index + 1}" onerror="this.onerror=null;this.src='/images/download.jpg';this.closest('button').dataset.src='/images/download.jpg'">
                        </button>
                    `).join('')}
                    </div>
                    <div class="product-main-image-wrap"><img src="${resolveImagePath(mainImage)}" alt="${product.name}" class="product-main-image" onerror="this.onerror=null;this.src='/images/download.jpg'" /><span class="product-variant-preview" aria-live="polite">Colour 1</span></div>
                </div>
            </div>
            <div class="product-detail-copy">
                <span class="product-brand">${escapeProductText(product.category_name || product.category || 'Shema Store')}</span>
                <h1>${product.name}</h1>
                <div class="product-rating-summary"><span class="rating-stars">★★★★★</span><a href="#product-reviews">Read customer reviews</a></div>
                <div class="product-price-row">
                    <strong>${formatCurrency(product.price || 0)}</strong>
                    <span>${formatCurrency((product.price || 0) * 1.15)}</span>
                </div>
                <p>${product.description || 'High-quality product designed for everyday reliability and satisfaction.'}</p>
                ${images.length > 1 ? `<div class="product-color-picker"><strong>Colour:</strong><span id="selectedColorLabel">Option 1</span><div class="product-color-options">${images.map((img, index) => `<button type="button" class="product-color-swatch ${index === 0 ? 'is-selected' : ''}" data-color-index="${index}" data-src="${resolveImagePath(img)}" aria-label="Choose colour ${index + 1}"><img src="${resolveImagePath(img)}" alt="Colour ${index + 1}"></button>`).join('')}</div></div>` : ''}
                ${sizes.length ? `<div class="product-size-picker"><div class="size-picker-heading"><strong>Size:</strong><span id="selectedSizeLabel">Select a size</span></div><input type="hidden" id="productSize" value=""><div class="product-size-options">${sizes.map(size => `<button type="button" class="product-size-option" data-size="${escapeProductText(size.size || size)}">${escapeProductText(size.size || size)}</button>`).join('')}</div></div>` : ''}
                <div class="product-meta-list">
                    <div><span>Category</span><strong>${product.category_name || product.category || 'General'}</strong></div>
                    <div><span>Stock</span><strong>${Number(product.stock || 0) > 0 ? `${product.stock} available` : 'Sold out'}</strong></div>
                    <div class="delivery-row"><span>Deliver to</span><strong id="deliverCity">Detecting...</strong></div>
                </div>
                <div class="product-actions-row">
                    <input type="number" id="quantityInput" min="1" value="1" />
                    <button class="btn btn-primary" data-action="add-to-cart" ${Number(product.stock || 0) <= 0 ? 'disabled' : ''}>${Number(product.stock || 0) > 0 ? 'Add to Cart' : 'Sold Out'}</button>
                    <button class="btn btn-secondary" data-action="add-to-wishlist">Save</button>
                    <button class="btn btn-whatsapp" data-action="order-whatsapp">Order on WhatsApp</button>
                </div>
            </div>
        </div>
    `;

    // attach delegated handlers for actions on the product section
    const sectionEl = document.querySelector('.product-details-section .container');
    if (sectionEl) {
        sectionEl.removeEventListener('click', productSectionClickHandler);
        sectionEl.addEventListener('click', productSectionClickHandler);
        sectionEl.querySelectorAll('.product-color-swatch').forEach((swatch) => {
            const previewColor = () => {
                const index = Number(swatch.dataset.colorIndex || 0);
                const label = sectionEl.querySelector('#selectedColorLabel');
                const overlay = sectionEl.querySelector('.product-variant-preview');
                if (label) label.textContent = `Option ${index + 1}`;
                if (overlay) overlay.textContent = `Colour ${index + 1}`;
                changeMainImage(swatch.dataset.src);
            };
            swatch.addEventListener('mouseenter', previewColor);
            swatch.addEventListener('focus', previewColor);
            swatch.addEventListener('mouseleave', () => restoreSelectedColor(sectionEl));
            swatch.addEventListener('blur', () => restoreSelectedColor(sectionEl));
            swatch.addEventListener('click', () => {
                sectionEl.querySelectorAll('.product-color-swatch').forEach(item => item.classList.remove('is-selected'));
                swatch.classList.add('is-selected');
                previewColor();
            });
        });
        sectionEl.querySelectorAll('.product-size-option').forEach((option) => {
            const previewSize = () => {
                const label = sectionEl.querySelector('#selectedSizeLabel');
                const overlay = sectionEl.querySelector('.product-variant-preview');
                if (label) label.textContent = option.dataset.size || 'Select a size';
                if (overlay) overlay.textContent = `Size ${option.dataset.size || ''}`;
            };
            option.addEventListener('mouseenter', previewSize);
            option.addEventListener('focus', previewSize);
            option.addEventListener('mouseleave', () => restoreSelectedSize(sectionEl));
            option.addEventListener('blur', () => restoreSelectedSize(sectionEl));
            option.addEventListener('click', () => {
                sectionEl.querySelectorAll('.product-size-option').forEach(item => item.classList.remove('is-selected'));
                option.classList.add('is-selected');
                const input = sectionEl.querySelector('#productSize');
                const label = sectionEl.querySelector('#selectedSizeLabel');
                if (input) input.value = option.dataset.size || '';
                if (label) label.textContent = option.dataset.size || 'Select a size';
                const overlay = sectionEl.querySelector('.product-variant-preview');
                if (overlay) overlay.textContent = `Size ${option.dataset.size || ''}`;
            });
        });
    }


function productSectionClickHandler(e) {
    const btn = e.target.closest('button');
    if (btn?.classList.contains('product-thumbnail')) {
        const src = btn.dataset.src;
        document.querySelectorAll('.product-thumbnail').forEach(thumbnail => thumbnail.classList.remove('is-selected'));
        btn.classList.add('is-selected');
        if (src) changeMainImage(src);
        return;
    }
    if (!btn) return;
    const action = btn.dataset.action;
    if (!action) return;
    if (action === 'add-to-cart') {
        addProductToCart();
    } else if (action === 'add-to-wishlist') {
        addProductToWishlist();
    } else if (action === 'order-whatsapp') {
        orderOnWhatsApp();
    }
}

function restoreSelectedColor(section) {
    const selected = section.querySelector('.product-color-swatch.is-selected');
    if (!selected) return;
    changeMainImage(selected.dataset.src);
    const index = Number(selected.dataset.colorIndex || 0);
    const label = section.querySelector('#selectedColorLabel');
    const overlay = section.querySelector('.product-variant-preview');
    if (label) label.textContent = `Option ${index + 1}`;
    if (overlay) overlay.textContent = `Colour ${index + 1}`;
}

function restoreSelectedSize(section) {
    const selected = section.querySelector('.product-size-option.is-selected');
    const label = section.querySelector('#selectedSizeLabel');
    const overlay = section.querySelector('.product-variant-preview');
    if (selected) {
        if (label) label.textContent = selected.dataset.size || 'Select a size';
        if (overlay) overlay.textContent = `Size ${selected.dataset.size || ''}`;
    } else {
        if (label) label.textContent = 'Select a size';
        if (overlay) overlay.textContent = 'Choose a variant';
    }
}
    // detect delivery city and update UI
    detectDeliveryCity().then(city => {
        const el = document.getElementById('deliverCity');
        if (el) el.textContent = city;
    }).catch(() => {
        const el = document.getElementById('deliverCity');
        if (el) el.textContent = 'Unavailable';
    });
}

function detectDeliveryCity() {
    return new Promise((resolve) => {
        const cached = localStorage.getItem('delivery_city');
        if (cached) return resolve(cached);

        if (!navigator.geolocation) return resolve('Unknown');

        navigator.geolocation.getCurrentPosition((pos) => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            const city = getCityFromCoords(lat, lon);
            localStorage.setItem('delivery_city', city);
            resolve(city);
        }, (err) => {
            resolve('Unknown');
        }, { timeout: 5000 });
    });
}

function getCityFromCoords(lat, lon) {
    // Simple bounding-box checks for a couple of cities in Rwanda
    // Kigali approx: lat between -1.99 and -1.90, lon between 29.98 and 30.12
    if (lat >= -1.99 && lat <= -1.90 && lon >= 29.98 && lon <= 30.12) return 'Kigali';
    // Huye (Butare) approx: lat between -2.66 and -2.50, lon between 29.65 and 29.85
    if (lat >= -2.66 && lat <= -2.50 && lon >= 29.65 && lon <= 29.85) return 'Huye';
    return 'Other';
}

function resolveImagePath(img) {
    if (!img) return '/images/download.jpg';
    // If it's an absolute URL or already a path with folders, return as-is
    if (/^https?:\/\//i.test(img) || img.startsWith('data:')) return img;
    // if it already looks like a path with folders, make it root-relative
    if (img.startsWith('/')) return img;
    if (img.includes('/')) return '/' + img;
    // Otherwise assume it's a filename stored in the project's top-level images/ folder
    return '/images/' + img;
}

function orderOnWhatsApp() {
    // open quick order modal for the currently displayed product
    const prod = displayedProduct || { id: currentProductId, name: document.querySelector('.product-detail-copy h1')?.textContent || 'product', price: 0 };
    openQuickOrderModal(prod);
}

function openQuickOrderModal(product) {
    const existing = document.getElementById('quickOrderModal'); if (existing) existing.remove();
    const modal = document.createElement('div');
    modal.id = 'quickOrderModal';
    modal.innerHTML = `
        <div class="modal-overlay" style="position:fixed;inset:0;background:rgba(15,23,42,0.52);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;">
            <div class="modal" style="background:#fff;border-radius:22px;max-width:520px;width:100%;box-shadow:0 20px 60px rgba(15,23,42,0.22);padding:24px 22px 18px; border:1px solid rgba(148,163,184,0.24); font-family: Arial, Helvetica, sans-serif;">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:18px;">
                    <div>
                        <p style="margin:0;color:#a16207;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Quick order</p>
                        <h3 style="margin:6px 0 0;font-size:24px;line-height:1.2;color:#111827;font-weight:800;">Order ${product.name}</h3>
                    </div>
                    <button id="qoClose" type="button" aria-label="Close" style="width:38px;height:38px;border-radius:12px;border:1px solid #e5e7eb;background:#f8fafc;color:#374151;font-size:22px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;">×</button>
                </div>

                <div style="display:grid;gap:16px;">
                    <div>
                        <label style="display:block;margin:0 0 8px;font-size:15px;font-weight:700;color:#374151;">Quantity</label>
                        <input id="qoQuantity" type="number" value="1" min="1" style="width:100%;height:46px;border:1px solid #d1d5db;border-radius:12px;padding:0 14px;font-size:16px;color:#111827;background:#fff;outline:none;box-shadow:none;transition:border-color .2s ease;" />
                    </div>

                    <div>
                        <label style="display:block;margin:0 0 8px;font-size:15px;font-weight:700;color:#374151;">Name (optional)</label>
                        <input id="qoName" type="text" style="width:100%;height:46px;border:1px solid #d1d5db;border-radius:12px;padding:0 14px;font-size:16px;color:#111827;background:#fff;outline:none;" />
                    </div>

                    <div>
                        <label style="display:block;margin:0 0 8px;font-size:15px;font-weight:700;color:#374151;">Phone (optional)</label>
                        <input id="qoPhone" type="text" placeholder="+250..." style="width:100%;height:46px;border:1px solid #d1d5db;border-radius:12px;padding:0 14px;font-size:16px;color:#111827;background:#fff;outline:none;" />
                    </div>

                    <div>
                        <label style="display:block;margin:0 0 8px;font-size:15px;font-weight:700;color:#374151;">Delivery address (optional)</label>
                        <input id="qoAddress" type="text" style="width:100%;height:46px;border:1px solid #d1d5db;border-radius:12px;padding:0 14px;font-size:16px;color:#111827;background:#fff;outline:none;" />
                    </div>
                </div>

                <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:22px;">
                    <button id="qoCancel" type="button" class="btn btn-secondary" style="min-width:120px;height:48px;border-radius:12px;font-weight:700;background:#f3f4f6;color:#111827;border:1px solid #d1d5db;">Cancel</button>
                    <button id="qoContinue" type="button" class="btn btn-whatsapp" style="min-width:210px;height:48px;border-radius:12px;font-weight:700;background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;box-shadow:0 10px 18px rgba(34,197,94,0.24);">Continue to WhatsApp</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('qoCancel')?.addEventListener('click', () => modal.remove());
    document.getElementById('qoClose')?.addEventListener('click', () => modal.remove());
    document.getElementById('qoContinue')?.addEventListener('click', async () => {
        const qty = parseInt(document.getElementById('qoQuantity')?.value || '1', 10) || 1;
        const name = document.getElementById('qoName')?.value || '';
        const phone = document.getElementById('qoPhone')?.value || '';
        const address = document.getElementById('qoAddress')?.value || '';
        // build message
        const settings = await api.getStoreSettings().catch(() => ({}));
        const number = formatWhatsAppNumber(settings?.whatsapp_number || window.storeSettings?.whatsapp_number || '0793087491');
        if (!number) { alert('WhatsApp number not configured'); return; }
        const lines = [];
        lines.push('Hello 👋');
        lines.push('');
        lines.push('I would like to order:');
        lines.push('');
        lines.push(`Product: ${product.name}`);
        const size = document.getElementById('productSize')?.value || '';
        if (document.getElementById('productSize') && !size) {
            alert('Please select a size');
            return;
        }
        lines.push(`Quantity: ${qty}`);
        if (size) lines.push(`Size: ${size}`);
        lines.push(`Price: ${formatCurrency(product.price || 0)}`);
        lines.push('');
        const deliveryCity = localStorage.getItem('delivery_location') || 'Unknown';
        lines.push(`📍 Delivery location: ${deliveryCity}`);
        if (address) lines.push(`Address: ${address}`);
        if (name) lines.push(`Name: ${name}`);
        if (phone) lines.push(`Phone: ${phone}`);
        lines.push('');
        lines.push('Please confirm availability and delivery details.');
        lines.push('Thank you.');

        const message = encodeURIComponent(lines.join('\n'));
        const url = `https://wa.me/${number}?text=${message}`;
        window.open(url, '_blank');
        modal.remove();
    });
}

function formatWhatsAppNumber(value) {
    const digits = String(value || '').replace(/\D/g, '');
    if (!digits) return '';
    return digits.startsWith('250') ? digits : `250${digits.replace(/^0/, '')}`;
}

function changeMainImage(src) {
    const mainImage = document.querySelector('.product-main-image');
    if (mainImage) mainImage.src = src;
}

async function addProductToCart() {
    try {
        const quantityInput = document.getElementById('quantityInput');
        const quantity = parseInt(quantityInput?.value || '1', 10) || 1;
        const sizeInput = document.getElementById('productSize');
        const size = sizeInput?.value || '';
        if (sizeInput && !size) {
            alert('Please select a size');
            return;
        }
        const raw = localStorage.getItem('shema_cart');
        const cart = raw ? JSON.parse(raw) : { items: [] };
        // check if item exists
        const existing = cart.items.find(i => Number(i.productId) === Number(currentProductId) && (i.size || '') === size);
        if (existing) {
            existing.quantity = (existing.quantity || 0) + quantity;
        } else {
            cart.items.push({ productId: Number(currentProductId), quantity, size });
        }
        localStorage.setItem('shema_cart', JSON.stringify(cart));
        updateCartBadge();
        showAlert('Product added to cart', 'success');
    } catch (error) {
        showAlert('Error adding to cart', 'error');
        console.error(error);
    }
}

function escapeProductText(value) {
    return String(value || '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character]));
}

async function addProductToWishlist() {
    try {
        const raw = localStorage.getItem('shema_wishlist');
        const list = raw ? JSON.parse(raw) : [];
        if (!list.includes(Number(currentProductId))) list.push(Number(currentProductId));
        localStorage.setItem('shema_wishlist', JSON.stringify(list));
        showAlert('Product added to wishlist', 'success');
    } catch (error) {
        showAlert('Error adding to wishlist', 'error');
        console.error(error);
    }
}

async function loadProductReviews() {
    try {
        const response = await api.getProductReviews(currentProductId).catch(() => []);
        const reviews = Array.isArray(response) ? response : response.reviews || [];
        displayReviews(reviews);
    } catch (error) {
        console.error('Error loading reviews:', error);
    }
}

function displayReviews(reviews) {
    const relatedSection = document.querySelector('.related-products');
    if (!relatedSection) return;

    const list = Array.isArray(reviews) ? reviews : [];

    const reviewsMarkup = `
        <div id="product-reviews" class="container reviews-block">
            <div class="section-heading"><h2>Customer Reviews</h2><span>${list.length} review${list.length === 1 ? '' : 's'}</span></div>
            <div class="review-grid">
                ${list.length ? list.map((review) => `
                    <div class="review-card">
                        <div class="rating-row">${'★'.repeat(review.rating || 5)} <span>${review.customer || 'Verified customer'}</span></div>
                        <p>${review.comment || 'Very happy with this product.'}</p>
                    </div>
                `).join('') : '<p class="empty-state">No ratings yet. Be the first to rate this product.</p>'}
            </div>
            <form id="productReviewForm" class="product-review-form">
                <h3>Rate this product</h3>
                <fieldset class="star-rating"><legend>Your rating</legend>${[5, 4, 3, 2, 1].map(value => `<input type="radio" id="reviewRating${value}" name="reviewRating" value="${value}" required><label for="reviewRating${value}" title="${value} star${value === 1 ? '' : 's'}">★</label>`).join('')}</fieldset>
                <label for="reviewComment">Comment (optional)</label>
                <textarea id="reviewComment" rows="3" maxlength="1000" placeholder="Share your experience"></textarea>
                <button class="btn btn-primary" type="submit">Submit rating</button>
            </form>
        </div>
    `;
    relatedSection.querySelector('.reviews-block')?.remove();
    relatedSection.insertAdjacentHTML('beforeend', reviewsMarkup);
    document.getElementById('productReviewForm')?.addEventListener('submit', submitProductReview);
}

async function submitProductReview(event) {
    event.preventDefault();
    const rating = document.querySelector('input[name="reviewRating"]:checked')?.value;
    const comment = document.getElementById('reviewComment')?.value || '';
    if (!rating) return showAlert('Choose a star rating first', 'error');
    try {
        const response = await api.createReview(currentProductId, { rating: Number(rating), comment });
        showAlert(response.message || 'Rating submitted', 'success');
        event.currentTarget.reset();
        loadProductReviews();
    } catch (error) {
        showAlert(error.data?.message || 'Please log in to rate this product', 'error');
    }
}

async function loadRelatedProducts() {
    try {
        const products = await api.getProducts().catch(() => []);
        const list = Array.isArray(products) ? products : products.products || [];
        const currentCategory = displayedProduct?.category;
        const filtered = list.filter((item) => Number(item.id) !== Number(currentProductId) && (!currentCategory || item.category === currentCategory)).slice(0, 4);

        const section = document.querySelector('.related-products');
        if (!section) return;

        section.innerHTML += `
            <div class="container">
                <div class="section-heading">
                    <h2>Related Products</h2>
                    <a href="/products.html">Browse more</a>
                </div>
                <div class="product-grid">
                    ${(filtered.length ? filtered : fallbackRelatedProducts(currentCategory)).map((product) => `
                        <article class="product-card">
                            <div class="product-image-wrap">
                                <img src="${resolveImagePath(product.image || product.image_path || 'assets/images/placeholders/product.jpg')}" alt="${product.name}" />
                            </div>
                            <div class="product-body">
                                <h3>${product.name}</h3>
                                <div class="product-price-row"><strong>${formatCurrency(product.price || 0)}</strong></div>
                                <a href="/product/${product.id}" class="btn btn-primary full-width">View item</a>
                            </div>
                        </article>
                    `).join('')}
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading related products:', error);
    }
}

function fallbackRelatedProducts(category) {
    const related = {
        beauty: [{ name: 'Beauty Essentials', price: 45000, image: '/images/jampa.jpg' }],
        fashion: [{ name: 'Everyday Shoes', price: 180000, image: '/images/shoes.jpg' }, { name: 'Classic Watch', price: 120000, image: '/images/watch.jpg' }],
        'home-living': [{ name: 'Home Essentials', price: 41000, image: '/images/tv.jpg' }],
        electronics: [{ name: 'Smart Device', price: 95000, image: '/images/phone.jpg' }, { name: 'Laptop', price: 1050000, image: '/images/laptop.jpg' }]
    };
    return (related[category] || related.electronics).map((product, index) => ({ ...product, id: `related-${category}-${index}` }));
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-RW', {
        style: 'currency',
        currency: 'RWF'
    }).format(amount || 0);
}

