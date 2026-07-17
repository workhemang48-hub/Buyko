import { useState, useEffect } from 'react';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../../api/products';
import ProductModal from '../../components/admin/ProductModal';

export default function AdminProducts({ showToast }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [error, setError] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };
const filteredProducts =
    selectedSubCategory === 'all'
      ? products
      : products.filter((p) => p.subCategory === selectedSubCategory);

  const handleExportCSV = () => {
    const headers = ['Name', 'Price', 'Original Price', 'Sub Category', 'Sizes', 'Stock'];
    const rows = filteredProducts.map((p) => [
      p.name,
      p.price,
      p.originalPrice || '',
      p.subCategory,
      p.sizes.map((s) => s.size).join(', '),
      p.sizes.reduce((sum, s) => sum + s.stock, 0),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `products-export-${selectedSubCategory}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  useEffect(() => {
    loadProducts();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (data) => {
    if (editingProduct) {
      await updateProduct(editingProduct._id, data);
      showToast('Product updated successfully');
    } else {
      await createProduct(data);
      showToast('Product added successfully');
    }
    closeModal();
    loadProducts();
  };

  const handleDelete = async (product) => {
    const confirmed = window.confirm(`Delete "${product.name}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await deleteProduct(product._id);
      showToast('Product deleted successfully');
      loadProducts();
    } catch (err) {
      setError('Failed to delete product.');
    }
  };

  if (loading) {
    return <p className="text-buyko-text-dim text-center py-10">Loading products...</p>;
  }

  return (
    <div>
     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-buyko-text">Products</h1>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedSubCategory}
            onChange={(e) => setSelectedSubCategory(e.target.value)}
            className="bg-transparent border border-white/10 rounded-md text-buyko-text text-sm px-3 py-1.5"
          >
            <option value="all" style={{ color: '#ffffff', backgroundColor: '#000000' }}>All categories</option>
            <option value="Topwear" style={{ color: '#ffffff', backgroundColor: '#000000' }}>Topwear</option>
            <option value="Bottomwear" style={{ color: '#ffffff', backgroundColor: '#000000' }}>Bottomwear</option>
            <option value="Winterwear" style={{ color: '#ffffff', backgroundColor: '#000000' }}>Winterwear</option>
          </select>
          <button
            onClick={handleExportCSV}
            disabled={filteredProducts.length === 0}
            className="text-xs font-medium px-3 py-1.5 rounded-md border border-orange-400/30 text-orange-400 bg-orange-400/10 hover:bg-orange-400/20 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Export CSV
          </button>
          <button
            onClick={openCreateModal}
            className="rounded-lg bg-gradient-to-r from-orange-400 to-rose-400 text-white text-sm font-medium px-4 py-2"
          >
            + Add product
          </button>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-950/30 border border-red-900 rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <p className="text-buyko-text-dim text-center py-10">
          {selectedSubCategory === 'all' ? 'No products yet.' : 'No products in this category.'}
        </p>
      ) : (
        <>
        {/* Mobile: card layout */}
        <div className="space-y-3 md:hidden">
          {filteredProducts.map((product) => (
            <div key={product._id} className="border border-white/10 rounded-xl p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-buyko-text font-medium">{product.name}</p>
                <div className="flex-shrink-0 text-right">
                  <span className="text-buyko-text">&#8377;{product.price}</span>
                  {product.originalPrice > product.price && (
                    <span className="ml-2 text-xs text-buyko-text-dim/50 line-through">
                      &#8377;{product.originalPrice}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm mb-3">
                {product.sizes.map((s) => {
                  const colorClass =
                    s.stock === 0
                      ? 'text-rose-400'
                      : s.stock < 10
                      ? 'text-orange-400'
                      : 'text-green-400';
                  return (
                    <span key={s._id || s.size} className="text-buyko-text-dim">
                      {s.size}: <span className={colorClass}>{s.stock}</span>
                    </span>
                  );
                })}
              </div>

              <div className="flex items-center gap-4 pt-3 border-t border-white/10">
                <button
                  onClick={() => openEditModal(product)}
                  className="text-orange-400 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product)}
                  className="text-red-400 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: table layout */}
        <div className="hidden md:block overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-buyko-text-dim border-b border-white/10">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Sizes</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product._id} className="border-b border-white/5">
                  <td className="px-4 py-3 text-buyko-text">{product.name}</td>
                  <td className="px-4 py-3 text-buyko-text-dim">
                    &#8377;{product.price}
                    {product.originalPrice > product.price && (
                      <span className="ml-2 text-buyko-text-dim/50 line-through">
                        &#8377;{product.originalPrice}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-buyko-text-dim">
                    {product.sizes.map((s) => s.size).join(', ') || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      {product.sizes.map((s) => {
                        const colorClass =
                          s.stock === 0
                            ? 'text-rose-400'
                            : s.stock < 10
                            ? 'text-orange-400'
                            : 'text-green-400';
                        return (
                          <span key={s._id || s.size} className="text-buyko-text-dim">
                            {s.size}: <span className={colorClass}>{s.stock}</span>
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEditModal(product)}
                      className="text-orange-400 hover:underline text-sm mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="text-red-400 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      {modalOpen && (
        <ProductModal
          initialData={editingProduct}
          onSubmit={handleSubmit}
          onClose={closeModal}
        />
      )}
    </div>
  );
}