import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
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
      <h1 className="text-3xl font-semibold text-buyko-text mb-2 text-center">Log In</h1>
      <p className="text-buyko-text-dim text-sm text-center mb-8">
        Welcome back. Enter your details to continue.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-sm text-red-400 bg-red-950/30 border border-red-900 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

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
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg bg-black/20 border border-white/10 px-4 py-2 pr-11 text-buyko-text focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-buyko-text-dim hover:text-buyko-text"
              tabIndex={-1}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-2 rounded-lg bg-gradient-to-r from-orange-400 to-rose-400 text-white font-medium py-2.5 disabled:opacity-60"
        >
          {submitting ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <p className="text-sm text-buyko-text-dim text-center mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-orange-400 hover:underline">
          Register
        </Link>
      </p>
      <p className="text-sm text-buyko-text-dim text-center mt-2">
        <Link to="/forgot-password" className="text-orange-400 hover:underline">
          Forgot password?
        </Link>
      </p>
    </div>
  );
}