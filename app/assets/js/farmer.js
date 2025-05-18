document.addEventListener('DOMContentLoaded', async function () {
    const token = localStorage.getItem('token'); // Get the stored JWT token

    if (!token) {
        alert("You must be logged in as a farmer to view this page.");
        window.location.href = "../signin.html";
        return;
    }

    try {
        // Fetch farmer data
        const response = await fetch('/api/farmers/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch farmer data.");
        }

        const farmer = await response.json();

        // Populate farmer details
        document.getElementById('farmer-image').src = farmer.image || '../../assets/Images/farmer-placeholder.jpg';
        document.getElementById('farmer-name').textContent = farmer.name;
        document.getElementById('farmer-bio').textContent = farmer.bio || "No bio provided.";
        document.getElementById('farmer-certifications').textContent = `Certifications: ${farmer.certifications.join(", ") || "None"}`;

        // Populate product list
        const productList = document.getElementById('product-grid');
        productList.innerHTML = ''; // Clear existing products

        farmer.products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>$${product.price.toFixed(2)}</p>
                <button onclick="addToCart(${product.id}, '${product.name}', ${product.price})">Add to Cart</button>
            `;
            productList.appendChild(productCard);
        });
    } catch (error) {
        console.error("Error loading farmer data:", error);
    }

    // Add event listener for "Products" and "Recipes" toggle
    document.getElementById('products-heading').addEventListener('click', function () {
        document.getElementById('product-grid').style.display = 'grid';
        document.getElementById('recipe-grid').style.display = 'none';
    });

    document.getElementById('recipes-heading').addEventListener('click', function () {
        document.getElementById('product-grid').style.display = 'none';
        document.getElementById('recipe-grid').style.display = 'grid';
        showRecipes();
    });
});

// Function to add items to the cart
async function addToCart(id, name, price) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));

    // Optional: Sync with backend
    try {
        const token = localStorage.getItem('token');
        if (!token) return;

        await fetch('/api/cart', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cart)
        });
    } catch (error) {
        console.error("Failed to sync cart with server:", error);
    }

    alert(`${name} added to cart!`);
}

// Function to show recipes dynamically
async function showRecipes() {
    const recipeGrid = document.getElementById('recipe-grid');
    recipeGrid.innerHTML = ''; // Clear existing recipes

    const token = localStorage.getItem('token');
    try {
        const response = await fetch('/api/recipes', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch recipes.");
        }

        const recipes = await response.json();

        recipes.forEach(recipe => {
            const recipeCard = document.createElement('div');
            recipeCard.className = 'recipe-card';
            recipeCard.innerHTML = `
                <img src="${recipe.image}" alt="${recipe.name}">
                <h3>${recipe.name}</h3>
                <p>${recipe.description}</p>
            `;
            recipeGrid.appendChild(recipeCard);
        });
    } catch (error) {
        console.error("Error loading recipes:", error);
    }
}