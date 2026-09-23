/**
 * SHEMA STORE - Main JavaScript
 * Common functionality for all pages
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initFooter();
    loadStoreSettings();
    checkUserSession();
    updateCartBadge();

    if (document.getElementById('featuredProducts') || document.getElementById('categoryGrid')) {
        loadHomePageContent();
    }
    loadDeliveryInfo();

    document.querySelector('.newsletter-form')?.addEventListener('submit', (event) => {
        event.preventDefault();
        const input = event.currentTarget.querySelector('input');
        if (input?.value) {
            input.value = '';
            showAlert('You are subscribed to the latest offers.', 'success');
        }
    });
});

function initNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    navbar.innerHTML = `
        <div class="announcement-bar">
            <div class="container announcement-inner">
                <span>🚚 Free delivery for orders over RWF 50,000</span>
                <span>Shop now and enjoy fast, reliable delivery across Rwanda!</span>
                <button type="button" class="currency-switcher">🇷🇼 &nbsp;RWF⌄</button>
            </div>
        </div>
        <div class="nav-main">
            <div class="container nav-main-inner">
                <div style="display:flex;align-items:center;gap:12px;flex:0 0 auto">
                    <a href="/index.html" class="brand-logo" aria-label="Store home"><img src="/images/logo.png" alt="Store logo" class="brand-logo-img" onerror="this.style.display='none'"></a>
                </div>
                <form id="siteSearchForm" class="nav-search" action="/products.html" method="get">
                        <div class="search-inner">
                            <div class="search-select-wrapper">
                                <select id="searchCategory" aria-label="Category">
                                    <option value="all">All</option>
                                    <option value="shoes">Shoes</option>
                                    <option value="clothing">Clothing</option>
                                    <option value="accessories">Accessories</option>
                                    <option value="food">Food</option>
                                    <option value="home">Home</option>
                                    <option value="electronics">Electronics</option>
                                    <option value="offers">Offers</option>
                                </select>
                            </div>
                            <div class="search-input-wrapper">
                                <span class="input-icon" aria-hidden>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 21l-4.35-4.35" stroke="#9aa4b2" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="11" cy="11" r="6" stroke="#9aa4b2" stroke-width="1.6"/></svg>
                                </span>
                                <input id="siteSearchInput" type="search" name="q" placeholder="Search products, brands, and categories" aria-label="Search" />
                            </div>
                            <button type="submit" class="search-btn" aria-label="Search">
                                <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"></circle><path d="m16 16 5 5"></path></svg><span>Search</span>
                            </button>
                            <div id="searchSuggestions" class="search-suggestions" role="listbox" aria-label="Search suggestions"></div>
                        </div>
                </form>
                <div class="nav-quick-actions">
                    <a href="/account.html" class="nav-link nav-account"><svg class="nav-action-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"></circle><path d="M5 21c.6-4 2.8-6 7-6s6.4 2 7 6"></path></svg><span><small>My</small><strong id="navUserLabel">Account⌄</strong></span></a>
                    <a href="/cart.html" class="nav-link cart-link"><svg class="nav-action-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2 11h10l3-8H6"></path><circle cx="9" cy="20" r="1.5"></circle><circle cx="17" cy="20" r="1.5"></circle></svg><span class="cart-label">Cart</span><span id="cartCount">0</span></a>
                </div>
            </div>
        </div>
        <div class="nav-categories">
            <div class="container nav-categories-inner">
                <button class="mobile-menu-button" type="button" aria-label="Open menu">☰</button>
                <a class="nav-home active" href="/index.html">Home</a>
                <div class="nav-dropdown">
                    <a href="/products.html" class="nav-dropdown-trigger" aria-haspopup="true">Shop <span aria-hidden="true">⌄</span></a>
                    <div class="nav-dropdown-menu" role="menu">
                        <a href="/products.html" role="menuitem">All Products</a>
                        <a href="/products.html?featured=1" role="menuitem">Deals</a>
                        <a href="/products.html?q=new" role="menuitem">New Arrivals</a>
                    </div>
                </div>
                <div class="nav-dropdown">
                    <a href="/categories.html" class="nav-dropdown-trigger" aria-haspopup="true">Categories <span aria-hidden="true">⌄</span></a>
                    <div class="nav-dropdown-menu category-dropdown-menu" role="menu">
                        <a href="/category/electronics" role="menuitem">Electronics</a>
                        <a href="/category/fashion" role="menuitem">Fashion</a>
                        <a href="/category/home-living" role="menuitem">Home &amp; Living</a>
                        <a href="/category/beauty" role="menuitem">Beauty</a>
                        <a href="/category/sports-outdoors" role="menuitem">Sports &amp; Outdoors</a>
                        <a href="/category/toys-games" role="menuitem">Toys &amp; Games</a>
                        <a href="/category/health-wellness" role="menuitem">Health &amp; Wellness</a>
                    </div>
                </div>
                <a href="/products.html?featured=1">Deals</a>
                <a href="/about.html">About</a>
                <a href="/contact.html">Contact</a>
            </div>
        </div>
    `;

    const siteSearchForm = document.getElementById('siteSearchForm');
    if (siteSearchForm) {
        setupLiveSearch(siteSearchForm);
        siteSearchForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const value = document.getElementById('siteSearchInput')?.value.trim();
            if (value) {
                const category = document.getElementById('searchCategory')?.value;
                showSearchResults(value, category);
            } else {
                document.getElementById('searchSuggestions')?.classList.remove('is-visible');
            }
        });
    }

    document.querySelector('.mobile-menu-button')?.addEventListener('click', () => {
        document.querySelector('.nav-categories-inner')?.classList.toggle('menu-open');
    });

    document.querySelectorAll('.nav-dropdown-trigger').forEach((trigger) => {
        trigger.addEventListener('click', (event) => {
            // Touch users should follow the main link; desktop users get hover/focus menus.
            if (window.innerWidth > 1024 || !window.matchMedia('(hover: none)').matches) return;
            trigger.closest('.nav-dropdown')?.classList.remove('is-open');
        });
    });

    if (!window.searchHistoryListenerAdded) {
        window.searchHistoryListenerAdded = true;
        window.addEventListener('popstate', () => {
            const params = new URLSearchParams(window.location.search);
            const query = params.get('search');
            if (query) showSearchResults(query, params.get('searchCategory') || 'all', false);
            else closeSearchResults();
        });
        const initialParams = new URLSearchParams(window.location.search);
        if (initialParams.get('search')) {
            showSearchResults(initialParams.get('search'), initialParams.get('searchCategory') || 'all', false);
        }
    }
}

function setupLiveSearch(form) {
    const input = form.querySelector('#siteSearchInput');
    const suggestions = form.querySelector('#searchSuggestions');
    if (!input || !suggestions || typeof api === 'undefined') return;
    const categorySelect = form.querySelector('#searchCategory');

    let timer;
    let requestId = 0;
    let activeIndex = -1;
    let catalogProducts = [];
    let catalogLoaded = false;

    const getCategoryMatches = (products) => {
        const selectedCategory = categorySelect?.value || 'all';
        if (selectedCategory === 'all' || selectedCategory === 'offers') return products;
        return products.filter((product) => [product.category, product.category_name, product.name, product.description]
            .filter(Boolean).join(' ').toLowerCase().includes(selectedCategory.toLowerCase()));
    };

    api.getProducts().then((response) => {
        catalogProducts = Array.isArray(response) ? response : response.products || [];
        catalogLoaded = true;
    }).catch(() => {
        catalogLoaded = false;
    });

    const searchAndRender = async (query) => {
        const currentRequest = ++requestId;
        suggestions.innerHTML = '<div class="search-loading">Finding related products...</div>';
        suggestions.classList.add('is-visible');

        if (catalogLoaded) {
            const normalizedQuery = query.toLowerCase();
            const localResults = getCategoryMatches(catalogProducts).filter((product) => {
                const searchableText = [product.name, product.description, product.category_name, product.category]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();
                return searchableText.includes(normalizedQuery);
            });
            renderSuggestions(localResults, query);
            return;
        }

        try {
            const response = await api.searchProducts(query);
            if (currentRequest !== requestId) return;
            const products = Array.isArray(response) ? response : response.products || [];
            renderSuggestions(products, query);
        } catch (error) {
            if (currentRequest !== requestId) return;
            suggestions.innerHTML = '<div class="search-empty">Search is temporarily unavailable.</div>';
            suggestions.classList.add('is-visible');
        }
    };

    const closeSuggestions = () => {
        suggestions.innerHTML = '';
        suggestions.classList.remove('is-visible');
        activeIndex = -1;
    };

    const renderSuggestions = (products, query) => {
        if (!products.length) {
            suggestions.innerHTML = `<div class="search-empty">No products found for “${escapeSearchText(query)}”</div>`;
            suggestions.classList.add('is-visible');
            return;
        }

        const title = query ? `Related products for “${escapeSearchText(query)}”` : 'Popular products';
        suggestions.innerHTML = `<div class="search-suggestions-title">${title}</div>` + products.slice(0, 10).map((product, index) => `
            <a class="search-suggestion" href="/product/${product.id}" role="option" data-index="${index}">
                <img src="${resolveSearchImage(product.image || product.image_path)}" alt="" onerror="this.onerror=null;this.src='/images/download.jpg'">
                <span class="search-suggestion-copy"><strong>${escapeSearchText(product.name)}</strong><small>${formatSearchCurrency(product.price)}</small></span>
                <span class="search-suggestion-arrow" aria-hidden="true">›</span>
            </a>
        `).join('') + (query ? '<button type="button" class="search-see-all">View all search results</button>' : '');
        suggestions.classList.add('is-visible');
        suggestions.querySelector('.search-see-all')?.addEventListener('click', () => {
            showSearchResults(query, categorySelect?.value || 'all');
        });
    };

    const showPopularProducts = async () => {
        if (catalogLoaded) {
            const popular = getCategoryMatches(catalogProducts)
                .sort((left, right) => Number(right.is_featured || 0) - Number(left.is_featured || 0));
            renderSuggestions(popular, '');
            return;
        }

        suggestions.innerHTML = '<div class="search-loading">Loading products...</div>';
        suggestions.classList.add('is-visible');
        try {
            const response = await api.getProducts();
            catalogProducts = Array.isArray(response) ? response : response.products || [];
            catalogLoaded = true;
            renderSuggestions(getCategoryMatches(catalogProducts), '');
        } catch (error) {
            suggestions.innerHTML = '<div class="search-empty">Products are temporarily unavailable.</div>';
            suggestions.classList.add('is-visible');
        }
    };

    input.addEventListener('input', () => {
        const query = input.value.trim();
        window.clearTimeout(timer);
        if (query.length < 1) {
            closeSuggestions();
            return;
        }

        suggestions.innerHTML = '<div class="search-loading">Finding related products...</div>';
        suggestions.classList.add('is-visible');
        timer = window.setTimeout(async () => {
            await searchAndRender(query);
        }, 220);
    });

    input.addEventListener('focus', () => {
        if (!input.value.trim()) showPopularProducts();
    });

    categorySelect?.addEventListener('change', () => {
        if (input.value.trim()) {
            searchAndRender(input.value.trim());
        } else {
            showPopularProducts();
        }
    });

    form.addEventListener('show-search-results', (event) => {
        window.clearTimeout(timer);
        searchAndRender(event.detail.query);
    });

    input.addEventListener('keydown', (event) => {
        const options = [...suggestions.querySelectorAll('.search-suggestion')];
        if (!suggestions.classList.contains('is-visible') || !options.length) return;
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            activeIndex = event.key === 'ArrowDown'
                ? (activeIndex + 1) % options.length
                : (activeIndex - 1 + options.length) % options.length;
            options.forEach((option, index) => option.classList.toggle('is-active', index === activeIndex));
        } else if (event.key === 'Enter' && activeIndex >= 0) {
            event.preventDefault();
            options[activeIndex].click();
        } else if (event.key === 'Escape') {
            closeSuggestions();
        }
    });

    document.addEventListener('click', (event) => {
        if (!form.contains(event.target)) closeSuggestions();
    });
}

async function showSearchResults(query, category = 'all', updateHistory = true) {
    const cleanQuery = String(query || '').trim();
    if (!cleanQuery || typeof api === 'undefined') return;

    let panel = document.getElementById('searchResultsPanel');
    if (!panel) {
        panel = document.createElement('section');
        panel.id = 'searchResultsPanel';
        panel.className = 'search-results-panel';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-modal', 'true');
        document.body.appendChild(panel);
    }

    panel.innerHTML = `
        <div class="search-results-backdrop" data-close-search></div>
        <div class="search-results-sheet">
            <div class="search-results-header">
                <div><p>SEARCH RESULTS</p><h2>Results for “${escapeSearchText(cleanQuery)}”</h2></div>
                <button type="button" class="search-results-close" data-close-search aria-label="Close search results">×</button>
            </div>
            <div class="search-results-content"><div class="spinner"></div></div>
        </div>`;
    panel.classList.add('is-open');
    document.body.classList.add('search-results-open');
    panel.querySelectorAll('[data-close-search]').forEach((button) => button.addEventListener('click', () => closeSearchResults(true)));

    if (updateHistory) {
        const params = new URLSearchParams(window.location.search);
        params.set('search', cleanQuery);
        if (category && category !== 'all' && category !== 'offers') params.set('searchCategory', category);
        else params.delete('searchCategory');
        window.history.pushState({ search: cleanQuery }, '', `${window.location.pathname}?${params.toString()}`);
    }

    try {
        const response = await api.searchProducts(cleanQuery);
        let products = Array.isArray(response) ? response : response.products || [];
        if (category && category !== 'all' && category !== 'offers') {
            const categoryName = category.toLowerCase();
            products = products.filter((product) => [product.category, product.category_name, product.name, product.description]
                .filter(Boolean).join(' ').toLowerCase().includes(categoryName));
        }
        if (!panel.classList.contains('is-open')) return;
        const content = panel.querySelector('.search-results-content');
        content.innerHTML = products.length ? `
            <p class="search-results-count">${products.length} product${products.length === 1 ? '' : 's'} found</p>
            <div class="search-results-grid">${products.map((product) => `
                <a class="search-result-card" href="/product/${product.id}">
                    <img src="${resolveSearchImage(product.image || product.image_path)}" alt="${escapeSearchText(product.name)}" onerror="this.onerror=null;this.src='/images/download.jpg'">
                    <span><strong>${escapeSearchText(product.name)}</strong><small>${formatSearchCurrency(product.price)}</small></span>
                </a>`).join('')}</div>` : '<div class="search-results-empty"><h3>No products found</h3><p>Try another product, brand, or category.</p></div>';
    } catch (error) {
        const content = panel.querySelector('.search-results-content');
        if (content) content.innerHTML = '<div class="search-results-empty"><h3>Search is unavailable</h3><p>Please try again in a moment.</p></div>';
    }
}

function closeSearchResults(removeSearchFromUrl = false) {
    document.getElementById('searchResultsPanel')?.classList.remove('is-open');
    document.body.classList.remove('search-results-open');
    if (removeSearchFromUrl) {
        const params = new URLSearchParams(window.location.search);
        params.delete('search');
        params.delete('searchCategory');
        const query = params.toString();
        window.history.replaceState({}, '', `${window.location.pathname}${query ? `?${query}` : ''}`);
    }
}

function resolveSearchImage(imagePath) {
    if (!imagePath) return '/images/download.jpg';
    if (/^(https?:\/\/|data:)/i.test(imagePath) || imagePath.startsWith('/')) return imagePath;
    return imagePath.includes('/') ? `/${imagePath}` : `/images/${encodeURIComponent(imagePath)}`;
}

function formatSearchCurrency(amount) {
    return new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(Number(amount || 0));
}

function escapeSearchText(value) {
    return String(value || '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character]));
}

// Detect user's OS and browser for diagnostics and adaptions
function detectSystem() {
    try {
        const ua = navigator.userAgent || '';
        let os = 'Unknown OS';
        if (/Windows NT/i.test(ua)) os = 'Windows';
        else if (/Mac OS X/i.test(ua)) os = 'macOS';
        else if (/Android/i.test(ua)) os = 'Android';
        else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
        else if (/Linux/i.test(ua)) os = 'Linux';

        let browser = 'Unknown Browser';
        if (/Chrome\/\d+/i.test(ua) && !/Edg\//i.test(ua)) browser = 'Chrome';
        else if (/Firefox\//i.test(ua)) browser = 'Firefox';
        else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = 'Safari';
        else if (/Edg\//i.test(ua)) browser = 'Edge';

        const el = document.getElementById('systemInfo');
        if (el) el.textContent = `${os} · ${browser}`;
        // keep in localStorage for later diagnostics
        localStorage.setItem('shema_system', JSON.stringify({ os, browser, ua }));
    } catch (err) {
        console.error('system detection failed', err);
    }
}

async function loadDeliveryInfo() {
    try {
        const saved = localStorage.getItem('delivery_location');
        const label = document.getElementById('deliverCityLabel');
        if (!label) return;
        if (saved) {
            label.textContent = saved;
        } else {
            label.textContent = 'Detecting...';
            // try geolocation
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async (pos) => {
                        const lat = pos.coords.latitude;
                        const lon = pos.coords.longitude;
                        // reverse-geocode using Nominatim
                        try {
                            const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                            const data = await resp.json();
                            const rawPlace = data.address || {};
                            const candidate = rawPlace.city || rawPlace.town || rawPlace.village || rawPlace.county || rawPlace.state_district || rawPlace.municipality || rawPlace.region || '';
                            const city = resolveRwandaCity(candidate, lat, lon);
                            if (label) label.textContent = city;
                            localStorage.setItem('delivery_location', city);
                        } catch (err) {
                            // fallback: nearest known city
                            const city = resolveRwandaCity('', lat, lon);
                            if (label) label.textContent = city || 'Other';
                            localStorage.setItem('delivery_location', city || 'Other');
                        }
                }, () => { if (label) label.textContent = 'Other'; }, { timeout: 5000 });
            } else {
                if (label) label.textContent = 'Other';
            }
        }

        const btn = document.getElementById('deliverBtn');
        if (btn) btn.addEventListener('click', openDeliveryChooser);
    } catch (error) {
        console.error('loadDeliveryInfo error', error);
    }
}

function resolveRwandaCity(candidate, lat, lon) {
    const normalized = (candidate || '').toLowerCase();
    // Known Rwandan cities with approximate coordinates
    const cities = [
        { name: 'Kigali', lat: -1.9706, lon: 30.1044 },
        { name: 'Huye', lat: -2.5959, lon: 29.7401 },
        { name: 'Musanze', lat: -1.5033, lon: 29.6333 },
        { name: 'Rubavu', lat: -1.7191, lon: 29.2731 },
        { name: 'Muhanga', lat: -2.1239, lon: 29.7556 },
        { name: 'Nyagatare', lat: -1.2939, lon: 30.3265 },
        { name: 'Rusizi', lat: -2.4861, lon: 29.0156 },
        { name: 'Kayonza', lat: -2.0000, lon: 30.7500 },
        { name: 'Nyamasheke', lat: -2.4925, lon: 29.1767 },
        { name: 'Kibungo', lat: -2.1311, lon: 30.5000 },
        { name: 'Kigoma', lat: -1.0, lon: 29.0 },
        { name: 'Kigoma (Kigoya)', lat: -1.5, lon: 29.0 },
        { name: 'Kanjongo', lat: -2.4, lon: 29.6 }
    ];

    // direct match
    for (const c of cities) {
        if (normalized && c.name.toLowerCase().includes(normalized)) return c.name;
    }

    // if coords provided, pick nearest city
    if (typeof lat === 'number' && typeof lon === 'number') {
        let best = null;
        let bestDist = Infinity;
        cities.forEach(c => {
            const d = haversineDistance(lat, lon, c.lat, c.lon);
            if (d < bestDist) { bestDist = d; best = c; }
        });
        // if within 120 km, return it
        if (best && bestDist <= 120) return best.name;
    }

    return candidate || 'Other';
}

function haversineDistance(lat1, lon1, lat2, lon2) {
    function toRad(x) { return x * Math.PI / 180; }
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

async function openDeliveryChooser() {
    // fetch delivery zones
    let zones = [];
    try {
        const resp = await fetch('/api/delivery-zones');
        const data = await resp.json();
        zones = data.zones || [];
    } catch (err) {
        console.error('Failed to load zones', err);
    }

    // build modal
    const existing = document.getElementById('deliveryModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'deliveryModal';
    modal.innerHTML = `
        <div class="modal-overlay" style="position:fixed;inset:0;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;z-index:9999">
            <div class="modal" style="background:#fff;padding:20px;border-radius:8px;max-width:520px;width:100%">
                <h3>Choose your delivery location</h3>
                <button id="useMyLocation" class="btn btn-primary">📍 Use my current location</button>
                <div style="margin:12px 0">Or choose from list:</div>
                <div id="zoneList" style="max-height:240px;overflow:auto"></div>
                <div style="margin-top:12px;text-align:right"><button id="closeDeliveryModal" class="btn btn-secondary">Close</button></div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const zoneList = document.getElementById('zoneList');
    zoneList.innerHTML = zones.map(z => `<div style="padding:8px;border-bottom:1px solid #eee"><button class="btn btn-secondary choose-zone" data-city="${z.city}">${z.city} — RWF ${z.fee} (${z.min_days}–${z.max_days} days)</button></div>`).join('') || '<p>No zones configured</p>';

    document.querySelectorAll('.choose-zone').forEach(btn => btn.addEventListener('click', (e) => {
        const city = e.currentTarget.dataset.city;
        localStorage.setItem('delivery_location', city);
        const label = document.getElementById('deliverCityLabel'); if (label) label.textContent = city;
        modal.remove();
    }));

    document.getElementById('useMyLocation')?.addEventListener('click', async () => {
        if (!navigator.geolocation) return alert('Geolocation not supported');
        navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
                const lat = pos.coords.latitude; const lon = pos.coords.longitude;
                const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                const data = await resp.json();
                const city = data.address.city || data.address.town || data.address.village || data.address.county || 'Other';
                localStorage.setItem('delivery_location', city);
                const label = document.getElementById('deliverCityLabel'); if (label) label.textContent = city;
                modal.remove();
            } catch (err) {
                alert('Failed to determine city from location');
            }
        }, (err) => { alert('Location permission denied or failed'); }, { timeout: 8000 });
    });

    document.getElementById('closeDeliveryModal')?.addEventListener('click', () => modal.remove());
}

function initFooter() {
    const footer = document.querySelector('.footer');
    if (!footer) return;

    footer.innerHTML = `
        <div class="footer-newsletter">
            <div class="container footer-newsletter-inner">
                <div class="footer-newsletter-icon">✉</div>
                <div><h3>Join our newsletter</h3><p>Get the latest deals, new arrivals and exclusive offers.</p></div>
                <form class="footer-subscribe-form"><input type="email" placeholder="Enter your email address" aria-label="Email address" required><button type="submit">Subscribe</button></form>
            </div>
        </div>
        <div class="container footer-main-grid">
            <div class="footer-brand-column">
                <a href="/index.html" class="footer-logo" aria-label="Store home"><img src="/images/logo.png" alt="Shema Store logo"></a>
                <p class="footer-tagline">Shop Smarter, Live Better</p>
                <p class="footer-description">Quality products, trusted brands and everyday essentials delivered across Rwanda.</p>
                <div class="footer-socials" aria-label="Social links"><a href="#" aria-label="Facebook">f</a><a href="#" aria-label="Instagram">◎</a><a href="#" aria-label="X">𝕏</a><a href="#" aria-label="YouTube">▶</a><a href="#" aria-label="TikTok">♪</a></div>
            </div>
            <div class="footer-link-column"><h4>Quick Links</h4><a href="/index.html">Home</a><a href="/products.html">Shop</a><a href="/categories.html">Categories</a><a href="/products.html?featured=1">Deals</a><a href="/about.html">About</a><a href="/contact.html">Contact</a></div>
            <div class="footer-link-column"><h4>Categories</h4><a href="/category/electronics">Electronics</a><a href="/category/fashion">Fashion</a><a href="/category/home-living">Home & Living</a><a href="/category/beauty">Beauty</a><a href="/category/health-wellness">Health & Wellness</a></div>
            <div class="footer-link-column"><h4>Customer Care</h4><a href="/account.html">My Account</a><a href="/orders.html">Track Order</a><a href="/faq.html">FAQs</a><a href="/privacy.html">Privacy Policy</a><a href="/contact.html">Contact Support</a></div>
        </div>
        <div class="footer-trust-row"><div class="container"><span>✓ Secure payments</span><span>✓ Fast delivery across Rwanda</span><span>✓ Quality products</span><span>✓ Friendly support</span></div></div>
        <div class="footer-bottom"><div class="container"><span>© 2025 Shema Store. All rights reserved.</span><span>Shop Smarter, Live Better</span><span>Made for Rwanda</span></div></div>
    `;

    footer.querySelector('.footer-subscribe-form')?.addEventListener('submit', event => {
        event.preventDefault();
        event.currentTarget.reset();
        showAlert('You are subscribed to our latest offers.', 'success');
    });
}

async function loadStoreSettings() {
    try {
        const settings = await api.getStoreSettings();
        window.storeSettings = settings;
        const name = settings?.store_name || settings?.name || 'Store';
        if (!window.location.pathname.startsWith('/category/')) {
            document.title = 'Shema Store | Shop Smarter, Live Better';
        }
        // prefer logo image only for the brand — set alt/title on the image instead of inserting text
        const brandImg = document.querySelector('.brand-logo img, .brand-logo-img');
        if (brandImg) {
            brandImg.alt = name;
            brandImg.setAttribute('title', name);
            const brandAnchor = document.querySelector('.brand-logo');
            if (brandAnchor) brandAnchor.setAttribute('aria-label', name);
        }
    } catch (error) {
        console.error('Error loading store settings:', error);
        window.storeSettings = null;
    }
}

async function checkUserSession() {
    try {
        const user = await api.getCurrentUser();
        window.currentUser = user;
        updateUIForUser(user);
    } catch (error) {
        window.currentUser = null;
        updateUIForGuest();
    }
}

function updateUIForUser(user) {
    const navUserLabel = document.getElementById('navUserLabel');
    if (navUserLabel && user) {
        navUserLabel.textContent = user.name || user.username || user.email || 'Account';
    }
    updateCartBadge();
}

function updateUIForGuest() {
    const navUserLabel = document.getElementById('navUserLabel');
    if (navUserLabel) {
        navUserLabel.textContent = 'Guest';
    }
    updateCartBadge();
}

async function updateCartBadge() {
    const cartCountElement = document.getElementById('cartCount');
    if (!cartCountElement) return;

    try {
        const raw = localStorage.getItem('shema_cart');
        const cart = raw ? JSON.parse(raw) : { items: [] };
        const items = Array.isArray(cart.items) ? cart.items : [];
        const total = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
        cartCountElement.textContent = total || 0;
    } catch (error) {
        cartCountElement.textContent = '0';
    }
}

function getCart() {
    try {
        const raw = localStorage.getItem('shema_cart');
        return raw ? JSON.parse(raw) : { items: [] };
    } catch (err) { return { items: [] }; }
}

function renderCartPreview() {
    const cartLink = document.querySelector('.cart-link');
    if (!cartLink) return;
    // remove existing preview
    const existing = cartLink.querySelector('.cart-preview');
    if (existing) existing.remove();

    const cart = getCart();
    const items = Array.isArray(cart.items) ? cart.items : [];

    const preview = document.createElement('div');
    preview.className = 'cart-preview';

    if (!items.length) {
        preview.innerHTML = `<div style="padding:18px;text-align:center;color:#6b7280">Your cart is empty</div><div style="text-align:center;margin-top:8px"><a href="products.html" class="btn btn-primary">Start shopping</a></div>`;
        cartLink.appendChild(preview);
        return;
    }

    // fetch minimal product info if possible
    const rows = items.slice(0,4).map(it => {
        const img = it.image || '/images/download.jpg';
        const name = it.name || `Item #${it.productId}`;
        const qty = it.quantity || 1;
        return `<div class="cart-item"><img src="${img}" alt="${name}"/><div class="meta"><div class="name">${name}</div><div class="qty">Qty: ${qty}</div></div></div>`;
    }).join('');

    const totalQty = items.reduce((s,i)=>s+Number(i.quantity||0),0);

    preview.innerHTML = `${rows}<div class="cart-footer"><button class="btn btn-view-cart" onclick="window.location.href='cart.html'">View cart (${totalQty})</button><button class="btn btn-checkout" id="cartPreviewOrder">Order on WhatsApp</button></div>`;
    cartLink.appendChild(preview);

    // attach quick order
    document.getElementById('cartPreviewOrder')?.addEventListener('click', async () => {
        const settings = await api.getStoreSettings().catch(()=>({}));
        const number = formatWhatsAppNumber(settings?.whatsapp_number || window.storeSettings?.whatsapp_number || '0793087491');
        if (!number) return alert('WhatsApp number not configured');

        const currentUser = window.currentUser || null;
        const firstName = currentUser?.first_name || currentUser?.firstName || '';
        const lastName = currentUser?.last_name || currentUser?.lastName || '';
        const customerName = [firstName, lastName].filter(Boolean).join(' ') || 'Customer';
        const deliveryLocation = localStorage.getItem('delivery_location') || localStorage.getItem('delivery_city') || 'Unknown';
        const lines = [];
        lines.push(`Hello ${settings?.store_name || settings?.name || 'SHEMA STORE'} 👋`);
        lines.push('');
        lines.push('I would like to order the following items:');
        items.forEach(it=>{
            lines.push(`${it.name || ('Product ' + it.productId)} — Qty: ${it.quantity || 1}`);
        });
        lines.push('');
        lines.push(`Delivery location: ${deliveryLocation}`);
        if (currentUser?.phone) lines.push(`Phone: ${currentUser.phone}`);
        if (customerName && customerName !== 'Customer') lines.push(`Customer: ${customerName}`);
        lines.push('');
        lines.push('Please confirm availability and delivery time.');
        lines.push('Thank you.');
        const message = encodeURIComponent(lines.join('\n'));
        window.open(`https://wa.me/${number}?text=${message}`,'_blank');
    });
}

function attachCartPreviewListeners() {
    const cartLink = document.querySelector('.cart-link');
    if (!cartLink) return;
    // show on hover
    cartLink.addEventListener('mouseenter', () => renderCartPreview());
    cartLink.addEventListener('focus', () => renderCartPreview());
    // remove on leave after delay
    let hideTimer = null;
    cartLink.addEventListener('mouseleave', () => { hideTimer = setTimeout(()=>{ const ex = cartLink.querySelector('.cart-preview'); if (ex) ex.remove(); }, 400); });
    cartLink.addEventListener('click', (e) => {
        // toggle preview on click for touch devices
        e.preventDefault();
        const existing = cartLink.querySelector('.cart-preview');
        if (existing) { existing.remove(); return; }
        renderCartPreview();
    });
}

async function loadHomePageContent() {
    const productContainer = document.getElementById('featuredProducts');
    const categoryContainer = document.getElementById('categoryGrid');

    if (!productContainer && !categoryContainer) return;

    try {
        const [categoriesData, productsData] = await Promise.all([
            api.getCategories().catch(() => []),
            api.getProducts().catch(() => [])
        ]);

        const categories = Array.isArray(categoriesData) ? categoriesData : categoriesData.categories || [];
        const products = Array.isArray(productsData) ? productsData : productsData.products || [];

        const categoryList = categories.length ? categories.slice(0, 7) : fallbackCategories();
        // Only use demo products when the API is unavailable or empty. Every displayed
        // product should otherwise come from the same database-backed catalog as admin.
        const productList = products.length ? products.slice(0, 6) : fallbackProducts();

        if (categoryContainer) {
            const categoryImages = ['/images/phone.jpg', '/images/shoes.jpg', '/images/laptop.jpg', '/images/jampa.jpg', '/images/watch.jpg', '/images/school adidas bag.jpg', '/images/tv.jpg'];
            categoryContainer.innerHTML = categoryList.map((category, index) => `
                <a href="/category/${categorySlug(category.name)}" class="category-card">
                    <span class="category-icon"><img src="${category.image || categoryImages[index % categoryImages.length]}" alt="${category.name || 'Category'}"></span>
                    <h3>${category.name || 'Shop'}</h3>
                    <p>${category.description || 'Explore best sellers'}</p>
                </a>
            `).join('');
        }

        if (productContainer) {
                productContainer.innerHTML = productList.map(product => createProductCard(product)).join('');
                attachProductCardListeners();
        }
    } catch (error) {
        console.error('Home page load failed:', error);
        if (categoryContainer) {
            categoryContainer.innerHTML = fallbackCategories().map(category => `
                <a href="/category/${categorySlug(category.name)}" class="category-card">
                    <span class="category-icon">🛍️</span>
                    <h3>${category.name}</h3>
                    <p>${category.description}</p>
                </a>
            `).join('');
        }
        if (productContainer) {
            productContainer.innerHTML = fallbackProducts().map(product => createProductCard(product)).join('');
        }
    }
    // populate system info
    detectSystem();
}

function createProductCard(product) {
    const image = product.image || product.image_path || 'assets/images/placeholders/product.jpg';
    const price = Number(product.price || 0);
    const title = product.name || 'Featured product';
    const stock = Number(product.stock || 0);
    const soldOut = stock <= 0;

    return `
        <article class="product-card" data-product-id="${product.id}">
            <div class="product-image-wrap">
                <img src="${image}" alt="${title}" loading="lazy" />
            </div>
            <div class="product-body">
                <div class="badge-row">
                    <span class="badge">Top rated</span>
                    <span class="stock-badge ${soldOut ? 'sold-out' : ''}">${soldOut ? 'Sold out' : `${stock} available`}</span>
                    <button type="button" class="wishlist-button" data-id="${product.id}" aria-label="Add to wishlist">
                        <span aria-hidden="true">♡</span>
                    </button>
                </div>
                <h3>${title}</h3>
                <div class="product-price-row">
                    <strong>${formatCurrency(price)}</strong>
                    <span>${formatCurrency(price * 1.15)}</span>
                </div>
                <div class="product-actions-inline">
                        <button class="btn btn-primary btn-view" data-id="${product.id}">View</button>
                        <button class="btn btn-secondary btn-add-cart" data-id="${product.id}" ${soldOut ? 'disabled' : ''}>${soldOut ? 'Sold out' : 'Add to Cart'}</button>
                        <button class="btn btn-whatsapp btn-quick-order" data-id="${product.id}">Order on WhatsApp</button>
                </div>
            </div>
        </article>
    `;
}

function syncWishlistButtons() {
    const saved = JSON.parse(localStorage.getItem('shema_wishlist') || '[]');
    const ids = new Set(saved.map(id => Number(id)));

    document.querySelectorAll('.wishlist-button').forEach((button) => {
        const productId = Number(button.dataset.id);
        const isActive = ids.has(productId);
        button.classList.toggle('active', isActive);
        const label = button.querySelector('span');
        if (label) label.textContent = isActive ? '♥' : '♡';
    });
}

function toggleWishlist(productId, button) {
    const currentId = Number(productId);
    const raw = localStorage.getItem('shema_wishlist');
    const list = raw ? JSON.parse(raw) : [];
    const normalized = Array.isArray(list) ? list.map(Number) : [];
    const exists = normalized.includes(currentId);

    const nextList = exists ? normalized.filter(id => id !== currentId) : [...normalized, currentId];
    localStorage.setItem('shema_wishlist', JSON.stringify(nextList));

    if (button) {
        button.classList.toggle('active', !exists);
        const label = button.querySelector('span');
        if (label) label.textContent = !exists ? '♥' : '♡';
    }

    syncWishlistButtons();
    showAlert(exists ? 'Removed from wishlist' : 'Product added to wishlist', exists ? 'info' : 'success');
}

    function attachProductCardListeners() {
        // Use event delegation on product grid container(s)
        document.querySelectorAll('.product-grid, .products-grid').forEach(grid => {
            grid.removeEventListener('click', productGridClickHandler);
            grid.addEventListener('click', productGridClickHandler);
        });

        document.querySelectorAll('.wishlist-button').forEach((button) => {
            button.removeEventListener('click', wishlistButtonClickHandler);
            button.addEventListener('click', wishlistButtonClickHandler);
        });
    }

    function wishlistButtonClickHandler(event) {
        event.preventDefault();
        event.stopPropagation();
        const btn = event.currentTarget;
        if (btn.dataset.id) toggleWishlist(btn.dataset.id, btn);
    }

    function productGridClickHandler(e) {
        const btn = e.target.closest('button');
        if (!btn) return;
        const id = btn.dataset.id;
        if (btn.classList.contains('wishlist-button')) {
            wishlistButtonClickHandler(e);
            return;
        }
        if (btn.classList.contains('btn-view')) {
            window.location.href = `/product/${id}`;
            return;
        }
        if (btn.classList.contains('btn-add-cart')) {
            const raw = localStorage.getItem('shema_cart');
            const cart = raw ? JSON.parse(raw) : { items: [] };
            const existing = cart.items.find(i => Number(i.productId) === Number(id));
            if (existing) existing.quantity = (existing.quantity || 0) + 1; else cart.items.push({ productId: Number(id), quantity: 1 });
            localStorage.setItem('shema_cart', JSON.stringify(cart));
            updateCartBadge();
            showAlert('Added to cart', 'success');
            return;
        }
        if (btn.classList.contains('btn-quick-order')) {
            (async () => {
                try {
                    const productData = await api.getProduct(id);
                    const p = productData && productData.product ? productData.product : productData;
                    const settings = await api.getStoreSettings().catch(() => ({}));
                    const number = formatWhatsAppNumber(settings?.whatsapp_number || window.storeSettings?.whatsapp_number || '0793087491');
                    if (!number) {
                        alert('WhatsApp number not configured');
                        return;
                    }

                    const currentUser = window.currentUser || null;
                    const firstName = currentUser?.first_name || currentUser?.firstName || '';
                    const lastName = currentUser?.last_name || currentUser?.lastName || '';
                    const customerName = [firstName, lastName].filter(Boolean).join(' ') || 'Customer';
                    const deliveryLocation = localStorage.getItem('delivery_location') || localStorage.getItem('delivery_city') || 'Unknown';
                    const lines = [];
                    lines.push(`Hello ${settings?.store_name || settings?.name || 'SHEMA STORE'} 👋`);
                    lines.push('');
                    lines.push('I would like to order:');
                    lines.push('');
                    lines.push(`Product: ${p.name}`);
                    lines.push(`Quantity: 1`);
                    lines.push(`Price: ${formatCurrency(p.price || 0)}`);
                    lines.push('');
                    lines.push(`📍 Delivery location: ${deliveryLocation}`);
                    if (currentUser?.phone) lines.push(`Phone: ${currentUser.phone}`);
                    if (customerName && customerName !== 'Customer') lines.push(`Customer: ${customerName}`);
                    lines.push('');
                    lines.push('Please confirm availability and delivery details.');
                    lines.push('Thank you.');

                    const message = encodeURIComponent(lines.join('\n'));
                    window.open(`https://wa.me/${number}?text=${message}`, '_blank');
                } catch (err) {
                    console.error('Failed to load product for quick order', err);
                    alert('Failed to load product');
                }
            })();
            return;
        }
    }

async function openQuickOrderModal(product) {
    const settings = await api.getStoreSettings().catch(() => ({}));
    const number = formatWhatsAppNumber(settings?.whatsapp_number || window.storeSettings?.whatsapp_number || '0793087491');
    if (!number) {
        alert('WhatsApp number not configured');
        return;
    }

    const currentUser = window.currentUser || null;
    const firstName = currentUser?.first_name || currentUser?.firstName || '';
    const lastName = currentUser?.last_name || currentUser?.lastName || '';
    const customerName = [firstName, lastName].filter(Boolean).join(' ') || 'Customer';
    const deliveryLocation = localStorage.getItem('delivery_location') || localStorage.getItem('delivery_city') || 'Unknown';
    const lines = [];
    lines.push(`Hello ${settings?.store_name || settings?.name || 'SHEMA STORE'} 👋`);
    lines.push('');
    lines.push('I would like to order:');
    lines.push('');
    lines.push(`Product: ${product.name}`);
    lines.push(`Quantity: 1`);
    lines.push(`Price: ${formatCurrency(product.price || 0)}`);
    lines.push('');
    lines.push(`📍 Delivery location: ${deliveryLocation}`);
    if (currentUser?.phone) lines.push(`Phone: ${currentUser.phone}`);
    if (customerName && customerName !== 'Customer') lines.push(`Customer: ${customerName}`);
    lines.push('');
    lines.push('Please confirm availability and delivery details.');
    lines.push('Thank you.');

    const message = encodeURIComponent(lines.join('\n'));
    const url = `https://wa.me/${number}?text=${message}`;
    window.open(url, '_blank');
}

function fallbackCategories() {
    return [
        { name: 'Electronics', description: 'Tech for a better tomorrow', image: '/images/phone.jpg' },
        { name: 'Fashion', description: 'Style for every you', image: '/images/shoes.jpg' },
        { name: 'Home & Living', description: 'Make your house a home', image: '/images/laptop.jpg' },
        { name: 'Beauty', description: 'Look good, feel great', image: '/images/jampa.jpg' },
        { name: 'Sports & Outdoors', description: 'Move, play, explore', image: '/images/watch.jpg' },
        { name: 'Toys & Games', description: 'Fun for every age', image: '/images/school adidas bag.jpg' },
        { name: 'Health & Wellness', description: 'Feel your best', image: '/images/tv.jpg' },
        { name: 'Grocery & Supermarket', description: 'Everyday groceries and essentials', image: '/images/tv.jpg' },
        { name: 'Food & Beverages', description: 'Food, drinks and local favourites', image: '/images/jampa.jpg' },
        { name: 'Baby & Kids', description: 'Essentials for growing families', image: '/images/school adidas bag.jpg' },
        { name: 'Books & Stationery', description: 'School, office and reading essentials', image: '/images/school adidas bag.jpg' },
        { name: 'Automotive', description: 'Car and motorcycle essentials', image: '/images/tv.jpg' },
        { name: 'Agriculture & Garden', description: 'Supplies for farming and gardening', image: '/images/jampa.jpg' }
    ];
}

function categorySlug(name) {
    const value = String(name || '').toLowerCase();
    if (/beauty|skin|makeup|cosmetic|perfume|hair/.test(value)) return 'beauty';
    if (/sport|outdoor|fitness|gym|football/.test(value)) return 'sports-outdoors';
    if (/toy|game|puzzle|doll/.test(value)) return 'toys-games';
    if (/health|wellness|self-care/.test(value)) return 'health-wellness';
    if (/grocery|supermarket|groceries|household essentials/.test(value)) return 'grocery-supermarket';
    if (/food|beverage|drink|restaurant|snack/.test(value)) return 'food-beverages';
    if (/baby|kid|child|children|infant/.test(value)) return 'baby-kids';
    if (/book|stationery|school|office supplies/.test(value)) return 'books-stationery';
    if (/automotive|car|motorcycle|vehicle|spare parts/.test(value)) return 'automotive';
    if (/agriculture|garden|farming|farm|seed|fertilizer/.test(value)) return 'agriculture-garden';
    if (/fashion|clothing|shirt|dress|jacket|bag|watch|shoe/.test(value)) return 'fashion';
    if (/home|living|furniture|kitchen|vase|storage|lighting/.test(value)) return 'home-living';
    return 'electronics';
}

function fallbackProducts() {
    return [
        { id: 101, name: 'Samsung Galaxy A15', price: 280000, image: '/images/phone.jpg' },
        { id: 102, name: 'Nike Air Force 1', price: 180000, image: '/images/shoes.jpg' },
        { id: 103, name: 'HP Laptop 15.6"', price: 1050000, image: '/images/laptop.jpg' },
        { id: 104, name: 'Air Fryer 5.5L', price: 95000, image: '/images/tv.jpg' },
        { id: 105, name: 'Nivea Skincare Set', price: 45000, image: '/images/jampa.jpg' },
        { id: 106, name: 'Smart Watch', price: 120000, image: '/images/watch.jpg' }
    ];
}

function showAlert(message, type = 'info') {
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type}`;
    alertElement.textContent = message;

    const container = document.querySelector('.container') || document.body;
    container.insertBefore(alertElement, container.firstChild);

    setTimeout(() => alertElement.remove(), 5000);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-RW', {
        style: 'currency',
        currency: 'RWF'
    }).format(amount || 0);
}

function formatDate(dateString) {
    return new Intl.DateTimeFormat('en-RW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(dateString));
}

function redirectToLogin() {
    window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname);
}

function isLoggedIn() {
    return window.currentUser !== null && window.currentUser !== undefined;
}

async function logout() {
    try {
        await api.logout();
        window.currentUser = null;
        showAlert('Logged out successfully', 'success');
        window.location.href = 'index.html';
    } catch (error) {
        showAlert('Logout failed', 'error');
    }
}
