import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { Skeleton } from '../components/Skeleton';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get('/products')
      .then((res) => {
        const filtered = res.data.filter((p) =>
          p.name.toLowerCase().includes(query.toLowerCase())
        );
        setProducts(filtered);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Heading */}
      <div className="mb-8">
        <p className="text-buyko-text-dim text-sm uppercase tracking-widest mb-1">Search results for</p>
        <h1 className="text-2xl font-semibold text-buyko-text">"{query}"</h1>
        {!loading && (
          <p className="text-buyko-text-dim text-sm mt-1">{products.length} product{products.length !== 1 ? 's' : ''} found</p>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-black/20 rounded-xl overflow-hidden border border-white/5">
              <Skeleton className="aspect-square rounded-none" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-buyko-text-dim mb-2">No products found for "{query}"</p>
          <p className="text-buyko-text-dim text-sm mb-6">
            Try checking your spelling, or use a more general search term.
          </p>
          <Link to="/" className="text-orange-400 hover:underline">
            Browse all products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((product) => {
            const hasDiscount = product.originalPrice && product.originalPrice > product.price;
            const discountPercent = hasDiscount
              ? Math.round((1 - product.price / product.originalPrice) * 100)
              : null;
            const inStock = product.sizes?.some((s) => s.stock > 0);

            return (
              <Link
                key={product._id}
                to={`/products/${product._id}`}
                className="bg-black/20 rounded-xl overflow-hidden border border-white/5 hover:border-white/15 transition-colors duration-200 group"
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
                    <span className="text-sm font-medium text-buyko-text">&#8377;{product.price}</span>
                    {hasDiscount && (
                      <span className="text-xs text-buyko-text-dim/50 line-through">&#8377;{product.originalPrice}</span>
                    )}
                  </div>
                  <p className="text-xs text-buyko-text-dim mt-1">{product.category?.join(', ')}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}