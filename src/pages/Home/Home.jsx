import { useState } from "react";
import Navbar from "../../components/NavBar/NavBar";
import ProductCard from "../../components/ProductCard/ProductCard";
import ProductModal from "../../components/ProductModal/ProductModal";
import { products } from "../../data/products";

const paletteProducts = products.slice(0, 5);

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeProductId, setActiveProductId] = useState(paletteProducts[0].id);

  const activeProduct =
    products.find((product) => product.id === activeProductId) ?? products[0];

  const orderedProducts = [
    activeProduct,
    ...products.filter((product) => product.id !== activeProduct.id)
  ];

  const handlePaletteSelect = (productId) => {
    setActiveProductId(productId);
  };

  const handleProductClick = (product) => {
    setActiveProductId(product.id);
    setSelectedProduct(product);
  };

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
              <span className="hero-card-label">{activeProduct.category}</span>
              <strong>{activeProduct.name}</strong>
              <span>{activeProduct.description}</span>
            </div>

            <div className="hero-plate" />

            <div className="hero-image-wrap" key={activeProduct.id}>
              <img
                src={activeProduct.image}
                alt={activeProduct.name}
                className="hero-image"
              />
            </div>

            <div className="hero-card hero-card-bottom">
              <span className="hero-card-label">From</span>
              <strong>{activeProduct.price} грн</strong>
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
              <p>
                Palette нижче працює як швидкий перехід між десертами на самій
                сторінці. Натискаєш точку, і змінюється головний акцент сторінки.
              </p>
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
