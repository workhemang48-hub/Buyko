import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Skeleton } from './Skeleton';

function Hero({ products = [], loading = false, error = '', onRetry }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const hasFeatured = products.length > 0;

  useEffect(() => {
    if (!hasFeatured || products.length < 2) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % products.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [products.length, hasFeatured]);

  useEffect(() => {
    setCurrentSlide(0);
  }, [products.length]);

  const scrollToShop = () => {
    document.getElementById('shop-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <section className="max-w-6xl mx-auto px-6 pt-12">
        <div className="grid md:grid-cols-2 rounded-xl overflow-hidden border border-buyko-border">
          <div className="flex flex-col justify-center gap-4 px-10 py-16 md:py-0">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-24 mt-2" />
          </div>
          <Skeleton className="min-h-[280px] rounded-none" />
        </div>
      </section>
    );
  }

  if (!hasFeatured) {
    return (
      <section className="max-w-6xl mx-auto px-6 pt-12">
        <div className="grid md:grid-cols-2 rounded-xl overflow-hidden border border-buyko-border">
          <div className="flex flex-col justify-center gap-4 px-10 py-16 md:py-0">
            <span className="text-buyko-coral-from text-xs font-semibold tracking-widest uppercase">
              — New Arrivals
            </span>
            <h1 className="text-4xl md:text-5xl font-semibold text-buyko-text leading-tight">
              Latest Arrivals
            </h1>
            {error ? (
              <div>
                <p className="text-sm text-red-400 mb-1">Could not load featured products.</p>
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="text-sm font-medium text-orange-400 hover:underline text-left"
                  >
                    Try again
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={scrollToShop}
                className="mt-2 text-sm font-medium text-buyko-text hover:text-buyko-coral-from transition-colors text-left"
              >
                Shop Now —
              </button>
            )}
          </div>
          <div className="relative min-h-[280px] bg-gradient-to-br from-[#3a261c] to-[#2a1c14]" />
        </div>
      </section>
    );
  }

  const product = products[currentSlide];
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <section className="max-w-6xl mx-auto px-6 pt-12">
        <Link
        to={`/products/${product._id}`}
        className="grid md:grid-cols-[1.2fr_0.8fr] min-h-[500px] rounded-xl overflow-hidden border border-buyko-border group"
       >
        <div className="flex flex-col justify-center gap-4 px-10 py-16 md:py-0">
          <span className="text-buyko-coral-from text-xs font-semibold tracking-widest uppercase">
            — New Arrivals
          </span>
          <h1 className="text-3xl md:text-4xl font-semibold text-buyko-text leading-tight">
            {product.name}
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-lg font-medium text-buyko-text">
              &#8377;{product.price}
            </span>
            {hasDiscount && (
              <>
                <span className="text-sm text-buyko-text-dim line-through">
                  &#8377;{product.originalPrice}
                </span>
                <span className="text-sm text-buyko-coral-from">{discountPercent}% off</span>
              </>
            )}
          </div>
          <span className="mt-2 text-sm font-medium text-buyko-text group-hover:text-buyko-coral-from transition-colors">
            Shop Now —
          </span>

          {products.length > 1 && (
            <div className="flex gap-2 mt-6">
              {products.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentSlide(index);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? 'w-6 bg-buyko-coral-from'
                      : 'w-1.5 bg-buyko-border'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#111] h-[500px] flex items-center justify-center overflow-hidden">
          {product.images?.[0] ? (
            <img
              key={product._id}
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
            />
          ) : (
            <div className="aspect-square w-full flex items-center justify-center text-buyko-text-dim text-sm">
              No image
            </div>
          )}
        </div>
      </Link>
    </section>
  );
}

export default Hero;