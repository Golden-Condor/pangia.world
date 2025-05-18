document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('query'); // Get query from URL

    if (searchQuery) {
        performSearch(searchQuery); // Perform full-page search
    }

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const query = searchInput.value;
            if (query.trim()) {
                showDropdownResults(query); // Show dropdown results
            } else {
                clearDropdown(); // Clear dropdown if input is empty
            }
        });
    }
});

// Show dropdown results dynamically
function showDropdownResults(query) {
    const searchResults = document.getElementById('search-results');
    searchResults.innerHTML = ''; // Clear previous results

    fetch('../../assets/data/farmers.json')
        .then(response => response.json())
        .then(data => {
            const farmResults = [];
            const productResults = [];

            data.forEach(farmer => {
                if (farmer.name.toLowerCase().includes(query.toLowerCase())) {
                    farmResults.push(farmer);
                }
                farmer.products.forEach(product => {
                    if (product.name.toLowerCase().includes(query.toLowerCase())) {
                        productResults.push({ product, farmer });
                    }
                });
            });

            if (farmResults.length > 0 || productResults.length > 0) {
                searchResults.style.display = 'block';
            } else {
                searchResults.style.display = 'none';
            }

            // Populate the dropdown results
            farmResults.forEach(farmer => {
                const item = document.createElement('li');
                item.textContent = farmer.name;
                item.onclick = () => {
                    window.location.href = `farmer.html?id=${farmer.id}`;
                };
                searchResults.appendChild(item);
            });

            productResults.forEach(({ product, farmer }) => {
                const item = document.createElement('li');
                item.textContent = `${product.name} (from ${farmer.name})`;
                item.onclick = () => {
                    window.location.href = `farmer.html?id=${farmer.id}`;
                };
                searchResults.appendChild(item);
            });
        })
        .catch(err => console.error('Error fetching data:', err));
}

// Perform search on search.html
function performSearch(query) {
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = ''; // Clear previous results

    fetch('../../assets/data/farmers.json')
        .then(response => response.json())
        .then(data => {
            const farmResults = [];
            const productResults = [];

            data.forEach(farmer => {
                if (farmer.name.toLowerCase().includes(query.toLowerCase())) {
                    farmResults.push(farmer);
                }
                farmer.products.forEach(product => {
                    if (product.name.toLowerCase().includes(query.toLowerCase())) {
                        productResults.push({ product, farmer });
                    }
                });
            });

            if (farmResults.length === 0 && productResults.length === 0) {
                resultsContainer.innerHTML = '<p>No results found.</p>';
            } else {
                farmResults.forEach(farmer => {
                    const farmCard = document.createElement('div');
                    farmCard.className = 'result-card';
                    farmCard.innerHTML = `
                        <h3>${farmer.name}</h3>
                        <p>${farmer.description}</p>
                        <button onclick="window.location.href='farmer.html?id=${farmer.id}'">View Profile</button>
                    `;
                    resultsContainer.appendChild(farmCard);
                });

                productResults.forEach(({ product, farmer }) => {
                    const productCard = document.createElement('div');
                    productCard.className = 'result-card';
                    productCard.innerHTML = `
                        <h3>${product.name}</h3>
                        <p>Price: $${product.price.toFixed(2)}</p>
                        <p>From: ${farmer.name}</p>
                    `;
                    resultsContainer.appendChild(productCard);
                });
            }
        })
        .catch(err => console.error('Error fetching data:', err));
}