import { Link, useLocation } from "react-router-dom";
import Navbar from "../../components/NavBar/NavBar";
import { products } from "../../data/products";

export default function Order() {
  const location = useLocation();
  const draft = location.state?.orderDraft;

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
                  {Number(draft.basePrice) !== Number(draft.totalPrice) ? (
                    <span className="order-draft-base">
                      {" "}
                      (база {draft.basePrice} грн + доплата за склад)
                    </span>
                  ) : null}
                </p>
              </div>
            ) : null}

            <form className="order-form">
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
                  <select id="dessert" name="dessert" defaultValue="">
                    <option value="" disabled>
                      Оберіть десерт
                    </option>
                    {products.map((product) => (
                      <option key={product.id} value={product.name}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="form-row">
                <div className="field-group">
                  <label htmlFor="quantity">Кількість</label>
                  <input id="quantity" name="quantity" type="number" min="1" placeholder="1" />
                </div>

                <div className="field-group">
                  <label htmlFor="date">Дата</label>
                  <input id="date" name="date" type="date" />
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="phone">Телефон</label>
                <input id="phone" name="phone" type="tel" placeholder="+380 67 123 45 67" />
              </div>

              <div className="field-group">
                <label htmlFor="comment">Коментар для кондитера</label>
                <textarea
                  id="comment"
                  name="comment"
                  placeholder="Наприклад: менше цукру, напис на торті або пакування для подарунка"
                />
              </div>

              <button className="form-submit" type="submit">
                Підтвердити замовлення
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
