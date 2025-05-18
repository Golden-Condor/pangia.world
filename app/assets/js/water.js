document.addEventListener('DOMContentLoaded', function() {
    var productGridContainer = document.getElementById('product-grid-container');
    var originalGridContent = productGridContainer.innerHTML;

    window.setGridHome = function() {
        productGridContainer.className = "product-grid"; // Reset class
        productGridContainer.innerHTML = originalGridContent;
    };

    window.setGridAbout = function() {
        productGridContainer.className = "about-mode"; // Apply about mode
        productGridContainer.innerHTML =
            '<div class="about-grid">' +
                '<div class="about-image">' +
                    '<img src="/pages/water/Images/Avl-Alistair.jpg" alt="Alistair - Founder of AVL Spring Water">' +
                '</div>' +
                '<div class="about-text">' +
                    '<h2>About AVL Spring Water</h2>' +
                    '<p>AVL Spring Water was founded by Alistair, a passionate advocate for clean, sustainable water. His commitment to quality and ethical sourcing has made AVL a trusted name in the region. After years of researching water purity, Alistair built AVL Spring Water with a mission to bring naturally filtered, mineral-rich hydration straight from the Appalachian springs to your home.</p>' +
                '</div>' +
            '</div>';
    };

    window.setGridQuality = function() {
        productGridContainer.className = "quality-mode"; // Apply quality mode
        productGridContainer.innerHTML =
            '<div class="quality-grid">' +
                '<div class="quality-image">' +
                    '<img src="/pages/water/Images/Water-Cert-NC-Seal.webp" alt="Quality &amp; Sourcing">' +
                '</div>' +
                '<div class="quality-text" style="text-align: left;">' +
                    '<h2>Quality &amp; Sourcing</h2>' +
                    '<p>At AVL Spring Water, quality is our top priority. Our water is sourced from pristine Appalachian springs and is naturally filtered through mineral-rich rock. We employ rigorous testing and state-of-the-art bottling processes to ensure every drop meets our high standards. Transparency in our sourcing and production practices builds trust and guarantees that you receive only the best.</p>' +
                '</div>' +
            '</div>';
    };

    // Enable add-to-cart functionality for water products
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('add-to-cart')) {
            event.preventDefault();
            event.stopPropagation();
            const productId = event.target.dataset.productId;
            const productName = event.target.dataset.productName;
            const productPrice = parseFloat(event.target.dataset.productPrice);
            const productImage = event.target.dataset.productImage;
            
            // Call the addToCart function (defined in scripts.js)
            addToCart(productId, productName, productPrice, 1, productImage);
            
            alert(`Added to cart: ${productName}`);
        }
    });
});