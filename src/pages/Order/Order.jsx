import Navbar from "../../components/NavBar/NavBar";
import { products } from "../../data/products";

export default function Order() {
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

            <form className="order-form">
              <div className="field-group">
                <label htmlFor="dessert">Десерт</label>
                <select id="dessert" defaultValue="">
                  <option value="" disabled>
                    Оберіть десерт
                  </option>
                  {products.map((product) => (
                    <option key={product.id} value={product.name}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="field-group">
                  <label htmlFor="quantity">Кількість</label>
                  <input id="quantity" type="number" min="1" placeholder="1" />
                </div>

                <div className="field-group">
                  <label htmlFor="date">Дата</label>
                  <input id="date" type="date" />
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="phone">Телефон</label>
                <input id="phone" type="tel" placeholder="+380 67 123 45 67" />
              </div>

              <div className="field-group">
                <label htmlFor="comment">Коментар для кондитера</label>
                <textarea
                  id="comment"
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
