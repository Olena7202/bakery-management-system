export default function ProductCard({ product, onClick, isActive = false }) {
  const imageUrl = product.photoUrl || product.image;
  const categoryName =
    typeof product.category === "object" ? product.category?.name : product.category;
  const price = product.basePrice ?? product.price;

  return (
    <button
      className={`product-card ${isActive ? "product-card-active" : ""}`}
      onClick={onClick}
      type="button"
    >
      <div className="product-image-wrap">
        <img src={imageUrl} alt={product.name} />
      </div>

      <div className="product-info">
        <div className="product-meta">
          <span>{categoryName}</span>
          <span>{product.weight}</span>
        </div>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <span className="product-price">{price} грн</span>
      </div>
    </button>
  );
}
