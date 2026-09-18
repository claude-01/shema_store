/**
 * SHEMA STORE - Admin Categories Management
 */

async function loadCategoriesList() {
    try {
        // Load and display categories
        // To be implemented
        console.log('Categories loaded');
    } catch (error) {
        showAdminAlert('Error loading categories', 'error');
        console.error(error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('addCategoryButton')?.addEventListener('click', openAddCategoryForm);
});

function openAddCategoryForm() {
    // Show modal or form to add category
    // To be implemented
}
