/**
 * SHEMA STORE - Search Functionality
 * Handle product search
 */

async function searchProducts(query) {
    try {
        const results = await api.searchProducts(query);
        displaySearchResults(results);
    } catch (error) {
        showAlert('Search error', 'error');
        console.error(error);
    }
}

/**
 * Display search results
 */
function displaySearchResults(results) {
    // To be implemented
    console.log('Search results:', results);
}
