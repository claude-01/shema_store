/**
 * SHEMA STORE - Admin Users Management
 */

document.addEventListener('DOMContentLoaded', () => {
    loadUsersList();
});

async function loadUsersList() {
    try {
        // Load and display users
        // To be implemented
        console.log('Users loaded');
    } catch (error) {
        showAdminAlert('Error loading users', 'error');
        console.error(error);
    }
}
