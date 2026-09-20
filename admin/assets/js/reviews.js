/**
 * SHEMA STORE - Admin Reviews Management
 */

document.addEventListener('DOMContentLoaded', () => {
    loadReviewsList();
});

async function loadReviewsList() {
    try {
        const section = document.querySelector('.reviews-table');
        if (!section) return;
        const response = await fetch('http://localhost:7070/api/reviews', { credentials: 'include' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to load reviews');
        const reviews = data.reviews || [];
        const productRatings = data.productRatings || [];
        section.innerHTML = `
            <div class="admin-review-summary">${reviews.length} review${reviews.length === 1 ? '' : 's'} received</div>
            <h2 class="admin-reviews-heading">Product rating overview</h2>
            <div class="admin-table-wrap"><table class="admin-table">
                <thead><tr><th>Product</th><th>Rating</th><th>Reviews</th></tr></thead>
                <tbody>${productRatings.map(product => {
                    const rating = Number(product.average_rating || 0);
                    const filledStars = Math.round(rating);
                    return `<tr><td><strong>${escapeReviewText(product.product_name)}</strong></td><td><span class="admin-review-stars" aria-label="${rating} out of 5 stars">${'★'.repeat(filledStars)}${'☆'.repeat(5 - filledStars)}</span><strong class="rating-number">${rating ? `${rating}/5` : 'Not rated'}</strong></td><td>${product.review_count}</td></tr>`;
                }).join('')}</tbody>
            </table></div>
            ${reviews.length ? `<h2 class="admin-reviews-heading">Submitted reviews</h2><div class="admin-table-wrap"><table class="admin-table">
                <thead><tr><th>Product</th><th>Customer</th><th>Rating</th><th>Comment</th><th>Date</th><th>Status</th></tr></thead>
                <tbody>${reviews.map(review => `
                    <tr>
                        <td><strong>${escapeReviewText(review.product_name)}</strong></td>
                        <td>${escapeReviewText(review.customer)}<small class="review-email">${escapeReviewText(review.customer_email)}</small></td>
                        <td><span class="admin-review-stars" aria-label="${review.rating} out of 5 stars">${'★'.repeat(Number(review.rating))}${'☆'.repeat(5 - Number(review.rating))}</span><strong class="rating-number">${review.rating}/5</strong></td>
                        <td>${escapeReviewText(review.comment || 'No comment')}</td>
                        <td>${new Date(review.created_at).toLocaleDateString()}</td>
                        <td><span class="review-status ${review.is_approved ? 'approved' : 'pending'}">${review.is_approved ? 'Approved' : 'Pending'}</span></td>
                    </tr>
                `).join('')}</tbody>
            </table></div>` : '<div class="admin-empty-state">No individual reviews have been submitted yet. Product stars will fill as customers rate products.</div>'}`;
    } catch (error) {
        showAdminAlert('Error loading reviews', 'error');
        console.error(error);
    }
}

function escapeReviewText(value) {
    return String(value || '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character]));
}
