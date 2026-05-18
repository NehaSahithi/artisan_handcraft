import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron to-clay flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-2xl mb-4">Page Not Found</p>
        <p className="text-lg mb-8 opacity-90">The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn-primary bg-white text-clay hover:bg-gray-100">
          Go Home
        </Link>
      </div>
    </div>
  )
}
