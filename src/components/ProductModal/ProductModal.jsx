export default function ProductModal({ product, onClose }) {
  if (!product) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(event) => event.stopPropagation()}>
        <button className="close-btn" onClick={onClose} type="button">
          ×
        </button>

        <img src={product.image} alt={product.name} className="modal-image" />
        <h2>{product.name}</h2>
        <p>{product.description}</p>
        <p>
          <strong>Ціна:</strong> {product.price} грн
        </p>
        <p>
          <strong>Вага:</strong> {product.weight}
        </p>

        <h4>Склад</h4>
        <ul>
          {product.ingredients.map((ingredient) => (
            <li key={ingredient}>{ingredient}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
