import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getBiscuits,
  getCreams,
  saveCakeCustomization,
  saveFavoriteCake
} from "../../services/cakeService";
import { getCurrentUser } from "../../services/authStorage";

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export default function ProductModal({ product, onClose }) {
  const navigate = useNavigate();
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [biscuits, setBiscuits] = useState([]);
  const [creams, setCreams] = useState([]);
  const [biscuitId, setBiscuitId] = useState("");
  const [creamId, setCreamId] = useState("");
  const [optionsError, setOptionsError] = useState("");
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (!product) {
      setShowCustomizer(false);
      setBiscuits([]);
      setCreams([]);
      setBiscuitId("");
      setCreamId("");
      setOptionsError("");
      setOptionsLoading(false);
      setSuccessMessage("");
      setActionError("");
    }
  }, [product?.id]);

  useEffect(() => {
    if (!product || !showCustomizer) {
      return;
    }

    let cancelled = false;
    setOptionsLoading(true);
    setOptionsError("");

    Promise.all([getBiscuits(), getCreams()])
      .then(([bList, cList]) => {
        if (cancelled) return;
        const b = Array.isArray(bList) ? bList : [];
        const c = Array.isArray(cList) ? cList : [];
        setBiscuits(b);
        setCreams(c);
        if (b.length) setBiscuitId(String(b[0].id));
        if (c.length) setCreamId(String(c[0].id));
      })
      .catch(() => {
        if (!cancelled) {
          setOptionsError(
            "Не вдалося завантажити варіанти. Перевір, що бекенд запущений."
          );
          setBiscuits([]);
          setCreams([]);
          setBiscuitId("");
          setCreamId("");
        }
      })
      .finally(() => {
        if (!cancelled) setOptionsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [product?.id, showCustomizer]);

  const selectedBiscuit = useMemo(
    () => biscuits.find((b) => String(b.id) === String(biscuitId)),
    [biscuits, biscuitId]
  );
  const selectedCream = useMemo(
    () => creams.find((c) => String(c.id) === String(creamId)),
    [creams, creamId]
  );

  const basePrice = product ? num(product.basePrice ?? product.price) : 0;
  const extrasTotal =
    showCustomizer && selectedBiscuit && selectedCream
      ? num(selectedBiscuit.extraPrice) + num(selectedCream.extraPrice)
      : 0;
  const totalWithCustom = basePrice + extrasTotal;
  const canCustomize = biscuits.length > 0 && creams.length > 0;

  if (!product) {
    return null;
  }

  const ingredients = Array.isArray(product.ingredients)
    ? product.ingredients
    : product.ingredients
      ? product.ingredients.split(",")
      : [];
  const imageUrl = product.photoUrl || product.image;

  function handleOrderClick() {
    const usedCustom = showCustomizer && canCustomize;
    const draft = {
      cakeId: product.id,
      cakeName: product.name,
      basePrice,
      biscuitId: usedCustom && selectedBiscuit ? selectedBiscuit.id : null,
      creamId: usedCustom && selectedCream ? selectedCream.id : null,
      biscuitName: usedCustom ? (selectedBiscuit?.name ?? "") : "",
      creamName: usedCustom ? (selectedCream?.name ?? "") : "",
      extraBiscuit: usedCustom && selectedBiscuit ? num(selectedBiscuit.extraPrice) : 0,
      extraCream: usedCustom && selectedCream ? num(selectedCream.extraPrice) : 0,
      totalPrice: usedCustom ? totalWithCustom : basePrice
    };
    navigate("/order", { state: { orderDraft: draft } });
    onClose();
  }

  function ensureClientUser() {
    if (!currentUser || currentUser.role !== "client") {
      setActionError("Щоб зберігати зміни та вподобання, увійди як клієнт.");
      return false;
    }
    return true;
  }

  function handleSaveChanges() {
    if (!ensureClientUser()) return;

    const usedCustom = showCustomizer && canCustomize;
    const customization = saveCakeCustomization({
      clientId: currentUser.id,
      cakeId: product.id,
      biscuitId: usedCustom ? selectedBiscuit?.id : null,
      biscuitName: usedCustom ? selectedBiscuit?.name : "",
      creamId: usedCustom ? selectedCream?.id : null,
      creamName: usedCustom ? selectedCream?.name : "",
      totalPrice: usedCustom ? totalWithCustom : basePrice
    });

    setActionError("");
    setSuccessMessage(
      customization.biscuitName || customization.creamName
        ? "Зміни збережено. Цей склад підставиться для цього торта."
        : "Зміни збережено (базовий склад)."
    );
  }

  function handleLikeCake() {
    if (!ensureClientUser()) return;

    const usedCustom = showCustomizer && canCustomize;
    const result = saveFavoriteCake({
      clientId: currentUser.id,
      cake: {
        id: product.id,
        name: product.name,
        photoUrl: imageUrl,
        basePrice: usedCustom ? totalWithCustom : basePrice
      },
      customization: usedCustom
        ? {
            biscuitId: selectedBiscuit?.id ?? null,
            biscuitName: selectedBiscuit?.name ?? "",
            creamId: selectedCream?.id ?? null,
            creamName: selectedCream?.name ?? "",
            totalPrice: totalWithCustom
          }
        : null
    });

    setActionError("");
    setSuccessMessage(
      result.alreadyExists
        ? "Цей торт вже є у вподобаних."
        : "Торт додано у вподобані. Побачиш його в кабінеті клієнта."
    );
    navigate("/client#saved-cakes");
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(event) => event.stopPropagation()}>
        <button className="close-btn" onClick={onClose} type="button">
          ×
        </button>

        <img src={imageUrl} alt={product.name} className="modal-image" />
        <h2>{product.name}</h2>
        <p>{product.description}</p>
        <p className="modal-price-line">
          <strong>Ціна:</strong> {basePrice} грн
        </p>
        <p>
          <strong>Вага:</strong> {product.weight ?? "—"}
        </p>

        <h4 className="modal-composition-title">Склад торта</h4>
        {ingredients.length > 0 ? (
          <ul className="modal-composition-list">
            {ingredients.map((ingredient, index) => (
              <li key={`${index}-${ingredient}`}>{ingredient.trim()}</li>
            ))}
          </ul>
        ) : (
          <p className="modal-muted">Детальний склад з&apos;явиться пізніше або уточни в коментарі до замовлення.</p>
        )}

        <div className="modal-change-row">
          {!showCustomizer ? (
            <button
              type="button"
              className="modal-change-btn"
              onClick={() => setShowCustomizer(true)}
            >
              Змінити щось
            </button>
          ) : (
            <button
              type="button"
              className="modal-change-btn modal-change-btn-muted"
              onClick={() => {
                setShowCustomizer(false);
                setOptionsError("");
              }}
            >
              Сховати зміни
            </button>
          )}
        </div>

        {showCustomizer ? (
          <section className="modal-customize" aria-labelledby="customize-heading">
            <h4 id="customize-heading">Що хочеш змінити</h4>
            <p className="modal-customize-hint">
              Обери інший бісквіт або крем — до ціни торта додається доплата за варіант.
            </p>

            {optionsLoading ? <p className="modal-muted">Завантаження варіантів…</p> : null}
            {optionsError ? <p className="modal-error">{optionsError}</p> : null}

            {canCustomize ? (
              <>
                <div className="modal-field-group">
                  <label htmlFor="modal-biscuit">Бісквіт</label>
                  <select
                    id="modal-biscuit"
                    className="modal-select"
                    value={biscuitId}
                    onChange={(e) => setBiscuitId(e.target.value)}
                  >
                    {biscuits.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                        {num(b.extraPrice) > 0 ? ` (+${num(b.extraPrice)} грн)` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="modal-field-group">
                  <label htmlFor="modal-cream">Крем</label>
                  <select
                    id="modal-cream"
                    className="modal-select"
                    value={creamId}
                    onChange={(e) => setCreamId(e.target.value)}
                  >
                    {creams.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                        {num(c.extraPrice) > 0 ? ` (+${num(c.extraPrice)} грн)` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="modal-total-price">
                  <strong>Разом з обраними змінами:</strong> {totalWithCustom} грн
                </p>
              </>
            ) : null}
          </section>
        ) : null}

        <div className="modal-actions">
          <div className="modal-actions-top">
            <button type="button" className="modal-secondary-btn" onClick={onClose}>
              Закрити
            </button>
            <button type="button" className="modal-secondary-btn" onClick={handleSaveChanges}>
              Зберегти зміни
            </button>
            <button type="button" className="modal-secondary-btn" onClick={handleLikeCake}>
              Зберегти торт
            </button>
          </div>
          <div className="modal-actions-bottom">
            <button type="button" className="modal-primary-btn" onClick={handleOrderClick}>
              Оформити замовлення
            </button>
          </div>
        </div>
        {successMessage ? <p className="modal-success">{successMessage}</p> : null}
        {actionError ? <p className="modal-error">{actionError}</p> : null}
      </div>
    </div>
  );
}
