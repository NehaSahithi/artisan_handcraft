import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const { items } = useCartStore()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const accountPath =
    user?.role === 'artisan'
      ? '/seller/dashboard'
      : user?.role === 'admin'
        ? '/admin/dashboard'
        : '/dashboard'

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully!')
    navigate('/')
    setMenuOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container-custom py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-saffron flex items-center gap-2">
          <span className="text-3xl">🪔</span> Karigar
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center gap-6 font-semibold text-gray-700">
          <li><Link to="/products" className="hover:text-saffron">Products</Link></li>
          <li><Link to="/artisans" className="hover:text-saffron">Artisans</Link></li>
          {user?.role === 'artisan' && <li><Link to="/seller/dashboard" className="hover:text-saffron">My Store</Link></li>}
          {user?.role === 'admin' && <li><Link to="/admin/dashboard" className="hover:text-saffron">Admin</Link></li>}
        </ul>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Cart */}
          {user?.role === 'buyer' && (
            <Link to="/cart" className="relative">
              <span className="text-2xl">🛒</span>
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-saffron text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>
          )}

          {/* Auth Links */}
          {!user ? (
            <>
              <Link to="/login" className="btn-outline hidden sm:block">Login</Link>
              <Link to="/register" className="btn-primary">Sign Up</Link>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 font-semibold text-gray-700 hover:text-saffron"
              >
                👤 {user.name}
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <Link
                    to={accountPath}
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 hover:bg-gray-50"
                  >
                    My Account
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600 font-semibold"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-2xl"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-gray-50 border-t border-gray-200 p-4">
          <ul className="space-y-3">
            <li><Link to="/products" className="block font-semibold text-gray-700">Products</Link></li>
            <li><Link to="/artisans" className="block font-semibold text-gray-700">Artisans</Link></li>
            {user?.role === 'artisan' && <li><Link to="/seller/dashboard" className="block font-semibold text-gray-700">My Store</Link></li>}
            {user?.role === 'admin' && <li><Link to="/admin/dashboard" className="block font-semibold text-gray-700">Admin</Link></li>}
          </ul>
        </div>
      )}
    </nav>
  )
}
