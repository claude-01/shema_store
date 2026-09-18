/**
 * SHEMA STORE - Admin Reviews Management
 */

document.addEventListener('DOMContentLoaded', () => {
    loadReviewsList();
});

async function loadReviewsList() {
    try {
        // Load and display reviews
        // To be implemented
        console.log('Reviews loaded');
    } catch (error) {
        showAdminAlert('Error loading reviews', 'error');
        console.error(error);
    }
}
