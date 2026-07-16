import { useState } from 'react';
import { uploadImage } from '../../api/upload';
const SIZE_OPTIONS = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];

export default function ProductForm({ initialData, onSubmit, onCancel }) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState(initialData?.category || []);

  const toggleCategory = (value) => {
    setCategory((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    );
  };
  const [subCategory, setSubCategory] = useState(initialData?.subCategory || '');
  const [bestseller, setBestseller] = useState(initialData?.bestseller || false);
  const [featured, setFeatured] = useState(initialData?.featured || false);
  const [price, setPrice] = useState(initialData?.price?.toString() || '');
  const [originalPrice, setOriginalPrice] = useState(initialData?.originalPrice?.toString() || '');
  const [sizes, setSizes] = useState(
  initialData?.sizes?.length
    ? initialData.sizes.map((s) => ({ size: s.size.toUpperCase(), stock: s.stock.toString() }))
    : []
);
  const [images, setImages] = useState(() => {
  const existing = initialData?.images || [];
  const padded = [...existing];
  while (padded.length < 4) padded.push('');
  return padded;
});
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [uploadError, setUploadError] = useState('');

  const handleImageUpload = async (index, file) => {
    if (!file) return;
    setUploadError('');
    setUploadingIndex(index);
    try {
      const url = await uploadImage(file);
      setImages((prev) => {
        const next = [...prev];
        next[index] = url;
        return next;
      });
    } catch (err) {
      setUploadError('Image upload failed. Please try again.');
    } finally {
      setUploadingIndex(null);
    }
  };

  const removeImage = (index) => {
    setImages((prev) => {
      const next = [...prev];
      next[index] = '';
      return next;
    });
  };
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const discountPercent =
    originalPrice && price && Number(originalPrice) > Number(price)
      ? Math.round((1 - Number(price) / Number(originalPrice)) * 100)
      : null;

  const toggleSize = (sizeValue) => {
  setSizes((prev) => {
    const exists = prev.some((row) => row.size === sizeValue);
    if (exists) {
      return prev.filter((row) => row.size !== sizeValue);
    }
    return [...prev, { size: sizeValue, stock: '' }];
  });
};

const handleStockChange = (sizeValue, stockValue) => {
  setSizes((prev) =>
    prev.map((row) => (row.size === sizeValue ? { ...row, stock: stockValue } : row))
  );
};
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

   if (!name || !description || category.length === 0 || !subCategory || !price) {
      setError('Please fill in name, description, category, sub-category, and price.');
      return;
    }

    const cleanedSizes = sizes.map((row) => ({ size: row.size, stock: Number(row.stock) || 0 }));

    const cleanedImages = images.filter((url) => url !== '');

    const payload = {
      name,
      description,
      category,
      subCategory,
      bestseller,
      featured,
      price: Number(price),
      sizes: cleanedSizes,
      images: cleanedImages,
    };

    if (originalPrice) {
      payload.originalPrice = Number(originalPrice);
    }

    setSubmitting(true);
    try {
      await onSubmit(payload);
    } catch (err) {
      const message = err.response?.data?.message || 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="text-sm text-red-400 bg-red-950/30 border border-red-900 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm text-buyko-text-dim mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg bg-black/20 border border-white/10 px-4 py-2 text-buyko-text focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      <div>
        <label className="block text-sm text-buyko-text-dim mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-lg bg-black/20 border border-white/10 px-4 py-2 text-buyko-text focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-buyko-text-dim mb-1">Category</label>
          <div className="flex gap-4 pt-2">
            {['Men', 'Women'].map((value) => (
              <label key={value} className="flex items-center gap-2 text-sm text-buyko-text cursor-pointer">
                <input
                  type="checkbox"
                  checked={category.includes(value)}
                  onChange={() => toggleCategory(value)}
                  className="accent-orange-400"
                />
                {value}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm text-buyko-text-dim mb-1">Sub category</label>
          <select
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
            className="w-full rounded-lg bg-black/20 border border-white/10 px-4 py-2 text-buyko-text focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="" style={{ backgroundColor: '#18181b', color: '#e4e4e7' }}>Select sub category</option>
            <option value="Topwear" style={{ backgroundColor: '#18181b', color: '#e4e4e7' }}>Topwear</option>
            <option value="Bottomwear" style={{ backgroundColor: '#18181b', color: '#e4e4e7' }}>Bottomwear</option>
            <option value="Winterwear" style={{ backgroundColor: '#18181b', color: '#e4e4e7' }}>Winterwear</option>
          </select>
        </div>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-buyko-text cursor-pointer">
          <input
            type="checkbox"
            checked={bestseller}
            onChange={(e) => setBestseller(e.target.checked)}
            className="accent-orange-400"
          />
          Add to bestseller
        </label>
        <label className="flex items-center gap-2 text-sm text-buyko-text cursor-pointer">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="accent-orange-400"
          />
          Add to featured (Latest Arrivals)
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-buyko-text-dim mb-1">Price (&#8377;)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min="0"
            className="w-full rounded-lg bg-black/20 border border-white/10 px-4 py-2 text-buyko-text focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <div>
          <label className="block text-sm text-buyko-text-dim mb-1">
            Original price (&#8377;) <span className="text-buyko-text-dim/60">optional</span>
          </label>
          <input
            type="number"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            min="0"
            className="w-full rounded-lg bg-black/20 border border-white/10 px-4 py-2 text-buyko-text focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
      </div>

      {discountPercent !== null && (
        <p className="text-sm text-orange-400">{discountPercent}% off when saved</p>
      )}

      <div>
        <label className="block text-sm text-buyko-text-dim mb-2">Sizes & stock</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {SIZE_OPTIONS.map((sizeValue) => {
            const isSelected = sizes.some((row) => row.size === sizeValue);
            return (
              <button
                key={sizeValue}
                type="button"
                onClick={() => toggleSize(sizeValue)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  isSelected
                    ? 'bg-orange-400/20 border-orange-400 text-orange-400'
                    : 'border-white/10 text-buyko-text-dim hover:border-white/30'
                }`}
              >
                {sizeValue}
              </button>
            );
          })}
        </div>

        {sizes.length > 0 && (
          <div className="space-y-2">
            {sizes.map((row) => (
              <div key={row.size} className="flex gap-2 items-center">
                <span className="w-14 text-sm text-buyko-text">{row.size}</span>
                <input
                  type="number"
                  placeholder="Stock"
                  value={row.stock}
                  onChange={(e) => handleStockChange(row.size, e.target.value)}
                  min="0"
                  className="w-28 rounded-lg bg-black/20 border border-white/10 px-3 py-2 text-buyko-text text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <button
                  type="button"
                  onClick={() => toggleSize(row.size)}
                  className="text-red-400 hover:text-red-300 text-sm px-2"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm text-buyko-text-dim mb-2">Product images</label>
        {uploadError && (
          <p className="text-sm text-red-400 mb-2">{uploadError}</p>
        )}
        <div className="grid grid-cols-4 gap-3">
          {images.map((url, index) => (
            <div key={index} className="relative">
              {url ? (
                <div className="relative aspect-square rounded-lg overflow-hidden border border-white/10">
                  <img src={url} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-black/70 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center hover:bg-black/90"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label className="aspect-square rounded-lg border border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-orange-400 transition-colors bg-black/20">
                  {uploadingIndex === index ? (
                    <span className="text-xs text-buyko-text-dim">Uploading...</span>
                  ) : (
                    <span className="text-xs text-buyko-text-dim">+ Upload</span>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingIndex !== null}
                    onChange={(e) => handleImageUpload(index, e.target.files?.[0])}
                  />
                </label>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 rounded-lg bg-gradient-to-r from-orange-400 to-rose-400 text-white font-medium py-2.5 disabled:opacity-60"
        >
          {submitting ? 'Saving...' : 'Save product'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 rounded-lg border border-white/10 text-buyko-text-dim hover:text-buyko-text transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}