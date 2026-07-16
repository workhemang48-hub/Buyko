import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const adminLinkClass = (active) =>
  `text-sm pb-1 border-b-2 transition-colors duration-200 ${
    active
      ? 'text-buyko-text border-buyko-coral-from'
      : 'text-buyko-text-dim border-transparent hover:text-buyko-text'
  }`;

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const tabs = [
    { label: 'Dashboard', path: '/admin', enabled: true },
    { label: 'Products', path: '/admin/products', enabled: true },
    { label: 'Subscribers', path: '/admin/subscribers', enabled: true },
    { label: 'Orders', path: '/admin/orders', enabled: true },
    { label: 'Users', path: '/admin/users', enabled: true },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div>
      <div className="border-b border-buyko-border">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between gap-6 overflow-x-auto">
          <div className="flex items-center gap-6">
            {tabs.map((tab) =>
              tab.enabled ? (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`${adminLinkClass(location.pathname === tab.path)} py-4`}
                >
                  {tab.label}
                </Link>
              ) : (
                <span
                  key={tab.path}
                  className="text-sm py-4 text-buyko-text-dim/40 cursor-not-allowed whitespace-nowrap"
                  title="Coming soon"
                >
                  {tab.label}
                </span>
              )
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-buyko-text-dim whitespace-nowrap">
            <Link to="/" className="hover:text-buyko-text transition-colors duration-200">
              Back to shop
            </Link>
            <span className="text-buyko-text">{user?.name}</span>
            <button onClick={handleLogout} className="hover:text-buyko-text transition-colors duration-200">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">{children}</div>
    </div>
  );
}