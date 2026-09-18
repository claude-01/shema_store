document.addEventListener('DOMContentLoaded', () => {
    loadZones();
    const form = document.getElementById('addZoneForm');
    if (form) form.addEventListener('submit', handleAddZone);
});

async function loadZones() {
    try {
        const resp = await fetch('http://localhost:7070/api/delivery-zones');
        const data = await resp.json();
        const list = data.zones || [];
        const container = document.getElementById('zonesList');
        if (!container) return;
        if (!list.length) { container.innerHTML = '<p>No zones configured.</p>'; return; }
        container.innerHTML = `<table class="admin-table"><thead><tr><th>City</th><th>Fee</th><th>Min</th><th>Max</th><th>Active</th><th>Actions</th></tr></thead><tbody>${list.map(z => `
            <tr data-id="${z.id}">
                <td>${z.city}</td>
                <td>${z.fee}</td>
                <td>${z.min_days}</td>
                <td>${z.max_days}</td>
                <td>${z.is_active ? 'Yes' : 'No'}</td>
                <td><button class="btn btn-secondary edit-zone" data-id="${z.id}">Edit</button> <button class="btn btn-danger delete-zone" data-id="${z.id}">Delete</button></td>
            </tr>
        `).join('')}</tbody></table>`;
        document.querySelectorAll('.delete-zone').forEach(b => b.addEventListener('click', async (e) => {
            if (!confirm('Delete zone?')) return;
            const id = e.currentTarget.dataset.id;
            await fetch(`http://localhost:7070/api/delivery-zones/${id}`, { method: 'DELETE' });
            loadZones();
        }));
        document.querySelectorAll('.edit-zone').forEach(b => b.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            const row = document.querySelector(`tr[data-id=\"${id}\"]`);
            if (!row) return;
            const cells = row.querySelectorAll('td');
            const city = cells[0].textContent;
            const fee = cells[1].textContent;
            const min = cells[2].textContent;
            const max = cells[3].textContent;
            const active = cells[4].textContent === 'Yes' ? '1' : '0';
            // populate form for editing
            document.getElementById('zoneCity').value = city;
            document.getElementById('zoneFee').value = fee;
            document.getElementById('zoneMinDays').value = min;
            document.getElementById('zoneMaxDays').value = max;
            document.getElementById('zoneActive').value = active;
            // change form submit to update
            const form = document.getElementById('addZoneForm');
            form.dataset.editId = id;
        }));
    } catch (error) {
        console.error('loadZones error', error);
    }
}

async function handleAddZone(e) {
    e.preventDefault();
    try {
        const city = document.getElementById('zoneCity').value;
        const fee = parseFloat(document.getElementById('zoneFee').value) || 0;
        const min_days = parseInt(document.getElementById('zoneMinDays').value, 10) || 1;
        const max_days = parseInt(document.getElementById('zoneMaxDays').value, 10) || 3;
        const is_active = document.getElementById('zoneActive').value === '1';
        const form = document.getElementById('addZoneForm');
        const editId = form.dataset.editId;
        if (editId) {
            await fetch(`http://localhost:7070/api/delivery-zones/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ city, fee, min_days, max_days, is_active }) });
            delete form.dataset.editId;
        } else {
            await fetch('http://localhost:7070/api/delivery-zones', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ city, fee, min_days, max_days, is_active }) });
        }
        loadZones();
        form.reset();
    } catch (error) {
        console.error('handleAddZone error', error);
    }
}
