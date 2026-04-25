import { useState, useEffect } from "react";
import Navbar from "../../components/NavBar/NavBar";
import { getOrders, updateOrderStatus } from "../../services/orderService";


export default function ConfectionerDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders().then((data) => {
      setOrders(data);
      setLoading(false);
    });
  }, []);

  const handleStatusChange = async (orderId, status) => {
    await updateOrderStatus(orderId, status);
    setOrders((prev) => 
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  if (loading) return <div className="page"><Navbar /><p>Завантаження...</p></div>;

  return (
    <div className="page">
      <Navbar />

      <div className="dashboard-page">
        <h2>Confectioner Dashboard</h2>
        <div className="dashboard-list">
          {orders.map((order) => (
            <div key={order.id} className="dashboard-card">
              <h3>{order.client?.name}</h3>
              <p>Client: {order.client?.name}</p>
              <p>Price: {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('uk-UA') : '—'}</p>
              <p>Prep time: {cake.prepTime}</p>
              <p>Status: {order.status}</p>
            </div>
          ))}
          {incomingOrders.map((order) => (
            <div key={order.id} className="dashboard-card">
              <h3>{order.item}</h3>
              <p>Client: {order.client}</p>
              <p>Date: {order.date}</p>
              <p>Status: {order.status}</p>
              {order.note && <p>Note: {order.note}</p>}

              <div className="actions-row">
                <button onClick={() => handleStatusChange(order.id, 'Accepted')}>Accept</button>
                <button onClick={() => handleStatusChange(order.id, 'In Progress')}>In Progress</button>
                <button onClick={() => handleStatusChange(order.id, 'Ready')}>Done</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}