// app/assets/js/checkout.js

const DELIVERY_FEE = 4.50;

/**
 * createOrder: Calls the backend to create a new order with the current cart data.
 * Returns a promise that resolves with the new order's ID.
 */
function createOrder() {
  const orderData = JSON.parse(localStorage.getItem("cart"));
  if (!orderData || orderData.length === 0) {
    alert("Your cart is empty.");
    return Promise.reject("Cart empty");
  }

  const totalPrice = orderData.reduce((acc, item) => acc + item.price * item.quantity, 0) + DELIVERY_FEE;
  const guestEmail = document.getElementById('email').value;

  const billing = {
    fullName: document.getElementById('full-name').value,
    address: document.getElementById('address').value,
    city: document.getElementById('city').value,
    postalCode: document.getElementById('postal-code').value,
    country: document.getElementById('country').value,
    phoneNumber: document.getElementById('phone-number').value,
    email: guestEmail,
  };

  const orderPayload = {
    guestEmail: guestEmail,
    fullName: billing.fullName,
    address: billing.address,
    city: billing.city,
    postalCode: billing.postalCode,
    country: billing.country,
    phoneNumber: billing.phoneNumber,
    email: guestEmail,
    items: orderData.map(item => ({
      productId: item.id,
      productName: item.name,
      quantity: item.quantity,
      price: item.price
    })),
    totalPrice: totalPrice
  };

  return fetch('/api/orders/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload)
  })
  .then(response => response.json())
  .then(orderResponse => {
    if (orderResponse.order && orderResponse.order._id) {
      return orderResponse.order._id;
    } else {
      throw new Error("Order creation failed");
    }
  });
}
  
  /**
   * placeOrder: Validates billing information, creates the order, and then triggers payment.
   */
  function placeOrder() {
    // Validate billing form; reportValidity() will trigger built-in browser validations.
    const billingForm = document.getElementById('customer-form');
    if (!billingForm.reportValidity()) {
      alert("Please complete the billing information correctly.");
      return;
    }
    // First, create the order.
    createOrder()
    .then(orderId => {
      // Build billing information from the form.
      const billing = {
        fullName: document.getElementById('full-name').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        postalCode: document.getElementById('postal-code').value,
        country: document.getElementById('country').value,
        phoneNumber: document.getElementById('phone-number').value,
        email: document.getElementById('email').value,
      };
      
      // Build the payment payload including the newly created orderId.
      const paymentPayload = {
        orderId: orderId,
        billing: billing
      };
      
      // Call the payment endpoint.
      return fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentPayload)
      });
    })
    .then(async response => {
      const text = await response.text();
      console.log("Raw response:", text);
      try {
        return JSON.parse(text);
      } catch (e) {
        throw new Error("Invalid JSON: " + text);
      }
    })
    .then(data => {
      if (data.url) {
        // Redirect the user to Stripe's checkout page.
        window.location.href = data.url;
      } else {
        alert(data.message || "Error initiating payment.");
      }
    })
    .catch(error => {
      console.error("Checkout error:", error);
      alert("An error occurred while processing your order.");
    });
  }


cart = cart || [];

document.addEventListener("DOMContentLoaded", () => {
  const orderSummaryContainer = document.getElementById("order-summary-container");
  const totalPriceElement = document.getElementById("total-price");

  cart = JSON.parse(localStorage.getItem("cart")) || [];

  function updateCartDisplay() {
    orderSummaryContainer.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
      const itemDiv = document.createElement("div");
      itemDiv.classList.add("cart-item");

      const itemImage = document.createElement("img");
      itemImage.src = item.image;
      itemImage.alt = item.name;
      itemImage.classList.add("checkout-item-img");

      const itemName = document.createElement("p");
      itemName.textContent = `${item.name}`;

      const itemControls = document.createElement("div");
      itemControls.classList.add("item-controls");
      itemControls.innerHTML = `
        <button class="quantity-btn" data-index="${index}" data-action="decrease">-</button>
        <span class="item-qty">${item.quantity}</span>
        <button class="quantity-btn" data-index="${index}" data-action="increase">+</button>
        <button class="remove-btn" data-index="${index}">Remove</button>
      `;

      const detailsDiv = document.createElement("div");
      detailsDiv.classList.add("cart-item-details");
      detailsDiv.appendChild(itemName);
      detailsDiv.appendChild(itemControls);

      itemDiv.appendChild(itemImage);
      itemDiv.appendChild(detailsDiv);
      orderSummaryContainer.appendChild(itemDiv);

      total += item.price * item.quantity;
    });

    totalPriceElement.textContent = `Total: $${total.toFixed(2)}`;

    // Dynamically update the service fee display
    const serviceFeeElement = document.getElementById("service-fee");
    if (serviceFeeElement) {
      const serviceFee = total * 0.05;
      serviceFeeElement.textContent = `Service Fee: $${serviceFee.toFixed(2)}`;
    }

    const deliveryFeeElement = document.getElementById("delivery-fee");
    if (deliveryFeeElement) {
      deliveryFeeElement.textContent = `Delivery Fee: $${DELIVERY_FEE.toFixed(2)}`;
    }
  }

  orderSummaryContainer.addEventListener("click", (event) => {
    const target = event.target;
    const index = parseInt(target.dataset.index, 10);

    if (target.classList.contains("quantity-btn")) {
      const action = target.dataset.action;
      if (action === "increase") {
        cart[index].quantity += 1;
      } else if (action === "decrease" && cart[index].quantity > 1) {
        cart[index].quantity -= 1;
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      updateCartDisplay();
    }

    if (target.classList.contains("remove-btn")) {
      cart.splice(index, 1);
      localStorage.setItem("cart", JSON.stringify(cart));
      updateCartDisplay();
    }
  });

  updateCartDisplay();
});