import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // Fetch all products once
  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(() => {});
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const results = query.trim().length < 2
    ? []
    : products.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase())
      );

  const handleSelect = (id) => {
    navigate(`/products/${id}`);
    setQuery('');
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xs">
      {/* Input */}
      <div className="flex items-center gap-2 bg-white/5 border border-buyko-border rounded-lg px-3 py-1.5">
       <button
        onClick={() => {
            if (query.trim().length >= 2) {
            navigate(`/search?q=${encodeURIComponent(query.trim())}`);
            setOpen(false);
            }
        }}
        className="shrink-0"
        >
        <Search size={14} className="text-buyko-text-dim hover:text-buyko-text transition-colors" />
        </button>
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
            if (e.key === 'Enter' && query.trim().length >= 2) {
                navigate(`/search?q=${encodeURIComponent(query.trim())}`);
                setOpen(false);
            }
            }}
          placeholder="Search products..."
          className="bg-transparent text-sm text-buyko-text placeholder:text-buyko-text-dim outline-none w-full"
        />
        {query && (
          <button onClick={() => { setQuery(''); setOpen(false); }}>
            <X size={13} className="text-buyko-text-dim hover:text-buyko-text transition-colors" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-buyko-surface border border-buyko-border rounded-xl overflow-hidden shadow-xl z-50">
          {results.slice(0, 6).map((product) => {
            const hasDiscount = product.originalPrice && product.originalPrice > product.price;
            return (
              <button
                key={product._id}
                onClick={() => handleSelect(product._id)}
                className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
              >
                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gradient-to-br from-orange-400 to-rose-400">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-buyko-text truncate">{product.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-medium text-buyko-text">
                      &#8377;{product.price}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs text-buyko-text-dim line-through">
                        &#8377;{product.originalPrice}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-buyko-text-dim mt-0.5">
                    {product.category?.join(', ')}
                  </p>
                </div>
              </button>
            );
          })}

          {results.length > 6 && (
            <p className="text-xs text-buyko-text-dim text-center py-2 border-t border-buyko-border">
              {results.length - 6} more results — refine your search
            </p>
          )}
        </div>
      )}

      {/* No results */}
      {open && query.trim().length >= 2 && results.length === 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-buyko-surface border border-buyko-border rounded-xl px-4 py-3 z-50">
          <p className="text-sm text-buyko-text-dim">No products found for "{query}"</p>
        </div>
      )}
    </div>
  );
}