/* =====================================================
   MARKET RENZZ
   Main Application
===================================================== */


/* =========================
   DATA PRODUK
========================= */

const products = [

    {
        id: "apikey",
        icon: "🔑",
        category: "APIKEY",
        name: "Apikey",
        desc: "Apikey untuk kebutuhan digital kamu.",
        price: 5
    },

    {
        id: "quota",
        icon: "📦",
        category: "QUOTA",
        name: "Quota Add Owner",
        desc: "Tambahkan quota sesuai kebutuhan.",
        price: 2000
    }

];


/* =========================
   DATA PESANAN
========================= */

const orders = [];


/* =========================
   USER
========================= */

let currentUser = null;


/* =========================
   DOM
========================= */

const menuBtn =
    document.getElementById("menuBtn");

const menuPanel =
    document.getElementById("menuPanel");

const modal =
    document.getElementById("modal");

const modalContent =
    document.getElementById("modalContent");

const modalClose =
    document.getElementById("modalClose");


/* =========================
   SECTIONS
========================= */

const sections = {

    home:
        document.getElementById("homeSection"),

    shop:
        document.getElementById("shopSection"),

    orders:
        document.getElementById("ordersSection"),

    account:
        document.getElementById("accountSection"),

    ai:
        document.getElementById("aiSection")

};


/* =========================
   NAV BUTTONS
========================= */

const navButtons =
    document.querySelectorAll(
        ".bottom-nav button"
    );


const menuButtons =
    document.querySelectorAll(
        ".menu-panel button"
    );


const pageButtons =
    document.querySelectorAll(
        ".back-btn"
    );


/* =========================
   MOBILE MENU
========================= */

if (menuBtn) {

    menuBtn.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            menuPanel.classList.toggle(
                "hidden"
            );

        }
    );

}


/* =========================
   CLOSE MENU
========================= */

document.addEventListener(
    "click",
    (event) => {

        if (
            !event.target.closest(
                ".menu-panel"
            ) &&
            !event.target.closest(
                ".menu-btn"
            )
        ) {

            menuPanel.classList.add(
                "hidden"
            );

        }

    }
);


/* =========================
   SHOW SECTION
========================= */

const showSection = (
    sectionName
) => {

    if (!sections[sectionName]) {
        sectionName = "home";
    }


    Object.values(sections).forEach(
        section => {

            section.classList.add(
                "hidden"
            );

        }
    );


    sections[sectionName]
        .classList.remove(
            "hidden"
        );


    /* Bottom navigation */

    navButtons.forEach(
        button => {

            button.classList.remove(
                "active"
            );

        }
    );


    const activeNav =
        document.querySelector(
            `.bottom-nav button[data-section="${sectionName}"]`
        );


    if (activeNav) {

        activeNav.classList.add(
            "active"
        );

    }


    /* Close menu */

    menuPanel.classList.add(
        "hidden"
    );


    /* Render */

    if (sectionName === "shop") {
        renderShop();
    }

    if (sectionName === "orders") {
        renderOrders();
    }

    if (sectionName === "account") {
        renderAccount();
    }

};


/* =========================
   NAVIGATION EVENTS
========================= */

navButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                const section =
                    button.getAttribute(
                        "data-section"
                    );

                showSection(
                    section
                );

            }
        );

    }
);


menuButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                const section =
                    button.getAttribute(
                        "data-section"
                    );

                showSection(
                    section
                );

            }
        );

    }
);


pageButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                const section =
                    button.getAttribute(
                        "data-section"
                    );

                showSection(
                    section
                );

            }
        );

    }
);


/* =========================
   LOGIN BUTTON
========================= */

const loginBtn =
    document.getElementById(
        "loginBtnDesktop"
    );


if (loginBtn) {

    loginBtn.addEventListener(
        "click",
        openLoginModal
    );

}


/* =========================
   ADMIN BUTTON
========================= */

const adminBtn =
    document.getElementById(
        "adminBtn"
    );


if (adminBtn) {

    adminBtn.addEventListener(
        "click",
        () => {

            openModal(`

                <h2>
                    Login Admin
                </h2>

                <p>
                    Halaman admin MARKET RENZZ.
                </p>

                <div class="modal-form">

                    <input
                        type="email"
                        placeholder="Email admin"
                        id="adminEmail"
                    >

                    <input
                        type="password"
                        placeholder="Password"
                        id="adminPassword"
                    >

                    <button
                        onclick="handleAdminLogin()"
                    >
                        Login Admin
                    </button>

                </div>

            `);

        }
    );

}


/* =========================
   ADMIN LOGIN
========================= */

window.handleAdminLogin =
    () => {

        const email =
            document.getElementById(
                "adminEmail"
            ).value;

        if (!email) {

            alert(
                "Masukkan email admin."
            );

            return;

        }


        closeModal();


        alert(
            "Login admin berhasil."
        );

    };


/* =========================
   OPEN MODAL
========================= */

const openModal =
    (content) => {

        modalContent.innerHTML =
            content;

        modal.classList.remove(
            "hidden"
        );

    };


/* =========================
   CLOSE MODAL
========================= */

const closeModal =
    () => {

        modal.classList.add(
            "hidden"
        );

        modalContent.innerHTML =
            "";

    };


window.closeModal =
    closeModal;


/* =========================
   MODAL CLOSE
========================= */

modalClose.addEventListener(
    "click",
    closeModal
);


modal.addEventListener(
    "click",
    (event) => {

        if (
            event.target === modal
        ) {

            closeModal();

        }

    }
);


/* =========================
   LOGIN MODAL
========================= */

const openLoginModal =
    () => {

        const content = `

            <h2>
                Masuk / Daftar
            </h2>

            <p>
                Masukkan informasi akun kamu
                untuk melanjutkan.
            </p>

            <div class="modal-form">

                <input
                    type="email"
                    placeholder="Email"
                    id="loginEmail"
                >

                <input
                    type="password"
                    placeholder="Password"
                    id="loginPassword"
                >

                <button
                    onclick="handleLogin()"
                >
                    Login
                </button>

            </div>

        `;


        openModal(
            content
        );

    };


window.openLoginModal =
    openLoginModal;


/* =========================
   HANDLE LOGIN
========================= */

window.handleLogin =
    () => {

        const email =
            document.getElementById(
                "loginEmail"
            ).value.trim();


        if (!email) {

            alert(
                "Masukkan email terlebih dahulu."
            );

            return;

        }


        currentUser = {

            email: email,

            name:
                email
                    .split("@")[0]

        };


        closeModal();


        renderAccount();


        showSection(
            "account"
        );

    };


/* =========================
   RENDER SHOP
========================= */

const renderShop =
    () => {

        const container =
            document.getElementById(
                "shopProducts"
            );


        let html = "";


        products.forEach(
            product => {

                html += `

                    <article
                        class="product"
                    >

                        <div
                            class="product-icon"
                        >
                            ${product.icon}
                        </div>


                        <div
                            class="product-info"
                        >

                            <span>
                                ${product.category}
                            </span>

                            <h3>
                                ${product.name}
                            </h3>

                            <p>
                                ${product.desc}
                            </p>

                            <strong>
                                Mulai Rp${product.price.toLocaleString("id-ID")}
                            </strong>

                        </div>


                        <button
                            class="buy"
                            onclick="buyProduct(
                                '${product.id}',
                                ${product.price}
                            )"
                        >
                            Beli
                        </button>

                    </article>

                `;

            }
        );


        container.innerHTML =
            html;

    };


/* =========================
   BUY PRODUCT
========================= */

window.buyProduct =
    (
        productId,
        price
    ) => {

        /* Harus login */

        if (!currentUser) {

            openLoginModal();

            return;

        }


        const product =
            products.find(
                item =>
                    item.id ===
                    productId
            );


        if (!product) {
            return;
        }


        const content = `

            <h2>
                Beli ${product.name}
            </h2>

            <p>
                Harga:
                <strong>
                    Rp${price.toLocaleString("id-ID")}
                </strong>
            </p>


            <div class="modal-form">

                <input
                    type="number"
                    min="1"
                    value="1"
                    placeholder="Jumlah"
                    id="quantity"
                >

                <button
                    onclick="
                        processPayment(
                            '${productId}',
                            ${price}
                        )
                    "
                >
                    Lanjutkan
                </button>

            </div>

        `;


        openModal(
            content
        );

    };


/* =========================
   PROCESS PAYMENT
========================= */

window.processPayment =
    (
        productId,
        price
    ) => {

        const quantityInput =
            document.getElementById(
                "quantity"
            );


        let quantity =
            parseInt(
                quantityInput.value
            );


        if (
            !quantity ||
            quantity < 1
        ) {

            quantity = 1;

        }


        const product =
            products.find(
                item =>
                    item.id ===
                    productId
            );


        if (!product) {
            return;
        }


        const total =
            price * quantity;


        const order = {

            id:
                "ORD-" +
                Date.now(),

            product:
                product.name,

            quantity:
                quantity,

            total:
                total,

            status:
                "Diproses",

            date:
                new Date()
                    .toLocaleDateString(
                        "id-ID"
                    )

        };


        orders.push(
            order
        );


        updateStats();


        closeModal();


        openModal(`

            <h2>
                Pesanan Berhasil!
            </h2>

            <p>
                Pesanan kamu telah diterima.
            </p>

            <p>
                ID:
                <strong>
                    ${order.id}
                </strong>
            </p>

            <p>
                Total:
                <strong>
                    Rp${total.toLocaleString("id-ID")}
                </strong>
            </p>

            <div class="modal-form">

                <button
                    onclick="
                        closeModal();
                        showSection('orders');
                    "
                >
                    Lihat Pesanan
                </button>

            </div>

        `);

    };


/* =========================
   RENDER ORDERS
========================= */

const renderOrders =
    () => {

        const container =
            document.getElementById(
                "ordersList"
            );


        if (!currentUser) {

            container.innerHTML = `

                <div class="empty">

                    Silakan login untuk
                    melihat pesanan.

                </div>

            `;

            return;

        }


        if (
            orders.length === 0
        ) {

            container.innerHTML = `

                <div class="empty">

                    Belum ada pesanan.

                </div>

            `;

            return;

        }


        let html = "";


        orders.forEach(
            order => {

                html += `

                    <div
                        class="order-card"
                    >

                        <div
                            class="order-top"
                        >

                            <span
                                class="order-id"
                            >
                                ${order.id}
                            </span>

                            <span
                                class="order-status"
                            >
                                ● ${order.status}
                            </span>

                        </div>


                        <h3>
                            ${order.product}
                        </h3>


                        <p>
                            Qty:
                            ${order.quantity}
                            &nbsp; | &nbsp;

                            Total:
                            Rp${order.total.toLocaleString("id-ID")}

                            &nbsp; | &nbsp;

                            ${order.date}
                        </p>

                    </div>

                `;

            }
        );


        container.innerHTML =
            html;

    };


/* =========================
   RENDER ACCOUNT
========================= */

const renderAccount =
    () => {

        const container =
            document.getElementById(
                "accountCard"
            );


        if (!currentUser) {

            container.innerHTML = `

                <p>
                    Silakan login terlebih dahulu.
                </p>

                <button
                    class="buy"
                    style="margin-top:18px;"
                    onclick="openLoginModal()"
                >
                    Login
                </button>

            `;

            return;

        }


        const firstLetter =
            currentUser.name
                .charAt(0)
                .toUpperCase();


        container.innerHTML = `

            <div
                class="account-avatar"
            >
                ${firstLetter}
            </div>


            <h3>
                ${currentUser.name}
            </h3>


            <p>
                ${currentUser.email}
            </p>


            <button
                class="logout"
                onclick="handleLogout()"
            >
                Logout
            </button>

        `;

    };


/* =========================
   LOGOUT
========================= */

window.handleLogout =
    () => {

        currentUser = null;

        renderAccount();

        showSection(
            "home"
        );

    };


/* =========================
   AI BUTTON
========================= */

const aiBtn =
    document.getElementById(
        "aiBtn"
    );


if (aiBtn) {

    aiBtn.addEventListener(
        "click",
        openAIModal
    );

}


/* =========================
   AI MODAL
========================= */

window.openAIModal =
    () => {

        openModal(`

            <h2>
                ✦ AI World
            </h2>

            <p>
                Halo! Saya AI World
                dari MARKET RENZZ.
            </p>

            <div class="modal-form">

                <input
                    type="text"
                    placeholder="Tulis pesan..."
                    id="aiMessage"
                >

                <button
                    onclick="sendAIMessage()"
                >
                    Kirim
                </button>

            </div>

        `);

    };


/* =========================
   AI MESSAGE
========================= */

window.sendAIMessage =
    () => {

        const input =
            document.getElementById(
                "aiMessage"
            );


        const message =
            input.value.trim();


        if (!message) {

            alert(
                "Tulis pesan terlebih dahulu."
            );

            return;

        }


        openModal(`

            <h2>
                ✦ AI World
            </h2>

            <p>
                Kamu bertanya:
            </p>

            <p>
                <strong>
                    "${escapeHTML(message)}"
                </strong>
            </p>

            <p>
                AI World siap membantu.
                Hubungkan API AI kamu
                untuk mengaktifkan
                percakapan sebenarnya.
            </p>

            <div class="modal-form">

                <button
                    onclick="closeModal()"
                >
                    Tutup
                </button>

            </div>

        `);

    };


/* =========================
   ESCAPE HTML
========================= */

function escapeHTML(
    text
) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        text;

    return div.innerHTML;

}


/* =========================
   UPDATE STATS
========================= */

const updateStats =
    () => {

        const apikeySold =
            document.getElementById(
                "apikeySold"
            );


        const quotaActive =
            document.getElementById(
                "quotaActive"
            );


        let apikeyTotal = 0;

        let quotaTotal = 0;


        orders.forEach(
            order => {

                if (
                    order.product ===
                    "Apikey"
                ) {

                    apikeyTotal +=
                        order.quantity;

                }


                if (
                    order.product ===
                    "Quota Add Owner"
                ) {

                    quotaTotal +=
                        order.quantity;

                }

            }
        );


        if (apikeySold) {

            apikeySold.textContent =
                apikeyTotal;

        }


        if (quotaActive) {

            quotaActive.textContent =
                quotaTotal;

        }

    };


/* =========================
   HOME BUY BUTTONS
========================= */

document
    .querySelectorAll(
        ".buy[data-product]"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const productId =
                        button.dataset.product;

                    const price =
                        Number(
                            button.dataset.price
                        );

                    buyProduct(
                        productId,
                        price
                    );

                }
            );

        }
    );


/* =========================
   INITIAL
========================= */

renderShop();

renderOrders();

renderAccount();

updateStats();

showSection(
    "home"
);
