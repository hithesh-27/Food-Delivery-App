import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';
import './Orders.css';

const kitchenStages = [
  {
    match: /food processing|processing/i,
    icon: '🥩',
    label: 'Marination Started',
    description: 'Your chef is prepping fresh ingredients with care.',
    percent: 20,
  },
  {
    match: /preparing|preparation/i,
    icon: '🔥',
    label: 'On Grill',
    description: 'Your meal is sizzling and being cooked to perfection.',
    percent: 50,
  },
  {
    match: /packed|packing/i,
    icon: '🍔',
    label: 'Packing',
    description: 'Your order is being packed hot and secure.',
    percent: 75,
  },
  {
    match: /delivered|completed|delivery|rider/i,
    icon: '🚴',
    label: 'Rider Assigned',
    description: 'A delivery partner is on the way with your meal.',
    percent: 100,
  },
];

const getKitchenStage = (status) => {
  if (!status) return { index: 0, stage: kitchenStages[0] };
  const activeIndex = kitchenStages.findIndex((stage) => stage.match.test(status));
  if (activeIndex >= 0) {
    return { index: activeIndex, stage: kitchenStages[activeIndex] };
  }
  return { index: 0, stage: kitchenStages[0] };
};

const Orders = () => {
  const { url, token } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stageProgress, setStageProgress] = useState({});

  const fetchOrders = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await axios.get(`${url}/api/order/user`, {
        headers: { token },
      });
      if (res.data.success) {
        setOrders(res.data.orders);
        setStageProgress((prev) => {
          const next = {};
          res.data.orders.forEach((order) => {
            const { index: statusStageIndex } = getKitchenStage(order.status);
            const existing = prev[order._id] ?? statusStageIndex;
            next[order._id] = Math.max(existing, statusStageIndex);
          });
          return next;
        });
        setError('');
      } else {
        setError(res.data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('orders fetch error', err);
      setError('Network error');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;

    fetchOrders();
    const intervalId = setInterval(() => {
      setStageProgress((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((orderId) => {
          if (next[orderId] < kitchenStages.length - 1) {
            next[orderId] += 1;
          }
        });
        return next;
      });
      fetchOrders(false);
    }, 5000);

    return () => clearInterval(intervalId);
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
    await fetchOrders();
  };

  return (
    <div className="user-orders">
      <h1>My Orders</h1>
      <button className="refresh-btn" onClick={refreshOrders}>Refresh</button>
      {loading && <p>Loading …</p>}
      {error && <p className="error-msg">{error}</p>}
      {!loading && !orders.length && !error && <p>You have no orders yet.</p>}
      <div className="orders-list">
        {orders.map((o) => {
          const { index: statusStageIndex, stage: statusStage } = getKitchenStage(o.status);
          const currentStageIndex = o.status === 'Cancelled' ? statusStageIndex : (stageProgress[o._id] ?? statusStageIndex);
          const finalStageIndex = Math.max(currentStageIndex, statusStageIndex);
          const currentStage = kitchenStages[finalStageIndex] || statusStage;
          const progress = currentStage?.percent || 0;
          const craftLabel = o.status === 'Cancelled' ? 'Order cancelled' : 'Your food is being crafted';

          return (
            <div key={o._id} className="order-card">
              <div className="order-summary">
                <div>
                  <p><strong>ID:</strong> {o._id}</p>
                  <p><strong>Amount:</strong> ₹{o.amount}</p>
                  <p><strong>Status:</strong> {o.status}</p>
                  <p><strong>Date:</strong> {new Date(o.date).toLocaleString()}</p>
                </div>
                <div className="order-avatar">
                  <span role="img" aria-label="chef">👨‍🍳</span>
                </div>
              </div>

              {o.status === 'Cancelled' ? (
                <p className="cancelled-note">This order was cancelled.</p>
              ) : (
                <div className="order-live-stage">
                  <div className="stage-top">
                    <div className="chef-animation">👨‍🍳</div>
                    <div className="stage-copy">
                      <p className="status-sentiment">Your food is being crafted</p>
                      <h3>{currentStage.icon} {currentStage.label}</h3>
                      <p className="stage-description">{currentStage.description}</p>
                    </div>
                  </div>
                  <div className="progress-row">
                    <span>{progress}% prepared</span>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <div className="stage-steps">
                    {kitchenStages.map((stage, idx) => (
                      <div key={stage.label} className={`stage-step ${idx <= finalStageIndex ? 'active' : ''}`}>
                        <span className="step-icon">{stage.icon}</span>
                        <span className="step-label">{stage.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="ai-visual">
                    <div className="ai-visual-screen">
                      <p>AI kitchen preview</p>
                      <div className="ai-visual-emoji">🍳✨</div>
                    </div>
                  </div>
                </div>
              )}

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
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
