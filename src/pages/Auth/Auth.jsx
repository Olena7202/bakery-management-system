import { useState } from "react";
import Navbar from "../../components/NavBar/NavBar";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState("client");

  return (
    <div className="page">
      <Navbar />

      <div className="auth-page">
        <div className="forms-layout">
          <section className="form-panel">
            <h1>Ваш кабінет для замовлень і комунікації</h1>
            <p>
              Увійдіть, щоб керувати своїми десертами, відстежувати статус
              замовлень і швидко повертатися до улюблених позицій.
            </p>

            <div className="form-highlights">
              <div className="form-highlight">
                <strong>Швидкий вхід</strong>
                Відновлюйте попередні замовлення та персональні налаштування.
              </div>
              <div className="form-highlight">
                <strong>Ролі для команди</strong>
                Окремий доступ для клієнта та кондитера в одному інтерфейсі.
              </div>
            </div>
          </section>

          <section className="auth-card">
            <div className="form-header">
              <h2>{isLogin ? "Вхід до кабінету" : "Створення кабінету"}</h2>
              <p>
                {isLogin
                  ? "Введіть свої дані, щоб продовжити роботу."
                  : "Заповніть форму, щоб отримати доступ до особистого кабінету."}
              </p>
            </div>

            <form className="auth-form">
              {!isLogin && (
                <div className="field-group">
                  <label htmlFor="fullName">Ім&apos;я та прізвище</label>
                  <input id="fullName" type="text" placeholder="Олена Коваленко" />
                </div>
              )}

              <div className="field-group">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" placeholder="hello@bakery.ua" />
              </div>

              <div className="field-group">
                <label htmlFor="password">Пароль</label>
                <input id="password" type="password" placeholder="Введіть пароль" />
              </div>

              {!isLogin && (
                <div className="field-group">
                  <label htmlFor="role">Роль</label>
                  <select
                    id="role"
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                  >
                    <option value="client">Клієнт</option>
                    <option value="confectioner">Кондитер</option>
                  </select>
                </div>
              )}

              <button className="form-submit" type="submit">
                {isLogin ? "Увійти" : "Створити акаунт"}
              </button>
            </form>

            <p className="switch-auth">
              {isLogin ? "Ще не маєте акаунта?" : "Вже маєте акаунт?"}
              <button type="button" onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? " Зареєструватися" : " Увійти"}
              </button>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
