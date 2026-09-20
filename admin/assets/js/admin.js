/**
 * SHEMA STORE - Admin Main Script
 * Admin authentication and navigation
 */

document.addEventListener('DOMContentLoaded', () => {
    checkAdminSession();
    initAdminNavigation();
    document.querySelector('[data-action="logout"]')?.addEventListener('click', logoutAdmin);
});

const ADMIN_API = '/api/admin';

/**
 * Check Admin Session
 */
async function checkAdminSession() {
    try {
        // If on login page, don't check session
        if (window.location.pathname.includes('login.html')) {
            return;
        }

        const response = await fetch(`${ADMIN_API}/me`, {
            credentials: 'include'
        });

        if (!response.ok) {
            window.location.href = 'login.html';
            return;
        }

        const admin = await response.json();
        window.adminUser = admin;
        updateAdminUI();
    } catch (error) {
        console.error('Session check error:', error);
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        }
    }
}

/**
 * Update Admin UI with user info
 */
function updateAdminUI() {
    const adminNameElement = document.querySelector('#adminName');
    if (adminNameElement && window.adminUser) {
        adminNameElement.textContent = window.adminUser.username;
    }

    loadAdminNavigation();
}

/**
 * Load Admin Navigation Sidebar
 */
function loadAdminNavigation() {
    const sidebarContent = document.querySelector('#sidebarContent');
    if (!sidebarContent) return;

    sidebarContent.innerHTML = `
        <a class="admin-brand" href="dashboard.html" aria-label="Admin dashboard"><img src="/images/logo.png" alt="Store logo"></a>
        <hr>
        <nav>
            <a href="dashboard.html" class="nav-link">📊 Dashboard</a>
            <a href="products.html" class="nav-link">📦 Products</a>
            <a href="categories.html" class="nav-link">🏷️ Categories</a>
            <a href="orders.html" class="nav-link">📋 Orders</a>
            <a href="users.html" class="nav-link">👥 Customers</a>
            <a href="reviews.html" class="nav-link">⭐ Reviews</a>
            <hr>
            <a href="settings.html" class="nav-link">⚙️ Settings</a>
            <a href="delivery-zones.html" class="nav-link">🚚 Delivery Zones</a>
        </nav>
    `;

    setActiveNavLink();
}

/**
 * Set Active Navigation Link
 */
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        }
    });
}

/**
 * Admin Login Handler
 */
async function handleAdminLogin(e) {
    if (e) e.preventDefault();

    const username = document.querySelector('#username')?.value;
    const password = document.querySelector('#password')?.value;

    if (!username || !password) {
        showAdminAlert('Please fill in all fields', 'error');
        return;
    }

    try {
        const response = await fetch(`${ADMIN_API}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            showAdminAlert(data.message || 'Login failed', 'error');
            return;
        }

        showAdminAlert('Login successful!', 'success');
        window.adminUser = data.admin;
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    } catch (error) {
        showAdminAlert('Login error', 'error');
        console.error(error);
    }
}

/**
 * Logout Admin
 */
async function logoutAdmin() {
    try {
        await fetch(`${ADMIN_API}/logout`, {
            method: 'POST',
            credentials: 'include'
        });

        window.adminUser = null;
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Logout error:', error);
    }
}

/**
 * Initialize Admin Navigation
 */
function initAdminNavigation() {
    const loginForm = document.querySelector('#adminLoginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleAdminLogin);
    }
}

/**
 * Show Alert Message
 */
function showAdminAlert(message, type = 'info') {
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type}`;
    alertElement.textContent = message;

    const container = document.querySelector('.admin-content') || document.body;
    if (container.firstChild) {
        container.insertBefore(alertElement, container.firstChild);
    } else {
        container.appendChild(alertElement);
    }

    setTimeout(() => alertElement.remove(), 5000);
}

/**
 * Switch Settings Tab
 */
function switchTab(tabName) {
    const tabContents = document.querySelectorAll('.tab-content');
    const tabButtons = document.querySelectorAll('.tab-btn');

    tabContents.forEach(tab => tab.classList.remove('active'));
    tabButtons.forEach(btn => btn.classList.remove('active'));

    const activeTab = document.querySelector(`#${tabName}`);
    const activeBtn = event.target;

    if (activeTab) activeTab.classList.add('active');
    if (activeBtn) activeBtn.classList.add('active');
}
