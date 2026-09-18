/**
 * SHEMA STORE - Account Management
 * Handle user account and profile
 */

document.addEventListener('DOMContentLoaded', () => {
    if (!isLoggedIn()) {
        redirectToLogin();
        return;
    }

    loadAccountData();
    attachAccountFormListeners();
});

/**
 * Load account data
 */
async function loadAccountData() {
    try {
        const user = await api.getCurrentUser();
        displayAccountData(user);
    } catch (error) {
        showAlert('Error loading account data', 'error');
        console.error(error);
    }
}

/**
 * Display account data
 */
function displayAccountData(user) {
    // To be implemented
    console.log('Account data loaded:', user);
}

/**
 * Attach form listeners
 */
function attachAccountFormListeners() {
    const profileForm = document.querySelector('#profileForm');
    
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
}

/**
 * Handle profile update
 */
async function handleProfileUpdate(e) {
    e.preventDefault();

    const formData = {
        firstName: document.querySelector('input[name="firstName"]')?.value,
        lastName: document.querySelector('input[name="lastName"]')?.value,
        phone: document.querySelector('input[name="phone"]')?.value,
        address: document.querySelector('input[name="address"]')?.value,
        city: document.querySelector('input[name="city"]')?.value
    };

    try {
        await api.updateProfile(formData);
        showAlert('Profile updated successfully', 'success');
        loadAccountData();
    } catch (error) {
        showAlert('Error updating profile', 'error');
        console.error(error);
    }
}

/**
 * Load user orders
 */
async function loadUserOrders() {
    try {
        const orders = await api.getUserOrders();
        displayUserOrders(orders);
    } catch (error) {
        showAlert('Error loading orders', 'error');
        console.error(error);
    }
}

/**
 * Display user orders
 */
function displayUserOrders(orders) {
    // To be implemented
    console.log('Orders:', orders);
}
