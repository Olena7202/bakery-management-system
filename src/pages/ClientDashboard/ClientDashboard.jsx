import Navbar from "../../components/NavBar/NavBar";

const orders = [
  { id: 1, item: "Raspberry Cake", date: "2026-04-25", status: "Pending" },
  { id: 2, item: "Vanilla Donut", date: "2026-04-26", status: "Done" }
];

export default function ClientDashboard() {
  return (
    <div className="page">
      <Navbar />

      <div className="dashboard-page">
        <h2>Client Dashboard</h2>
        <div className="dashboard-list">
          {orders.map((order) => (
            <div key={order.id} className="dashboard-card">
              <h3>{order.item}</h3>
              <p>Date: {order.date}</p>
              <p>Status: {order.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}