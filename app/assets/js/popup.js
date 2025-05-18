// Combined Add to Cart + Popup Logic
function handleAddToCart() {
  // Add product to cart
  addToCart(1, '20oz Case (24-pack)', 29.99, parseInt(document.getElementById('quantity').value), '/pages/water/Images/Avl-bottle.jpeg');

  // Show popup
  const popup = document.getElementById("add-to-cart-popup");
  if (popup) {
    popup.classList.add("show");
    setTimeout(function() {
      popup.classList.remove("show");
    }, 2500);
  }
}
