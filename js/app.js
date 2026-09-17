// Produk diambil dari database melalui API.
let products = [];

// Data User (simulasi)
let currentUser = null;

// DOM Elements
const menuBtn = document.getElementById('menuBtn');
const menuPanel = document.getElementById('menuPanel');
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modalContent');
const modalClose = document.getElementById('modalClose');

const sections = {
    home: document.getElementById('homeSection'),
    shop: document.getElementById('shopSection'),
    orders: document.getElementById('ordersSection'),
    account: document.getElementById('accountSection')
};

const navButtons = document.querySelectorAll('.bottom-nav button');
const menuButtons = document.querySelectorAll('.menu-panel button');

// Toggle Menu
menuBtn.addEventListener('click', () => {
    menuPanel.classList.toggle('hidden');
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.menu-panel') && !e.target.closest('.menu-btn')) {
        menuPanel.classList.add('hidden');
    }
});

// Navigasi Sections
const showSection = (sectionName) => {
    Object.values(sections).forEach(section => section.classList.add('hidden'));
    sections[sectionName].classList.remove('hidden');

    navButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

    menuPanel.classList.add('hidden');
};

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const section = btn.getAttribute('data-section');
        showSection(section);
    });
});

menuButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const section = btn.getAttribute('data-section');
        showSection(section);
    });
});

// Tombol Hero
document.getElementById('shopBtn').addEventListener('click', () => {
    showSection('shop');
});

document.getElementById('loginBtn').addEventListener('click', () => {
    openLoginModal();
});

document.getElementById('allProductBtn').addEventListener('click', () => {
    showSection('shop');
});

// Modal Functions
const openModal = (content) => {
    modalContent.innerHTML = content;
    modal.classList.remove('hidden');
};

const closeModal = () => {
    modal.classList.add('hidden');
    modalContent.innerHTML = '';
};

modalClose.addEventListener('click', closeModal);

modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

// Authentication
const openLoginModal = () => {
    const content = `
        <h2>Login</h2>
        <p>Masuk ke akun Market Renzz kamu.</p>
        <div class="modal-form">
            <input type="email" placeholder="Email" id="loginEmail" autocomplete="email">
            <input type="password" placeholder="Password" id="loginPassword" autocomplete="current-password">
            <button onclick="handleLogin()">Login</button>
            <button class="form-secondary" onclick="openRegisterModal()">Buat Akun</button>
            <div id="authMessage" class="auth-message"></div>
        </div>
    `;
    openModal(content);
};

const openRegisterModal = () => {
    const content = `
        <h2>Daftar Akun</h2>
        <p>Buat akun baru untuk mulai belanja.</p>
        <div class="modal-form">
            <input type="text" placeholder="Nama" id="registerName" autocomplete="name">
            <input type="email" placeholder="Email" id="registerEmail" autocomplete="email">
            <input type="password" placeholder="Password (min. 6 karakter)" id="registerPassword" autocomplete="new-password">
            <button onclick="handleRegister()">Daftar</button>
            <button class="form-secondary" onclick="openLoginModal()">Sudah punya akun? Login</button>
            <div id="authMessage" class="auth-message"></div>
        </div>
    `;
    openModal(content);
};

const showAuthMessage = (message, error = true) => {
    const el = document.getElementById('authMessage');
    if (el) {
        el.textContent = message;
        el.className = `auth-message ${error ? 'error' : 'success'}`;
    }
};

window.handleLogin = async () => {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        showAuthMessage('Email dan password wajib diisi.');
        return;
    }

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify({email, password})
        });
        const data = await response.json();

        if (!response.ok) {
            showAuthMessage(data.message || 'Login gagal.');
            return;
        }

        currentUser = data.user;
        closeModal();
        renderAccount();
        renderOrders();
        showSection('account');
    } catch (error) {
        console.error('Login error:', error);
        showAuthMessage('Server tidak dapat dihubungi. Coba lagi setelah deployment selesai.');
    }
};

window.handleRegister = async () => {
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;

    if (!name || !email || !password) {
        showAuthMessage('Semua data wajib diisi.');
        return;
    }

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify({name, email, password})
        });
        const data = await response.json();

        if (!response.ok) {
            showAuthMessage(data.message || 'Pendaftaran gagal.');
            return;
        }

        currentUser = data.user;
        closeModal();
        renderAccount();
        showSection('account');
    } catch (error) {
        console.error('Register error:', error);
        showAuthMessage('Server tidak dapat dihubungi. Coba lagi setelah deployment selesai.');
    }
};

window.handleLogout = async () => {
    try {
        await fetch('/api/logout', {
            method: 'POST',
            credentials: 'include'
        });
    } finally {
        currentUser = null;
        renderAccount();
        renderOrders();
        showSection('home');
    }
};

const restoreSession = async () => {
    try {
        const response = await fetch('/api/me', {credentials: 'include'});
        const data = await response.json();
        currentUser = data.user || null;
    } catch (error) {
        currentUser = null;
    }
    renderAccount();
    renderOrders();
};

const loadProducts = async () => {
    try {
        const response = await fetch('/api/products', {credentials: 'include'});
        const data = await response.json();
        products = Array.isArray(data.products) ? data.products : [];
    } catch {
        products = [];
    }
    renderShop();
};

// Render Shop
const renderShop = () => {
    let html = '';
    products.forEach(product => {
        html += `
            <article class="product">
                <div class="product-icon">
                    ${product.icon}
                </div>
                <div class="product-info">
                    <span>${product.category}</span>
                    <h3>${product.name}</h3>
                    <p>${product.desc}</p>
                    <strong>Mulai Rp${product.price.toLocaleString('id-ID')}</strong>
                </div>
                <button class="buy" onclick="buyProduct('${product.id}', ${product.price})">
                    Beli
                </button>
            </article>
        `;
    });
    document.getElementById('shopProducts').innerHTML = html;
};

// Buy Product
window.buyProduct = (productId, price) => {
    if (!currentUser) {
        openLoginModal();
        return;
    }
    const product = products.find(p => p.id === productId);
    const content = `
        <h2>Beli ${product.name}</h2>
        <p>Harga: Rp${price.toLocaleString('id-ID')}</p>
        <p>Saldo: Rp${Number(currentUser.balance || 0).toLocaleString('id-ID')}</p>
        <div class="modal-form">
            <input type="number" min="1" placeholder="Jumlah" id="quantity" value="1">
            <button onclick="processPayment('${productId}', ${price})">Bayar Sekarang</button>
            <div id="orderMessage" class="auth-message"></div>
        </div>
    `;
    openModal(content);
};

window.processPayment = async (productId, price) => {
    const quantity = Math.max(1, parseInt(document.getElementById('quantity').value, 10) || 1);
    const product = products.find(p => p.id === productId);
    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify({productId: product.id, quantity})
        });
        const data = await response.json();
        if (!response.ok) {
            const el = document.getElementById('orderMessage');
            if (el) { el.textContent = data.message || 'Pembelian gagal.'; el.className = 'auth-message error'; }
            return;
        }
        currentUser = data.user;
        closeModal();
        await renderOrders();
        const content = `
            <h2>Pesanan Berhasil! 🎉</h2>
            <p>ID Pesanan: <strong>${data.order.id}</strong></p>
            <p>Total: <strong>Rp${data.order.total.toLocaleString('id-ID')}</strong></p>
            <p>Saldo tersisa: <strong>Rp${Number(currentUser.balance).toLocaleString('id-ID')}</strong></p>
            <div class="modal-form"><button onclick="closeModal()">Tutup</button></div>
        `;
        openModal(content);
    } catch {
        const el = document.getElementById('orderMessage');
        if (el) { el.textContent = 'Server tidak dapat dihubungi.'; el.className = 'auth-message error'; }
    }
};

// Render Orders
const renderOrders = async () => {
    const list = document.getElementById('ordersList');
    if (!currentUser) {
        list.innerHTML = '<div class="empty">Silakan login untuk melihat pesanan</div>';
        return;
    }
    try {
        const response = await fetch('/api/orders', {credentials: 'include'});
        const data = await response.json();
        const orders = data.orders || [];
        if (!orders.length) {
            list.innerHTML = '<div class="empty">Belum ada pesanan</div>';
            return;
        }
        list.innerHTML = orders.map(order => `
            <div class="order-card">
                <div class="order-top">
                    <span class="order-id">${order.id}</span>
                    <span class="order-status">● ${order.status}</span>
                </div>
                <h3>${order.product}</h3>
                <p>Qty: ${order.quantity} | Total: Rp${Number(order.total).toLocaleString('id-ID')}</p>
                <p>${new Date(order.date).toLocaleString('id-ID')}</p>
            </div>
        `).join('');
    } catch {
        list.innerHTML = '<div class="empty">Gagal memuat pesanan.</div>';
    }
};

// Account
const renderAccount = () => {
    const card = document.getElementById('accountCard');
    if (!currentUser) {
        card.innerHTML = `
            <p>Silakan login terlebih dahulu.</p>
            <button class="btn primary" onclick="openLoginModal()" style="width:100%;margin-top:10px;">Login</button>
        `;
        return;
    }
    card.innerHTML = `
        <div class="account-avatar">${currentUser.name.charAt(0).toUpperCase()}</div>
        <h3>${currentUser.name}</h3>
        <p>${currentUser.email}</p>
        <div class="balance-box">
            <small>SALDO</small>
            <strong>Rp${Number(currentUser.balance || 0).toLocaleString('id-ID')}</strong>
        </div>
        ${currentUser.role === 'admin' ? '<button class="btn primary account-action" onclick="openAdminModal()">🛠️ Admin Panel</button>' : ''}
        <button class="btn secondary account-action" onclick="openProfileModal()">Edit Profil</button>
        <button class="logout" onclick="handleLogout()">Logout</button>
    `;
};

window.openProfileModal = () => {
    openModal(`
        <h2>Edit Profil</h2>
        <div class="modal-form">
            <input type="text" id="profileName" value="${currentUser.name}" placeholder="Nama">
            <input type="password" id="profilePassword" placeholder="Password baru (opsional)">
            <button onclick="saveProfile()">Simpan Perubahan</button>
            <div id="profileMessage" class="auth-message"></div>
        </div>
    `);
};

window.saveProfile = async () => {
    const name = document.getElementById('profileName').value.trim();
    const newPassword = document.getElementById('profilePassword').value;
    const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify({name, newPassword})
    });
    const data = await response.json();
    if (!response.ok) {
        const el = document.getElementById('profileMessage');
        el.textContent = data.message || 'Gagal menyimpan.';
        el.className = 'auth-message error';
        return;
    }
    currentUser = data.user;
    closeModal();
    renderAccount();
};

window.openAdminModal = async () => {
    if (!currentUser || currentUser.role !== 'admin') return;
    openModal('<h2>Admin Panel</h2><p>Memuat data...</p>');
    const [statsR, usersR, ordersR] = await Promise.all([
        fetch('/api/admin/stats', {credentials:'include'}),
        fetch('/api/admin/users', {credentials:'include'}),
        fetch('/api/admin/orders', {credentials:'include'})
    ]);
    const stats = await statsR.json(), users = await usersR.json(), orders = await ordersR.json();
    openModal(`
        <h2>Admin Panel 🛠️</h2>
        <div class="admin-grid">
            <div><small>USER</small><strong>${stats.users}</strong></div>
            <div><small>ORDER</small><strong>${stats.orders}</strong></div>
            <div><small>PENDAMPING</small><strong>${stats.pending}</strong></div>
            <div><small>OMSET</small><strong>Rp${Number(stats.revenue).toLocaleString('id-ID')}</strong></div>
        </div>
        <h3 class="admin-title">Top Up User</h3>
        <div class="modal-form">
            <input id="topupEmail" placeholder="Email user">
            <input id="topupAmount" type="number" min="1" placeholder="Nominal">
            <button onclick="adminTopup()">Top Up</button>
        </div>
        <h3 class="admin-title">Pesanan Terbaru</h3>
        <div class="admin-orders">
            ${orders.orders.slice(0, 12).map(o => `
                <div class="admin-order">
                    <div><strong>${o.id}</strong><br><span>${o.product} × ${o.quantity}</span></div>
                    <select onchange="adminStatus('${o.id}', this.value)">
                        ${['Diproses','Selesai','Dibatalkan'].map(s => `<option ${o.status===s?'selected':''}>${s}</option>`).join('')}
                    </select>
                </div>
            `).join('') || '<div class="empty">Belum ada order.</div>'}
        </div>
    `);
};

window.adminTopup = async () => {
    const email = document.getElementById('topupEmail').value.trim();
    const amount = Number(document.getElementById('topupAmount').value);
    const response = await fetch('/api/admin/topup', {
        method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include',
        body:JSON.stringify({email, amount})
    });
    const data = await response.json();
    alert(data.message || `Saldo ${email} berhasil ditambah.`);
    if (response.ok) openAdminModal();
};

window.adminStatus = async (id, status) => {
    const response = await fetch('/api/admin/orders/' + encodeURIComponent(id) + '/status', {
        method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include',
        body:JSON.stringify({status})
    });
    const data = await response.json();
    if (!response.ok) alert(data.message || 'Gagal mengubah status.');
    else renderOrders();
};

// Intersection Observer untuk render saat di-scroll
// Intersection Observer untuk render saat di-scroll
const observerOptions = { threshold: 0.1 };
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            if (entry.target.id === 'shopSection') renderShop();
            if (entry.target.id === 'ordersSection') renderOrders();
            if (entry.target.id === 'accountSection') renderAccount();
        }
    });
}, observerOptions);

observer.observe(sections.shop);
observer.observe(sections.orders);
observer.observe(sections.account);

// Initial render
loadProducts();
renderOrders();
renderAccount();
restoreSession();
