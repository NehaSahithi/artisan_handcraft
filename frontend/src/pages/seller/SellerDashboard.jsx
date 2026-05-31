import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import apiClient from '../../lib/apiClient'
import { 
  Store, 
  Package, 
  IndianRupee, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  PlusCircle, 
  Settings,
  Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from "@/components/ui/button"

// --- REUSABLE HERITAGE ELEMENTS ---
const LotusMotif = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <path d="M50 10 C30 30 10 50 10 70 C10 85 25 95 50 95 C75 95 90 85 90 70 C90 50 70 30 50 10 Z M50 25 C65 45 75 60 75 70 C75 80 65 85 50 85 C35 85 25 80 25 70 C25 60 35 45 50 25 Z"/>
    <path d="M20 60 C5 70 0 85 10 95 C25 90 35 75 40 60 C25 55 10 60 20 60 Z"/>
    <path d="M80 60 C95 70 100 85 90 95 C75 90 65 75 60 60 C75 55 90 60 80 60 Z"/>
  </svg>
)

const BlockPrintPattern = () => (
  <svg
    className="inset-0 w-full h-full opacity-[0.03] pointer-events-none z-0"
    style={{ position: 'fixed' }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs><pattern id="paisley-seller" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M30 10 C45 10 50 25 45 35 C40 45 25 50 20 40 C15 30 20 15 30 10 Z" fill="currentColor" /><circle cx="30" cy="25" r="4" fill="transparent" stroke="currentColor" strokeWidth="2" /></pattern></defs><rect x="0" y="0" width="100%" height="100%" fill="url(#paisley-seller)" />
  </svg>
)

export default function SellerDashboard() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 })
  const [recentOrders, setRecentOrders] = useState([])
  const [products, setProducts] = useState([])
  const [activeTab, setActiveTab] = useState('catalog') // Default to catalog so new artifacts are immediately visible!

  useEffect(() => {
    fetchStudioData()
  }, [])

  const fetchStudioData = async () => {
    setLoading(true)
    try {
      // Fetch stats using the backend controller you built
      const statsRes = await apiClient.get('/orders/stats')
      if (statsRes.data?.success) {
        const statsData = statsRes.data.stats || {}
        setStats({
          totalOrders: statsData.totalOrders || 0,
          totalRevenue: statsData.totalRevenue || 0,
          avgOrderValue: statsData.avgOrderValue || 0,
        })
      }

      // Fetch the artisan's recent orders
      const ordersRes = await apiClient.get('/orders')
      if (ordersRes.data?.success) {
        // Grab the 5 most recent orders for the dashboard view
        setRecentOrders(ordersRes.data.orders.slice(0, 5))
      }

      // Fetch the artisan's products
      if (user?._id || user?.id) {
        const artisanId = user._id || user.id
        const productsRes = await apiClient.get(`/products/artisan/${artisanId}`)
        if (productsRes.data?.success) {
          setProducts(productsRes.data.products || [])
        }
      }
    } catch (error) {
      console.error("Studio data fetch error:", error)
      toast.error("Failed to sync studio data.")
    } finally {
      setLoading(false)
    }
  }

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to retire this artifact from the gallery?")) return
    try {
      const res = await apiClient.delete(`/products/${id}`)
      if (res.data?.success) {
        toast.success("Artifact retired successfully.")
        fetchStudioData() // Refresh
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not retire artifact.")
    }
  }

  const updateItemStatus = async (orderId, newStatus) => {
    try {
      const res = await apiClient.put(`/orders/${orderId}/status`, { status: newStatus })
      if (res.data?.success) {
        toast.success("Order status updated!")
        fetchStudioData() // Refresh the view
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update status.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="font-serif italic text-muted-foreground">Opening Karigar Studio...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative py-12 md:py-20 font-sans selection:bg-primary/20 selection:text-primary">
      <BlockPrintPattern />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-6 border-b border-border">
          <div>
            <div className="inline-flex items-center gap-2 text-primary mb-3">
              <Store className="w-5 h-5" />
              <span className="text-sm font-bold uppercase tracking-widest font-mono">Karigar Studio</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground">
              Welcome, <span className="italic">{user?.name?.split(' ')[0] || 'Artisan'}</span>.
            </h1>
            <p className="text-muted-foreground font-serif italic mt-2">Manage your craft, track your livelihood, and fulfill cultural acquisitions.</p>
          </div>
          
          <div className="flex gap-4">
            <Link to="/seller/products/new">
              <Button className="font-serif tracking-wide rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2">
                <PlusCircle className="w-4 h-4" /> Add Artifact
              </Button>
            </Link>
            <Link to="/seller/settings">
              <Button variant="outline" className="font-serif tracking-wide rounded-sm border-border hover:bg-secondary flex items-center gap-2">
                <Settings className="w-4 h-4" /> Studio Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border p-6 rounded-xl shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform" />
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-emerald-100 text-emerald-700 rounded-lg">
                <IndianRupee className="w-6 h-6" />
              </div>
              <p className="text-sm font-serif font-bold text-muted-foreground uppercase tracking-wider">Total Revenue</p>
            </div>
            <h3 className="text-4xl font-serif font-bold text-foreground">₹{stats.totalRevenue.toLocaleString()}</h3>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border p-6 rounded-xl shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform" />
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 text-blue-700 rounded-lg">
                <Package className="w-6 h-6" />
              </div>
              <p className="text-sm font-serif font-bold text-muted-foreground uppercase tracking-wider">Total Acquisitions</p>
            </div>
            <h3 className="text-4xl font-serif font-bold text-foreground">{stats.totalOrders}</h3>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border p-6 rounded-xl shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-24 h-24 bg-amber-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform" />
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-amber-100 text-amber-700 rounded-lg">
                <TrendingUp className="w-6 h-6" />
              </div>
              <p className="text-sm font-serif font-bold text-muted-foreground uppercase tracking-wider">Avg. Order Value</p>
            </div>
            <h3 className="text-4xl font-serif font-bold text-foreground">₹{Math.round(stats.avgOrderValue || 0).toLocaleString()}</h3>
          </motion.div>
        </div>

        {/* TABS */}
        <div className="flex border-b border-border mb-8">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`pb-4 px-6 font-serif font-bold text-lg border-b-2 transition-all ${
              activeTab === 'catalog'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Studio Catalog / Products
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`pb-4 px-6 font-serif font-bold text-lg border-b-2 transition-all ${
              activeTab === 'ledger'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Fulfillment Ledger
          </button>
        </div>

        {/* TAB CONTENTS */}
        {activeTab === 'catalog' ? (
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border bg-secondary/30 flex items-center justify-between">
              <h2 className="text-2xl font-serif font-bold text-foreground">Studio Catalog / Inventory</h2>
              <Link to="/seller/products/new">
                <Button size="sm" className="h-8 text-xs bg-primary text-white hover:bg-primary/95 flex items-center gap-1 font-serif">
                  + Add Artifact
                </Button>
              </Link>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-16">
                <LotusMotif className="w-12 h-12 text-primary/20 mx-auto mb-4" />
                <p className="text-lg font-serif text-foreground">No artifacts in your studio catalog.</p>
                <p className="text-sm font-serif italic text-muted-foreground">Click 'Add Artifact' to introduce your masterpiece to collectors.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-secondary/10 border-b border-border text-sm font-serif text-muted-foreground">
                      <th className="p-4 font-normal">Artifact</th>
                      <th className="p-4 font-normal">Tradition</th>
                      <th className="p-4 font-normal">Value (Price)</th>
                      <th className="p-4 font-normal">Stock status</th>
                      <th className="p-4 font-normal text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    <AnimatePresence>
                      {products.map((product) => (
                        <motion.tr 
                          key={product._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-secondary/5 transition-colors font-serif"
                        >
                          <td className="p-4 flex items-center gap-3">
                            <div className="w-12 h-12 border border-border rounded-sm overflow-hidden bg-secondary">
                              <img 
                                src={product.images?.[0] || 'https://placehold.co/100'} 
                                alt={product.name} 
                                className="w-full h-full object-cover filter sepia-[0.2]" 
                              />
                            </div>
                            <div>
                              <p className="text-foreground font-bold">{product.name}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">{product.description}</p>
                            </div>
                          </td>
                          <td className="p-4 text-sm font-medium">{product.category}</td>
                          <td className="p-4 font-bold text-foreground">₹{product.price.toLocaleString()}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 text-xs rounded-full border ${
                              product.stock > 5 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              product.stock > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              {product.stock === 0 ? 'Out of Stock' : `${product.stock} units`}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => deleteProduct(product._id)} 
                              className="h-8 text-xs font-serif"
                            >
                              Retire
                            </Button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border bg-secondary/30 flex items-center justify-between">
              <h2 className="text-2xl font-serif font-bold text-foreground">Recent Fulfillment Ledger</h2>
              <Link to="/seller/orders" className="text-sm font-serif text-primary hover:underline italic">View Entire Ledger &rarr;</Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="text-center py-16">
                <LotusMotif className="w-12 h-12 text-primary/20 mx-auto mb-4" />
                <p className="text-lg font-serif text-foreground">No recent acquisitions to fulfill.</p>
                <p className="text-sm font-serif italic text-muted-foreground">When collectors acquire your work, details will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-secondary/10 border-b border-border text-sm font-serif text-muted-foreground">
                      <th className="p-4 font-normal">Order Ref</th>
                      <th className="p-4 font-normal">Collector</th>
                      <th className="p-4 font-normal">Artifact(s)</th>
                      <th className="p-4 font-normal">Amount</th>
                      <th className="p-4 font-normal">Status</th>
                      <th className="p-4 font-normal text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    <AnimatePresence>
                      {recentOrders.map((order) => {
                        const artisanId = user._id || user.id
                        const myItems = order.items.filter(item => 
                          item.artisan?._id === artisanId || item.artisan === artisanId
                        )
                        
                        if (myItems.length === 0) return null;

                        const currentStatus = myItems[0]?.status || 'pending'

                        return (
                          <motion.tr 
                            key={order._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="hover:bg-secondary/5 transition-colors font-serif"
                          >
                            <td className="p-4 font-mono text-xs text-muted-foreground uppercase">{order._id.slice(-8)}</td>
                            <td className="p-4">
                              <p className="text-foreground font-bold">{order.user?.name || order.shippingAddress?.fullName || 'Collector'}</p>
                              <p className="text-xs text-muted-foreground italic">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-col gap-1">
                                {myItems.map((item, i) => (
                                  <span key={i} className="text-sm">
                                    {item.product?.name || 'Artifact'} <span className="text-muted-foreground border border-border px-1 rounded text-xs ml-1">x{item.quantity}</span>
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="p-4 font-bold text-foreground">
                              ₹{myItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 text-xs rounded-full border ${
                                currentStatus === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                currentStatus === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                currentStatus === 'processing' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
                              </span>
                            </td>
                            <td className="p-4 text-right space-x-2">
                              {currentStatus === 'pending' || currentStatus === 'confirmed' ? (
                                <Button size="sm" onClick={() => updateItemStatus(order._id, 'processing')} className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700">
                                  Start Prep
                                </Button>
                              ) : currentStatus === 'processing' ? (
                                <Button size="sm" onClick={() => updateItemStatus(order._id, 'shipped')} className="h-8 text-xs bg-blue-600 hover:bg-blue-700">
                                  Mark Shipped
                                </Button>
                              ) : (
                                <span className="text-xs text-muted-foreground italic">Action Complete</span>
                              )}
                            </td>
                          </motion.tr>
                        )
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}