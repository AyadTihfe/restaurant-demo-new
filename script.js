/* ==========================================
   TASTE RESTAURANT
   Main JavaScript
========================================== */


/* ==========================================
   SETTINGS
========================================== */

const WHATSAPP_NUMBER = "96181832518";

const DELIVERY_FEE = 3;

const FREE_DELIVERY_LIMIT = 50;


/* ==========================================
   HELPERS
========================================== */

const $ = (selector, parent = document) =>
    parent.querySelector(selector);

const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];


function getPrice(text) {
    const match = String(text).match(/[\d]+(?:\.\d{1,2})?/);

    return match ? Number(match[0]) : 0;
}


function getDishName(card) {
    return $(".item-name h4", card)?.textContent.trim() || "Dish";
}


function getDishPrice(card) {
    return getPrice($(".item-name strong", card)?.textContent || "0");
}


function getDishImage(card) {
    return $("img", card)?.src || "";
}


function getDishDescription(card) {
    return $(".menu-info p", card)?.textContent.trim() || "";
}


function getDishCategory(card) {
    return card.closest(".menu-category")
        ?.querySelector(".category-title h3")
        ?.textContent.trim() || "Menu";
}


function showToast(message) {
    const toast = $("#extraToast");

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}


/* ==========================================
   MOBILE NAVIGATION
========================================== */

const menuToggle = $("#menuToggle");
const navMenu = $("#navMenu");

if (menuToggle && navMenu) {

    menuToggle.addEventListener("click", () => {
        navMenu.classList.toggle("active");
    });

    $$(".nav-links a, .nav-actions a", navMenu).forEach(link => {

        link.addEventListener("click", () => {
            navMenu.classList.remove("active");
        });

    });

}


/* ==========================================
   CATEGORY FILTERS
========================================== */

const filterButtons = $$(".extra-filter");
const menuCategories = $$(".menu-category");
const searchInput = $("#dishSearch");

let activeFilter = "all";


function normalizeText(value) {
    return String(value)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "");
}


function getCategoryKey(categoryName) {

    const name = normalizeText(categoryName);

    if (
        name.includes("starter") ||
        name.includes("appetizer")
    ) {
        return "starters";
    }

    if (name.includes("burger")) {
        return "burgers";
    }

    if (name.includes("pizza")) {
        return "pizza";
    }

    if (name.includes("sushi")) {
        return "sushi";
    }

    if (
        name.includes("main") ||
        name.includes("dish") ||
        name.includes("steak") ||
        name.includes("chicken")
    ) {
        return "mains";
    }

    if (
        name.includes("dessert") ||
        name.includes("sweet") ||
        name.includes("cake")
    ) {
        return "desserts";
    }

    if (
        name.includes("drink") ||
        name.includes("beverage") ||
        name.includes("juice")
    ) {
        return "drinks";
    }

    return name;
}


function applyMenuFilters() {

    const searchTerm = normalizeText(
        searchInput?.value || ""
    );

    menuCategories.forEach(category => {

        const categoryName =
            $(".category-title h3", category)?.textContent || "";

        const categoryKey = getCategoryKey(categoryName);

        const cards = $$(".menu-item", category);

        let visibleCount = 0;

        const categoryMatches =
            activeFilter === "all" ||
            categoryKey === activeFilter;

        cards.forEach(card => {

            const searchableText = normalizeText(
                getDishName(card) + " " +
                getDishDescription(card) + " " +
                categoryName
            );

            const searchMatches =
                searchableText.includes(searchTerm);

            const visible =
                categoryMatches && searchMatches;

            card.classList.toggle("hidden", !visible);

            if (visible) {
                visibleCount++;
            }

        });

        category.classList.toggle(
            "category-hidden",
            visibleCount === 0
        );

    });

}


filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        filterButtons.forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        activeFilter = button.dataset.filter || "all";

        applyMenuFilters();

    });

});


if (searchInput) {
    searchInput.addEventListener("input", applyMenuFilters);
}


/* ==========================================
   DISH DETAILS
========================================== */

const dishModal = $("#dishModal");
const dishModalClose = $("#dishModalClose");
const dishModalImage = $("#dishModalImage");
const dishModalTitle = $("#dishModalTitle");
const dishModalCategory = $("#dishModalCategory");
const dishModalDescription = $("#dishModalDescription");
const dishModalPrice = $("#dishModalPrice");
const dishModalCalories = $("#dishModalCalories");
const dishModalIngredients = $("#dishModalIngredients");
const dishModalAdd = $("#dishModalAdd");

let selectedDish = null;


const ingredientDatabase = {

    burger: [
        "Fresh burger bun",
        "Beef patty",
        "Fresh lettuce",
        "Tomato",
        "House sauce"
    ],

    pizza: [
        "Pizza dough",
        "Tomato sauce",
        "Mozzarella cheese",
        "Fresh herbs"
    ],

    sushi: [
        "Sushi rice",
        "Seafood or vegetables",
        "Nori seaweed",
        "Rice vinegar"
    ],

    chicken: [
        "Chicken",
        "Seasoning",
        "Olive oil",
        "Fresh vegetables"
    ],

    steak: [
        "Beef steak",
        "Black pepper",
        "Salt",
        "House seasoning"
    ],

    dessert: [
        "Sugar",
        "Cream",
        "Flour",
        "Chocolate or fruit"
    ],

    drink: [
        "Fresh ingredients",
        "Ice",
        "Fruit or coffee"
    ],

    default: [
        "Fresh ingredients",
        "House seasoning",
        "Special restaurant sauce"
    ]

};


function getIngredients(name, category) {

    const value = normalizeText(name + category);

    if (value.includes("burger")) {
        return ingredientDatabase.burger;
    }

    if (value.includes("pizza")) {
        return ingredientDatabase.pizza;
    }

    if (value.includes("sushi") || value.includes("roll")) {
        return ingredientDatabase.sushi;
    }

    if (value.includes("chicken")) {
        return ingredientDatabase.chicken;
    }

    if (value.includes("steak") || value.includes("beef")) {
        return ingredientDatabase.steak;
    }

    if (
        value.includes("cake") ||
        value.includes("dessert") ||
        value.includes("cheese")
    ) {
        return ingredientDatabase.dessert;
    }

    if (
        value.includes("juice") ||
        value.includes("coffee") ||
        value.includes("drink")
    ) {
        return ingredientDatabase.drink;
    }

    return ingredientDatabase.default;

}


function getEstimatedCalories(name) {

    const value = normalizeText(name);

    if (value.includes("burger")) return 650;
    if (value.includes("pizza")) return 750;
    if (value.includes("sushi")) return 420;
    if (value.includes("steak")) return 580;
    if (value.includes("chicken")) return 490;
    if (value.includes("cake")) return 430;
    if (value.includes("cheesecake")) return 460;
    if (value.includes("juice")) return 160;
    if (value.includes("coffee")) return 90;

    return 350;

}


function openDishModal(card) {

    if (!dishModal) return;

    selectedDish = {
        name: getDishName(card),
        price: getDishPrice(card),
        image: getDishImage(card),
        description: getDishDescription(card),
        category: getDishCategory(card)
    };

    dishModalImage.src = selectedDish.image;
    dishModalImage.alt = selectedDish.name;

    dishModalTitle.textContent = selectedDish.name;

    dishModalCategory.textContent =
        selectedDish.category.toUpperCase();

    dishModalDescription.textContent =
        selectedDish.description;

    dishModalPrice.textContent =
        "$" + selectedDish.price.toFixed(2);

    dishModalCalories.textContent =
        getEstimatedCalories(selectedDish.name) + " kcal";

    dishModalIngredients.innerHTML = "";

    getIngredients(
        selectedDish.name,
        selectedDish.category
    ).forEach(ingredient => {

        const li = document.createElement("li");

        li.textContent = ingredient;

        dishModalIngredients.appendChild(li);

    });

    dishModal.classList.add("active");

    dishModal.setAttribute("aria-hidden", "false");

    document.body.classList.add("modal-open");

}


function closeDishModal() {

    if (!dishModal) return;

    dishModal.classList.remove("active");

    dishModal.setAttribute("aria-hidden", "true");

    document.body.classList.remove("modal-open");

    selectedDish = null;

}


$$(".menu-item").forEach(card => {

    card.addEventListener("click", event => {

        if (event.target.closest("button, a")) return;

        openDishModal(card);

    });

});


if (dishModalClose) {
    dishModalClose.addEventListener("click", closeDishModal);
}


if (dishModal) {

    dishModal.addEventListener("click", event => {

        if (event.target === dishModal) {
            closeDishModal();
        }

    });

}


/* ==========================================
   SHOPPING CART
========================================== */

const cartToggle = $("#extraCartToggle");
const cartDrawer = $("#extraCart");
const cartClose = $("#extraCartClose");
const cartBackdrop = $("#extraCartBackdrop");

const cartItemsContainer = $("#extraCartItems");

const cartCount = $("#extraCartCount");
const cartFloatCount = $("#extraCartFloatCount");

const subtotalElement = $("#extraSubtotal");
const deliveryElement = $("#extraDelivery");
const totalElement = $("#extraTotal");

const orderTypeSelect = $("#extraOrderType");
const addressInput = $("#extraAddress");

const checkoutButton = $("#extraCheckout");


let cart = [];


function loadCart() {

    try {

        const savedCart = localStorage.getItem("tasteRestaurantCart");

        if (savedCart) {

            const parsed = JSON.parse(savedCart);

            if (Array.isArray(parsed)) {
                cart = parsed;
            }

        }

    } catch (error) {

        console.error("Could not load cart:", error);

        cart = [];

    }

}


function saveCart() {

    try {

        localStorage.setItem(
            "tasteRestaurantCart",
            JSON.stringify(cart)
        );

    } catch (error) {

        console.error("Could not save cart:", error);

    }

}


function openCart() {

    cartDrawer?.classList.add("active");

    cartBackdrop?.classList.add("active");

    cartDrawer?.setAttribute("aria-hidden", "false");

    document.body.classList.add("cart-open");

}


function closeCart() {

    cartDrawer?.classList.remove("active");

    cartBackdrop?.classList.remove("active");

    cartDrawer?.setAttribute("aria-hidden", "true");

    document.body.classList.remove("cart-open");

}


cartToggle?.addEventListener("click", openCart);

cartClose?.addEventListener("click", closeCart);

cartBackdrop?.addEventListener("click", closeCart);


function addToCart(dish) {

    if (!dish || !dish.name) return;

    const existingItem = cart.find(item => item.name === dish.name);

    if (existingItem) {

        existingItem.quantity++;

    } else {

        cart.push({
            name: dish.name,
            price: Number(dish.price),
            image: dish.image,
            quantity: 1
        });

    }

    saveCart();

    renderCart();

    showToast(dish.name + " added to cart");

}


function changeQuantity(index, amount) {

    if (!cart[index]) return;

    cart[index].quantity += amount;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    saveCart();

    renderCart();

}


function removeCartItem(index) {

    cart.splice(index, 1);

    saveCart();

    renderCart();

    showToast("Item removed");

}


function getCartSubtotal() {

    return cart.reduce((total, item) => {

        return total + item.price * item.quantity;

    }, 0);

}


function getCartQuantity() {

    return cart.reduce((total, item) => {

        return total + item.quantity;

    }, 0);

}


function getDeliveryFee(subtotal) {

    if (orderTypeSelect?.value === "pickup") {
        return 0;
    }

    if (subtotal >= FREE_DELIVERY_LIMIT) {
        return 0;
    }

    return DELIVERY_FEE;

}


function renderCart() {

    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = "";

    if (cart.length === 0) {

        const emptyMessage = document.createElement("p");

        emptyMessage.className = "extra-empty";

        emptyMessage.textContent = "Your cart is empty.";

        cartItemsContainer.appendChild(emptyMessage);

    } else {

        cart.forEach((item, index) => {

            const itemElement = document.createElement("div");

            itemElement.className = "extra-cart-item";

            const image = document.createElement("img");

            image.src = item.image;

            image.alt = item.name;

            const details = document.createElement("div");

            const title = document.createElement("h4");

            title.textContent = item.name;

            const price = document.createElement("p");

            price.textContent =
                "$" + (item.price * item.quantity).toFixed(2);

            const quantityControls = document.createElement("div");

            quantityControls.className = "extra-cart-qty";

            const minus = document.createElement("button");

            minus.type = "button";

            minus.textContent = "−";

            minus.setAttribute("aria-label", "Decrease quantity");

            minus.addEventListener("click", () => {
                changeQuantity(index, -1);
            });

            const quantity = document.createElement("span");

            quantity.textContent = item.quantity;

            const plus = document.createElement("button");

            plus.type = "button";

            plus.textContent = "+";

            plus.setAttribute("aria-label", "Increase quantity");

            plus.addEventListener("click", () => {
                changeQuantity(index, 1);
            });

            quantityControls.append(minus, quantity, plus);

            details.append(title, price, quantityControls);

            const remove = document.createElement("button");

            remove.type = "button";

            remove.className = "extra-cart-remove";

            remove.textContent = "Remove";

            remove.addEventListener("click", () => {
                removeCartItem(index);
            });

            itemElement.append(image, details, remove);

            cartItemsContainer.appendChild(itemElement);

        });

    }


    const quantity = getCartQuantity();

    const subtotal = getCartSubtotal();

    const delivery = getDeliveryFee(subtotal);

    const total = subtotal + delivery;


    if (cartCount) {
        cartCount.textContent = quantity;
    }

    if (cartFloatCount) {
        cartFloatCount.textContent = quantity;
    }

    if (subtotalElement) {
        subtotalElement.textContent = "$" + subtotal.toFixed(2);
    }

    if (deliveryElement) {
        deliveryElement.textContent =
            delivery === 0 && orderTypeSelect?.value !== "pickup"
                ? "FREE"
                : "$" + delivery.toFixed(2);
    }

    if (totalElement) {
        totalElement.textContent = "$" + total.toFixed(2);
    }

    if (checkoutButton) {
        checkoutButton.disabled = cart.length === 0;
    }

}


if (dishModalAdd) {

    dishModalAdd.addEventListener("click", () => {

        if (!selectedDish) return;

        addToCart(selectedDish);

        closeDishModal();

    });

}


/* ==========================================
   ORDER TYPE
========================================== */

orderTypeSelect?.addEventListener("change", () => {

    const isDelivery = orderTypeSelect.value === "delivery";

    if (addressInput) {

        addressInput.disabled = !isDelivery;

        addressInput.placeholder = isDelivery
            ? "Enter your delivery address"
            : "Not required for pickup";

        if (!isDelivery) {
            addressInput.value = "";
        }

    }

    renderCart();

});


/* ==========================================
   WHATSAPP CHECKOUT
========================================== */

function checkoutWhatsApp() {

    if (cart.length === 0) {

        showToast("Your cart is empty");

        return;

    }

    const orderType = orderTypeSelect?.value || "delivery";

    const address = addressInput?.value.trim() || "";

    if (orderType === "delivery" && address.length < 4) {

        showToast("Please enter your delivery address");

        addressInput?.focus();

        return;

    }

    const subtotal = getCartSubtotal();

    const delivery = getDeliveryFee(subtotal);

    const total = subtotal + delivery;

    let message = "Hello TASTE! I would like to place an order:\n\n";

    cart.forEach(item => {

        message +=
            "• " +
            item.name +
            " x" +
            item.quantity +
            " = $" +
            (item.price * item.quantity).toFixed(2) +
            "\n";

    });

    message += "\n----------------------\n";

    message += "Order type: " +
        (orderType === "delivery" ? "Delivery" : "Pickup") +
        "\n";

    if (orderType === "delivery") {
        message += "Address: " + address + "\n";
    }

    message += "Subtotal: $" + subtotal.toFixed(2) + "\n";

    message += "Delivery: " +
        (delivery === 0 ? "FREE" : "$" + delivery.toFixed(2)) +
        "\n";

    message += "TOTAL: $" + total.toFixed(2);

    const whatsappURL =
        "https://wa.me/" +
        WHATSAPP_NUMBER +
        "?text=" +
        encodeURIComponent(message);

    window.open(whatsappURL, "_blank");

}


checkoutButton?.addEventListener("click", checkoutWhatsApp);


/* ==========================================
   GALLERY LIGHTBOX
========================================== */

const galleryLightbox = $("#extraGalleryLightbox");

const galleryLightboxImage = $("#extraGalleryImage");

const galleryClose = $("#extraGalleryClose");


$$(".gallery-item img").forEach(image => {

    image.addEventListener("click", () => {

        if (!galleryLightbox || !galleryLightboxImage) return;

        galleryLightboxImage.src = image.src;

        galleryLightboxImage.alt = image.alt;

        galleryLightbox.classList.add("active");

        galleryLightbox.setAttribute("aria-hidden", "false");

    });

});


function closeGalleryLightbox() {

    galleryLightbox?.classList.remove("active");

    galleryLightbox?.setAttribute("aria-hidden", "true");

}


galleryClose?.addEventListener("click", closeGalleryLightbox);


galleryLightbox?.addEventListener("click", event => {

    if (event.target === galleryLightbox) {
        closeGalleryLightbox();
    }

});


/* ==========================================
   RESERVATION FORM
========================================== */

const reservationForm = $(".reservation-form");


reservationForm?.addEventListener("submit", event => {

    event.preventDefault();

    const name = $("#name")?.value.trim() || "";

    const phone = $("#phone")?.value.trim() || "";

    const date = $("#date")?.value || "";

    const time = $("#time")?.value || "";

    const guests = $("#guests")?.value || "";

    const message = $("#message")?.value.trim() || "";


    if (!name || !phone || !date || !time || !guests) {

        showToast("Please complete all required fields");

        return;

    }


    let whatsappMessage =
        "Hello TASTE! I would like to make a reservation.\n\n";

    whatsappMessage += "Name: " + name + "\n";

    whatsappMessage += "Phone: " + phone + "\n";

    whatsappMessage += "Date: " + date + "\n";

    whatsappMessage += "Time: " + time + "\n";

    whatsappMessage += "Guests: " + guests + "\n";

    if (message) {
        whatsappMessage += "Special request: " + message + "\n";
    }

    const url =
        "https://wa.me/" +
        WHATSAPP_NUMBER +
        "?text=" +
        encodeURIComponent(whatsappMessage);

    window.open(url, "_blank");

});


/* ==========================================
   KEYBOARD SHORTCUTS
========================================== */

document.addEventListener("keydown", event => {

    if (event.key === "Escape") {

        closeDishModal();

        closeCart();

        closeGalleryLightbox();

        navMenu?.classList.remove("active");

    }

});


/* ==========================================
   INITIALIZATION
========================================== */

loadCart();

renderCart();

applyMenuFilters();

if (orderTypeSelect && addressInput) {

    addressInput.disabled = orderTypeSelect.value !== "delivery";

}

console.log("TASTE Restaurant website initialized successfully.");