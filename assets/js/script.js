// ====== Product tabs ======
const tabButtons = document.querySelectorAll(".btn-tab");
const tabPanes = document.querySelectorAll(".tab-pane");

tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        // 1. Deactivate all buttons
        tabButtons.forEach((button) => {
            button.classList.remove("active");
        });

        // 2. Hide all panes
        tabPanes.forEach((pane) => {
            pane.classList.remove("active");
            pane.style.display = "none";
        });

        // 3. Activate the clicked button
        btn.classList.add("active");

        // 4. Show the matching pane
        const targetId = btn.getAttribute("data-target");
        const targetPane = document.getElementById(targetId);

        if (targetPane) {
            targetPane.classList.add("active");
            targetPane.style.display = "block";
        }
    });
});

// ====== Shopping cart ======
const CART_KEY = "foryou_cart";
let cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");

const cartBtn = document.getElementById("cartBtn");
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const cartClose = document.getElementById("cartClose");
const cartItemsEl = document.getElementById("cartItems");
const cartCountEl = document.getElementById("cartCount");
const cartSubtotalEl = document.getElementById("cartSubtotal");

function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function money(n) {
    return "$" + n.toFixed(2);
}

function renderCart() {
    cartItemsEl.innerHTML = "";

    if (cart.length === 0) {
        cartItemsEl.innerHTML = '<li class="cart-empty">Your cart is empty.</li>';
    } else {
        cart.forEach((item, index) => {
            const li = document.createElement("li");
            li.className = "cart-item";
            li.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <div class="cart-item-price">${money(item.price * item.qty)}</div>
                    <div class="cart-item-qty">
                        <button class="qty-decrease" data-index="${index}" aria-label="Decrease quantity">-</button>
                        <span>${item.qty}</span>
                        <button class="qty-increase" data-index="${index}" aria-label="Increase quantity">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" data-index="${index}" aria-label="Remove item">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            cartItemsEl.appendChild(li);
        });
    }

    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = cart.reduce((sum, item) => sum + item.qty * item.price, 0);

    cartCountEl.textContent = totalCount;
    cartSubtotalEl.textContent = money(subtotal);
    saveCart();
}

function openCart() {
    cartDrawer.classList.add("open");
    cartOverlay.classList.add("open");
    cartDrawer.setAttribute("aria-hidden", "false");
}

function closeCart() {
    cartDrawer.classList.remove("open");
    cartOverlay.classList.remove("open");
    cartDrawer.setAttribute("aria-hidden", "true");
}

function addToCart(product) {
    const existing = cart.find((item) => item.name === product.name);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({
            ...product,
            qty: 1
        });
    }
    renderCart();
    openCart();
}

if (cartBtn) {
    cartBtn.addEventListener("click", openCart);
    cartClose.addEventListener("click", closeCart);
    cartOverlay.addEventListener("click", closeCart);

    // Add-to-cart buttons (event delegation covers all tabs)
    document.addEventListener("click", (e) => {
        const addBtn = e.target.closest(".add-to-cart-btn");
        if (!addBtn) return;

        const card = addBtn.closest(".product-card");
        if (!card) return;

        const name = card.querySelector(".product-title").textContent.trim() || "Product";
        const priceText = card.querySelector(".price-current").textContent.replace(/[^0-9.]/g, "") || "0";
        const image = card.querySelector("img").getAttribute("src") || "";

        addToCart({
            name,
            price: parseFloat(priceText),
            image
        });
    });

    // Quantity +/- and remove, inside the drawer
    cartItemsEl.addEventListener("click", (e) => {
        const increaseBtn = e.target.closest(".qty-increase");
        const decreaseBtn = e.target.closest(".qty-decrease");
        const removeBtn = e.target.closest(".cart-item-remove");

        if (increaseBtn) {
            cart[increaseBtn.dataset.index].qty += 1;
        } else if (decreaseBtn) {
            const idx = decreaseBtn.dataset.index;
            cart[idx].qty -= 1;
            if (cart[idx].qty <= 0) cart.splice(idx, 1);
        } else if (removeBtn) {
            cart.splice(removeBtn.dataset.index, 1);
        } else {
            return;
        }

        renderCart();
    });

    renderCart();
}

// ====== Checkout button (demo only) ======
const checkoutBtn = document.getElementById("checkoutBtn");
if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
        if (cart.length === 0) return;
        const originalText = checkoutBtn.textContent;
        checkoutBtn.textContent = "Redirecting...";
        checkoutBtn.disabled = true;
        setTimeout(() => {
            checkoutBtn.textContent = originalText;
            checkoutBtn.disabled = false;
        }, 1500);
    });
}

// ====== Back to top ======
const backToTop = document.getElementById("backToTop");

if (backToTop) {
    window.addEventListener("scroll", () => {
        if (window.scrollY > 420) {
            backToTop.classList.add("show");
        } else {
            backToTop.classList.remove("show");
        }
    });

    backToTop.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}

// ====== Mobile hamburger menu ======
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.getElementById("navMenu");

if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
        const isOpen = navMenu.classList.toggle("open");
        navToggle.setAttribute("aria-expanded", isOpen);
        navToggle.innerHTML = isOpen ?
            '<i class="fas fa-times"></i>' :
            '<i class="fas fa-bars"></i>';
    });

    // Close the menu after tapping a link
    navMenu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            navMenu.classList.remove("open");
            navToggle.setAttribute("aria-expanded", "false");
            navToggle.innerHTML = '<i class="fas fa-bars"></i>';
        });
    });
}

// ====== Calm scroll-reveal animation (Intersection Observer) ======
const revealEls = document.querySelectorAll(".reveal, .reveal-stagger");

if ("IntersectionObserver" in window && revealEls.length) {
    const observer = new IntersectionObserver(
        (entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    obs.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: "0px 0px -40px 0px",
        }
    );

    revealEls.forEach((el) => observer.observe(el));
} else {
    // Fallback: if the browser doesn't support it, just show everything
    revealEls.forEach((el) => el.classList.add("is-visible"));
}

// ====== Contact form (prevents real submit - demo only) ======
const contactForm = document.querySelector(".contact-form");
if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector(".submit-btn");
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Sent!';
        btn.disabled = true;
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
            contactForm.reset();
        }, 2000);
    });
}

// ====== Footer newsletter form ======
const newsletterForm = document.querySelector(".footer-newsletter-form");
if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = newsletterForm.querySelector("input");
        const btn = newsletterForm.querySelector("button");
        const originalText = btn.textContent;
        btn.textContent = "Subscribed";
        setTimeout(() => {
            btn.textContent = originalText;
            input.value = "";
        }, 1800);
    });
}