/**
 * SHEMA STORE - Admin Products Management
 */

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('products.html')) {
        loadProductsList();
    } else if (window.location.pathname.includes('add-product.html')) {
        attachAddProductForm();
    } else if (window.location.pathname.includes('edit-product.html')) {
        loadProductForEdit();
    }
});

async function loadProductsList() {
    try {
        // Use the same live catalog endpoint as the customer products page.
        const resp = await fetch(`http://localhost:7070/api/products?_=${Date.now()}`, {
            credentials: 'include',
            cache: 'no-store'
        });
        if (!resp.ok) throw new Error(`Products request failed (${resp.status})`);
        const data = await resp.json();
        const list = data.products || data || [];

        const section = document.querySelector('.products-table');
        if (!section) return;

        if (!list.length) {
            section.innerHTML = '<p>No products found.</p>';
            return;
        }

        const rows = list.map(p => {
            const img = p.image || (p.image_path ? p.image_path : (p.images && p.images[0] && p.images[0].image_path) || '');
            const imgUrl = resolveImagePath(img);
            return `
                <tr data-id="${p.id}" data-stock="${p.stock || 0}">
                    <td><img src="${imgUrl}" alt="${p.name}" class="product-list-image" style="height:60px;object-fit:cover"/></td>
                    <td>${p.name}</td>
                    <td>${p.category_name || p.category_id || ''}</td>
                    <td>${p.stock || 0}</td>
                    <td>${p.price || 0}</td>
                    <td>
                        <a class="btn btn-secondary" href="edit-product.html?id=${p.id}">Edit</a>
                        <button class="btn btn-danger btn-delete-product" data-id="${p.id}">Delete</button>
                        <button class="btn btn-primary btn-mark-sold" data-id="${p.id}" data-stock="${p.stock || 0}">Mark Sold</button>
                    </td>
                </tr>
            `;
        }).join('');

        section.innerHTML = `
            <table class="admin-table">
                <thead>
                    <tr><th>Image</th><th>Name</th><th>Category</th><th>Stock</th><th>Price</th><th>Actions</th></tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        `;
        section.querySelectorAll('.product-list-image').forEach(img => img.addEventListener('error', () => {
            img.src = '/images/download.jpg';
        }, { once: true }));
        // attach event listeners for delete and mark-sold buttons
        section.querySelectorAll('.btn-delete-product').forEach(btn => {
            btn.removeEventListener('click', adminDeleteHandler);
            btn.addEventListener('click', adminDeleteHandler);
        });
        section.querySelectorAll('.btn-mark-sold').forEach(btn => {
            btn.removeEventListener('click', adminMarkSoldHandler);
            btn.addEventListener('click', adminMarkSoldHandler);
        });
    } catch (error) {
        showAdminAlert('Error loading products', 'error');
        console.error(error);
    }
}

function adminDeleteHandler(e) {
    const id = Number(e.currentTarget.dataset.id);
    if (id) deleteProduct(id);
}

function adminMarkSoldHandler(e) {
    const id = Number(e.currentTarget.dataset.id);
    const stock = Number(e.currentTarget.dataset.stock || 0);
    if (id) markSold(id, stock);
}

function attachAddProductForm() {
    const form = document.querySelector('#addProductForm');
    if (form) {
        form.addEventListener('submit', handleAddProduct);
    }
}

async function handleAddProduct(e) {
    e.preventDefault();
    try {
        const API = 'http://localhost:7070/api/products';
        const name = document.querySelector('#name').value;
        const description = document.querySelector('#description').value;
        const price = parseFloat(document.querySelector('#price').value) || 0;
        const stock = parseInt(document.querySelector('#stock').value, 10) || 0;
        const category_id = parseInt(document.querySelector('#category_id').value, 10) || 1;
        const imageFile = document.querySelector('#imageFile')?.files[0];
        if (!imageFile) {
            showAdminAlert('Please choose a product image', 'error');
            return;
        }

        const resp = await fetch(API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description, price, stock, category_id })
        });

        const data = await resp.json();
        if (!resp.ok) {
            showAdminAlert(data.message || 'Failed to create product', 'error');
            return;
        }

        const created = data.product || data;
        const uploadData = new FormData();
        uploadData.append('image', imageFile);
        uploadData.append('product_id', created.id);
        const imageResponse = await fetch('http://localhost:7070/api/images', { method: 'POST', body: uploadData });
        const imageData = await imageResponse.json();
        if (!imageResponse.ok) throw new Error(imageData.message || 'Image upload failed');

        showAdminAlert('Product created successfully', 'success');
        setTimeout(() => { window.location.href = 'products.html'; }, 800);
    } catch (error) {
        console.error(error);
        showAdminAlert('Error creating product', 'error');
    }
}

async function loadProductForEdit() {
    const id = new URLSearchParams(window.location.search).get('id');
    const form = document.querySelector('#editProductForm');
    if (!id || !form) return;

    try {
        const response = await fetch(`http://localhost:7070/api/products/${id}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to load product');

        const product = data.product || data;
        await populateCategorySelect(product.category_id);
        ['name', 'description', 'price', 'stock', 'category_id', 'discount_percent'].forEach(field => {
            if (form.elements[field]) form.elements[field].value = product[field] ?? '';
        });
        const currentImage = (data.images || []).find(image => image.is_main) || (data.images || [])[0];
        if (currentImage && form.elements.imageFile) {
            form.elements.imageFile.dataset.currentImage = currentImage.image_path;
            const preview = document.getElementById('imagePreview');
            if (preview) {
                preview.innerHTML = `<img src="${resolveImagePath(currentImage.image_path)}" alt="Current product image" />`;
            }
        }

        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const fields = ['name', 'description', 'price', 'stock', 'category_id'];
            const changes = Object.fromEntries(fields.map(field => [field, form.elements[field].value]));
            const updateResponse = await fetch(`http://localhost:7070/api/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(changes)
            });
            const result = await updateResponse.json();
            if (!updateResponse.ok) throw new Error(result.message || 'Failed to update product');
            const imageFile = form.elements.imageFile?.files[0];
            if (imageFile) {
                const uploadData = new FormData();
                uploadData.append('image', imageFile);
                uploadData.append('product_id', id);
                await fetch('http://localhost:7070/api/images', { method: 'POST', body: uploadData });
            }
            showAdminAlert('Product updated successfully', 'success');
            setTimeout(() => { window.location.href = 'products.html'; }, 800);
        });
    } catch (error) {
        console.error(error);
        showAdminAlert(error.message || 'Error loading product', 'error');
    }
}

function resolveImagePath(img) {
    if (!img) return '/images/download.jpg';
    if (/^https?:\/\//i.test(img) || img.startsWith('/')) return img;
    return `/images/${encodeURIComponent(img)}`;
}

async function deleteProduct(id) {
    if (!confirm('Delete product? This cannot be undone.')) return;
    try {
        const resp = await fetch(`http://localhost:7070/api/products/${id}`, { method: 'DELETE' });
        const data = await resp.json();
        if (!resp.ok) {
            showAdminAlert(data.message || 'Delete failed', 'error');
            return;
        }
        showAdminAlert('Product deleted', 'success');
        loadProductsList();
    } catch (error) {
        console.error(error);
        showAdminAlert('Error deleting product', 'error');
    }
}

async function markSold(id, stock) {
    try {
        const newStock = Math.max(0, (stock || 0) - 1);
        const resp = await fetch(`http://localhost:7070/api/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stock: newStock })
        });
        const data = await resp.json();
        if (!resp.ok) {
            showAdminAlert(data.message || 'Failed to update stock', 'error');
            return;
        }
        showAdminAlert('Marked one item as sold', 'success');
        loadProductsList();
    } catch (error) {
        console.error(error);
        showAdminAlert('Error updating stock', 'error');
    }
}

async function populateImageSelect() {
    try {
        const resp = await fetch('http://localhost:7070/api/images');
        const data = await resp.json();
        const list = data.images || [];
        const sel = document.querySelector('#imageSelect');
        if (!sel) return;
        sel.innerHTML = `<option value="">(none)</option>` + list.map(f => `<option value="${f}">${f}</option>`).join('');
        sel.addEventListener('change', () => {
            const preview = document.querySelector('#imagePreview');
            if (!preview) return;
            const v = sel.value;
            if (!v) { preview.innerHTML = ''; return; }
            preview.innerHTML = `<img src="/images/${v}" style="height:120px;object-fit:cover"/>`;
        });
    } catch (error) {
        console.error('populateImageSelect error', error);
    }
}

async function populateCategorySelect(selectedId = '') {
    const select = document.querySelector('#category_id');
    if (!select) return;

    try {
        const response = await fetch('http://localhost:7070/api/categories');
        const data = await response.json();
        const categories = data.categories || [];
        select.innerHTML = '<option value="">Select a category</option>' + categories.map(category => `<option value="${category.id}">${category.name}</option>`).join('');
        if (selectedId !== '') select.value = String(selectedId);
    } catch (error) {
        console.error('populateCategorySelect error', error);
        select.innerHTML = '<option value="">Unable to load categories</option>';
    }
}

if (window.location.pathname.includes('add-product.html')) {
    populateCategorySelect();
    document.querySelector('#imageFile')?.addEventListener('change', (event) => {
        const file = event.target.files[0];
        const preview = document.querySelector('#imagePreview');
        if (!file || !preview) return;
        const reader = new FileReader();
        reader.onload = () => { preview.innerHTML = `<img src="${reader.result}" alt="Selected product preview">`; };
        reader.readAsDataURL(file);
    });
}
