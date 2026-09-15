const $ = (selector) => document.querySelector(selector);

const $$ = (selector) => document.querySelectorAll(selector);


/* =========================
   DATA
========================= */

const products = {
    apikey: {
        name: "Apikey",
        price: 5,
        icon: "🔑"
    },

    quota: {
        name: "Quota Add Owner",
        price: 2000,
        icon: "📦"
    }
};


/* =========================
   STORAGE
========================= */

function getUsers() {
    return JSON.parse(
        localStorage.getItem("market_users") || "[]"
    );
}

function saveUsers(users) {
    localStorage.setItem(
        "market_users",
        JSON.stringify(users)
    );
}

function getOrders() {
    return JSON.parse(
        localStorage.getItem("market_orders") || "[]"
    );
}

function saveOrders(orders) {
    localStorage.setItem(
        "market_orders",
        JSON.stringify(orders)
    );
}

function getCurrentUser() {
    return JSON.parse(
        localStorage.getItem("market_current_user") || "null"
    );
}

function setCurrentUser(user) {
    localStorage.setItem(
        "market_current_user",
        JSON.stringify(user)
    );
}

function logout() {
    localStorage.removeItem("market_current_user");

    renderAccount();

    showSection("home");
}


/* =========================
   MODAL
========================= */

function openModal(content) {

    $("#modalContent").innerHTML = content;

    $("#modal").classList.remove("hidden");
}

function closeModal() {
    $("#modal").classList.add("hidden");
}

$("#modalClose").onclick = closeModal;

$("#modal").onclick = (event) => {

    if (event.target === $("#modal")) {
        closeModal();
    }

};


/* =========================
   NAVIGATION
========================= */

function showSection(section) {

    const sections = [
        "home",
        "shop",
        "orders",
        "account"
    ];

    sections.forEach((name) => {

        const element = $(`#${name}Section`);

        if (element) {
            element.classList.toggle(
                "hidden",
                name !== section
            );
        }

    });


    $$(".bottom-nav button").forEach((button) => {

        button.classList.toggle(
            "active",
            button.dataset.section === section
        );

    });


    $("#menuPanel").classList.add("hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    if (section === "shop") {
        renderShop();
    }

    if (section === "orders") {
        renderOrders();
    }

    if (section === "account") {
        renderAccount();
    }
}


$$("[data-section]").forEach((button) => {

    button.addEventListener("click", () => {

        showSection(
            button.dataset.section
        );

    });

});


/* =========================
   MENU
========================= */

$("#menuBtn").onclick = () => {

    $("#menuPanel").classList.toggle("hidden");

};


/* =========================
   LOGIN
========================= */

function showLogin() {

    openModal(`

        <h2>Login</h2>

        <p>
            Masuk ke akun Market Renzz kamu.
        </p>

        <form class="modal-form" id="loginForm">

            <input
                type="email"
                id="loginEmail"
                placeholder="Email"
                required
            >

            <input
                type="password"
                id="loginPassword"
                placeholder="Password"
                required
            >

            <button type="submit">
                Masuk
            </button>

        </form>

        <p style="text-align:center;margin-top:15px">
            Belum punya akun?
            <button
                id="registerSwitch"
                style="
                    background:none;
                    color:#9b83ff;
                "
            >
                Daftar
            </button>
        </p>

    `);


    $("#loginForm").onsubmit = (event) => {

        event.preventDefault();

        const email =
            $("#loginEmail").value
            .trim()
            .toLowerCase();

        const password =
            $("#loginPassword").value;


        const user = getUsers().find(
            (item) =>
                item.email === email &&
                item.password === password
        );


        if (!user) {

            alert(
                "Email atau password salah."
            );

            return;
        }


        setCurrentUser(user);

        closeModal();

        renderAccount();

        alert(
            `Selamat datang, ${user.name}!`
        );

    };


    $("#registerSwitch").onclick =
        showRegister;
}


$("#loginBtn").onclick = showLogin;


/* =========================
   REGISTER
========================= */

function showRegister() {

    openModal(`

        <h2>Buat Akun</h2>

        <p>
            Daftar akun baru di Market Renzz.
        </p>

        <form class="modal-form" id="registerForm">

            <input
                type="text"
                id="registerName"
                placeholder="Nama"
                required
            >

            <input
                type="email"
                id="registerEmail"
                placeholder="Email"
                required
            >

            <input
                type="password"
                id="registerPassword"
                placeholder="Password"
                minlength="6"
                required
            >

            <button type="submit">
                Daftar
            </button>

        </form>

        <p style="text-align:center;margin-top:15px">
            Sudah punya akun?
            <button
                id="loginSwitch"
                style="
                    background:none;
                    color:#9b83ff;
                "
            >
                Login
            </button>
        </p>

    `);


    $("#registerForm").onsubmit =
        (event) => {

            event.preventDefault();


            const name =
                $("#registerName").value.trim();

            const email =
                $("#registerEmail")
                .value
                .trim()
                .toLowerCase();

            const password =
                $("#registerPassword").value;


            const users = getUsers();


            if (
                users.some(
                    (user) =>
                        user.email === email
                )
            ) {

                alert(
                    "Email sudah terdaftar."
                );

                return;
            }


            const user = {

                id:
                    "USR" +
                    Date.now(),

                name,

                email,

                password,

                createdAt:
                    new Date().toISOString()

            };


            users.push(user);

            saveUsers(users);

            setCurrentUser(user);

            closeModal();

            renderAccount();

            alert(
                "Akun berhasil dibuat!"
            );

        };


    $("#loginSwitch").onclick =
        showLogin;

}


/* =========================
   SHOP
========================= */

function renderShop() {

    $("#shopProducts").innerHTML = `

        ${Object.entries(products)
            .map(([id, product]) => `

            <div class="product"
                 style="margin-bottom:12px">

                <div class="product-icon">
                    ${product.icon}
                </div>

                <div class="product-info">

                    <span>PRODUCT</span>

                    <h3>
                        ${product.name}
                    </h3>

                    <p>
                        Produk digital
                        Market Renzz.
                    </p>

                    <strong>
                        Rp${formatPrice(product.price)}
                    </strong>

                </div>

                <button
                    class="buy"
                    onclick="buyProduct('${id}')"
                >
                    Beli
                </button>

            </div>

        `)
        .join("")}

    `;
}


function buyProduct(productId) {

    const user = getCurrentUser();

    if (!user) {

        showLogin();

        return;
    }


    const product =
        products[productId];


    openModal(`

        <h2>
            ${product.icon}
            ${product.name}
        </h2>

        <p>
            Harga:
            <b>
                Rp${formatPrice(product.price)}
            </b>
        </p>

        <form
            class="modal-form"
            id="buyForm"
        >

            <input
                type="number"
                id="quantity"
                min="1"
                value="1"
                required
            >

            <button type="submit">
                Buat Pesanan
            </button>

        </form>

    `);


    $("#buyForm").onsubmit =
        (event) => {

            event.preventDefault();


            const quantity =
                Number(
                    $("#quantity").value
                );


            if (quantity < 1) {
                return;
            }


            const order = {

                id:
                    "MR" +
                    Date.now(),

                userId:
                    user.id,

                product:
                    product.name,

                quantity,

                total:
                    product.price *
                    quantity,

                status:
                    "MENUNGGU PEMBAYARAN",

                createdAt:
                    new Date().toISOString()

            };


            const orders =
                getOrders();


            orders.unshift(order);

            saveOrders(orders);

            closeModal();

            showSection("orders");

            alert(
                "Pesanan berhasil dibuat!"
            );

        };

}


/* =========================
   BUY BUTTON HOME
========================= */

$$(".buy").forEach((button) => {

    button.addEventListener(
        "click",
        () => {

            buyProduct(
                button.dataset.product
            );

        }
    );

});


$("#shopBtn").onclick = () => {
    showSection("shop");
};

$("#allProductBtn").onclick = () => {
    showSection("shop");
};


/* =========================
   ORDERS
========================= */

function renderOrders() {

    const user =
        getCurrentUser();


    if (!user) {

        $("#ordersList").innerHTML = `

            <div class="empty">

                <p>
                    Login untuk melihat
                    pesanan kamu.
                </p>

                <button
                    class="btn primary"
                    style="margin-top:15px"
                    onclick="showLogin()"
                >
                    Login
                </button>

            </div>

        `;

        return;
    }


    const orders =
        getOrders().filter(
            (order) =>
                order.userId === user.id
        );


    if (!orders.length) {

        $("#ordersList").innerHTML = `

            <div class="empty">

                Belum ada pesanan.

            </div>

        `;

        return;
    }


    $("#ordersList").innerHTML =
        orders.map((order) => `

            <div class="order-card">

                <div class="order-top">

                    <span class="order-id">
                        ${order.id}
                    </span>

                    <span class="order-status">
                        ${order.status}
                    </span>

                </div>

                <h3>
                    ${order.product}
                </h3>

                <p>
                    Jumlah:
                    ${order.quantity}
                </p>

                <p>
                    Total:
                    <b>
                        Rp${formatPrice(order.total)}
                    </b>
                </p>

            </div>

        `).join("");

}


/* =========================
   ACCOUNT
========================= */

function renderAccount() {

    const user =
        getCurrentUser();


    if (!user) {

        $("#accountCard").innerHTML = `

            <div class="account-avatar">
                ?
            </div>

            <h3>
                Belum Login
            </h3>

            <p>
                Login untuk menggunakan
                akun Market Renzz.
            </p>

            <button
                class="btn primary"
                style="
                    width:100%;
                    margin-top:20px;
                "
                onclick="showLogin()"
            >
                Login
            </button>

        `;

        return;
    }


    $("#accountCard").innerHTML = `

        <div class="account-avatar">
            ${user.name
                .charAt(0)
                .toUpperCase()}
        </div>

        <h3>
            ${user.name}
        </h3>

        <p>
            ${user.email}
        </p>

        <p>
            ID:
            ${user.id}
        </p>

        <button
            class="logout"
            onclick="logout()"
        >
            Keluar dari akun
        </button>

    `;

}


/* =========================
   FORMAT
========================= */

function formatPrice(number) {

    return new Intl.NumberFormat(
        "id-ID"
    ).format(number);

}


/* =========================
   START
========================= */

renderAccount();

showSection("home");
