import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      const message = err.response?.data?.message || 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-3xl font-semibold text-buyko-text mb-2 text-center">Create Account</h1>
      <p className="text-buyko-text-dim text-sm text-center mb-8">
        Join Buyko and start shopping.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-sm text-red-400 bg-red-950/30 border border-red-900 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm text-buyko-text-dim mb-1">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-lg bg-black/20 border border-white/10 px-4 py-2 text-buyko-text focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm text-buyko-text-dim mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg bg-black/20 border border-white/10 px-4 py-2 text-buyko-text focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm text-buyko-text-dim mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-lg bg-black/20 border border-white/10 px-4 py-2 text-buyko-text focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-2 rounded-lg bg-gradient-to-r from-orange-400 to-rose-400 text-white font-medium py-2.5 disabled:opacity-60"
        >
          {submitting ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="text-sm text-buyko-text-dim text-center mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-orange-400 hover:underline">
          Log In
        </Link>
      </p>
    </div>
  );
}