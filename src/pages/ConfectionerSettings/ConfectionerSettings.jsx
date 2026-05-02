import { useState } from "react";
import { Link } from "react-router-dom";
import {
  getConfectionerProfile,
  getCurrentUser,
  saveConfectionerProfile,
  updateCurrentUser,
} from "../../services/authStorage";

export default function ConfectionerSettings() {
  const user = getCurrentUser();
  const profile = user ? getConfectionerProfile(user.id) : null;

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || profile?.phone || "");
  const [telegram, setTelegram] = useState(profile?.telegram || user?.telegram || "");
  const [saved, setSaved] = useState(false);

  if (!user) {
    return null;
  }

  function handleSubmit(event) {
    event.preventDefault();
    const name = fullName.trim();
    const phoneVal = phone.trim();
    const tg = telegram.trim();

    saveConfectionerProfile({
      userId: user.id,
      telegram: tg,
      phone: phoneVal,
    });
    updateCurrentUser({
      fullName: name,
      phone: phoneVal,
      telegram: tg,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2400);
  }

  return (
    <main className="confectioner-settings-page">
      <div className="profile-settings-inner">
        <header className="profile-settings-header">
          <p className="client-eyebrow">Кабінет кондитера</p>
          <h2 className="profile-settings-title">Налаштування профілю</h2>
          <p className="profile-settings-lead">
            Ім&apos;я, телефон і Telegram зберігаються локально; Telegram також потрапляє у профіль для
            картки в кабінеті.
          </p>
        </header>

        <div className="profile-settings-body">
          <form className="profile-settings-card profile-settings-form" onSubmit={handleSubmit}>
            <h3 className="profile-settings-card-title">Публічні контакти</h3>
            <div className="profile-settings-fields">
              <div className="field-group">
                <label htmlFor="conf-settings-name">Ім&apos;я / назва бренду</label>
                <input
                  id="conf-settings-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                />
              </div>
              <div className="field-group">
                <label htmlFor="conf-settings-phone">Телефон</label>
                <input
                  id="conf-settings-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  placeholder="+380…"
                />
              </div>
              <div className="field-group">
                <label htmlFor="conf-settings-telegram">Telegram</label>
                <input
                  id="conf-settings-telegram"
                  type="text"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  placeholder="@username або посилання"
                />
              </div>
            </div>
            <div className="profile-settings-actions">
              <button type="submit" className="primary-btn">
                Зберегти зміни
              </button>
              <Link to="/confectioner" className="secondary-btn profile-settings-back-link">
                Назад до кабінету
              </Link>
            </div>
            {saved ? (
              <p className="profile-settings-saved" role="status">
                Зміни збережено в цьому браузері.
              </p>
            ) : null}
          </form>
        </div>
      </div>
    </main>
  );
}
