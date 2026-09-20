/**
 * SHEMA STORE - Admin Dashboard
 */

document.addEventListener('DOMContentLoaded', loadDashboardData);

async function loadDashboardData() {
    const root = document.getElementById('dashboardRoot');
    if (!root) return;
    try {
        const response = await fetch('/api/admin/dashboard', { credentials: 'include' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Dashboard request failed');
        renderDashboard(root, data);
    } catch (error) {
        console.error(error);
        root.innerHTML = '<div class="dashboard-empty">Dashboard data is unavailable. Check the database connection and refresh.</div>';
    }
}

function renderDashboard(root, data) {
    const summary = data.summary || {};
    const currency = value => `RWF ${Number(value || 0).toLocaleString('en-RW')}`;
    const number = value => Number(value || 0).toLocaleString('en-RW');
    const image = value => value || '/images/download.jpg';
    const statusClass = status => String(status || 'pending').toLowerCase().replace(/\s+/g, '-');
    const orderRows = (data.recentOrders || []).map(order => `<tr><td>#SH-${order.id}</td><td>${order.customer_name || 'Guest customer'}</td><td>${currency(order.total_amount)}</td><td><span class="payment-badge">Paid</span></td><td><span class="status-badge ${statusClass(order.status)}">${order.status || 'Pending'}</span></td><td>${formatDate(order.created_at)}</td><td><a href="orders.html?id=${order.id}">View</a></td></tr>`).join('');
    const topRows = (data.topProducts || []).map(product => `<div class="dashboard-product-row"><img src="${image(product.image)}" alt="${product.name}" class="fallback-image"><div><strong>${product.name}</strong><small>${product.category_name || 'Uncategorized'}</small></div><span>${number(product.units_sold)} sold</span><b>${currency(product.revenue)}</b></div>`).join('');
    const stockRows = (data.lowStock || []).map(product => `<div class="stock-row"><img src="${image(product.image)}" alt="${product.name}" class="fallback-image"><div><strong>${product.name}</strong><small>${product.stock} remaining</small></div><span class="stock-meter"><i style="width:${Math.max(12, Math.min(100, Number(product.stock || 0) * 15))}%"></i></span></div>`).join('');
    const categoryRows = (data.categorySales || []).map(category => `<div class="category-bar-row"><div><span>${category.category_name}</span><strong>${currency(category.revenue)}</strong></div><span class="category-bar"><i style="width:${categoryPercent(category.revenue, data.categorySales)}%"></i></span></div>`).join('');

    root.innerHTML = `
        <div class="dashboard-stat-grid">${statCard('💰', 'Total Revenue', currency(summary.revenue), 'Live database total', 'positive')}${statCard('🛒', 'Total Orders', number(summary.orders), 'Live database total', 'positive')}${statCard('👥', 'Total Customers', number(summary.customers), 'Active customer records', 'positive')}${statCard('📦', 'Total Products', number(summary.products), 'Active product records', 'positive')}${statCard('⚠️', 'Low Stock', `${number(summary.low_stock)} Products`, 'Needs attention', 'warning')}${statCard('↩️', 'Pending Returns', number(summary.pending_returns), 'Cancelled orders count', 'warning')}</div>
        <section class="dashboard-card sales-overview-card"><div class="dashboard-section-heading"><div><h2>Sales Overview</h2><p>Track revenue and orders performance</p></div><div class="chart-filters"><button class="active">This Week</button><button>This Month</button><button>This Year</button></div></div><div class="sales-chart"><div class="chart-legend"><span><i class="legend-revenue"></i>Revenue</span><span><i class="legend-orders"></i>Orders</span></div>${renderSalesChart(data.salesTrend || [])}</div></section>
        <div class="dashboard-two-column"><section class="dashboard-card"><div class="dashboard-section-heading"><div><h2>Recent Orders</h2><p>Latest customer activity</p></div><a href="orders.html">View All Orders →</a></div><div class="dashboard-table-wrap"><table class="dashboard-table"><thead><tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Payment</th><th>Status</th><th>Date</th><th>Action</th></tr></thead><tbody>${orderRows || '<tr><td colspan="7" class="table-empty">No orders recorded yet.</td></tr>'}</tbody></table></div></section><section class="dashboard-card"><div class="dashboard-section-heading"><div><h2>Top Selling Products</h2><p>Best performers by units sold</p></div><a href="products.html">View Products →</a></div><div class="dashboard-product-list">${topRows || '<div class="dashboard-empty-inline">No sales data yet.</div>'}</div></section></div>
        <div class="dashboard-two-column lower-dashboard-grid"><section class="dashboard-card"><div class="dashboard-section-heading"><div><h2>Low Stock Alert</h2><p>Products that need attention</p></div><a href="products.html">Manage Inventory →</a></div><div class="stock-list">${stockRows || '<div class="dashboard-empty-inline">All products have healthy stock.</div>'}</div></section><section class="dashboard-card"><div class="dashboard-section-heading"><div><h2>Sales by Category</h2><p>Revenue contribution by category</p></div></div><div class="category-bars">${categoryRows || '<div class="dashboard-empty-inline">No category sales yet.</div>'}</div></section></div>
        <div class="dashboard-two-column actions-notifications"><section class="dashboard-card"><div class="dashboard-section-heading"><div><h2>Quick Actions</h2><p>Common admin tasks</p></div></div><div class="quick-actions"><a href="add-product.html">＋ Add Product</a><a href="categories.html">＋ Add Category</a><a href="orders.html">View Orders</a><a href="products.html">Manage Inventory</a><a href="products.html?featured=1">Create Promotion</a><a href="orders.html">View Reports</a></div></section><section class="dashboard-card"><div class="dashboard-section-heading"><div><h2>Alerts & Notifications</h2><p>Important store updates</p></div></div><div class="notification-list"><div><span>🔔</span><p><strong>${(data.recentOrders || []).length ? 'Recent order activity' : 'No new order activity'}</strong><small>${(data.recentOrders || []).length ? `${data.recentOrders.length} recent order record(s) available.` : 'No order records are available.'}</small></p><time>Live</time></div><div><span>⚠️</span><p><strong>${(data.lowStock || []).length ? 'Low stock needs attention' : 'Stock levels look healthy'}</strong><small>${(data.lowStock || []).length ? `${data.lowStock.length} product(s) are low in stock.` : 'No low-stock products were found.'}</small></p><time>Live</time></div><div><span>💳</span><p><strong>Payment status</strong><small>Payment details are available on order records.</small></p><time>Live</time></div><div><span>⭐</span><p><strong>Review activity</strong><small>Review analytics will appear when review records are available.</small></p><time>Live</time></div></div></section></div>
        <section class="dashboard-card customer-overview"><div class="dashboard-section-heading"><div><h2>Customer Overview</h2><p>Keep an eye on your audience</p></div></div><div class="customer-metrics"><div><span>New Customers</span><strong>—</strong></div><div><span>Returning Customers</span><strong>—</strong></div><div><span>Active Customers</span><strong>${number(summary.customers)}</strong></div></div></section>`;
    root.querySelectorAll('.fallback-image').forEach(img => img.addEventListener('error', () => {
        img.src = '/images/download.jpg';
        img.classList.remove('fallback-image');
    }, { once: true }));
}

function statCard(icon, title, value, note, tone) { return `<article class="dashboard-stat-card ${tone}"><span class="stat-icon">${icon}</span><div><p>${title}</p><strong>${value}</strong><small>${note}</small></div></article>`; }
function formatDate(value) { return value ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '-'; }
function categoryPercent(value, rows) { const total = rows.reduce((sum, row) => sum + Number(row.revenue || 0), 0); return total ? Math.round(Number(value || 0) / total * 100) : 0; }
function renderSalesChart(rows) { const labels = rows.length ? rows.map(row => row.day.slice(0, 3)) : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']; const values = rows.length ? rows.map(row => Number(row.revenue || 0)) : labels.map(() => 0); const max = Math.max(...values, 1); const points = values.map((value, index) => `${(index / Math.max(values.length - 1, 1)) * 96 + 2},${92 - (value / max) * 78}`).join(' '); return `<svg viewBox="0 0 100 100" preserveAspectRatio="none" class="sales-chart-svg" role="img" aria-label="Sales revenue chart"><path class="chart-area" d="M2,92 ${points} L98,92 Z"></path><polyline class="chart-line" points="${points}"></polyline>${labels.map((label, index) => `<text x="${(index / Math.max(labels.length - 1, 1)) * 96 + 2}" y="99">${label}</text>`).join('')}</svg>`; }
