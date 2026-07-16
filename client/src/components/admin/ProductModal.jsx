import ProductForm from './ProductForm';

export default function ProductModal({ initialData, onSubmit, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-b from-gray-800 to-black border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
      >
        <h2 className="text-xl font-semibold text-buyko-text mb-4">
          {initialData ? 'Edit product' : 'Add product'}
        </h2>
        <ProductForm initialData={initialData} onSubmit={onSubmit} onCancel={onClose} />
      </div>
    </div>
  );
}