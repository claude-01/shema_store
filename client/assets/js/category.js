const CATEGORY_DEFINITIONS = {
    electronics: { title: 'Electronics', subtitle: 'Discover the latest technology and electronics.' },
    fashion: { title: 'Fashion', subtitle: 'Find your style with our latest fashion collection.' },
    'home-living': { title: 'Home & Living', subtitle: 'Everything you need to make your home better.' },
    beauty: { title: 'Beauty', subtitle: 'Look good, feel great.' },
    'sports-outdoors': { title: 'Sports & Outdoors', subtitle: 'Move, play, explore.' },
    'toys-games': { title: 'Toys & Games', subtitle: 'Fun for every age.' },
    'health-wellness': { title: 'Health & Wellness', subtitle: 'Products for a healthier lifestyle.' },
    'grocery-supermarket': { title: 'Grocery & Supermarket', subtitle: 'Everyday groceries and household essentials.' },
    'food-beverages': { title: 'Food & Beverages', subtitle: 'Food, drinks and local favourites.' },
    'baby-kids': { title: 'Baby & Kids', subtitle: 'Essentials for growing families.' },
    'books-stationery': { title: 'Books & Stationery', subtitle: 'School, office and reading essentials.' },
    automotive: { title: 'Automotive', subtitle: 'Essentials for cars, motorcycles and transport.' },
    'agriculture-garden': { title: 'Agriculture & Garden', subtitle: 'Supplies for farming and gardening.' }
};

let activeCategorySlug = '';
let categoryProducts = [];

window.addEventListener('DOMContentLoaded', () => {
    activeCategorySlug = window.location.pathname.split('/').filter(Boolean).pop() || '';
    if (!CATEGORY_DEFINITIONS[activeCategorySlug]) {
        window.location.replace('/categories.html');
        return;
    }

    const definition = CATEGORY_DEFINITIONS[activeCategorySlug];
    document.title = `${definition.title} | Shema Store`;
    document.getElementById('categoryTitle').textContent = definition.title;
    document.getElementById('categorySubtitle').textContent = definition.subtitle;
    document.getElementById('categoryBreadcrumb').textContent = definition.title;
    renderCategoryFilters();
    document.getElementById('sortProducts')?.addEventListener('change', renderCategoryProducts);
    loadCategoryProducts();
});

async function loadCategoryProducts() {
    const container = document.getElementById('categoryProducts');
    if (!container) return;
    container.innerHTML = '<div class="spinner"></div>';

    try {
        const response = await api.getProducts();
        const products = Array.isArray(response) ? response : response.products || [];
        categoryProducts = products.filter(product => normalizeCategory(product) === activeCategorySlug);
        renderCategoryProducts();
    } catch (error) {
        console.error('Category products failed:', error);
        container.innerHTML = '<div class="empty-state">Unable to load products for this category.</div>';
    }
}

function normalizeCategory(product) {
    if (product.category) return slugifyCategory(product.category);
    return slugifyCategory(product.category_name || product.categoryName || product.name || 'electronics');
}

function slugifyCategory(value) {
    const normalized = String(value || '').toLowerCase().trim();
    if (/beauty|skin|makeup|cosmetic|perfume|hair|nivea/.test(normalized)) return 'beauty';
    if (/sport|outdoor|fitness|gym|football|shoe|sneaker/.test(normalized)) return 'sports-outdoors';
    if (/toy|game|puzzle|doll|children/.test(normalized)) return 'toys-games';
    if (/health|wellness|self-care|personal care/.test(normalized)) return 'health-wellness';
    if (/grocery|supermarket|groceries|household essentials/.test(normalized)) return 'grocery-supermarket';
    if (/food|beverage|drink|restaurant|snack/.test(normalized)) return 'food-beverages';
    if (/baby|kid|child|children|infant/.test(normalized)) return 'baby-kids';
    if (/book|stationery|school|office supplies/.test(normalized)) return 'books-stationery';
    if (/automotive|car|motorcycle|vehicle|spare parts/.test(normalized)) return 'automotive';
    if (/agriculture|garden|farming|farm|seed|fertilizer/.test(normalized)) return 'agriculture-garden';
    if (/fashion|clothing|shirt|trouser|dress|jacket|bag|watch/.test(normalized)) return 'fashion';
    if (/home|living|furniture|kitchen|vase|storage|lighting|appliance/.test(normalized)) return 'home-living';
    return 'electronics';
}

function renderCategoryFilters() {
    const filters = document.getElementById('categoryFilters');
    if (!filters) return;
    filters.innerHTML = `
        <div class="category-filter-panel">
            <h2>Filter products</h2>
            <fieldset><legend>Category</legend><label class="filter-active"><input type="checkbox" checked disabled> ${CATEGORY_DEFINITIONS[activeCategorySlug].title}</label></fieldset>
            <fieldset><legend>Price range</legend><label><input type="checkbox" data-price="0-50000"> Under RWF 50,000</label><label><input type="checkbox" data-price="50000-200000"> RWF 50,000 - 200,000</label><label><input type="checkbox" data-price="200000-plus"> Above RWF 200,000</label></fieldset>
            <fieldset><legend>Brand</legend><label><input type="checkbox"> Popular brands</label><label><input type="checkbox"> Local sellers</label></fieldset>
            <fieldset><legend>Rating</legend><label><input type="checkbox"> 4 stars & above</label></fieldset>
            <fieldset><legend>Availability</legend><label><input type="checkbox"> In stock</label></fieldset>
        </div>`;
    filters.querySelectorAll('[data-price]').forEach(input => input.addEventListener('change', renderCategoryProducts));
}

function renderCategoryProducts() {
    const container = document.getElementById('categoryProducts');
    if (!container) return;
    const priceFilters = [...document.querySelectorAll('[data-price]:checked')].map(input => input.dataset.price);
    let visible = categoryProducts.filter(product => matchesPrice(product, priceFilters));
    const sort = document.getElementById('sortProducts')?.value;
    visible.sort((left, right) => {
        if (sort === 'price-low') return Number(left.price) - Number(right.price);
        if (sort === 'price-high') return Number(right.price) - Number(left.price);
        if (sort === 'name') return String(left.name).localeCompare(String(right.name));
        return 0;
    });

    document.getElementById('categoryCount').textContent = `${visible.length} Product${visible.length === 1 ? '' : 's'}`;
    document.getElementById('resultsLabel').textContent = `${visible.length} Product${visible.length === 1 ? '' : 's'}`;
    container.innerHTML = visible.length ? visible.map(product => createProductCard(product)).join('') : `<div class="empty-state"><h3>No products in this category yet</h3><p>New ${CATEGORY_DEFINITIONS[activeCategorySlug].title.toLowerCase()} products are coming soon.</p></div>`;
    attachProductCardListeners();
}

function matchesPrice(product, filters) {
    if (!filters.length) return true;
    const price = Number(product.price || 0);
    return filters.some(filter => filter === '0-50000' && price < 50000) || filters.some(filter => filter === '50000-200000' && price >= 50000 && price <= 200000) || filters.some(filter => filter === '200000-plus' && price > 200000);
}
