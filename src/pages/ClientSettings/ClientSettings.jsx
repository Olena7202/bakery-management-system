import { useState } from "react";
import { Link } from "react-router-dom";
import { getCurrentUser, updateCurrentUser } from "../../services/authStorage";
import { statusMeta } from "../../utils/orderViewModel";

export default function ClientSettings() {
  const user = getCurrentUser();
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [saved, setSaved] = useState(false);

  if (!user) {
    return null;
  }

  function handleSubmit(event) {
    event.preventDefault();
    updateCurrentUser({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2400);
  }

  return (
    <main className="client-settings-page">
      <div className="profile-settings-inner">
        <header className="profile-settings-header">
          <p className="client-eyebrow">Кабінет клієнта</p>
          <h2 className="profile-settings-title">Налаштування профілю</h2>
          <p className="profile-settings-lead">
            Дані зберігаються лише в цьому браузері (localStorage), без окремого API профілю на сервері.
          </p>
        </header>

        <div className="profile-settings-body profile-settings-body--client">
          <form className="profile-settings-card profile-settings-form" onSubmit={handleSubmit}>
            <h3 className="profile-settings-card-title">Контактні дані</h3>
            <div className="profile-settings-fields">
              <div className="field-group">
                <label htmlFor="client-settings-name">Ім&apos;я</label>
                <input
                  id="client-settings-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                />
              </div>
              <div className="field-group">
                <label htmlFor="client-settings-email">Email</label>
                <input
                  id="client-settings-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              <div className="field-group">
                <label htmlFor="client-settings-phone">Телефон</label>
                <input
                  id="client-settings-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  placeholder="+380…"
                />
              </div>
            </div>
            <div className="profile-settings-actions">
              <button type="submit" className="primary-btn">
                Зберегти зміни
              </button>
              <Link to="/client" className="secondary-btn profile-settings-back-link">
                Назад до кабінету
              </Link>
            </div>
            {saved ? (
              <p className="profile-settings-saved" role="status">
                Зміни збережено в цьому браузері.
              </p>
            ) : null}
          </form>

          <section className="profile-settings-card profile-settings-aside" aria-label="Підказка">
            <h3 className="profile-settings-card-title">Статуси замовлень</h3>
            <p className="profile-settings-aside-lead">
              У списку замовлень кольори статусів такі самі, як тут.
            </p>
            <ul className="profile-settings-status-list">
              {Object.entries(statusMeta).map(([key, meta]) => (
                <li key={key}>
                  <span
                    className="profile-settings-status-dot"
                    style={{ backgroundColor: meta.color }}
                    aria-hidden
                  />
                  <span className="profile-settings-status-label">{meta.label}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
