import { useState, useEffect } from "react";
import Navbar from "../../components/NavBar/NavBar";
import { getCurrentUser } from "../../services/authStorage";
import { getOrdersByClient } from "../../services/orderService";
import { getSavedCakes } from "../../services/cakeService";

export default function ClientDashboard() {
  const [orders, setOrders] = useState([]);
  const [savedCakes, setSavedCakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = getCurrentUser();

  useEffect(() => {
    if(!user) return;

    Promise.all([
      getOrdersByClient(user.id),
      getSavedCakes(user.id)
    ]).then(([ordersData, savedData]) => {
      setOrders(ordersData);
      setSavedCakes(savedData);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="page"><Navbar /><p>Завантаження...</p></div>;

  return (
    <div className="page">
      <Navbar />

      <div className="dashboard-page">
        <h2>Client Dashboard</h2>
        <div className="dashboard-list">
          {savedCakes.map((saved) => (
            <div key={saved.id} className="dashboard-card">
              <img src={saved.cake?.photoUrl} alt={saved.cake?.name} />
              <h3>{saved.cake?.name}</h3>
              <p>Price: {saved.cake?.basePrice} грн</p>
              <p>Нотатка: {cake.note}</p>
            </div>
          ))}
          {previousOrders.map((order) => (
            <div key={order.id} className="dashboard-card">
              <h3>{order.item}</h3>
              <p>Order ID: #{order.id}</p>
              <p>Price: {order.totalPrice} грн</p>
              <p>Date: {new Date(order.createdAt).toLocaleDateString('uk-UA')}</p>
              <p>Status: {order.status}</p>
              <p>Payment: {order.paymentStatus}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}