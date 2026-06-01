import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  User as UserIcon, 
  Menu, 
  X, 
  LogOut, 
  Compass, 
  Store, 
  Settings, 
  Shield 
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import toast from 'react-hot-toast';
import { LotusMotif } from '../common/Heritage';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { getTotalItems } = useCartStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully. Namaste!');
      navigate('/');
    } catch (e) {
      toast.error('Failed to log out. Please try again.');
    }
  };

  const accountPath =
    user?.role === 'artisan'
      ? '/seller/dashboard'
      : user?.role === 'admin'
        ? '/admin/dashboard'
        : '/buyer/dashboard'; // Unified buyer dashboard

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-amber-100 shadow-sm transition-all duration-300">
      <div className="container-custom py-3.5 flex items-center justify-between">
        
        {/* Brand Logo with Lotus Motif */}
        <Link to="/" className="flex items-center gap-2 group">
          <LotusMotif className="w-8 h-8 text-primary group-hover:scale-105 transition-all duration-300" />
          <span className="text-2xl font-serif font-bold tracking-tight text-stone-800">
            Karigar<span className="text-primary">.</span>
          </span>
        </Link>

        {/* Desktop Directory Links */}
        <ul className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
          <li>
            <Link 
              to="/products" 
              className={`hover:text-primary transition-all duration-200 flex items-center gap-1.5 ${
                location.pathname === '/products' ? 'text-primary font-semibold' : ''
              }`}
            >
              <Compass className="w-4 h-4" />
              Browse Crafts
            </Link>
          </li>
          <li>
            <Link 
              to="/artisans" 
              className={`hover:text-primary transition-all duration-200 flex items-center gap-1.5 ${
                location.pathname === '/artisans' ? 'text-primary font-semibold' : ''
              }`}
            >
              <Store className="w-4 h-4" />
              Our Artisans
            </Link>
          </li>
          {user?.role === 'artisan' && (
            <li>
              <Link 
                to="/seller/dashboard" 
                className="hover:text-primary transition-all duration-200 text-primary font-medium flex items-center gap-1.5"
              >
                <Store className="w-4 h-4 text-primary" />
                My Karigar Store
              </Link>
            </li>
          )}
          {user?.role === 'admin' && (
            <li>
              <Link 
                to="/admin/dashboard" 
                className="hover:text-primary transition-all duration-200 text-primary font-medium flex items-center gap-1.5"
              >
                <Shield className="w-4 h-4 text-primary" />
                Admin Dashboard
              </Link>
            </li>
          )}
        </ul>

        {/* Action Elements */}
        <div className="flex items-center gap-4">
          
          {/* Cart Badge (Buyer specific) */}
          {(!user || user.role === 'buyer') && (
            <Link 
              to="/cart" 
              className="relative p-2 rounded-full text-stone-600 hover:text-primary hover:bg-stone-50 transition-all duration-200"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-6 h-6 stroke-[1.8]" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white animate-pulse">
                  {getTotalItems()}
                </span>
              )}
            </Link>
          )}

          {/* User Profile dropdown or sign up anchor links */}
          {!user ? (
            <div className="hidden sm:flex items-center gap-3">
              <Link to="/login" className="btn-outline py-2 px-4 border-amber-200 text-stone-700 text-sm">
                Login
              </Link>
              <Link to="/register" className="btn-primary py-2 px-4 text-sm bg-primary hover:bg-opacity-95 text-white">
                Sign Up
              </Link>
            </div>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-100 hover:border-primary hover:bg-amber-50/30 text-stone-700 font-medium text-sm transition-all duration-200"
                aria-haspopup="true"
                aria-expanded={userMenuOpen}
              >
                <div className="w-6 h-6 rounded-full bg-amber-100 text-primary flex items-center justify-center overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-3.5 h-3.5" />
                  )}
                </div>
                <span className="max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2.5 w-48 bg-white border border-amber-100 rounded-xl shadow-lg py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-stone-50 mb-1">
                    <p className="text-xs text-stone-400">Signed in as</p>
                    <p className="text-sm font-semibold text-stone-700 truncate">{user.email}</p>
                  </div>
                  
                  <Link
                    to={accountPath}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-stone-600 hover:bg-amber-50/50 hover:text-primary transition-all duration-200"
                  >
                    <Settings className="w-4 h-4" />
                    My Account
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50/50 font-semibold transition-all duration-200 text-left border-t border-stone-50 mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile Hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-stone-600 hover:text-primary hover:bg-stone-50 transition-all duration-200"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-stone-50/95 backdrop-blur-md border-t border-amber-100 py-4 px-4 space-y-3 shadow-inner animate-in fade-in slide-in-from-top-4 duration-200">
          <ul className="space-y-2.5">
            <li>
              <Link 
                to="/products" 
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-stone-600 hover:bg-amber-50 hover:text-primary font-medium text-sm transition-all duration-200"
              >
                <Compass className="w-4.5 h-4.5" />
                Browse Crafts
              </Link>
            </li>
            <li>
              <Link 
                to="/artisans" 
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-stone-600 hover:bg-amber-50 hover:text-primary font-medium text-sm transition-all duration-200"
              >
                <Store className="w-4.5 h-4.5" />
                Our Artisans
              </Link>
            </li>
            {user?.role === 'artisan' && (
              <li>
                <Link 
                  to="/seller/dashboard" 
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-primary hover:bg-amber-50 font-semibold text-sm transition-all duration-200"
                >
                  <Store className="w-4.5 h-4.5 text-primary" />
                  My Karigar Store
                </Link>
              </li>
            )}
            {user?.role === 'admin' && (
              <li>
                <Link 
                  to="/admin/dashboard" 
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-primary hover:bg-amber-50 font-semibold text-sm transition-all duration-200"
                >
                  <Shield className="w-4.5 h-4.5 text-primary" />
                  Admin Dashboard
                </Link>
              </li>
            )}
          </ul>
          
          {!user && (
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-amber-100/60">
              <Link to="/login" className="btn-outline py-2 text-center text-sm">
                Login
              </Link>
              <Link to="/register" className="btn-primary py-2 text-center text-sm">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
