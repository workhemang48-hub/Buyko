import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAddresses, createAddress } from '../api/address';
import { createOrder, verifyPayment, createCodOrder } from '../api/orders';
import { useCart } from '../context/CartContext';
import AddressForm from '../components/AddressForm';

const GST_THRESHOLD = 2500;
const LOW_GST_RATE = 0.05;
const HIGH_GST_RATE = 0.18;
const FREE_DELIVERY_THRESHOLD = 1000;
const FLAT_DELIVERY_CHARGE = 49;

export default function Checkout({ showToast }) {
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [processing, setProcessing] = useState(false);

  const loadAddresses = async () => {
    try {
      const data = await getAddresses();
      setAddresses(data);

      const defaultAddress = data.find((a) => a.isDefault);
      if (defaultAddress) {
        setSelectedId(defaultAddress._id);
      } else if (data.length === 0) {
        setShowForm(true);
      }
    } catch (err) {
      setError('Failed to load addresses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleAddAddress = async (formData) => {
    const newAddress = await createAddress(formData);
    setAddresses((prev) => [newAddress, ...prev]);
    setSelectedId(newAddress._id);
    setShowForm(false);
    showToast?.('Address saved');
  };

  if (loading) {
    return <p className="text-buyko-text-dim text-center py-16">Loading checkout...</p>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="text-buyko-text-dim">Your cart is empty.</p>
      </div>
    );
  }

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

  const handlePayment = async () => {
    const selectedAddress = addresses.find((a) => a._id === selectedId);
    if (!selectedAddress) return;

    setProcessing(true);
    try {
      const orderItems = cart.items.map((item) => ({
        product: item.product._id,
        name: item.product.name,
        image: item.product.images?.[0],
        size: item.size,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const { orderId, razorpayOrderId, amount, currency, keyId } = await createOrder({
        items: orderItems,
        shippingAddress: selectedAddress,
        subtotal,
        gst: totalGST,
        deliveryCharge,
        total,
      });

      const options = {
        key: keyId,
        amount,
        currency,
        order_id: razorpayOrderId,
        name: 'Buyko',
        description: 'Order payment',
        handler: async (response) => {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
            });
            await refreshCart();
            showToast?.('Payment successful!');
            navigate('/orders');
          } catch (err) {
            showToast?.('Payment verification failed. Please contact support.');
          } finally {
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
          },
        },
        prefill: {
          name: selectedAddress.fullName,
          contact: selectedAddress.phone,
        },
        theme: {
          color: '#fb923c',
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (err) {
      showToast?.('Could not start payment. Please try again.');
      setProcessing(false);
    }
  };

  const handleCodOrder = async () => {
    const selectedAddress = addresses.find((a) => a._id === selectedId);
    if (!selectedAddress) return;

    setProcessing(true);
    try {
      const orderItems = cart.items.map((item) => ({
        product: item.product._id,
        name: item.product.name,
        image: item.product.images?.[0],
        size: item.size,
        quantity: item.quantity,
        price: item.product.price,
      }));

      await createCodOrder({
        items: orderItems,
        shippingAddress: selectedAddress,
        subtotal,
        gst: totalGST,
        deliveryCharge,
        total,
      });

      showToast?.('Order placed! Pay on delivery.');
      navigate('/orders');
    } catch (err) {
      showToast?.(err.response?.data?.message || 'Could not place order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-semibold text-buyko-text mb-8">Checkout</h1>

      <h2 className="text-lg font-medium text-buyko-text mb-4">Delivery address</h2>

      {error && (
        <div className="text-sm text-red-400 bg-red-950/30 border border-red-900 rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {addresses.length > 0 && (
        <div className="space-y-3 mb-6">
          {addresses.map((address) => (
            <label
              key={address._id}
              className={`flex items-start gap-3 border rounded-xl p-4 cursor-pointer transition-colors ${
                selectedId === address._id
                  ? 'border-orange-400 bg-orange-400/5'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <input
                type="radio"
                name="selectedAddress"
                checked={selectedId === address._id}
                onChange={() => setSelectedId(address._id)}
                className="mt-1 accent-orange-400"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs uppercase tracking-wide text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-md">
                    {address.label}
                  </span>
                  {address.isDefault && (
                    <span className="text-xs text-buyko-text-dim">Default</span>
                  )}
                </div>
                <p className="text-buyko-text text-sm font-medium">{address.fullName}</p>
                <p className="text-buyko-text-dim text-sm">
                  {address.addressLine1}
                  {address.addressLine2 && `, ${address.addressLine2}`}, {address.city}, {address.state} {address.pincode}, {address.country}
                </p>
                <p className="text-buyko-text-dim text-sm mt-1">{address.phone}</p>
              </div>
            </label>
          ))}
        </div>
      )}

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="text-sm text-orange-400 hover:underline mb-8"
        >
          + Add new address
        </button>
      ) : (
        <div className="mb-8">
          <AddressForm onSubmit={handleAddAddress} onCancel={() => setShowForm(false)} />
        </div>
      )}

      <div className="border-t border-white/10 pt-6 mb-6 space-y-2">
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
      </div>

      <div className="space-y-3">
        <button
          onClick={handlePayment}
          disabled={!selectedId || processing}
          className="w-full rounded-lg bg-gradient-to-r from-orange-400 to-rose-400 text-white font-medium py-3 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {processing ? 'Processing...' : `Pay ₹${total.toFixed(2)}`}
        </button>

        {total > 1000 ? (
          <button
            onClick={handleCodOrder}
            disabled={!selectedId || processing}
            className="w-full rounded-lg border border-white/15 text-buyko-text font-medium py-3 disabled:opacity-40 disabled:cursor-not-allowed hover:border-white/30 transition-colors"
          >
            Cash on Delivery
          </button>
        ) : (
          <p className="text-xs text-buyko-text-dim text-center">
            Cash on Delivery is available for orders above ₹1000.
          </p>
        )}
      </div>

      {!selectedId && (
        <p className="text-sm text-buyko-text-dim text-center mt-2">
          Select or add a delivery address to continue.
        </p>
      )}
    </div>
  );
}