import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { updateMyProfile, updateMyPassword, updateMyEmail } from '../api/users';
import { getAddresses, createAddress, deleteAddress, setDefaultAddress } from '../api/address';
import AddressForm from '../components/AddressForm';

export default function Profile({ showToast }) {
  const { user, updateUser } = useAuth();
  const { wishlist, toggleWishlistItem } = useWishlist();
  const [activeTab, setActiveTab] = useState('account');

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);

  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);

  useEffect(() => {
    if (activeTab === 'addresses' && addressesLoading) {
      getAddresses()
        .then(setAddresses)
        .catch(() => showToast?.('Could not load addresses'))
        .finally(() => setAddressesLoading(false));
    }
  }, [activeTab]);

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    setNameError('');
    setPhoneError('');

    if (!name.trim()) {
      setNameError('Name is required');
      return;
    }

    if (phone.trim() && !/^\d{10}$/.test(phone.trim())) {
      setPhoneError('Phone number must be exactly 10 digits');
      return;
    }

    setSavingName(true);
    try {
      const updated = await updateMyProfile(name.trim(), phone.trim());
      updateUser(updated);
      showToast?.('Details updated');
    } catch (err) {
      showToast?.(err.response?.data?.message || 'Could not update details');
    } finally {
      setSavingName(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;

    setSavingPassword(true);
    try {
      await updateMyPassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      showToast?.('Password updated');
    } catch (err) {
      showToast?.(err.response?.data?.message || 'Could not update password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleAddAddress = async (formData) => {
    const newAddress = await createAddress(formData);
    setAddresses((prev) => [newAddress, ...prev]);
    setShowAddressForm(false);
    showToast?.('Address saved');
  };

  const handleDeleteAddress = async (id) => {
    try {
      await deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a._id !== id));
      showToast?.('Address deleted');
    } catch (err) {
      showToast?.('Could not delete address');
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      const updated = await setDefaultAddress(id);
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: a._id === updated._id }))
      );
      showToast?.('Default address updated');
    } catch (err) {
      showToast?.('Could not update default address');
    }
  };

const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!newEmail.trim() || !emailPassword) return;

    setSavingEmail(true);
    try {
      const updated = await updateMyEmail(newEmail.trim(), emailPassword);
      updateUser(updated);
      setNewEmail('');
      setEmailPassword('');
      showToast?.('Email updated');
    } catch (err) {
      showToast?.(err.response?.data?.message || 'Could not update email');
    } finally {
      setSavingEmail(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {    try {
      await toggleWishlistItem(productId);
    } catch (err) {
      showToast?.('Could not update wishlist');
    }
  };

  const wishlistProducts = (wishlist?.products || []).filter(
    (p) => p && typeof p === 'object'
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-2xl font-semibold text-buyko-text mb-8">Your account</h1>

      <div className="flex items-center gap-6 mb-10 text-sm border-b border-white/5">
        <button
          onClick={() => setActiveTab('account')}
          className={`pb-3 transition-colors duration-200 ${
            activeTab === 'account'
              ? 'text-buyko-text border-b-2 border-buyko-coral-from'
              : 'text-buyko-text-dim hover:text-buyko-text'
          }`}
        >
          Account details
        </button>
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`pb-3 transition-colors duration-200 ${
            activeTab === 'wishlist'
              ? 'text-buyko-text border-b-2 border-buyko-coral-from'
              : 'text-buyko-text-dim hover:text-buyko-text'
          }`}
        >
          Wishlist {wishlistProducts.length > 0 && `(${wishlistProducts.length})`}
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 transition-colors duration-200 ${
            activeTab === 'addresses'
              ? 'text-buyko-text border-b-2 border-buyko-coral-from'
              : 'text-buyko-text-dim hover:text-buyko-text'
          }`}
        >
          Addresses {addresses.length > 0 && `(${addresses.length})`}
        </button>
      </div>

      {activeTab === 'account' && (
        <div className="space-y-8 max-w-md">
          <form onSubmit={handleNameSubmit} className="border border-white/10 rounded-xl p-5">
            <h2 className="text-sm font-medium text-buyko-text mb-4">Personal details</h2>

            <label className="text-xs text-buyko-text-dim mb-1 block">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-buyko-text focus:outline-none focus:border-orange-400/50"
            />
            {nameError && <p className="text-xs text-rose-400 mt-1 mb-2">{nameError}</p>}
            {!nameError && <div className="mb-3" />}

            <label className="text-xs text-buyko-text-dim mb-1 block">Phone number</label>
            <input
              type="tel"
              placeholder="10-digit number"
              value={phone}
              maxLength={10}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-buyko-text focus:outline-none focus:border-orange-400/50"
            />
            {phoneError && <p className="text-xs text-rose-400 mt-1 mb-2">{phoneError}</p>}
            {!phoneError && <div className="mb-4" />}

            <button
              type="submit"
              disabled={savingName}
              className="text-sm font-medium px-4 py-2 rounded-lg bg-gradient-to-r from-orange-400 to-rose-400 text-white disabled:opacity-60"
            >
              {savingName ? 'Saving...' : 'Save details'}
            </button>
          </form>
        <form onSubmit={handleEmailSubmit} className="border border-white/10 rounded-xl p-5">
            <h2 className="text-sm font-medium text-buyko-text mb-1">Change email</h2>
            <p className="text-xs text-buyko-text-dim mb-4">
              Current email: {user?.email}
            </p>

            <label className="text-xs text-buyko-text-dim mb-1 block">New email</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-buyko-text mb-3 focus:outline-none focus:border-orange-400/50"
            />

            <label className="text-xs text-buyko-text-dim mb-1 block">Current password</label>
            <div className="relative mb-4">
              <input
                type={showEmailPassword ? 'text' : 'password'}
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 pr-10 text-sm text-buyko-text focus:outline-none focus:border-orange-400/50"
              />
              <button
                type="button"
                onClick={() => setShowEmailPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-buyko-text-dim hover:text-buyko-text"
              >
                {showEmailPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={savingEmail}
              className="text-sm font-medium px-4 py-2 rounded-lg bg-gradient-to-r from-orange-400 to-rose-400 text-white disabled:opacity-60"
            >
              {savingEmail ? 'Saving...' : 'Update email'}
            </button>
          </form>
          <form onSubmit={handlePasswordSubmit} className="border border-white/10 rounded-xl p-5">
            <h2 className="text-sm font-medium text-buyko-text mb-4">Change password</h2>
            <div className="relative mb-3">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 pr-10 text-sm text-buyko-text focus:outline-none focus:border-orange-400/50"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-buyko-text-dim hover:text-buyko-text"
              >
                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="relative mb-4">
              <input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 pr-10 text-sm text-buyko-text focus:outline-none focus:border-orange-400/50"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-buyko-text-dim hover:text-buyko-text"
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <button
              type="submit"
              disabled={savingPassword}
              className="text-sm font-medium px-4 py-2 rounded-lg bg-gradient-to-r from-orange-400 to-rose-400 text-white disabled:opacity-60"
            >
              {savingPassword ? 'Updating...' : 'Update password'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'wishlist' && (
        <div>
          {wishlistProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-buyko-text-dim mb-4">Your wishlist is empty.</p>
              <Link to="/" className="text-orange-400 hover:underline text-sm">
                Browse products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {wishlistProducts.map((product) => (
                <div
                  key={product._id}
                  className="bg-black/20 rounded-xl overflow-hidden border border-white/5 relative"
                >
                  <Link to={`/products/${product._id}`}>
                    <div className="aspect-square bg-gradient-to-br from-orange-400 to-rose-400 flex items-center justify-center overflow-hidden">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white/60 text-xs">No image</span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-sm text-buyko-text truncate">{product.name}</p>
                      <span className="text-sm font-medium text-buyko-text">
                        ₹{product.price}
                      </span>
                    </div>
                  </Link>
                  <button
                    onClick={() => handleRemoveFromWishlist(product._id)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 flex items-center justify-center hover:bg-black/90 transition-colors"
                  >
                    <Heart size={14} className="fill-orange-400 text-orange-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'addresses' && (
        <div className="max-w-md">
          {addressesLoading ? (
            <p className="text-buyko-text-dim text-sm">Loading addresses...</p>
          ) : (
            <>
              {addresses.length > 0 && (
                <div className="space-y-3 mb-6">
                  {addresses.map((address) => (
                    <div
                      key={address._id}
                      className={`border rounded-xl p-4 ${
                        address.isDefault ? 'border-orange-400 bg-orange-400/5' : 'border-white/10'
                      }`}
                    >
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

                      <div className="flex gap-4 mt-3">
                        {!address.isDefault && (
                          <button
                            onClick={() => handleSetDefaultAddress(address._id)}
                            className="text-xs text-orange-400 hover:underline"
                          >
                            Set as default
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAddress(address._id)}
                          className="text-xs text-rose-400 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!showAddressForm ? (
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="text-sm text-orange-400 hover:underline"
                >
                  + Add new address
                </button>
              ) : (
                <AddressForm
                  onSubmit={handleAddAddress}
                  onCancel={() => setShowAddressForm(false)}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}