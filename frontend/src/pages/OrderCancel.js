import React from 'react';

const OrderCancel = () => {
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
        <h1>❌ Payment Canceled</h1>
        <p>Your payment was not completed. If this was a mistake, please try again.</p>
        <a href="https://pangia.world">Go back to homepage</a>
      </div>
    </div>
  );
};

export default OrderCancel;
