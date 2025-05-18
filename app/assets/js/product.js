function increaseQty() {
  const qtyInput = document.getElementById('quantity');
  qtyInput.value = parseInt(qtyInput.value) + 1;
}

function decreaseQty() {
  const qtyInput = document.getElementById('quantity');
  const currentValue = parseInt(qtyInput.value);
  if (currentValue > 1) {
    qtyInput.value = currentValue - 1;
  }
}

function addToCart(id, name, price, quantity, image) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];

  const existingItemIndex = cart.findIndex(item => item.id === id);
  if (existingItemIndex !== -1) {
    cart[existingItemIndex].quantity += quantity;
  } else {
    cart.push({ id, name, price, quantity, image });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const countSpan = document.querySelector('.cart-count');
  if (countSpan) {
    countSpan.textContent = totalCount;
  }
}


document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();

  document.body.addEventListener('click', function (event) {
    if (event.target.classList.contains('add-to-cart')) {
      event.preventDefault();

      const btn = event.target;
      const id = btn.dataset.productId;
      const name = btn.dataset.productName;
      const price = parseFloat(btn.dataset.productPrice);
      const image = btn.dataset.productImage;
      const qtyInput = document.getElementById('quantity');
      const quantity = qtyInput ? parseInt(qtyInput.value) : 1;

      addToCart(id, name, price, quantity, image);

      const popup = document.getElementById("add-to-cart-popup");
      if (popup) {
        popup.classList.add("show");
        setTimeout(() => popup.classList.remove("show"), 2500);
      }
    }
  });
});


