import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../services/authStorage";
import { removeFavoriteCake } from "../../services/cakeService";
import { getOrdersByClient } from "../../services/orderService";
import { getSavedCakes } from "../../services/cakeService";
import { statusMeta, normalizeStatus, formatDate } from "../../utils/orderViewModel";

function OrderDistribution({ orders }) {
  const total = orders.length;
  const rows = [
    {
      key: "Delivered",
      count: orders.filter((order) => normalizeStatus(order.status) === "Delivered").length,
      ...statusMeta.Delivered,
    },
    {
      key: "InProgress",
      count: orders.filter((order) => normalizeStatus(order.status) === "InProgress").length,
      ...statusMeta.InProgress,
    },
    {
      key: "Pending",
      count: orders.filter((order) => normalizeStatus(order.status) === "Pending").length,
      ...statusMeta.Pending,
    },
  ];

  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  let used = 0;

  function getOrderCake(order) {
    return order.orderItems?.[0]?.cake ?? null;
  }

  return (
    <section className="client-panel client-distribution-panel">
      <h3>Розподіл замовлень</h3>
      <div className="client-distribution">
        <div className="client-donut-wrap" aria-label={`Усього замовлень: ${total}`}>
          <svg className="client-donut" viewBox="0 0 120 120" role="img">
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="#f2f0eb"
              strokeWidth="17"
            />
            {rows.map((row) => {
              const length = total ? (row.count / total) * circumference : 0;
              const dash = `${Math.max(length - 3, 0)} ${circumference}`;
              const rotation = -90 + (used / circumference) * 360;
              used += length;

              return (
                <circle
                  key={row.key}
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke={row.color}
                  strokeWidth="17"
                  strokeLinecap="round"
                  strokeDasharray={dash}
                  transform={`rotate(${rotation} 60 60)`}
                />
              );
            })}
          </svg>
          <div className="client-donut-center">
            <strong>{total}</strong>
            <span>всього</span>
          </div>
        </div>

        <div className="client-distribution-rows">
          {rows.map((row) => (
            <div key={row.key} className="client-distribution-row">
              <span className="client-distribution-name">
                <span style={{ backgroundColor: row.color }} />
                {row.label}
              </span>
              <span className="client-distribution-track">
                <span
                  style={{
                    width: total ? `${(row.count / total) * 100}%` : "0%",
                    backgroundColor: row.color,
                  }}
                />
              </span>
              <strong>{row.count}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderIndex, setSelectedOrderIndex] = useState(null);
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
      .catch((err) => {
        console.error('Error fetching dashboard data:', err);
        setErrorMessage("Не вдалося завантажити дані кабінету.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user?.id]);

  const userName = user?.fullName || "Гість";
  const userEmail = user?.email || "email not set";
  const activeOrdersCount = orders.filter((order) => order.status !== "Delivered").length;

  function handleRemoveSaved(cake) {
    if (!user?.id || cake?.id == null) return;
    removeFavoriteCake(user.id, cake.id);
    setSavedCakes((prev) => prev.filter((c) => c.id !== cake.id));
  }

  function handleOrderCake(cake) {
    navigate("/order", {
      state: {
        orderDraft: {
          cakeId: cake.id,
          cakeName: cake.name,
          cakeImage: cake.image,
          basePrice: cake.price,
          totalPrice: cake.price,
          biscuitName: cake.customization?.biscuitName || "",
          creamName: cake.customization?.creamName || "",
          biscuitId: cake.customization?.biscuitId ?? null,
          creamId: cake.customization?.creamId ?? null,
        },
      },
    });
  }

  function handleSelectOrder(order, index) {
    setSelectedOrder(order);
    setSelectedOrderIndex(index);
  }

  function handleCloseModal() {
    setSelectedOrder(null);
    setSelectedOrderIndex(null);
  }

  function handleRepeatOrder(order) {
    const cake = order.orderItems?.[0]?.cake || order.cake || null;
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
      totalPrice: Number(order.totalPrice ?? order.total ?? cake?.basePrice ?? 0),
    };
    navigate("/order", { state: { orderDraft: draft } });
  }

  if (!user) {
    return null;
  }

  return (
    <main className="client-dashboard">
      <section className="client-hero-panel">
        <div>
          <p className="client-eyebrow">Кабінет клієнта</p>
          <h2>Вітаємо, {user.fullName || "клієнте"}</h2>
          <p>
            Тут зібрані тільки ваші замовлення, збережені торти та коротка статистика по активності.
          </p>
        </div>
        <div className="client-profile-card">
          <span>Профіль</span>
          <strong>{user.fullName || "Без імені"}</strong>
          <p>{user.email || "email не вказано"}</p>
          {user.phone ? <p>{user.phone}</p> : null}
          <small>Роль: {user.role || "client"}</small>
        </div>
      </section>

      <section className="client-stats-grid" aria-label="Моя статистика">
        <article className="client-stat-tile">
          <span>Активні замовлення</span>
          <strong>{activeOrdersCount}</strong>
        </article>
        <article className="client-stat-tile">
          <span>Виконані замовлення</span>
          <strong>{orders.filter(o => normalizeStatus(o.status) === "Delivered").length}</strong>
        </article>
        <article className="client-stat-tile">
          <span>Збережені торти</span>
          <strong>{savedCakes.length}</strong>
        </article>
      </section>

      <OrderDistribution orders={orders} />

      <section className="client-section">
        <div className="client-section-heading">
          <h3>Мої замовлення</h3>
          <span>{orders.length} усього</span>
        </div>

        {orders.length === 0 ? (
          <div className="client-empty-state">
            <h4>У вас ще немає замовлень</h4>
            <p>Коли ви оформите перше замовлення, воно зʼявиться тут.</p>
            <Link className="secondary-btn" to="/order">
              Оформити замовлення
            </Link>
          </div>
        ) : (
          <div className="client-orders-list">
            {orders.map((order, index) => {
              const status = normalizeStatus(order.status);
              const meta = statusMeta[status] || statusMeta.Pending;
              const orderNumber = orders.length - index;

              return (
                <button
                  key={order.id}
                  type="button"
                  className="client-order-card client-order-button"
                  onClick={() => handleSelectOrder(order, orderNumber)}
                >
                  <div>
                    <span className="client-order-id">#{orderNumber}</span>
                    <h4>{getOrderCake(order)?.name || "Замовлення"}</h4>
                  </div>
                  <p>{formatDate(order.createdAt)}</p>
                  <span className={`client-status-badge ${meta.className}`}>{meta.label}</span>
                  <strong>{order.totalPrice} грн</strong>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="client-section" id="saved-cakes">
        <div className="client-section-heading">
          <h3>Збережені торти</h3>
          <span>{savedCakes.length} обрано</span>
        </div>

        {savedCakes.length === 0 ? (
          <div className="client-empty-state">
            <h4>У вас ще немає збережених тортів</h4>
            <p>Відкрийте торт у меню та натисніть &quot;Зберегти торт&quot;.</p>
            <Link className="secondary-btn" to="/">
              Перейти в меню
            </Link>
          </div>
        ) : (
          <div className="client-saved-grid">
            {savedCakes.map((cake) => (
              <article key={cake.id} className="client-saved-card">
                <img src={cake.image} alt={cake.name} />
                <div>
                  <h4>{cake.name}</h4>
                  {cake.customization?.biscuitName || cake.customization?.creamName ? (
                    <small>
                      {cake.customization?.biscuitName || "Бісквіт не змінено"} /{" "}
                      {cake.customization?.creamName || "Крем не змінено"}
                    </small>
                  ) : null}
                  <p>{cake.price} грн</p>
                  <div className="client-saved-card-actions">
                    <button type="button" className="client-saved-order-btn" onClick={() => handleOrderCake(cake)}>
                      Замовити
                    </button>
                    <button
                      type="button"
                      className="client-saved-remove-btn"
                      onClick={() => handleRemoveSaved(cake)}
                    >
                      Прибрати зі збережених
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedOrder ? (
        <div className="client-order-modal-overlay" onClick={handleCloseModal}>
          <section className="client-order-modal" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="client-order-modal-close"
              onClick={handleCloseModal}
              aria-label="Закрити"
            >
              x
            </button>
            <img
              src={getOrderCake(selectedOrder)?.photoUrl || "/images/your-custom-cake.jpg"}
              alt={selectedOrder.cakeName || "Замовлений торт"}
            />
            <div className="client-order-modal-body">
              <span className="client-order-id">#{selectedOrderIndex}</span>
              <h3>{getOrderCake(selectedOrder)?.name || "Замовлення"}</h3>
              <p>Дата: {formatDate(selectedOrder.createdAt)}</p>
              <p>Кількість: {selectedOrder.quantity || 1}</p>
              <p>Базова ціна: {selectedOrder.totalPrice} грна</p>
              {selectedOrder.biscuitName ? <p>Бісквіт: {selectedOrder.biscuitName}</p> : null}
              {selectedOrder.creamName ? <p>Крем: {selectedOrder.creamName}</p> : null}
              {selectedOrder.note ? <p>Коментар: {selectedOrder.note}</p> : null}
              <div className="client-order-modal-footer">
                <span
                  className={`client-status-badge ${statusMeta[normalizeStatus(selectedOrder.status)]?.className ||
                    statusMeta.Pending.className
                    }`}
                >
                  {statusMeta[normalizeStatus(selectedOrder.status)]?.label || "Pending"}
                </span>
                <strong>{selectedOrder.total} грн</strong>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
