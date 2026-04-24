import Navbar from "../../components/NavBar/NavBar";

const savedCakes = [
  { id: 1, title: "Raspberry Cake", price: "950 UAH", note: "Безлактозний крем" },
  { id: 2, title: "Vanilla Donut Set", price: "420 UAH", note: "12 штук, пастельний декор" }
];

const previousOrders = [
  { id: 101, item: "Berry Tart", date: "2026-03-18", status: "Done" },
  { id: 102, item: "Wedding Cake", date: "2026-04-05", status: "In progress" }
];

export default function ClientDashboard() {
  return (
    <div className="page">
      <Navbar />

      <div className="dashboard-page">
        <h2>Client Dashboard</h2>
        <div className="dashboard-list">
          {savedCakes.map((cake) => (
            <div key={cake.id} className="dashboard-card">
              <h3>{cake.title}</h3>
              <p>Price: {cake.price}</p>
              <p>Нотатка: {cake.note}</p>
            </div>
          ))}
          {previousOrders.map((order) => (
            <div key={order.id} className="dashboard-card">
              <h3>{order.item}</h3>
              <p>Order ID: #{order.id}</p>
              <p>Date: {order.date}</p>
              <p>Status: {order.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}