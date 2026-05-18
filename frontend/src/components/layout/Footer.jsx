import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-indigo text-white py-12 mt-16">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-3">
              <span className="text-3xl">🪔</span> Karigar
            </h2>
            <p className="text-gray-300 text-sm">
              Connecting rural Indian artisans directly to global buyers, preserving cultural heritage through authentic handicrafts.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/products" className="hover:text-white">Browse Products</Link></li>
              <li><Link to="/artisans" className="hover:text-white">Discover Artisans</Link></li>
              <li><Link to="/register" className="hover:text-white">Sell with Us</Link></li>
              <li><a href="#" className="hover:text-white">About Us</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#" className="hover:text-white">Help Center</a></li>
              <li><a href="#" className="hover:text-white">Contact Us</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms of Service</a></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-bold mb-4">Follow Us</h3>
            <div className="flex gap-3">
              <a href="#" className="text-2xl hover:text-saffron">📘</a>
              <a href="#" className="text-2xl hover:text-saffron">📷</a>
              <a href="#" className="text-2xl hover:text-saffron">𝕏</a>
              <a href="#" className="text-2xl hover:text-saffron">📺</a>
            </div>
          </div>
        </div>

        <hr className="border-gray-600 my-6" />

        <div className="text-center text-gray-400 text-sm">
          <p>&copy; 2024 Karigar. Empowering Indian Artisans. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
