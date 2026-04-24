import Navbar from "../../components/NavBar/NavBar";

const incomingOrders = [
  { id: 1, client: "Olena", item: "Raspberry Cake", date: "2026-04-25", status: "Pending" },
  { id: 2, client: "Anna", item: "Berry Tart", date: "2026-04-26", status: "Accepted" }
];

export default function ConfectionerDashboard() {
  return (
    <div className="page">
      <Navbar />

      <div className="dashboard-page">
        <h2>Confectioner Dashboard</h2>
        <div className="dashboard-list">
          {incomingOrders.map((order) => (
            <div key={order.id} className="dashboard-card">
              <h3>{order.item}</h3>
              <p>Client: {order.client}</p>
              <p>Date: {order.date}</p>
              <p>Status: {order.status}</p>

              <div className="actions-row">
                <button>Accept</button>
                <button>Reject</button>
                <button>Done</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}