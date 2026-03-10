import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import './Verify.css';

const Verify = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const success = params.get('success');
  const orderId = params.get('orderId');

  return (
    <div className="verify-page">
      <h1>Order {success === 'true' ? 'Successful' : 'Cancelled'}</h1>
      {orderId && <p>Your order ID: {orderId}</p>}
      {success === 'true' ? (
        <p>Thank you for your purchase! Your order is being processed.</p>
      ) : (
        <p>Your payment was not completed. Please try again.</p>
      )}
      <Link to="/">Go back home</Link>
    </div>
  );
};

export default Verify;
