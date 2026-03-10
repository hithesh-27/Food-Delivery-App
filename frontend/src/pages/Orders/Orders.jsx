import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';
import './Orders.css';

const Orders = () => {
  const { url, token } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${url}/api/order/user`, {
          headers: { token },
        });
        if (res.data.success) {
          setOrders(res.data.orders);
        } else {
          setError(res.data.message || 'Failed to fetch orders');
        }
      } catch (err) {
        console.error('orders fetch error', err);
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [token, url]);

  if (!token) {
    return (
      <div className="user-orders">
        <h1>My Orders</h1>
        <p>Please <a href="#" onClick={() => window.location.reload()}>log in</a> to view your orders.</p>
      </div>
    );
  }

  const refreshOrders = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${url}/api/order/user`, {
        headers: { token },
      });
      if (res.data.success) {
        setOrders(res.data.orders);
        setError('');
      } else {
        setError(res.data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('orders fetch error', err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-orders">
      <h1>My Orders</h1>
      <button className="refresh-btn" onClick={refreshOrders}>Refresh</button>
      {loading && <p>Loading …</p>}
      {error && <p className="error-msg">{error}</p>}
      {!loading && !orders.length && !error && <p>You have no orders yet.</p>}
      <div className="orders-list">
        {orders.map((o) => (
          <div key={o._id} className="order-card">
            <p><strong>ID:</strong> {o._id}</p>
            <p><strong>Amount:</strong> ₹{o.amount}</p>
            <p><strong>Status:</strong> {o.status}</p>
            <p><strong>Date:</strong> {new Date(o.date).toLocaleString()}</p>
            {o.status !== 'Cancelled' && (
              <button
                className="cancel-btn"
                onClick={async () => {
                  try {
                    const res = await axios.patch(
                      `${url}/api/order/${o._id}/status`,
                      { status: 'Cancelled' },
                      { headers: { token } }
                    );
                    if (res.data.success) {
                      setOrders((prev) =>
                        prev.map((ord) =>
                          ord._id === o._id ? res.data.order : ord
                        )
                      );
                    } else {
                      alert(res.data.message || 'Could not cancel');
                    }
                  } catch (err) {
                    console.error('cancel error', err);
                    alert('Network error');
                  }
                }}
              >
                Cancel
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
