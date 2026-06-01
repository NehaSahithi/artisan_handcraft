import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

// Layout & Infrastructure
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/layout/ScrollToTop';
import ErrorBoundary from './components/layout/ErrorBoundary';

// Public & Catalog Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ArtisansPage from './pages/ArtisansPage';
import ArtisanDetailPage from './pages/ArtisanDetailPage';
import NotFoundPage from './pages/NotFoundPage';

// Authentication Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';

// Buyer Pages
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import BuyerDashboard from './pages/buyer/BuyerDashboard';

// Seller Pages
import SellerDashboard from './pages/seller/SellerDashboard';
import AddProductPage from './pages/seller/AddProductPage';
import EditProductPage from './pages/seller/EditProductPage';
import SellerOrdersPage from './pages/seller/SellerOrdersPage';
import SellerSettingsPage from './pages/seller/SellerSettingsPage';

// Administrative Pages
import AdminDashboard from './pages/admin/AdminDashboard';

// Protected Route Guard Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    // If buyer tries to access seller views, or vice versa, redirect safely to homepage
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { checkAuth } = useAuthStore();

  // Dynamically verify httpOnly cookie session on load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/artisans" element={<ArtisansPage />} />
              <Route path="/artisans/:id" element={<ArtisanDetailPage />} />
              
              {/* Auth Paths */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
              <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

              {/* Secure Buyer Routes */}
              <Route path="/cart" element={<ProtectedRoute requiredRole="buyer"><CartPage /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute requiredRole="buyer"><CheckoutPage /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute requiredRole="buyer"><BuyerDashboard /></ProtectedRoute>} />
              <Route path="/buyer/dashboard" element={<ProtectedRoute requiredRole="buyer"><BuyerDashboard /></ProtectedRoute>} />

              {/* Secure Seller/Artisan Routes */}
              <Route path="/seller/dashboard" element={<ProtectedRoute requiredRole="artisan"><SellerDashboard /></ProtectedRoute>} />
              <Route path="/seller/products/new" element={<ProtectedRoute requiredRole="artisan"><AddProductPage /></ProtectedRoute>} />
              <Route path="/seller/products/edit/:id" element={<ProtectedRoute requiredRole="artisan"><EditProductPage /></ProtectedRoute>} />
              <Route path="/seller/orders" element={<ProtectedRoute requiredRole="artisan"><SellerOrdersPage /></ProtectedRoute>} />
              <Route path="/seller/settings" element={<ProtectedRoute requiredRole="artisan"><SellerSettingsPage /></ProtectedRoute>} />

              {/* Secure Administrative Panel */}
              <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />

              {/* Fallback 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#3d302c',
              border: '1px solid #f3eae5',
              fontFamily: 'Outfit, sans-serif'
            }
          }} 
        />
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
