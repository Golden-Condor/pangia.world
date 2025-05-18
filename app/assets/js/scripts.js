let cart = loadCartFromLocalStorage();

function loadCartFromLocalStorage() {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
}

function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

console.log("JavaScript file loaded");

    // Sample data representing items in the store, now with image references
const items = [
    { id: "645a1b2c3d4e5f6789012345", name: "Chicken Breast", category: "Meats", price: 9.99, image: "images/chicken-breast.jpeg" },
    { id: "645a1b2c3d4e5f6789012344", name: "Salmon Fillet", category: "Seafood", price: 12.99, image: "../seafood/images/salmon-fillet.jpeg" },
    { id: "645a1b2c3d4e5f6789012343", name: "Carrots", category: "Produce", price: 1.99, image: "images/carrots.jpeg" },
    { id: "645a1b2c3d4e5f6789012342", name: "Brown Rice", category: "Dry Goods", price: 3.49, image: "images/brown-rice.jpeg" },
    { id: "645a1b2c3d4e5f6789012341", name: "Apples", category: "Produce", price: 2.49, image: "images/apples.jpeg" },
    { id: "645a1b2c3d4e5f6789012340", name: "Ground Beef", category: "Meats", price: 8.99, image: "images/ground-beef.jpeg" },
    { id: "645a1b2c3d4e5f6789012349", name: "Shrimp", category: "Seafood", price: 10.99, image: "images/shrimp.jpeg" }
];

document.addEventListener('DOMContentLoaded', function () {
    window.displayOrderSummary = function () {
        console.log("displayOrderSummary called", cart);
        const orderSummaryContainer = document.getElementById('order-summary-container');
        const totalPriceElement = document.getElementById('total-price');
        orderSummaryContainer.innerHTML = '';
        let totalPrice = 0;
    
        if (cart.length === 0) {
            orderSummaryContainer.innerHTML = '<p>Your order summary is empty.</p>';
            totalPriceElement.textContent = 'Total: $0.00';
            return;
        }
    
        cart.forEach(item => {
            const itemHTML = `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-details">
                        <strong>${item.name}</strong>
                        <p>Price: $${item.price.toFixed(2)}</p>
                        <p>Quantity: ${item.quantity}</p>
                    </div>
                </div>
            `;
            orderSummaryContainer.innerHTML += itemHTML;
            totalPrice += item.price * item.quantity;
        });
        totalPriceElement.textContent = `Total: $${totalPrice.toFixed(2)}`;
    };

    console.log("DOM fully loaded");
    const currentPath = window.location.pathname;
    updateCartIcon(); // Update cart icon count on every page load

    // Page-specific initializations
    if (currentPath.includes('cart.html')) {
        displayCartItems(); // Display cart items on the cart page
    } else if (currentPath.includes('checkout.html')) {
        window.displayOrderSummary(); // Call the globally defined function
    }

    // Set up search input functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => showSuggestions(e.target.value));
        searchInput.addEventListener('keypress', handleKeyPress);
    }

    // Highlight the active menu item
    const menuLinks = document.querySelectorAll('.menu a');
    menuLinks.forEach(link => {
        if (link.href.includes(currentPath)) {
            link.classList.add('active');
        }

    // Sign-in button functionality
    const signInButton = document.getElementById('sign-in-button');
    if (signInButton) {
        signInButton.addEventListener('click', () => {
            window.location.href = '../../signin.html';
        });
    }
});

    // Initialize slideshow if slides are present
    currentSlideIndex = 0;

    if (slides.length > 0) {
        showSlide(currentSlideIndex);

        document.querySelectorAll('.slide-button').forEach(button => {
            button.addEventListener('click', function () {
                const direction = parseInt(this.dataset.direction, 10);
                changeSlide(direction);
            });
        });
    }

    function displayCartItems() {
        const cartContainer = document.getElementById('cart-items');
        const totalItemsElement = document.getElementById('total-items');
        const subtotalElement = document.getElementById('subtotal');
    
        if (!cartContainer) {
            console.error("Cart container not found.");
            return;
        }
    
        cartContainer.innerHTML = ''; // Clear existing items
    
        if (cart.length === 0) {
            cartContainer.innerHTML = '<p>Your cart is empty.</p>';
            if (totalItemsElement) totalItemsElement.textContent = 'Items: 0';
            if (subtotalElement) subtotalElement.textContent = 'Subtotal: $0.00';
            return;
        }
    
        let totalItems = 0;
        let subtotal = 0;
    
        cart.forEach((item, index) => {
            totalItems += item.quantity;
            subtotal += item.price * item.quantity;
    
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <div class="item-details">
                    <img src="${item.image}" alt="${item.name}" class="item-image">
                    <p><strong>${item.name}</strong></p>
                    <p>Price: $${item.price.toFixed(2)}</p>
                    <p>Quantity: ${item.quantity}</p>
                    <button onclick="addToCart('${item.id}', '${item.name}', ${item.price}, 1, '${item.image}')" class="quantity-button">+</button>
                    <button onclick="decreaseQuantity(${index})" class="quantity-button">-</button>
                    <button onclick="removeFromCart(${index})" class="remove-button">Remove</button>
                </div>
            `;
            cartContainer.appendChild(itemElement);
        });
    
        if (totalItemsElement) totalItemsElement.textContent = `Items: ${totalItems}`;
        if (subtotalElement) subtotalElement.textContent = `Subtotal: $${subtotal.toFixed(2)}`;
    }

    // Unified addToCart function (parameter order: id, name, price, quantity, image)
    function addToCart(id, name, price, quantity = 1, image = "") {
        const existingItem = cart.find(item => item.id === id);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ id, name, price, quantity, image });
        }

        saveCartToLocalStorage();
        updateCartIcon();
    }
    
    // Function to show the add-to-cart popup
    function showAddToCartPopup(productName) {
        const popup = document.getElementById("add-to-cart-popup");
        if (!popup) return; // Prevent errors if the popup doesn't exist
    
        popup.textContent = `${productName} added to cart!`;
        popup.classList.add("show");
    
        setTimeout(() => {
            popup.classList.remove("show");
        }, 2000);
    }
    // Slideshow functions
    function showSlide(index) {
        for (let i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";
        }
        slides[index].style.display = "block";
    }

    function changeSlide(direction) {
        currentSlideIndex += direction;

        if (currentSlideIndex < 0) {
            currentSlideIndex = slides.length - 1;
        } else if (currentSlideIndex >= slides.length) {
            currentSlideIndex = 0;
        }

        showSlide(currentSlideIndex);
    }
});


// (addToCart function is now defined above, unified version)

function showPopup(message) {
    const popup = document.getElementById("add-to-cart-popup");
    if (popup) {
        popup.textContent = message;
        popup.style.display = "block";

        setTimeout(() => {
            popup.style.display = "none";
        }, 2000);
    }
}

// Update the quantity of items in the cart
function updateCartItem(id, newQuantity) {
    newQuantity = Math.max(1, parseInt(newQuantity)); // Minimum of 1
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity = newQuantity;
        saveCartToLocalStorage();
        displayCartItems(); // Refresh cart display
        updateCartIcon();
    }
}

function decreaseQuantity(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity--;
    } else {
        cart.splice(index, 1); // Remove the item if quantity reaches 0
    }

    saveCartToLocalStorage();
    displayCartItems();
    updateCartIcon();
}

function removeFromCart(index) {
    cart.splice(index, 1); // Remove the item completely
    saveCartToLocalStorage();
    displayCartItems();
    updateCartIcon();
}

    // Function to update cart icon with the correct count
    function updateCartIcon() {
        const cartCountElement = document.getElementById("cart-count");
        const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
        if (cartCountElement) {
            cartCountElement.textContent = itemCount;
        }
    }



// Function to validate the billing form
function validateBillingForm() {
    const fullName = document.getElementById("full-name").value.trim();
    const address = document.getElementById("address").value.trim();
    const city = document.getElementById("city").value.trim();
    const postalCode = document.getElementById("postal-code").value.trim();
    const country = document.getElementById("country").value.trim();
    const phoneNumber = document.getElementById("phone-number").value.trim();
    const email = document.getElementById("email").value.trim();

    if (fullName && address && city && postalCode && country && phoneNumber && email) {
        document.querySelector(".payment-info").style.display = "block"; // Show payment section
    } else {
        document.querySelector(".payment-info").style.display = "none"; // Hide payment section until billing is complete
    }
}



// Handle slideshow
let currentSlideIndex = 0;
const slides = document.getElementsByClassName("slide");

function showSlide(index) {
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    slides[index].style.display = "block";
}

function changeSlide(direction) {
    currentSlideIndex += direction;

    if (currentSlideIndex < 0) {
        currentSlideIndex = slides.length - 1;
    } else if (currentSlideIndex >= slides.length) {
        currentSlideIndex = 0;
    }

    showSlide(currentSlideIndex);
}

cart.forEach(item => {
    console.log(`Loading image: ${item.image}`);
});
// scripts.js

function showSuggestions(value) {
    const suggestionsList = document.getElementById("suggestions-list");
    suggestionsList.innerHTML = ""; // Clear previous suggestions
  
    if (value.length === 0) {
      suggestionsList.style.display = "none";
      return;
    }
  
    // Sample product data; replace with dynamic data in a live setup
    const products = ["Chicken Breast", "Salmon", "Organic Milk", "Fresh Apples", "Spinach"];
    const suggestions = products.filter(item => item.toLowerCase().includes(value.toLowerCase()));
  
    suggestions.forEach(suggestion => {
      const suggestionItem = document.createElement("li");
      suggestionItem.textContent = suggestion;
      suggestionItem.tabIndex = 0; // Make suggestions keyboard navigable
  
      // Add click event to suggestion items
      suggestionItem.onclick = () => {
        document.getElementById("search-input").value = suggestion;
        suggestionsList.style.display = "none";
      };
  
      suggestionsList.appendChild(suggestionItem);
    });
  
    suggestionsList.style.display = suggestions.length > 0 ? "block" : "none";
  }
  
  function handleKeyPress(event) {
    if (event.key === "Enter") {
      // Trigger search with the selected item
      // Implement your search trigger logic here, such as redirecting to a search results page
      alert(`Searching for: ${event.target.value}`);
    }
  }
  function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

console.log('Cart items loaded:', cart);