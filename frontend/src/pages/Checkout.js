import React, { useState } from 'react';
import axios from 'axios';

const Checkout = () => {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const orderData = {
        guestEmail: "pangia.test@gmail.com",
        fullName: "Connor Moore",
        phoneNumber: "123-456-7890",
        address: "123 Spring St",
        city: "Asheville",
        postalCode: "28801",
        country: "US",
        items: [
          {
            productId: "20oz-case-24pack",
            productName: "AVL Spring Water 20oz (24-Pack)",
            quantity: 1,
            price: 16.5
          }
        ]
      };

      console.log("📦 Order being sent:", orderData);

      const response = await axios.post("/api/orders/create", orderData);
      
      console.log("✅ Order created:", response.data);
      // Optional: redirect or show success
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>Checkout</h1>
      <button onClick={handleCheckout} disabled={loading}>
        {loading ? "Processing..." : "Proceed to Payment"}
      </button>
    </div>
  );
};

export default Checkout;