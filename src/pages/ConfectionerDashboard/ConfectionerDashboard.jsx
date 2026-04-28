import { useMemo, useState, useEffect } from "react";
import Navbar from "../../components/NavBar/NavBar";
import { getOrders, updateOrderStatus } from "../../services/orderService";
import {
  applyConfectionerCakeEdits,
  ensureConfectionerCakeIds,
  getCakes,
  removeConfectionerCake,
  saveConfectionerCakeEdit
} from "../../services/cakeService";
import {
  getConfectionerProfile,
  getCurrentUser,
  saveConfectionerProfile,
  updateCurrentUser
} from "../../services/authStorage";

export default function ConfectionerDashboard() {
  const confectioner = getCurrentUser();
  const [orders, setOrders] = useState([]);
  const [cakes, setCakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusSavingId, setStatusSavingId] = useState(null);
  const [selectedCake, setSelectedCake] = useState(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [isEditingCake, setIsEditingCake] = useState(false);
  const [cakeForm, setCakeForm] = useState({ name: "", description: "", basePrice: "", weight: "" });
  const [isEditingTelegram, setIsEditingTelegram] = useState(false);
  const [telegramDraft, setTelegramDraft] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [cakeSort, setCakeSort] = useState("new");
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    Promise.all([getOrders(), getCakes()])
      .then(([ordersData, cakesData]) => {
        const normalizedOrders = Array.isArray(ordersData) ? ordersData : [];
        const normalizedCakes = Array.isArray(cakesData) ? cakesData : [];
        const allowedCakeIds = ensureConfectionerCakeIds(confectioner?.id, normalizedCakes);
        const ownedCakes = normalizedCakes.filter((cake) => allowedCakeIds.includes(Number(cake.id)));
        const ownedCakesWithEdits = applyConfectionerCakeEdits(confectioner?.id, ownedCakes);
        const ownedCakeIds = new Set(ownedCakesWithEdits.map((cake) => Number(cake.id)));

        setOrders(
          normalizedOrders.filter((order) => {
            const orderCakeId = order.orderItems?.[0]?.cake?.id ?? order.cake?.id;
            return orderCakeId ? ownedCakeIds.has(Number(orderCakeId)) : true;
          })
        );
        setCakes(ownedCakesWithEdits);
      })
      .catch(() => {
        setErrorMessage("Не вдалося завантажити дані кабінету кондитера.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleStatusChange = async (orderId, status) => {
    try {
      setStatusSavingId(orderId);
      await updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    } finally {
      setStatusSavingId(null);
    }
  };

  const orderStatusOptions = ["Pending", "Accepted", "In Progress", "Ready", "Delivered"];
  const orderFilterOptions = ["All", ...orderStatusOptions];

  const ordersSorted = useMemo(() => {
    return [...orders].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [orders]);

  const activeOrdersCount = orders.filter(
    (order) => !["Ready", "Delivered"].includes(order.status)
  ).length;
  const readyOrdersCount = orders.filter((order) => order.status === "Ready").length;
  const completedOrdersCount = orders.filter((order) => order.status === "Delivered").length;
  const totalRevenue = orders
    .filter((order) => order.status === "Delivered")
    .reduce((sum, order) => sum + Number(order.totalPrice || 0), 0);
  const availableCakes = cakes.filter((cake) => cake.isAvailable !== false);
  const confectionerProfile = getConfectionerProfile(confectioner?.id);

  const confectionerName = confectioner?.fullName || "Кондитер";
  const confectionerEmail = confectioner?.email || "email not set";
  const confectionerTelegram = confectionerProfile?.telegram || confectioner?.telegram || "Не вказано";
  const telegramLink =
    confectionerTelegram && confectionerTelegram !== "Не вказано"
      ? confectionerTelegram.startsWith("http")
        ? confectionerTelegram
        : `https://t.me/${confectionerTelegram.replace(/^@/, "")}`
      : "";
  const faqItems = [
    {
      q: "Скільки часу займає виготовлення торта?",
      a: "Стандартно 2-4 дні. Для складного декору або великих замовлень краще бронювати за 5-7 днів."
    },
    {
      q: "Чи можна змінити склад під алергії?",
      a: "Так, можна прибрати окремі інгредієнти або підібрати альтернативи. Напиши побажання в коментарі до замовлення."
    },
    {
      q: "Який мінімальний термін замовлення?",
      a: "Мінімум за 48 годин до дати видачі. Терміни можуть відрізнятись у святкові дні."
    },
    {
      q: "Чи є доставка по місту?",
      a: "Так, доставка доступна в межах міста. Вартість уточнюється після підтвердження адреси."
    },
    {
      q: "Як відбувається оплата?",
      a: "Зазвичай: передоплата 30-50%, решта при отриманні. Для великих замовлень умови узгоджуються окремо."
    }
  ];

  const statusClassMap = {
    Ready: "status-delivered",
    Delivered: "status-delivered",
    "In Progress": "status-progress",
    Accepted: "status-progress",
    Pending: "status-pending"
  };

  const filteredOrders = useMemo(() => {
    if (statusFilter === "All") return ordersSorted;
    return ordersSorted.filter((order) => (order.status || "Pending") === statusFilter);
  }, [ordersSorted, statusFilter]);

  const sortedCakes = useMemo(() => {
    const list = [...availableCakes];
    if (cakeSort === "priceAsc") return list.sort((a, b) => Number(a.basePrice || 0) - Number(b.basePrice || 0));
    if (cakeSort === "priceDesc") return list.sort((a, b) => Number(b.basePrice || 0) - Number(a.basePrice || 0));
    if (cakeSort === "name") return list.sort((a, b) => (a.name || "").localeCompare(b.name || "", "uk"));
    return list.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
  }, [availableCakes, cakeSort]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(""), 2600);
    return () => clearTimeout(timer);
  }, [toastMessage]);

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

  function handleSelectCake(cake) {
    setSelectedCake(cake);
    setIsEditingCake(false);
    setCakeForm({
      name: cake.name || "",
      description: cake.description || "",
      basePrice: String(cake.basePrice ?? ""),
      weight: cake.weight || ""
    });
  }

  function handleSaveTelegram() {
    if (!confectioner?.id) return;
    const clean = telegramDraft.trim();
    saveConfectionerProfile({ userId: confectioner.id, telegram: clean });
    updateCurrentUser({ telegram: clean });
    setIsEditingTelegram(false);
    setToastMessage("Telegram оновлено");
  }

  function handleCakeFieldChange(field, value) {
    setCakeForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSaveCake() {
    if (!confectioner?.id || !selectedCake?.id) return;
    const patch = {
      name: cakeForm.name.trim(),
      description: cakeForm.description.trim(),
      basePrice: Number(cakeForm.basePrice) || 0,
      weight: cakeForm.weight.trim()
    };
    saveConfectionerCakeEdit(confectioner.id, selectedCake.id, patch);
    setCakes((prev) => prev.map((cake) => (cake.id === selectedCake.id ? { ...cake, ...patch } : cake)));
    setSelectedCake((prev) => (prev ? { ...prev, ...patch } : prev));
    setIsEditingCake(false);
    setToastMessage("Зміни торта збережено");
  }

  function handleDeleteCake() {
    if (!confectioner?.id || !selectedCake?.id) return;
    const shouldDelete = window.confirm(
      `Видалити торт "${selectedCake.name || "Без назви"}" з кабінету кондитера?`
    );
    if (!shouldDelete) return;

    removeConfectionerCake(confectioner.id, selectedCake.id);
    setCakes((prev) => prev.filter((cake) => Number(cake.id) !== Number(selectedCake.id)));
    setSelectedCake(null);
    setIsEditingCake(false);
    setToastMessage("Торт видалено з кабінету");
  }

  return (
    <div className="page">
      <Navbar />

      <div className="dashboard-page">
        <div className="dashboard-header">
          <h2>Кабінет кондитера</h2>
          <p className="dashboard-subtitle">
            Вітрина твого бренду: профіль, прайс, портфоліо та керування замовленнями в одному місці.
          </p>
        </div>

        <div className="confectioner-studio-layout">
          <section className="confectioner-studio-left">
            <article className="confectioner-about-card">
              <p className="profile-label">Кондитер</p>
              <h3>{confectionerName}</h3>
              <p className="profile-email">{confectionerEmail}</p>
              <p className="confectioner-about-copy">
                Створюю десерти, які мають настрій і характер. У пріоритеті: якісний склад, чистий смак
                і красиве подання під кожну подію.
              </p>
              <div className="confectioner-contact-list">
                {telegramLink ? (
                  <a href={telegramLink} target="_blank" rel="noreferrer" className="confectioner-contact-chip">
                    Telegram: {confectionerTelegram}
                  </a>
                ) : (
                  <span className="confectioner-contact-chip">Telegram: {confectionerTelegram}</span>
                )}
                {!isEditingTelegram ? (
                  <button
                    type="button"
                    className="confectioner-contact-chip"
                    onClick={() => {
                      setTelegramDraft(confectionerTelegram === "Не вказано" ? "" : confectionerTelegram);
                      setIsEditingTelegram(true);
                    }}
                  >
                    Редагувати Telegram
                  </button>
                ) : (
                  <div className="confectioner-telegram-edit">
                    <input
                      type="text"
                      value={telegramDraft}
                      onChange={(event) => setTelegramDraft(event.target.value)}
                      placeholder="@cake_master"
                    />
                    <div className="actions-row">
                      <button type="button" onClick={handleSaveTelegram}>Зберегти</button>
                      <button
                        type="button"
                        className="form-submit-secondary"
                        onClick={() => {
                          setTelegramDraft(confectionerTelegram === "Не вказано" ? "" : confectionerTelegram);
                          setIsEditingTelegram(false);
                        }}
                      >
                        Скасувати
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </article>

            <article className="confectioner-quote-card">
              <p>
                "Кожен торт має бути не просто смачним, а таким, який хочеться запам&apos;ятати на фото і в
                смаку."
              </p>
            </article>

            <article className="confectioner-gallery-card">
              <h4>Мої роботи</h4>
              <div className="confectioner-mini-gallery">
                {availableCakes.slice(0, 4).map((cake) => (
                  <button
                    key={cake.id}
                    type="button"
                    className="confectioner-mini-item"
                    onClick={() => handleSelectCake(cake)}
                  >
                    <img src={cake.photoUrl || "https://via.placeholder.com/320x200?text=Cake"} alt={cake.name} />
                  </button>
                ))}
              </div>
            </article>
          </section>

          <section className="confectioner-studio-right">
            <article className="confectioner-stats-strip">
              <div className="client-stat-card">
                <span>Активні</span>
                <strong>{activeOrdersCount}</strong>
              </div>
              <div className="client-stat-card">
                <span>Готові</span>
                <strong>{readyOrdersCount}</strong>
              </div>
              <div className="client-stat-card">
                <span>Виконані</span>
                <strong>{completedOrdersCount}</strong>
              </div>
              <div className="client-stat-card">
                <span>Дохід (виконані)</span>
                <strong>{totalRevenue} грн</strong>
              </div>
            </article>

            <article className="confectioner-price-card">
              <h3>Прайс та асортимент</h3>
              <div className="confectioner-order-filters">
                <button
                  type="button"
                  className={`confectioner-filter-btn ${cakeSort === "new" ? "is-active" : ""}`}
                  onClick={() => setCakeSort("new")}
                >
                  Нові
                </button>
                <button
                  type="button"
                  className={`confectioner-filter-btn ${cakeSort === "name" ? "is-active" : ""}`}
                  onClick={() => setCakeSort("name")}
                >
                  Назва
                </button>
                <button
                  type="button"
                  className={`confectioner-filter-btn ${cakeSort === "priceAsc" ? "is-active" : ""}`}
                  onClick={() => setCakeSort("priceAsc")}
                >
                  Ціна ↑
                </button>
                <button
                  type="button"
                  className={`confectioner-filter-btn ${cakeSort === "priceDesc" ? "is-active" : ""}`}
                  onClick={() => setCakeSort("priceDesc")}
                >
                  Ціна ↓
                </button>
              </div>
              <div className="confectioner-price-grid">
                {sortedCakes.map((cake) => (
                  <button
                    key={cake.id}
                    type="button"
                    className="confectioner-price-item"
                    onClick={() => handleSelectCake(cake)}
                  >
                    <img src={cake.photoUrl || "https://via.placeholder.com/320x200?text=Cake"} alt={cake.name} />
                    <div>
                      <strong>{cake.name}</strong>
                      <span>{cake.basePrice ?? "—"} грн</span>
                    </div>
                  </button>
                ))}
              </div>
            </article>

            <article className="confectioner-faq-card">
              <h4>Часті питання клієнтів</h4>
              <div className="confectioner-faq-list">
                {faqItems.map((item, index) => (
                  <div key={item.q} className="confectioner-faq-item-wrap">
                    <button
                      type="button"
                      className="confectioner-faq-item"
                      onClick={() => setOpenFaqIndex((prev) => (prev === index ? -1 : index))}
                      aria-expanded={openFaqIndex === index}
                    >
                      <span>{item.q}</span>
                      <span>{openFaqIndex === index ? "−" : "+"}</span>
                    </button>
                    {openFaqIndex === index ? (
                      <p className="confectioner-faq-answer">{item.a}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </article>

            <article className="confectioner-orders-card">
              <h3>Замовлення клієнтів</h3>
              <div className="confectioner-order-filters">
                {orderFilterOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`confectioner-filter-btn ${statusFilter === option ? "is-active" : ""}`}
                    onClick={() => setStatusFilter(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <div className="dashboard-list">
                {filteredOrders.length === 0 && <p>За цим фільтром замовлень немає.</p>}
                {filteredOrders.map((order) => (
                  <div key={order.id} className="dashboard-card">
                    <h3>{order.orderItems?.[0]?.cake?.name || order.cake?.name || "Замовлення"}</h3>
                    <p>Клієнт: {order.client?.name || order.client?.email || "—"}</p>
                    <p>Сума: {order.totalPrice ?? "—"} грн</p>
                    <p>
                      Дата доставки:{" "}
                      {order.deliveryDate
                        ? new Date(order.deliveryDate).toLocaleDateString("uk-UA")
                        : "—"}
                    </p>
                    <p>
                      Статус:{" "}
                      <span className={`order-status-chip ${statusClassMap[order.status] || "status-pending"}`}>
                        {order.status || "Pending"}
                      </span>
                    </p>
                    <p>
                      Створено:{" "}
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("uk-UA")
                        : "—"}
                    </p>
                    {order.note && <p>Побажання: {order.note}</p>}

                    <div className="actions-row confectioner-status-row">
                      <select
                        value={order.status || "Pending"}
                        onChange={(event) => {
                          const nextStatus = event.target.value;
                          if (nextStatus === (order.status || "Pending")) return;
                          const shouldApply = window.confirm(
                            `Змінити статус замовлення #${order.id} на "${nextStatus}"?`
                          );
                          if (!shouldApply) return;
                          handleStatusChange(order.id, nextStatus);
                          setToastMessage(`Статус замовлення #${order.id} оновлено`);
                        }}
                        disabled={statusSavingId === order.id}
                        aria-label={`Статус замовлення ${order.id}`}
                      >
                        {orderStatusOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      {statusSavingId === order.id ? <span className="profile-label">Збереження...</span> : null}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </div>
        {errorMessage ? <p className="ui-error-banner">{errorMessage}</p> : null}
        {sortedCakes.length === 0 ? (
          <div className="dashboard-empty-state">
            <h4>Поки немає тортів у твоєму профілі</h4>
            <p>Додай торти в асортимент або зміни поточний набір у налаштуваннях кабінету.</p>
            <button type="button" className="primary-btn" onClick={() => setCakeSort("new")}>
              Оновити список
            </button>
          </div>
        ) : null}
        {toastMessage ? <div className="ui-toast">{toastMessage}</div> : null}

        {selectedCake ? (
          <div className="modal-overlay" onClick={() => setSelectedCake(null)}>
            <div className="modal-content" onClick={(event) => event.stopPropagation()}>
              <button className="close-btn" type="button" onClick={() => setSelectedCake(null)}>
                ×
              </button>
              <img
                src={selectedCake.photoUrl || "https://via.placeholder.com/320x200?text=Cake"}
                alt={selectedCake.name || "Cake"}
                className="modal-image"
              />
              {isEditingCake ? (
                <div className="confectioner-cake-edit-form">
                  <div className="field-group">
                    <label htmlFor="cake-name">Назва</label>
                    <input
                      id="cake-name"
                      type="text"
                      value={cakeForm.name}
                      onChange={(event) => handleCakeFieldChange("name", event.target.value)}
                    />
                  </div>
                  <div className="field-group">
                    <label htmlFor="cake-description">Опис</label>
                    <textarea
                      id="cake-description"
                      value={cakeForm.description}
                      onChange={(event) => handleCakeFieldChange("description", event.target.value)}
                    />
                  </div>
                  <div className="form-row">
                    <div className="field-group">
                      <label htmlFor="cake-price">Ціна</label>
                      <input
                        id="cake-price"
                        type="number"
                        min="0"
                        value={cakeForm.basePrice}
                        onChange={(event) => handleCakeFieldChange("basePrice", event.target.value)}
                      />
                    </div>
                    <div className="field-group">
                      <label htmlFor="cake-weight">Вага</label>
                      <input
                        id="cake-weight"
                        type="text"
                        value={cakeForm.weight}
                        onChange={(event) => handleCakeFieldChange("weight", event.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <h2>{selectedCake.name || "Торт"}</h2>
                  <p>{selectedCake.description || "Опис ще не додано."}</p>
                  <p><strong>Категорія:</strong> {selectedCake.category?.name || "—"}</p>
                  <p><strong>Вага:</strong> {selectedCake.weight || "—"}</p>
                  <p><strong>Базова ціна:</strong> {selectedCake.basePrice ?? "—"} грн</p>
                </>
              )}
              <p><strong>Доступність:</strong> {selectedCake.isAvailable === false ? "Недоступний" : "Доступний"}</p>
              {selectedCake.ingredients ? (
                <p><strong>Склад:</strong> {selectedCake.ingredients}</p>
              ) : null}
              <div className="actions-row">
                {!isEditingCake ? (
                  <button type="button" onClick={() => setIsEditingCake(true)}>Редагувати торт</button>
                ) : (
                  <>
                    <button type="button" onClick={handleSaveCake}>Зберегти зміни</button>
                    <button type="button" className="form-submit-secondary" onClick={() => setIsEditingCake(false)}>
                      Скасувати
                    </button>
                  </>
                )}
                <button type="button" className="confectioner-delete-btn" onClick={handleDeleteCake}>
                  Видалити торт
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}