import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import { useProductStore } from '../../store/productStore'
import { useOrderStore } from '../../store/orderStore'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Package, TrendingUp, DollarSign, Plus, Edit, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function SellerDashboard() {
  const { user } = useAuthStore()
  const { products, getProducts, deleteProduct } = useProductStore()
  const { getSalesStats, getOrders, orders } = useOrderStore()
  
  const [stats, setStats] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    getProducts({ artisan: user._id })
    getOrders()
    const fetchStats = async () => {
      const data = await getSalesStats()
      setStats(data.stats)
    }
    fetchStats()
  }, [])

  // Mock data for the chart to show activity over time
  const chartData = [
    { name: 'Mon', revenue: 4000 },
    { name: 'Tue', revenue: 3000 },
    { name: 'Wed', revenue: 5000 },
    { name: 'Thu', revenue: 2780 },
    { name: 'Fri', revenue: 8900 },
    { name: 'Sat', revenue: 2390 },
    { name: 'Sun', revenue: 3490 },
  ]

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-serif font-bold text-foreground mb-1">Karigar Studio</h1>
            <p className="text-muted-foreground font-serif italic">Welcome back, {user?.name || 'Master Artisan'}</p>
          </div>
          <Link to="/seller/product/new" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-serif font-bold rounded-sm shadow-md hover:bg-primary/90 transition-colors">
            <Plus className="w-5 h-5" /> New Artifact
          </Link>
        </div>

        {/* Top Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { title: "Total Revenue", value: `₹${stats?.totalRevenue?.toLocaleString() || '0'}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
            { title: "Active Masterpieces", value: products.length || '0', icon: Package, color: "text-primary", bg: "bg-primary/10" },
            { title: "Total Orders", value: stats?.totalOrders || '0', icon: TrendingUp, color: "text-accent", bg: "bg-accent/10" }
          ].map((stat, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} 
              className="bg-card border border-border p-6 rounded-xl shadow-sm flex items-center gap-6"
            >
              <div className={`w-14 h-14 ${stat.bg} rounded-full flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                <h3 className="text-3xl font-serif font-bold text-foreground">{stat.value}</h3>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Dashboard Content Tabs */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="flex border-b border-border bg-secondary/50">
            {['overview', 'inventory', 'orders'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-8 py-4 font-serif font-bold text-lg capitalize transition-colors ${
                  activeTab === tab ? 'bg-background border-t-2 border-t-primary text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-8">
            {/* OVERVIEW TAB - Features Recharts Graph */}
            {activeTab === 'overview' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-2xl font-serif font-bold mb-6">Revenue Trend</h2>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)' }} tickFormatter={(value) => `₹${value}`} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}

            {/* INVENTORY TAB */}
            {activeTab === 'inventory' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-border">
                        <th className="py-4 font-serif text-muted-foreground">Artifact</th>
                        <th className="py-4 font-serif text-muted-foreground">Category</th>
                        <th className="py-4 font-serif text-muted-foreground">Price</th>
                        <th className="py-4 font-serif text-muted-foreground">Stock</th>
                        <th className="py-4 font-serif text-muted-foreground text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(product => (
                        <tr key={product._id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                          <td className="py-4 flex items-center gap-4">
                            <img src={product.images[0]} alt="" className="w-12 h-12 rounded object-cover border border-border" />
                            <span className="font-bold text-foreground">{product.name}</span>
                          </td>
                          <td className="py-4 text-muted-foreground">{product.category}</td>
                          <td className="py-4 font-bold text-foreground">₹{product.price}</td>
                          <td className="py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${product.stock > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-destructive/10 text-destructive'}`}>
                              {product.stock > 0 ? `${product.stock} Units` : 'Out of Stock'}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <Link to={`/seller/product/edit/${product._id}`} className="inline-block p-2 text-primary hover:bg-primary/10 rounded mr-2 transition-colors"><Edit className="w-4 h-4" /></Link>
                            <button onClick={() => deleteProduct(product._id)} className="p-2 text-destructive hover:bg-destructive/10 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8 font-serif">No acquisitions recorded yet.</p>
                  ) : (
                    orders.map(order => (
                      <div key={order._id} className="bg-secondary/30 p-6 rounded-lg border border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <p className="text-sm font-bold text-primary mb-1">Order #{order._id.slice(-6)}</p>
                          <p className="text-foreground font-serif">
                            {order.items.length} artifacts • <span className="font-bold text-accent">₹{order.totalAmount}</span>
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">Recipient: {order.user?.name || order.shippingAddress?.fullName}</p>
                        </div>
                        <span className="px-4 py-1.5 rounded-full text-sm font-bold bg-amber-100 text-amber-800 border border-amber-200 capitalize">
                          {order.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}