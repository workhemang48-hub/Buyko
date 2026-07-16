import { useState } from 'react';

const initialState = {
  label: 'Home',
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
};

export default function AddressForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!/^\d{10}$/.test(form.phone)) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }

    if (!/^\d{6}$/.test(form.pincode)) {
      setError('Pincode must be exactly 6 digits.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save address. Please check the details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border border-white/10 rounded-xl p-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-buyko-text-dim block mb-1">Label</label>
          <select
            name="label"
            value={form.label}
            onChange={handleChange}
            className="w-full rounded-lg bg-black/20 border border-white/10 px-3 py-2 text-sm text-buyko-text [&>option]:bg-black [&>option]:text-white"
          >
            <option value="Home">Home</option>
            <option value="Work">Work</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-buyko-text-dim block mb-1">Full name</label>
          <input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            required
            className="w-full rounded-lg bg-black/20 border border-white/10 px-3 py-2 text-sm text-buyko-text"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-buyko-text-dim block mb-1">Phone number</label>
        <input
          name="phone"
          value={form.phone}
          onChange={(e) => {
            const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
            setForm({ ...form, phone: digitsOnly });
          }}
          required
          inputMode="numeric"
          maxLength={10}
          className="w-full rounded-lg bg-black/20 border border-white/10 px-3 py-2 text-sm text-buyko-text"
        />
      </div>

      <div>
        <label className="text-xs text-buyko-text-dim block mb-1">Address line 1</label>
        <input
          name="addressLine1"
          value={form.addressLine1}
          onChange={handleChange}
          required
          className="w-full rounded-lg bg-black/20 border border-white/10 px-3 py-2 text-sm text-buyko-text"
        />
      </div>

      <div>
        <label className="text-xs text-buyko-text-dim block mb-1">Address line 2 (optional)</label>
        <input
          name="addressLine2"
          value={form.addressLine2}
          onChange={handleChange}
          className="w-full rounded-lg bg-black/20 border border-white/10 px-3 py-2 text-sm text-buyko-text"
        />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="text-xs text-buyko-text-dim block mb-1">City</label>
          <input
            name="city"
            value={form.city}
            onChange={handleChange}
            required
            className="w-full rounded-lg bg-black/20 border border-white/10 px-3 py-2 text-sm text-buyko-text"
          />
        </div>
        <div>
          <label className="text-xs text-buyko-text-dim block mb-1">State</label>
          <input
            name="state"
            value={form.state}
            onChange={handleChange}
            required
            className="w-full rounded-lg bg-black/20 border border-white/10 px-3 py-2 text-sm text-buyko-text"
          />
        </div>
        <div>
          <label className="text-xs text-buyko-text-dim block mb-1">Pincode</label>
          <input
            name="pincode"
            value={form.pincode}
            onChange={(e) => {
              const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 6);
              setForm({ ...form, pincode: digitsOnly });
            }}
            required
            inputMode="numeric"
            maxLength={6}
            className="w-full rounded-lg bg-black/20 border border-white/10 px-3 py-2 text-sm text-buyko-text"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-buyko-text-dim block mb-1">Country</label>
        <input
          name="country"
          value={form.country}
          onChange={handleChange}
          required
          className="w-full rounded-lg bg-black/20 border border-white/10 px-3 py-2 text-sm text-buyko-text"
        />
      </div>

      {error && <p className="text-sm text-rose-400">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-gradient-to-r from-orange-400 to-rose-400 text-white text-sm font-medium px-5 py-2 disabled:opacity-60"
        >
          {submitting ? 'Saving...' : 'Save address'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-buyko-text-dim hover:text-buyko-text"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}