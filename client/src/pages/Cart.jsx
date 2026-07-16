import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import { Skeleton } from '../components/Skeleton';

export default function Cart() {
  const { cart, updateCartItem, removeCartItem } = useCart();
  const [busyItemId, setBusyItemId] = useState(null);

  if (!cart) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-16">
        <Skeleton className="h-9 w-40 mb-8" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 border border-white/10 rounded-xl p-4">
              <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
          ))}
        </div>
        <div className="mt-8 border-t border-white/10 pt-6">
          <div className="w-full md:max-w-xs md:ml-auto space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-5 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-16 text-center">
        <h1 className="text-3xl font-semibold text-buyko-text mb-2">Your Cart</h1>
        <p className="text-buyko-text-dim text-sm mb-6">Your cart is empty.</p>
        <Link to="/" className="text-orange-400 hover:underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  const handleQuantityChange = async (itemId, newQuantity) => {
    setBusyItemId(itemId);
    try {
      if (newQuantity < 1) {
        await removeCartItem(itemId);
      } else {
        await updateCartItem(itemId, newQuantity);
      }
    } finally {
      setBusyItemId(null);
    }
  };

  const handleRemove = async (itemId) => {
    setBusyItemId(itemId);
    try {
      await removeCartItem(itemId);
    } finally {
      setBusyItemId(null);
    }
  };

  const GST_THRESHOLD = 2500;
  const LOW_GST_RATE = 0.05;
  const HIGH_GST_RATE = 0.18;
  const FREE_DELIVERY_THRESHOLD = 1000;
  const FLAT_DELIVERY_CHARGE = 49;

  let subtotal = 0;
  let totalGST = 0;

  cart.items.forEach((item) => {
    const lineTotal = item.product.price * item.quantity;
    const gstRate = item.product.price > GST_THRESHOLD ? HIGH_GST_RATE : LOW_GST_RATE;
    subtotal += lineTotal;
    totalGST += lineTotal * gstRate;
  });

  const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : FLAT_DELIVERY_CHARGE;
  const total = subtotal + totalGST + deliveryCharge;

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-semibold text-buyko-text mb-8">Your Cart</h1>

      <div className="space-y-4">
        {cart.items.map((item) => {
          const isBusy = busyItemId === item._id;
          return (
           <div
              key={item._id}
              className="flex flex-col sm:flex-row sm:items-center gap-4 border border-white/10 rounded-xl p-4"
            >
              <div className="flex gap-4">
                <img
                  src={item.product.images?.[0]}
                  alt={item.product.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
                />

                <div className="flex-1">
                  <p className="text-buyko-text font-medium">{item.product.name}</p>
                  <p className="text-buyko-text-dim text-sm">Size: {item.size}</p>
                  <p className="text-buyko-text text-sm mt-1">₹{item.product.price}</p>
                </div>
              </div>

              <div className="flex w-full items-center justify-end sm:w-auto sm:ml-auto sm:justify-end gap-4 sm:gap-2">
                <div className="flex items-center gap-2">
                  <button
                    disabled={isBusy}
                    onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                    className="w-8 h-8 rounded-md border border-white/10 text-buyko-text disabled:opacity-40"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-buyko-text">{item.quantity}</span>
                  <button
                    disabled={isBusy}
                    onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                    className="w-8 h-8 rounded-md border border-white/10 text-buyko-text disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                <button
                  disabled={isBusy}
                  onClick={() => handleRemove(item._id)}
                  className="text-sm text-rose-400 hover:underline disabled:opacity-40 sm:ml-4"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 border-t border-white/10 pt-6">
        <div className="w-full md:max-w-xs md:ml-auto space-y-2">
          <div className="flex justify-between text-sm text-buyko-text-dim">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-buyko-text-dim">
            <span>GST</span>
            <span>₹{totalGST.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-buyko-text-dim">
            <span>Delivery</span>
            <span>{deliveryCharge === 0 ? 'Free' : `₹${deliveryCharge.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between text-base text-buyko-text font-semibold pt-2 border-t border-white/10">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
          <p className="text-xs text-buyko-text-dim/60 pt-1">
            Delivery charge shown is for domestic orders and may vary by location. Final delivery and any international shipping charges are calculated at checkout.
          </p>
        </div>

        <Link
          to="/checkout"
          className="block w-full text-center rounded-lg bg-gradient-to-r from-orange-400 to-rose-400 text-white font-medium px-8 py-3 mt-6"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}