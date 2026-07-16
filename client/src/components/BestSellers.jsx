import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const BestSellers = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.filter((p) => p.bestseller === true));
      })
      .catch((err) => console.error("BestSellers fetch error:", err));
  }, []);

  if (products.length === 0) return null;

  return (
    <div className="max-w-6xl mx-auto px-6 pb-16">
      {/* Section heading */}
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-coral-gradient uppercase tracking-widest">
        Best Sellers
        </h2>
        </div>

      {/* Product grid — identical card pattern to Home */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {products.map((product, index) => {
          const hasDiscount =
            product.originalPrice && product.originalPrice > product.price;
          const discountPercent = hasDiscount
            ? Math.round((1 - product.price / product.originalPrice) * 100)
            : null;
          const inStock = product.sizes?.some((s) => s.stock > 0);

          return (
            <Link
              key={product._id}
              to={`/products/${product._id}`}
              style={{ animationDelay: `${index * 40}ms` }}
              className="product-card-enter bg-black/20 rounded-xl overflow-hidden border border-white/5 hover:border-white/15 transition-colors duration-200 group"
            >
              <div className="relative aspect-square bg-gradient-to-br from-orange-400 to-rose-400 flex items-center justify-center overflow-hidden">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <span className="text-white/60 text-xs">No image</span>
                )}

                {hasDiscount && (
                  <span className="absolute top-2 left-2 bg-black/70 text-orange-300 text-xs font-medium px-2 py-1 rounded-md">
                    {discountPercent}% off
                  </span>
                )}

                {!inStock && (
                  <span className="absolute top-2 right-2 bg-black/70 text-buyko-text-dim text-xs font-medium px-2 py-1 rounded-md">
                    Sold out
                  </span>
                )}
              </div>

              <div className="p-3">
                <p className="text-sm text-buyko-text truncate">{product.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-medium text-buyko-text">
                    &#8377;{product.price}
                  </span>
                  {hasDiscount && (
                    <span className="text-xs text-buyko-text-dim/50 line-through">
                      &#8377;{product.originalPrice}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BestSellers;