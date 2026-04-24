import Navbar from "../../components/NavBar/NavBar";

const incomingOrders = [
  { id: 1, client: "Olena", item: "Raspberry Cake", date: "2026-04-25", status: "Pending" },
  { id: 2, client: "Anna", item: "Berry Tart", date: "2026-04-26", status: "Accepted" }
];

const cakeTemplates = [
  { id: "A-12", title: "Birthday Cake", priceFrom: "1200 UAH", prepTime: "2 days" },
  { id: "C-08", title: "Chocolate Bento", priceFrom: "550 UAH", prepTime: "1 day" }
];

export default function ConfectionerDashboard() {
  return (
    <div className="page">
      <Navbar />

      <div className="dashboard-page">
        <h2>Confectioner Dashboard</h2>
        <div className="dashboard-list">
          {cakeTemplates.map((cake) => (
            <div key={cake.id} className="dashboard-card">
              <h3>{cake.title}</h3>
              <p>Template ID: {cake.id}</p>
              <p>Price from: {cake.priceFrom}</p>
              <p>Prep time: {cake.prepTime}</p>
            </div>
          ))}
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