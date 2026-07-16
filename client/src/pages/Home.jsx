import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import StarRating from '../components/StarRating';
import { getProducts } from '../api/products';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { Skeleton } from '../components/Skeleton';
import TrustBadges from '../components/TrustBadges';
import Hero from '../components/Hero';
import BestSellers from "../components/BestSellers";
import NewsletterSignup from '../components/NewsletterSignup';

export default function Home({ showToast }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isInWishlist, toggleWishlistItem } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const tabRefs = useRef({});
  const [typedText, setTypedText] = useState('');
  const tagline = 'Style Without Limits';

  useEffect(() => {
    setTypedText('');
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTypedText(tagline.slice(0, i));
      if (i >= tagline.length) clearInterval(interval);
    }, 60);

    return () => clearInterval(interval);
  }, [selectedCategory]);

  const loadProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const categories = ['All', ...new Set(products.flatMap((p) => p.category || []))];

  useEffect(() => {
    const activeTab = tabRefs.current[selectedCategory];
    if (activeTab) {
      setIndicator({ left: activeTab.offsetLeft, width: activeTab.offsetWidth });
    }
  }, [selectedCategory, products]);

  const handleWishlistToggle = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await toggleWishlistItem(productId);
    } catch (err) {
      showToast?.('Could not update wishlist. Please try again.');
    }
  };

  const filteredProducts =
  
    selectedCategory === 'All'
      ? products
      : products.filter((p) => p.category?.includes(selectedCategory));

  return (
    <>
    <Hero products={products.filter((p) => p.featured)} loading={loading} error={error} onRetry={loadProducts} />   <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <p className="text-coral-gradient text-2xl md:text-3xl font-semibold tracking-widest uppercase min-h-[2.5rem]">
          {typedText}
        </p>
      </div>

      {error && (
        <div className="text-center mb-6">
          <p className="text-sm text-red-400 mb-2">{error}</p>
          <button onClick={loadProducts} className="text-sm text-orange-400 hover:underline">
            Try again
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-black/20 rounded-xl overflow-hidden border border-white/5">
              <Skeleton className="aspect-square rounded-none" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? null : products.length === 0 ? (
        <p className="text-buyko-text-dim text-center py-10">No products available yet.</p>
      ) : (
        <>
          <div className="relative flex items-center justify-center gap-6 mb-8 text-sm border-b border-white/5">
            {categories.map((category) => (
              <button
                key={category}
                ref={(el) => (tabRefs.current[category] = el)}
                onClick={() => setSelectedCategory(category)}
                className={`pb-3 transition-colors duration-200 ${
                  selectedCategory === category
                    ? 'text-buyko-text'
                    : 'text-buyko-text-dim hover:text-buyko-text'
                }`}
              >
                {category}
              </button>
            ))}
            <span
              className="absolute bottom-0 h-0.5 bg-buyko-coral-from transition-all duration-300 ease-out"
              style={{ left: indicator.left, width: indicator.width }}
            />
          </div>

          <div
          id="shop-grid"
          key={selectedCategory}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5"
          >
          {filteredProducts.map((product, index) => {
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
                      <span className="absolute top-9 right-2 bg-black/70 text-buyko-text-dim text-xs font-medium px-2 py-1 rounded-md">
                        Sold out
                      </span>
                    )}

                    <button
                      onClick={(e) => handleWishlistToggle(e, product._id)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 flex items-center justify-center hover:bg-black/90 transition-colors"
                    >
                      <Heart
                        size={14}
                        className={
                          isInWishlist(product._id)
                            ? 'fill-orange-400 text-orange-400'
                            : 'text-white'
                        }
                      />
                    </button>
                  </div>

                  <div className="p-3">
                    <p className="text-sm text-buyko-text truncate">{product.name}</p>
                    {product.numReviews > 0 && (
                      <div className="mt-1">
                        <StarRating rating={product.averageRating} size={11} />
                      </div>
                    )}
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
        </>
      )}
    </div>
    <BestSellers />
    <TrustBadges />
    <NewsletterSignup showToast={showToast} />
    </>
  );
}