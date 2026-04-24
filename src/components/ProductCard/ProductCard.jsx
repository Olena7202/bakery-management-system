export default function ProductCard({ product, onClick, isActive = false }) {
  return (
    <button
      className={`product-card ${isActive ? "product-card-active" : ""}`}
      onClick={onClick}
      type="button"
    >
      <div className="product-image-wrap">
        <img src={product.image} alt={product.name} />
      </div>

      <div className="product-info">
        <div className="product-meta">
          <span>{product.category}</span>
          <span>{product.weight}</span>
        </div>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <span className="product-price">{product.price} грн</span>
      </div>
    </button>
  );
}
