import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/NavBar/NavBar";
import { getCurrentUser } from "../../services/authStorage";
import { getOrdersByClient } from "../../services/orderService";
import { getSavedCakes } from "../../services/cakeService";

export default function ClientDashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [orders, setOrders] = useState([]);
  const [savedCakes, setSavedCakes] = useState([]);
  const [loading, setLoading] = useState(Boolean(user));
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!user) return;

    Promise.all([getOrdersByClient(user.id), getSavedCakes(user.id)])
      .then(([ordersData, savedData]) => {
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        setSavedCakes(Array.isArray(savedData) ? savedData : []);
      })
      .catch(() => {
        setErrorMessage("Не вдалося завантажити дані кабінету.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]);

  const userName = user?.fullName || "Гість";
  const userEmail = user?.email || "email not set";
  const activeOrdersCount = orders.filter((order) => order.status !== "Delivered").length;

  const statusClassMap = {
    Delivered: "status-delivered",
    "In progress": "status-progress",
    "Pending confirmation": "status-pending"
  };

  function handleRepeatOrder(order) {
    const cake =
      order.orderItems?.[0]?.cake ||
      order.cake ||
      null;
    const draft = {
      cakeId: cake?.id ?? null,
      cakeName: cake?.name || order.item || "Торт із попереднього замовлення",
      basePrice: Number(cake?.basePrice ?? order.totalPrice ?? order.total ?? 0),
      biscuitId: order.orderItems?.[0]?.biscuitId ?? null,
      creamId: order.orderItems?.[0]?.creamId ?? null,
      biscuitName: order.orderItems?.[0]?.biscuit?.name ?? "",
      creamName: order.orderItems?.[0]?.cream?.name ?? "",
      extraBiscuit: 0,
      extraCream: 0,
      totalPrice: Number(order.totalPrice ?? order.total ?? cake?.basePrice ?? 0)
    };
    navigate("/order", { state: { orderDraft: draft } });
  }

  if (loading) {
    return (
      <div className="page">
        <Navbar />
        <div className="dashboard-page">
          <div className="dashboard-skeleton-grid">
            {[1, 2, 3].map((item) => (
              <div key={item} className="dashboard-card">
                <div className="ui-skeleton ui-skeleton-media" />
                <div className="ui-skeleton ui-skeleton-line" />
                <div className="ui-skeleton ui-skeleton-line short" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <Navbar />

      <div className="dashboard-page">
        <div className="dashboard-header">
          <div>
            <h2>Client Dashboard</h2>
            <p className="dashboard-subtitle">
              Керуйте збереженими десертами, активними замовленнями та історією покупок.
            </p>
          </div>
        </div>

        <section className="dashboard-profile-card">
          <div>
            <p className="profile-label">Ваш акаунт</p>
            <h3>{userName}</h3>
            <p className="profile-email">{userEmail}</p>
          </div>
          <div className="client-stats">
            <div className="client-stat-card">
              <span>Активні замовлення</span>
              <strong>{activeOrdersCount}</strong>
            </div>
            <div className="client-stat-card">
              <span>Збережені торти</span>
              <strong>{savedCakes.length}</strong>
            </div>
            <div className="client-stat-card">
              <span>Всього замовлень</span>
              <strong>{orders.length}</strong>
            </div>
          </div>
        </section>

        <h3 className="dashboard-section-title" id="saved-cakes">Збережені варіанти тортів</h3>
        <div className="dashboard-list dashboard-list-saved">
          {savedCakes.length === 0 && (
            <div className="dashboard-empty-state">
              <h4>Ще немає збережених тортів</h4>
              <p>Перейди в меню, відкрий картку торта і натисни “Зберегти торт”.</p>
              <a className="primary-btn" href="/">Перейти в меню</a>
            </div>
          )}
          {savedCakes.map((saved) => (
            <div key={saved.id} className="dashboard-card saved-cake-card">
              <img
                src={saved.cake?.photoUrl || "https://via.placeholder.com/320x200?text=Cake"}
                alt={saved.cake?.name || "Cake"}
              />
              <h3>{saved.cake?.name || "Без назви"}</h3>
              <p>Price: {saved.cake?.basePrice ?? "—"} грн</p>
              {saved.customization?.biscuitName || saved.customization?.creamName ? (
                <p>
                  Змінений склад: {saved.customization?.biscuitName || "—"} /{" "}
                  {saved.customization?.creamName || "—"}
                </p>
              ) : null}
              <p>Нотатка: {saved.note || "Немає нотаток"}</p>
              <p>Кондитер: {saved.cake?.confectionerName || "—"}</p>
            </div>
          ))}
        </div>

        <h3 className="dashboard-section-title">Мої замовлення</h3>
        <div className="dashboard-list">
          {orders.length === 0 && (
            <div className="dashboard-empty-state">
              <h4>Замовлень поки немає</h4>
              <p>Тут зʼявляться всі твої замовлення після оформлення.</p>
              <a className="secondary-btn" href="/order">Оформити перше замовлення</a>
            </div>
          )}
          {orders.map((order) => (
            <div key={order.id} className="dashboard-card">
              <h3>{order.cake?.name || order.item || "Замовлення"}</h3>
              <p>Order ID: #{order.id}</p>
              <p>Total: {order.totalPrice ?? order.total ?? "—"} грн</p>
              <p>
                Date:{" "}
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString("uk-UA")
                  : order.date || "—"}
              </p>
              <p>
                Status:{" "}
                <span className={`order-status-chip ${statusClassMap[order.status] || "status-pending"}`}>
                  {order.status || "Pending confirmation"}
                </span>
              </p>
              <p>Payment: {order.paymentStatus || "—"}</p>
              <div className="actions-row">
                <button
                  type="button"
                  className="form-submit-secondary"
                  onClick={() => handleRepeatOrder(order)}
                >
                  Повторити замовлення
                </button>
              </div>
            </div>
          ))}
        </div>
        {errorMessage ? <p className="ui-error-banner">{errorMessage}</p> : null}
      </div>
    </div>
  );
}