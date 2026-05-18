import { useState, useEffect } from 'react'
import { useArtisanStore } from '../../store/artisanStore'
import { useOrderStore } from '../../store/orderStore'

export default function SellerDashboard() {
  const { getDashboard } = useArtisanStore()
  const { getSellerOrders } = useOrderStore()
  const [dashboard, setDashboard] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [dashData, ordersData] = await Promise.all([
          getDashboard(),
          getSellerOrders(),
        ])
        setDashboard(dashData.stats)
        setOrders(ordersData.orders)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="bg-gray-50 py-8">
      <div className="container-custom">
        <h1 className="section-title">Seller Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6">
            <p className="text-gray-600">Total Products</p>
            <p className="text-3xl font-bold">{dashboard?.totalProducts}</p>
          </div>
          <div className="bg-white rounded-lg p-6">
            <p className="text-gray-600">Active Products</p>
            <p className="text-3xl font-bold">{dashboard?.activeProducts}</p>
          </div>
          <div className="bg-white rounded-lg p-6">
            <p className="text-gray-600">Total Orders</p>
            <p className="text-3xl font-bold">{dashboard?.totalOrders}</p>
          </div>
          <div className="bg-white rounded-lg p-6">
            <p className="text-gray-600">Total Revenue</p>
            <p className="text-3xl font-bold">₹{dashboard?.totalRevenue?.toLocaleString()}</p>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white rounded-lg p-6">
          <h2 className="font-bold text-lg mb-4">Recent Orders</h2>
          {orders.length === 0 ? (
            <p className="text-gray-600">No orders yet</p>
          ) : (
            <div className="space-y-2">
              {orders.slice(0, 10).map(order => (
                <div key={order._id} className="border-b pb-2 flex justify-between">
                  <div>
                    <p className="font-semibold">{order.buyer?.name}</p>
                    <p className="text-sm text-gray-600">{order.orderNumber}</p>
                  </div>
                  <span className="font-bold">₹{order.totalAmount}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
