import { useEffect, useState } from "react";
import Navbar from "../../components/NavBar/NavBar";
import ProductCard from "../../components/ProductCard/ProductCard";
import ProductModal from "../../components/ProductModal/ProductModal";
import { getCakes } from "../../services/cakeService";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeProductId, setActiveProductId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCakes().then((data) => {
      setProducts(data);
      if (data.length > 0) setActiveProductId(data[0].id);
      setLoading(false);
    })
    .catch((err) => {
      console.error('Failed to fetch cakes:', err);
      setLoading(false)
    });
  }, []);

  const activeProduct =
    products.find((product) => product.id === activeProductId) ?? products[0];

  const paletteProducts = products.slice(0, 5);
  const orderedProducts = activeProduct 
    ? [activeProduct, ...products.filter((product) => product.id !== activeProduct.id)]
    : products;

  const handlePaletteSelect = (productId) => {
    setActiveProductId(productId);
};

const handleProductClick = (product) => {
    setActiveProductId(product.id);
    setSelectedProduct(product);
};

  if(loading) return <div className="page"><Navbar /><p>Завантаження...</p></div>;

  return (
    <div className="page home-page">
      <div className="home-shell">
        <Navbar />

        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">Freshly baked collection</span>
            <h1>Ніжний десертний простір для справжніх гурманів</h1>
            

            <div className="hero-actions">
              <a href="#catalog" className="primary-btn">
                Переглянути меню
              </a>
              <a href="/order" className="secondary-btn">
                Замовити онлайн
              </a>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-card hero-card-top">
              <span className="hero-card-label">{activeProduct.category?.name}</span>
              <strong>{activeProduct.name}</strong>
              <span>{activeProduct.description}</span>
            </div>

            <div className="hero-plate" />

            <div className="hero-image-wrap" key={activeProduct.id}>
              <img
                src={activeProduct.photoUrl}
                alt={activeProduct.name}
                className="hero-image"
              />
            </div>

            <div className="hero-card hero-card-bottom">
              <span className="hero-card-label">From</span>
              <strong>{activeProduct.basePrice} грн</strong>
              <span>Вага {activeProduct.weight}, доступно для передзамовлення</span>
            </div>
          </div>

          <div className="hero-dots" aria-hidden="true">
            {paletteProducts.slice(0, 3).map((product) => (
              <span
                key={product.id}
                className={product.id === activeProduct.id ? "is-active" : ""}
              />
            ))}
          </div>
        </section>

        <section className="catalog-section" id="catalog">
          <div className="section-header">
            <div className="section-title-wrap">
              <h2>Меню десертів</h2>
            </div>

            <div className="palette-dots" role="tablist" aria-label="Перемикач десертів">
              {paletteProducts.map((product, index) => (
                <button
                  key={product.id}
                  type="button"
                  role="tab"
                  aria-selected={product.id === activeProduct.id}
                  aria-label={`Показати ${product.name}`}
                  className={`palette-dot palette-dot-${index + 1} ${
                    product.id === activeProduct.id ? "is-active" : ""
                  }`}
                  onClick={() => handlePaletteSelect(product.id)}
                />
              ))}
            </div>
          </div>

          <div className="products-grid">
            {orderedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isActive={product.id === activeProduct.id}
                onClick={() => handleProductClick(product)}
              />
            ))}
          </div>
        </section>
      </div>

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
