import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import AdminProducts from './pages/admin/AdminProducts';
import ProductDetail from './pages/ProductDetail';
import Footer from './components/Footer';
import SearchResults from './pages/SearchResults';
import AdminSubscribers from './pages/admin/AdminSubscribers';
import OrderDetail from './pages/OrderDetail';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import Profile from './pages/Profile';

function AnimatedRoutes({ showToast }) {
  const location = useLocation();

  return (
    <div key={location.pathname} className="page-transition">
      <Routes location={location}>
        <Route path="/" element={<Home showToast={showToast} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout showToast={showToast} />} />
        <Route path="/orders" element={<Orders showToast={showToast} />} />
        <Route path="/products/:id" element={<ProductDetail showToast={showToast} />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
         <Route path="/profile" element={<Profile showToast={showToast} />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminProducts showToast={showToast} />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route path="/admin/subscribers"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminSubscribers />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminOrders showToast={showToast} />
              </AdminLayout>
            </AdminRoute>
          }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminUsers showToast={showToast} />
                </AdminLayout>
              </AdminRoute>
            }
          />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

function StorefrontNavbar({ showToast }) {
  const location = useLocation();

  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return <Navbar showToast={showToast} />;
}
function StorefrontFooter({ }) {
  const location = useLocation();

  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return <Footer />;
}

function App() {
  const [toast, setToast] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = (message) => {
    setToast(message);
    setToastVisible(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setToastVisible(true));
    });
    setTimeout(() => setToastVisible(false), 2500);
    setTimeout(() => setToast(null), 2900);
  };

  return (
    <BrowserRouter>
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 bg-buyko-coral-from text-white text-sm font-medium px-5 py-3 rounded-full shadow-xl transition-all duration-300 ${
            toastVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
          }`}
        >
          {toast}
        </div>
      )}
      <StorefrontNavbar showToast={showToast} />
      <AnimatedRoutes showToast={showToast} />
      <StorefrontFooter />
    </BrowserRouter>
  );
}

export default App;