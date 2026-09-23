/**
 * SHEMA STORE - API Service
 * Centralized API communication layer
 */

class API {
    constructor(baseURL = window.SHEMA_API_BASE_URL || '/api') {
        this.baseURL = baseURL;
    }

    /**
     * Generic GET request
     */
    async get(endpoint) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'GET',
                headers: this.getHeaders(),
                credentials: 'include'
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error('GET Error:', error);
            throw error;
        }
    }

    /**
     * Generic POST request
     */
    async post(endpoint, data) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers: this.getHeaders(),
                credentials: 'include',
                body: JSON.stringify(data)
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error('POST Error:', error);
            throw error;
        }
    }

    /**
     * Generic PUT request
     */
    async put(endpoint, data) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                credentials: 'include',
                body: JSON.stringify(data)
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error('PUT Error:', error);
            throw error;
        }
    }

    /**
     * Generic DELETE request
     */
    async delete(endpoint) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'DELETE',
                headers: this.getHeaders(),
                credentials: 'include'
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error('DELETE Error:', error);
            throw error;
        }
    }

    /**
     * POST with FormData (for file uploads)
     */
    async postFormData(endpoint, formData) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error('FormData POST Error:', error);
            throw error;
        }
    }

    /**
     * Get Common Headers
     */
    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    /**
     * Handle API Response
     */
    async handleResponse(response) {
        const data = await response.json().catch(() => null);

        if (!response.ok) {
            const error = new Error(data?.message || `HTTP ${response.status}`);
            error.status = response.status;
            error.data = data;
            throw error;
        }

        return data;
    }

    // ==================== PRODUCT ENDPOINTS ====================

    /**
     * Get all products
     */
    getProducts(params = {}) {
        const normalized = { ...params };
        if (normalized.includeInactive === undefined) {
            normalized.includeInactive = 'true';
        }
        const query = new URLSearchParams(normalized).toString();
        return this.get(`/products?${query}`);
    }

    /**
     * Get single product
     */
    getProduct(id) {
        return this.get(`/products/${id}`);
    }

    /**
     * Search products
     */
    searchProducts(query) {
        return this.get(`/products/search?q=${encodeURIComponent(query)}`);
    }

    // ==================== CATEGORY ENDPOINTS ====================

    /**
     * Get all categories
     */
    getCategories() {
        return this.get('/categories');
    }

    /**
     * Get single category with products
     */
    getCategory(id) {
        return this.get(`/categories/${id}`);
    }

    // ==================== CART ENDPOINTS ====================

    /**
     * Get user cart
     */
    getCart() {
        return this.get('/cart');
    }

    /**
     * Add to cart
     */
    addToCart(productId, quantity, options = {}) {
        return this.post('/cart', { productId, quantity, options });
    }

    /**
     * Update cart item
     */
    updateCartItem(cartItemId, quantity) {
        return this.put(`/cart/${cartItemId}`, { quantity });
    }

    /**
     * Remove from cart
     */
    removeFromCart(cartItemId) {
        return this.delete(`/cart/${cartItemId}`);
    }

    /**
     * Clear cart
     */
    clearCart() {
        return this.delete('/cart');
    }

    // ==================== WISHLIST ENDPOINTS ====================

    /**
     * Get user wishlist
     */
    getWishlist() {
        return this.get('/wishlist');
    }

    /**
     * Add to wishlist
     */
    addToWishlist(productId) {
        return this.post('/wishlist', { productId });
    }

    /**
     * Remove from wishlist
     */
    removeFromWishlist(productId) {
        return this.delete(`/wishlist/${productId}`);
    }

    // ==================== AUTH ENDPOINTS ====================

    /**
     * Customer Login
     */
    login(email, password) {
        return this.post('/auth/login', { email, password });
    }

    /**
     * Customer Register
     */
    register(userData) {
        return this.post('/auth/register', userData);
    }

    /**
     * Logout
     */
    logout() {
        return this.post('/auth/logout', {});
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.get('/auth/me');
    }

    // ==================== USER ENDPOINTS ====================

    /**
     * Update user profile
     */
    updateProfile(data) {
        return this.put('/users/profile', data);
    }

    /**
     * Get user orders
     */
    getUserOrders() {
        return this.get('/users/orders');
    }

    /**
     * Get user order details
     */
    getUserOrderDetails(orderId) {
        return this.get(`/users/orders/${orderId}`);
    }

    // ==================== ORDER ENDPOINTS ====================

    /**
     * Create order
     */
    createOrder(orderData) {
        return this.post('/orders', orderData);
    }

    /**
     * Get all orders (admin)
     */
    getOrders() {
        return this.get('/orders');
    }

    // ==================== REVIEW ENDPOINTS ====================

    /**
     * Get product reviews
     */
    getProductReviews(productId) {
        return this.get(`/reviews/product/${productId}`);
    }

    /**
     * Create review
     */
    createReview(productId, reviewData) {
        return this.post('/reviews', { productId, ...reviewData });
    }

    // ==================== SETTINGS ENDPOINTS ====================

    /**
     * Get store settings
     */
    getStoreSettings() {
        return this.get('/settings');
    }
}

// Initialize API instance
const api = new API();
// Expose as global for other scripts that expect `api`
try { window.api = api; } catch (e) { /* ignore if not available */ }
