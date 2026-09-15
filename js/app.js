document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modal");
    const closeModal = document.getElementById("closeModal");
    const modalOk = document.getElementById("modalOk");
    const modalTitle = document.getElementById("modalTitle");
    const modalText = document.getElementById("modalText");

    const loginBtn = document.getElementById("loginBtn");
    const adminBtn = document.getElementById("adminBtn");
    const aiBtn = document.getElementById("aiBtn");
    const ordersBtn = document.getElementById("ordersBtn");

    const buyButtons = document.querySelectorAll(".buy-btn");

    function showModal(title, text) {
        modalTitle.textContent = title;
        modalText.textContent = text;
        modal.classList.remove("hidden");
    }

    function hideModal() {
        modal.classList.add("hidden");
    }

    loginBtn?.addEventListener("click", () => {
        showModal(
            "Masuk / Daftar",
            "Fitur login dan pendaftaran akan tersedia setelah backend Market Renzz dipasang."
        );
    });

    adminBtn?.addEventListener("click", () => {
        showModal(
            "Login Admin",
            "Halaman admin belum tersedia. Fitur ini akan disambungkan ke backend."
        );
    });

    aiBtn?.addEventListener("click", () => {
        showModal(
            "AI Renzz",
            "AI Renzz siap digunakan setelah sistem AI disambungkan."
        );
    });

    ordersBtn?.addEventListener("click", () => {
        showModal(
            "Pesanan Saya",
            "Belum ada sistem pesanan. Pesanan akan muncul setelah backend aktif."
        );
    });

    buyButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const product = button.dataset.product || "Produk";

            if (product === "Apikey") {
                showModal(
                    "Beli Apikey",
                    "Sistem pembelian apikey belum terhubung ke payment gateway."
                );
            } else if (product === "Quota") {
                showModal(
                    "Beli Quota",
                    "Sistem pembelian quota belum terhubung ke payment gateway."
                );
            } else {
                showModal(
                    product,
                    "Produk ini belum tersedia untuk pembelian."
                );
            }
        });
    });

    closeModal?.addEventListener("click", hideModal);
    modalOk?.addEventListener("click", hideModal);

    modal?.addEventListener("click", (event) => {
        if (event.target === modal) {
            hideModal();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            hideModal();
        }
    });

    document.querySelectorAll(".nav-item").forEach((item) => {
        item.addEventListener("click", () => {
            document.querySelectorAll(".nav-item").forEach((nav) => {
                nav.classList.remove("active");
            });

            item.classList.add("active");
        });
    });
});
