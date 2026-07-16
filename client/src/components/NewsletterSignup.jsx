import { useState } from 'react';
import { subscribeToNewsletter } from '../api/newsletter';

export default function NewsletterSignup({ showToast }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email.');
      return;
    }

    setSubmitting(true);
    try {
      await subscribeToNewsletter(email);
      showToast?.('Subscribed! Thanks for joining.');
      setEmail('');
    } catch (err) {
      const message = err.response?.data?.message || 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="max-w-2xl mx-auto px-6 py-16 text-center">
      <h2 className="text-2xl font-semibold text-buyko-text mb-2">Stay in the loop</h2>
      <p className="text-buyko-text-dim text-sm mb-6">
        Get notified about new arrivals, restocks, and exclusive offers.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="flex-1 max-w-sm rounded-lg bg-black/20 border border-white/10 px-4 py-3 text-sm text-buyko-text placeholder:text-buyko-text-dim/50 focus:outline-none focus:border-orange-400"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-gradient-to-r from-orange-400 to-rose-400 text-white font-medium px-6 py-3 disabled:opacity-60"
        >
          {submitting ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>

      {error && <p className="text-sm text-rose-400 mt-3">{error}</p>}
    </section>
  );
}