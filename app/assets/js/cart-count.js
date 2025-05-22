document.addEventListener('DOMContentLoaded', function () {
    // Safely get the cart from localStorage
    let cart = [];
    try {
        const savedCart = localStorage.getItem("cart");
        cart = savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
        cart = [];
    }

    // Update the cart icon with the correct item count
    const cartCountElement = document.getElementById("cart-count");
    const itemCount = cart.reduce((total, item) => total + (item.quantity || 0), 0);
    if (cartCountElement) {
        cartCountElement.textContent = itemCount;
    }
});