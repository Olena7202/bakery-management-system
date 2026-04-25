export default function ProductModal({ product, onClose }) {
  if (!product) {
    return null;
  }

  const ingredients = product.ingredients ? product.ingredients.split(',') : [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(event) => event.stopPropagation()}>
        <button className="close-btn" onClick={onClose} type="button">
          ×
        </button>

        <img src={product.photoUrl} alt={product.name} className="modal-image" />
        <h2>{product.name}</h2>
        <p>{product.description}</p>
        <p>
          <strong>Ціна:</strong> {product.basePrice} грн
        </p>
        <p>
          <strong>Вага:</strong> {product.weight}
        </p>

        <h4>Склад</h4>
        <ul>
          {ingredients.map((ingredient) => (
            <li key={ingredient}>{ingredient.trim()}</li>
          ))}
          
        </ul>
      </div>
    </div>
  );
}
