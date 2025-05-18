import React, { useEffect } from 'react';

const OrderSuccess = () => {
  useEffect(() => {
    // Redirect after 5 seconds to an external URL
    const timer = setTimeout(() => {
      window.location.href = 'https://pangia.world';
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh', 
        backgroundColor: '#f0f0f0' 
      }}>
      <div style={{
          backgroundColor: '#ffffff',
          padding: '40px',
          borderRadius: '15px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
          textAlign: 'center',
          maxWidth: '600px',
          width: '90%'
      }}>
        <h1>Payment Successful!</h1>
        <p>Thank you for your order. Your payment has been processed.</p>
        <p>You will be redirected to the home page shortly.</p>
      </div>
    </div>
  );
};

export default OrderSuccess;