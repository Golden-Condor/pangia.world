import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import OrderSuccess from './pages/OrderSuccess';
import OrderCancel from './pages/OrderCancel';
import Checkout from './pages/Checkout';

function App() {
  return (
    <Router>
      <Routes>
       <Route path="/checkout" element={<Checkout />} />
       <Route path="/pages/checkout.html" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/order-cancel" element={<OrderCancel />} />
      </Routes>
    </Router>
  );
}

export default App;
