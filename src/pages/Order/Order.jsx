import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/NavBar/NavBar";
import { getCakes } from "../../services/cakeService";
import { createOrder } from "../../services/orderService";
import { getCurrentUser } from "../../services/authStorage";

export default function Order() {
  const location = useLocation();
  const navigate = useNavigate();
  const draft = location.state?.orderDraft;
  const user = getCurrentUser();

  const [cakes, setCakes] = useState([]);
  const [selectedCakeId, setSelectedCakeId] = useState(draft?.cakeId ?? "");
  const [quantity, setQuantity] = useState(1);
  const [date, setDate] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  useEffect(() => {
    if(!draft) {
      getCakes().then(setCakes);
    }
  }, []);

  const selectedCake = cakes.find(c => c.id === Number(selectedCakeId));
  const totalPrice = draft
  ? draft.totalPrice * quantity
  : (selectedCake?.basePrice ?? 0) * quantity;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if(!user) {
      navigate("/auth");
      return;
    }

    const cakeId = draft ? draft.cakeId : Number(selectedCakeId);
    if(!cakeId) {
      setError("Оберіть десерт!");
      return;
    }

    setSubmitting(true);

    try {
      await createOrder({
        clientId: user.id,
        note: comment,
        totalPrice,
        deliveryDate: date || null,
        status: "Pending",
        paymentStatus: "Unpaid",
        orderItems: [{
          cakeId,
          biscuitId: draft?.biscuitId ?? null,
          creamId: draft?.creamId ?? null,
          quantity: Number(quantity),
          itemPrice: draft ? draft.totalPrice : (selectedCake?.basePrice ?? 0)
        }]
      });

      navigate("/client")
    } catch(err) {
      setError("Не вдалося оформити замовлення. Спробуйте ще раз.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <Navbar />

      <div className="order-page">
        <div className="forms-layout">
          <section className="form-panel">
            <h1>Оформлення замовлення без зайвих кроків</h1>
            <p>
              Оберіть десерт, вкажіть кількість та дату, а ми підготуємо
              замовлення з урахуванням ваших побажань.
            </p>

            <div className="form-highlights">
              <div className="form-highlight">
                <strong>Гнучке замовлення</strong>
                Коментар до начинки, декору чи формату подачі в одному полі.
              </div>
              <div className="form-highlight">
                <strong>Прозорі терміни</strong>
                Оберіть зручну дату й ми підтвердимо доступність одразу.
              </div>
            </div>
          </section>

          <section className="order-card">
            <div className="form-header">
              <h2>Замовити десерт</h2>
              <p>Заповніть коротку форму, і ми зв&apos;яжемося для підтвердження.</p>
            </div>

            {draft ? (
              <div className="order-draft-summary">
                <h3 className="order-draft-title">Обрано в меню</h3>
                <p className="order-draft-cake">
                  <strong>{draft.cakeName}</strong>
                </p>
                {draft.biscuitName || draft.creamName ? (
                  <ul className="order-draft-list">
                    {draft.biscuitName ? (
                      <li>
                        Бісквіт: {draft.biscuitName}
                        {Number(draft.extraBiscuit) > 0
                          ? ` (+${draft.extraBiscuit} грн)`
                          : ""}
                      </li>
                    ) : null}
                    {draft.creamName ? (
                      <li>
                        Крем: {draft.creamName}
                        {Number(draft.extraCream) > 0 ? ` (+${draft.extraCream} грн)` : ""}
                      </li>
                    ) : null}
                  </ul>
                ) : (
                  <p className="order-draft-muted">
                    Склад можна уточнити в коментарі — варіанти бісквіта й крему не підвантажились з
                    сервера.
                  </p>
                )}
                <p className="order-draft-total">
                  Орієнтовна сума: <strong>{draft.totalPrice} грн</strong>
                </p>
              </div>
            ) : null}

            <form className="order-form" onSubmit={handleSubmit}>
              <div className="field-group">
                <label htmlFor="dessert">Десерт</label>
                {draft ? (
                  <p id="dessert" className="order-draft-readonly">
                    {draft.cakeName}
                    <span className="order-draft-hint">
                      {" "}
                      — щоб обрати інший, повернись у{" "}
                      <Link to="/">меню</Link> й відкрий картку торта.
                    </span>
                  </p>
                ) : (
                  <select 
                  id="dessert"
                  value={selectedCakeId}
                  onChange={(e) => setSelectedCakeId(e.target.value)}
                  required>
                    <option value="" disabled>
                      Оберіть десерт
                    </option>
                    {cakes.map((cake) => (
                      <option key={cake.id} value={cake.id}>
                        {cake.name} - {cake.basePrice} грн
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="form-row">
                <div className="field-group">
                  <label htmlFor="quantity">Кількість</label>
                  <input 
                  id="quantity"
                  type="number"
                  min="1" 
                  value={quantity}
                  placeholder="1" 
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  />
                </div>

                <div className="field-group">
                  <label htmlFor="date">Дата</label>
                  <input 
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)} 
                  />
                </div>
              </div>

              {/*<div className="field-group">
                <label htmlFor="phone">Телефон</label>
                <input id="phone" name="phone" type="tel" placeholder="+380 67 123 45 67" />
              </div> */}

              <div className="field-group">
                <label htmlFor="comment">Коментар для кондитера</label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Наприклад: менше цукру, напис на торті або пакування для подарунка"
                />
              </div>

              {totalPrice > 0 && (
                <p className="order-draft-total">
                  Сума: <strong>{totalPrice} грн</strong>
                </p>
              )}

              {error && <p className="form-error">{error}</p>}

              <button className="form-submit" type="submit" disabled={submitting}>
                {submitting ? "Оформлення..." : "Підтвердити замовлення"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
