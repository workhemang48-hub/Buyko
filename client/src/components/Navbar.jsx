import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SearchBar from './SearchBar';

const navLinkClass =
  'relative hover:text-buyko-text transition-colors duration-200 after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-buyko-coral-from after:transition-all after:duration-200 hover:after:w-full';

export default function Navbar({ showToast }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/');
    showToast('Logged out successfully');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="border-b border-buyko-border relative">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-10">
        <Link to="/" onClick={closeMenu} className="flex items-end gap-2 transition-transform duration-200 hover:scale-105">
        <img src="/mark.svg" alt="" className="h-7 mb-6" />
        <img src="/buykologo.png" alt="Buyko" className="h-18" />
        <span className="hidden sm:block text-[10px] leading-snug tracking-widest text-buyko-text-dim uppercase border-l border-buyko-border pl-5 ml-3 mb-6">
          Style Without<br />Limits
        </span>
      </Link>
         {/* Search — desktop */}
        <div className="hidden md:block">
          <SearchBar />
        </div>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 text-sm text-buyko-text-dim">
          <Link to="/" className={navLinkClass}>Shop</Link>
          <Link to="/cart" className={navLinkClass}>Cart</Link>
          <Link to="/orders" className={navLinkClass}>Orders</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className={navLinkClass}>Admin</Link>
          )}

          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/profile" className={`text-buyko-text ${navLinkClass}`}>
                {user.name}
              </Link>
              <button onClick={handleLogout} className={navLinkClass}>
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className={navLinkClass}>Login</Link>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMenuOpen((open) => !open)}
          className="md:hidden text-buyko-text-dim hover:text-buyko-text transition-colors"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile dropdown */}
        <div
        className={`md:hidden border-t border-buyko-border overflow-hidden transition-all duration-300 ease-in-out ${
            menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 border-t-0'
        }`}
        >
        <div className="px-6 py-4 flex flex-col gap-4 text-sm text-buyko-text-dim bg-buyko-bg">
          {/* Search — mobile */}
            <div className="pb-2 border-b border-buyko-border">
              <SearchBar />
            </div>
            <Link to="/" onClick={closeMenu} className="hover:text-buyko-text transition-colors">Shop</Link>
            <Link to="/cart" onClick={closeMenu} className="hover:text-buyko-text transition-colors">Cart</Link>
            <Link to="/orders" onClick={closeMenu} className="hover:text-buyko-text transition-colors">Orders</Link>
            {user?.role === 'admin' && (
            <Link to="/admin" onClick={closeMenu} className="hover:text-buyko-text transition-colors">Admin</Link>
            )}

           {user ? (
            <div className="flex items-center justify-between pt-2 border-t border-buyko-border">
                <Link to="/profile" onClick={closeMenu} className={`text-buyko-text ${navLinkClass}`}>
                  {user.name}
                </Link>
                <button onClick={handleLogout} className="hover:text-buyko-text transition-colors">
                Logout
                </button>
            </div>
            ) : (
            <Link to="/login" onClick={closeMenu} className="hover:text-buyko-text transition-colors">Login</Link>
            )}
        </div>
        </div>
    </header>
  );
}