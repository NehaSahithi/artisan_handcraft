import { useState, useEffect } from 'react'
import { useOrderStore } from '../../store/orderStore'

export default function BuyerDashboard() {
  const { getMyOrders, orders, loading } = useOrderStore()
  const [activeTab, setActiveTab] = useState('orders')

  useEffect(() => {
    getMyOrders()
  }, [])

  return (
    <div className="bg-gray-50 py-8">
      <div className="container-custom">
        <h1 className="section-title">My Dashboard</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 font-semibold ${activeTab === 'orders' ? 'border-b-2 border-saffron text-saffron' : 'text-gray-600'}`}
          >
            My Orders
          </button>
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`px-4 py-2 font-semibold ${activeTab === 'wishlist' ? 'border-b-2 border-saffron text-saffron' : 'text-gray-600'}`}
          >
            Wishlist
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 font-semibold ${activeTab === 'profile' ? 'border-b-2 border-saffron text-saffron' : 'text-gray-600'}`}
          >
            Profile
          </button>
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            {loading ? (
              <p>Loading...</p>
            ) : orders.length === 0 ? (
              <p className="text-center text-gray-600">No orders yet. Start shopping!</p>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order._id} className="bg-white rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold">{order.orderNumber}</p>
                        <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-3 py-1 rounded font-semibold text-sm ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-gray-600">{order.items.length} items</span>
                      <span className="font-bold">₹{order.totalAmount}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Other tabs would go here */}
      </div>
    </div>
  )
}
