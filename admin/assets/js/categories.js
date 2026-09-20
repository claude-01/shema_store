/**
 * SHEMA STORE - Admin Categories Management
 */

async function loadCategoriesList() {
    try {
        const response = await fetch('/api/categories?includeInactive=true', {
            credentials: 'include',
            cache: 'no-store'
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Failed to load categories');
        }

        const categories = Array.isArray(data.categories) ? data.categories : [];
        const section = document.querySelector('.categories-table');
        if (!section) return;

        if (!categories.length) {
            section.innerHTML = '<p>No categories found.</p>';
            return;
        }

        section.innerHTML = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Cover</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${categories.map(category => `
                        <tr data-id="${category.id}">
                            <td>${category.id}</td>
                            <td>
                                ${category.image ? `<img src="${category.image}" alt="${category.name}" class="category-cover-thumb" style="width: 52px; height: 52px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd;" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-block';"> <span style="display:none;">No image</span>` : '<span>No image</span>'}
                            </td>
                            <td>${category.name}</td>
                            <td>${category.description || '—'}</td>
                            <td>${category.is_active === 0 || category.is_active === false ? 'Inactive' : 'Active'}</td>
                            <td>
                                <button class="btn btn-secondary btn-edit-category" data-id="${category.id}">Edit</button>
                                <button class="btn btn-danger btn-delete-category" data-id="${category.id}">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        section.querySelectorAll('.btn-edit-category').forEach(button => {
            button.addEventListener('click', () => openEditCategoryForm(Number(button.dataset.id)));
        });

        section.querySelectorAll('.btn-delete-category').forEach(button => {
            button.addEventListener('click', () => deleteCategory(Number(button.dataset.id)));
        });
    } catch (error) {
        showAdminAlert('Error loading categories', 'error');
        console.error(error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('categories.html')) {
        loadCategoriesList();
    }
    document.getElementById('addCategoryButton')?.addEventListener('click', openAddCategoryForm);
});

function openAddCategoryForm() {
    const section = document.querySelector('.categories-table');
    if (!section) return;

    section.insertAdjacentHTML('afterend', `
        <div class="admin-card" id="categoryFormCard" style="margin-top: 20px;">
            <h3>Add Category</h3>
            <form id="categoryForm">
                <div class="admin-field">
                    <label for="categoryName">Name</label>
                    <input id="categoryName" name="name" type="text" required>
                </div>
                <div class="admin-field">
                    <label for="categoryDescription">Description</label>
                    <textarea id="categoryDescription" name="description" rows="4"></textarea>
                </div>
                <div class="admin-field">
                    <label for="categoryImage">Cover Image URL</label>
                    <input id="categoryImage" name="image" type="url" placeholder="https://... or /images/category.jpg">
                    <small>Use a direct image URL or a local path like /images/category.jpg</small>
                </div>
                <div class="admin-field">
                    <label for="categoryStatus">Status</label>
                    <select id="categoryStatus" name="is_active">
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                    </select>
                </div>
                <div class="admin-field">
                    <label>Cover Preview</label>
                    <img id="categoryImagePreview" src="" alt="Category cover preview" style="max-width: 180px; max-height: 120px; object-fit: cover; display: none; border-radius: 10px; border: 1px solid #ddd; margin-top: 8px;">
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Save Category</button>
                    <button type="button" class="btn btn-secondary" id="cancelCategoryForm">Cancel</button>
                </div>
            </form>
        </div>
    `);

    const imageInput = document.getElementById('categoryImage');
    const previewImage = document.getElementById('categoryImagePreview');
    imageInput?.addEventListener('input', () => {
        const src = imageInput.value.trim();
        if (!src) {
            previewImage.style.display = 'none';
            previewImage.src = '';
            return;
        }
        previewImage.src = src;
        previewImage.style.display = 'block';
    });

    document.getElementById('categoryForm')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const payload = {
            name: form.elements.name.value.trim(),
            description: form.elements.description.value.trim(),
            image: form.elements.image.value.trim(),
            is_active: form.elements.is_active.value === '1'
        };

        if (!payload.name) {
            showAdminAlert('Category name is required', 'error');
            return;
        }

        try {
            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to create category');
            }
            document.getElementById('categoryFormCard')?.remove();
            showAdminAlert('Category added successfully', 'success');
            loadCategoriesList();
        } catch (error) {
            console.error(error);
            showAdminAlert(error.message || 'Error creating category', 'error');
        }
    });

    document.getElementById('cancelCategoryForm')?.addEventListener('click', () => {
        document.getElementById('categoryFormCard')?.remove();
    });
}

async function openEditCategoryForm(categoryId) {
    try {
        const response = await fetch(`/api/categories/${categoryId}`, { credentials: 'include' });
        const data = await response.json();
        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Failed to load category');
        }

        const category = data.category || {};
        const section = document.querySelector('.categories-table');
        if (!section) return;

        const existingForm = document.getElementById('categoryFormCard');
        if (existingForm) existingForm.remove();

        section.insertAdjacentHTML('afterend', `
            <div class="admin-card" id="categoryFormCard" style="margin-top: 20px;">
                <h3>Edit Category</h3>
                <form id="categoryForm">
                    <div class="admin-field">
                        <label for="categoryName">Name</label>
                        <input id="categoryName" name="name" type="text" value="${(category.name || '').replace(/"/g, '&quot;')}" required>
                    </div>
                    <div class="admin-field">
                        <label for="categoryDescription">Description</label>
                        <textarea id="categoryDescription" name="description" rows="4">${(category.description || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
                    </div>
                    <div class="admin-field">
                        <label for="categoryImage">Cover Image URL</label>
                        <input id="categoryImage" name="image" type="url" value="${(category.image || '').replace(/"/g, '&quot;')}" placeholder="https://... or /images/category.jpg">
                    </div>
                    <div class="admin-field">
                        <label for="categoryStatus">Status</label>
                        <select id="categoryStatus" name="is_active">
                            <option value="1" ${category.is_active === 1 || category.is_active === true ? 'selected' : ''}>Active</option>
                            <option value="0" ${category.is_active === 0 || category.is_active === false ? 'selected' : ''}>Inactive</option>
                        </select>
                    </div>
                    <div class="admin-field">
                        <label>Cover Preview</label>
                        <img id="categoryImagePreview" src="${(category.image || '').replace(/"/g, '&quot;')}" alt="Category cover preview" style="max-width: 180px; max-height: 120px; object-fit: cover; display: ${category.image ? 'block' : 'none'}; border-radius: 10px; border: 1px solid #ddd; margin-top: 8px;">
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Update Category</button>
                        <button type="button" class="btn btn-secondary" id="cancelCategoryForm">Cancel</button>
                    </div>
                </form>
            </div>
        `);

        const imageInput = document.getElementById('categoryImage');
        const previewImage = document.getElementById('categoryImagePreview');
        imageInput?.addEventListener('input', () => {
            const src = imageInput.value.trim();
            if (!src) {
                previewImage.style.display = 'none';
                previewImage.src = '';
                return;
            }
            previewImage.src = src;
            previewImage.style.display = 'block';
        });

        document.getElementById('categoryForm')?.addEventListener('submit', async (event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const payload = {
                name: form.elements.name.value.trim(),
                description: form.elements.description.value.trim(),
                image: form.elements.image.value.trim(),
                is_active: form.elements.is_active.value === '1'
            };

            if (!payload.name) {
                showAdminAlert('Category name is required', 'error');
                return;
            }

            try {
                const response = await fetch(`/api/categories/${categoryId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(payload)
                });
                const data = await response.json();
                if (!response.ok || !data.success) {
                    throw new Error(data.message || 'Failed to update category');
                }
                document.getElementById('categoryFormCard')?.remove();
                showAdminAlert('Category updated successfully', 'success');
                loadCategoriesList();
            } catch (error) {
                console.error(error);
                showAdminAlert(error.message || 'Error updating category', 'error');
            }
        });

        document.getElementById('cancelCategoryForm')?.addEventListener('click', () => {
            document.getElementById('categoryFormCard')?.remove();
        });
    } catch (error) {
        console.error(error);
        showAdminAlert(error.message || 'Error loading category', 'error');
    }
}

async function deleteCategory(categoryId) {
    if (!confirm('Delete this category? This may reassign products to another category.')) {
        return;
    }

    try {
        const response = await fetch(`/api/categories/${categoryId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Failed to delete category');
        }
        showAdminAlert('Category deleted', 'success');
        loadCategoriesList();
    } catch (error) {
        console.error(error);
        showAdminAlert(error.message || 'Error deleting category', 'error');
    }
}
