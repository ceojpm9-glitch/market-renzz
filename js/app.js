// Data Produk
const products = [
    {
        id: 'quota',
        icon: '📦',
        category: 'QUOTA',
        name: 'Quota Add Owner',
        desc: 'Tambahkan quota sesuai kebutuhan.',
        price: 2000
    }
];

// Data Pesanan (simulasi)
const orders = [];

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

// Login Modal
const openLoginModal = () => {
    const content = `
        <h2>Login</h2>
        <p>Masukkan informasi akun kamu</p>
        <div class="modal-form">
            <input type="email" placeholder="Email" id="loginEmail">
            <input type="password" placeholder="Password" id="loginPassword">
            <button onclick="handleLogin()">Login</button>
        </div>
    `;
    openModal(content);
};

window.handleLogin = () => {
    const email = document.getElementById('loginEmail').value;
    if (email) {
        currentUser = { email, name: email.split('@')[0] };
        closeModal();
        renderAccount();
        showSection('account');
    }
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
        <div class="modal-form">
            <input type="number" placeholder="Jumlah" id="quantity" value="1">
            <button onclick="processPayment('${productId}', ${price})">Lanjutkan</button>
        </div>
    `;
    openModal(content);
};

// Process Payment
window.processPayment = (productId, price) => {
    const quantity = parseInt(document.getElementById('quantity').value) || 1;
    const product = products.find(p => p.id === productId);
    const total = price * quantity;

    const order = {
        id: 'ORD-' + Date.now(),
        product: product.name,
        quantity: quantity,
        total: total,
        status: 'Diproses',
        date: new Date().toLocaleDateString('id-ID')
    };

    orders.push(order);
    closeModal();

    const content = `
        <h2>Pesanan Berhasil!</h2>
        <p>Pesanan kamu telah diterima. ID: <strong>${order.id}</strong></p>
        <p>Total: <strong>Rp${total.toLocaleString('id-ID')}</strong></p>
        <div class="modal-form">
            <button onclick="closeModal()">Tutup</button>
        </div>
    `;
    openModal(content);
};

// Render Orders
const renderOrders = () => {
    if (!currentUser) {
        document.getElementById('ordersList').innerHTML = '<div class="empty">Silakan login untuk melihat pesanan</div>';
        return;
    }

    if (orders.length === 0) {
        document.getElementById('ordersList').innerHTML = '<div class="empty">Belum ada pesanan</div>';
        return;
    }

    let html = '';
    orders.forEach(order => {
        html += `
            <div class="order-card">
                <div class="order-top">
                    <span class="order-id">${order.id}</span>
                    <span class="order-status">● ${order.status}</span>
                </div>
                <h3>${order.product}</h3>
                <p>Qty: ${order.quantity} | Total: Rp${order.total.toLocaleString('id-ID')} | ${order.date}</p>
            </div>
        `;
    });
    document.getElementById('ordersList').innerHTML = html;
};

// Render Account
const renderAccount = () => {
    if (!currentUser) {
        document.getElementById('accountCard').innerHTML = `
            <p>Silakan login terlebih dahulu</p>
            <button class="btn primary" onclick="openLoginModal()" style="width: 100%; margin-top: 10px;">Login</button>
        `;
        return;
    }

    const html = `
        <div class="account-avatar">${currentUser.name.charAt(0).toUpperCase()}</div>
        <h3>${currentUser.name}</h3>
        <p>${currentUser.email}</p>
        <button class="logout" onclick="handleLogout()">Logout</button>
    `;
    document.getElementById('accountCard').innerHTML = html;
};

// Logout
window.handleLogout = () => {
    currentUser = null;
    renderAccount();
    showSection('home');
};

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
renderShop();
renderOrders();
renderAccount();
