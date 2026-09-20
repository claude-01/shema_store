/**
 * SHEMA STORE - Admin Settings
 */

document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    attachSettingsFormListeners();
    document.querySelectorAll('[data-tab]').forEach(button => {
        button.addEventListener('click', () => switchTab(button.dataset.tab));
    });
});

async function loadSettings() {
    try {
        const resp = await fetch('/api/settings');
        const settings = await resp.json();
        ['store_name', 'whatsapp_number', 'phone', 'email', 'address', 'description', 'opening_hours', 'delivery_info', 'logo_path'].forEach(field => {
            const input = document.getElementById(field);
            if (input) input.value = settings[field] || '';
        });
        updateSettingsPreview();
        document.querySelector('#storeInfoForm')?.addEventListener('input', updateSettingsPreview);
    } catch (error) {
        showAdminAlert('Error loading settings', 'error');
        console.error(error);
    }
}

function attachSettingsFormListeners() {
    const adminCredentialsForm = document.querySelector('#adminCredentialsForm');
    if (adminCredentialsForm) {
        adminCredentialsForm.addEventListener('submit', handleAdminCredentialsUpdate);
    }
}

async function handleAdminCredentialsUpdate(e) {
    e.preventDefault();
    e.preventDefault();
    showAdminAlert('Admin credential updates require an authenticated admin session.', 'info');
}

async function handleStoreInfoUpdate(e) {
    e.preventDefault();
    try {
        const store_name = document.querySelector('#store_name')?.value || '';
        const whatsapp_number = document.querySelector('#whatsapp_number')?.value || '';
        const phone = document.querySelector('#phone')?.value || '';
        const fields = ['store_name', 'whatsapp_number', 'phone', 'email', 'address', 'description', 'opening_hours', 'delivery_info', 'logo_path'];
        const payload = Object.fromEntries(fields.map(field => [field, document.getElementById(field)?.value || '']));

        const resp = await fetch('/api/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await resp.json();
        if (!resp.ok) {
            showAdminAlert(data.message || 'Failed to update settings', 'error');
            return;
        }
        showAdminAlert('Settings updated', 'success');
    } catch (error) {
        console.error(error);
        showAdminAlert('Error updating settings', 'error');
    }
}

function updateSettingsPreview() {
    const value = id => document.getElementById(id)?.value || '';
    const logo = value('logo_path');
    const logoPreview = document.getElementById('settingsLogoPreview');
    if (logoPreview && logo) logoPreview.src = logo;
    const storePreview = document.getElementById('settingsStorePreview');
    const descriptionPreview = document.getElementById('settingsDescriptionPreview');
    const phonePreview = document.getElementById('settingsPhonePreview');
    const whatsappPreview = document.getElementById('settingsWhatsappPreview');
    if (storePreview) storePreview.textContent = value('store_name') || 'Your store';
    if (descriptionPreview) descriptionPreview.textContent = value('description') || 'Your store description will appear here.';
    if (phonePreview) phonePreview.textContent = value('phone') || 'Phone not set';
    if (whatsappPreview) whatsappPreview.textContent = value('whatsapp_number') || 'WhatsApp not set';
}
