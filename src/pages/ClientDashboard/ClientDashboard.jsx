import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/NavBar/NavBar";
import { getCurrentUser } from "../../services/authStorage";
import { getFavoriteCakesByClient } from "../../services/cakeService";

const CLIENT_ORDERS_KEY = "bakery_client_orders";

const statusMeta = {
  Pending: {
    label: "Pending",
    className: "client-status-pending",
    color: "#9b620f",
  },
  InProgress: {
    label: "In Progress",
    className: "client-status-progress",
    color: "#403393",
  },
  Delivered: {
    label: "Delivered",
    className: "client-status-delivered",
    color: "#5a9f21",
  },
};

function readClientOrders(clientId) {
  if (!clientId) return [];

  try {
    const parsed = JSON.parse(localStorage.getItem(CLIENT_ORDERS_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((order) => Number(order.clientId) === Number(clientId))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch {
    return [];
  }
}

function normalizeStatus(status) {
  if (status === "In Progress" || status === "InProgress") return "InProgress";
  if (status === "Delivered" || status === "Ready") return "Delivered";
  return "Pending";
}

function formatDate(value) {
  if (!value) return "Дата не вказана";

  return new Date(value).toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getSavedCakeData(saved) {
  const cake = saved.cake || saved;
  const price =
    saved.customization?.totalPrice ??
    cake.basePrice ??
    cake.price ??
    saved.totalPrice ??
    0;

  return {
    id: cake.id ?? saved.cakeId ?? saved.id,
    name: cake.name || "Торт без назви",
    image: cake.photoUrl || cake.image || "/images/your-custom-cake.jpg",
    price,
    customization: saved.customization,
  };
}

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
  const orders = user ? readClientOrders(user.id) : [];
  const savedCakes = user ? getFavoriteCakesByClient(user.id).map(getSavedCakeData) : [];

  const activeOrders = orders.filter((order) => normalizeStatus(order.status) !== "Delivered").length;
  const completedOrders = orders.filter((order) => normalizeStatus(order.status) === "Delivered").length;

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

  if (!user) {
    return (
      <div className="page">
        <Navbar />
        <main className="client-dashboard">
          <section className="client-auth-empty">
            <p className="client-eyebrow">Кабінет клієнта</p>
            <h2>Потрібно увійти в акаунт</h2>
            <p>
              Увійдіть або створіть акаунт, щоб переглядати замовлення,
              збережені торти та персональну статистику.
            </p>
            <Link className="primary-btn" to="/auth">
              Увійти
            </Link>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      <Navbar />

      <main className="client-dashboard">
        <section className="client-hero-panel">
          <div>
            <p className="client-eyebrow">Кабінет клієнта</p>
            <h2>Вітаємо, {user.fullName || "клієнте"}</h2>
            <p>
              Тут зібрані тільки ваші замовлення, збережені торти та коротка
              статистика по активності.
            </p>
          </div>
          <div className="client-profile-card">
            <span>Профіль</span>
            <strong>{user.fullName || "Без імені"}</strong>
            <p>{user.email || "email не вказано"}</p>
            <small>Роль: {user.role || "client"}</small>
          </div>
        </section>

        <section className="client-stats-grid" aria-label="Моя статистика">
          <article className="client-stat-tile">
            <span>Активні замовлення</span>
            <strong>{activeOrders}</strong>
          </article>
          <article className="client-stat-tile">
            <span>Виконані замовлення</span>
            <strong>{completedOrders}</strong>
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
                      <h4>{order.cakeName || "Замовлення"}</h4>
                    </div>
                    <p>{formatDate(order.date)}</p>
                    <span className={`client-status-badge ${meta.className}`}>
                      {meta.label}
                    </span>
                    <strong>{order.total} грн</strong>
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
              <p>Відкрийте торт у меню та натисніть "Зберегти торт".</p>
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
                    <button type="button" onClick={() => handleOrderCake(cake)}>
                      Замовити
                    </button>
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
                src={selectedOrder.cakeImage || "/images/your-custom-cake.jpg"}
                alt={selectedOrder.cakeName || "Замовлений торт"}
              />
              <div className="client-order-modal-body">
                <span className="client-order-id">#{selectedOrderIndex}</span>
                <h3>{selectedOrder.cakeName || "Замовлення"}</h3>
                <p>Дата: {formatDate(selectedOrder.date)}</p>
                <p>Кількість: {selectedOrder.quantity || 1}</p>
                <p>Базова ціна: {selectedOrder.cakeBasePrice || selectedOrder.total} грн</p>
                {selectedOrder.biscuitName ? <p>Бісквіт: {selectedOrder.biscuitName}</p> : null}
                {selectedOrder.creamName ? <p>Крем: {selectedOrder.creamName}</p> : null}
                {selectedOrder.note ? <p>Коментар: {selectedOrder.note}</p> : null}
                <div className="client-order-modal-footer">
                  <span
                    className={`client-status-badge ${
                      statusMeta[normalizeStatus(selectedOrder.status)]?.className ||
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
    </div>
  );
}
