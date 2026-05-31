import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import apiClient from '../../lib/apiClient'
import { 
  ShieldAlert, 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  FileText,
  DollarSign
} from 'lucide-react'
import toast from 'react-hot-toast'

// --- REUSABLE HERITAGE ELEMENTS ---
const LotusMotif = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <path d="M50 10 C30 30 10 50 10 70 C10 85 25 95 50 95 C75 95 90 85 90 70 C90 50 70 30 50 10 Z M50 25 C65 45 75 60 75 70 C75 80 65 85 50 85 C35 85 25 80 25 70 C25 60 35 45 50 25 Z"/>
    <path d="M20 60 C5 70 0 85 10 95 C25 90 35 75 40 60 C25 55 10 60 20 60 Z"/>
    <path d="M80 60 C95 70 100 85 90 95 C75 90 65 75 60 60 C75 55 90 60 80 60 Z"/>
  </svg>
)

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalArtisans: 0,
    totalOrders: 0,
    totalRevenue: 0
  })
  const [pendingArtisans, setPendingArtisans] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    setLoading(true)
    try {
      // Fetch platform overview statistics
      const metricsRes = await apiClient.get('/api/admin/metrics')
      if (metricsRes.data?.success) {
        setMetrics(metricsRes.data.metrics)
      }

      // Fetch unverified artisans awaiting approval
      const artisansRes = await apiClient.get('/api/admin/pending-artisans')
      if (artisansRes.data?.success) {
        setPendingArtisans(artisansRes.data.artisans)
      } else if (Array.isArray(artisansRes.data)) {
        setPendingArtisans(artisansRes.data)
      }
    } catch (error) {
      console.error("Error fetching administrative data:", error)
      // Provide clean default values for prototyping if backend points aren't fully deployed
      setPendingArtisans([])
    } finally {
      setLoading(false)
    }
  }

  const handleVerification = async (artisanId, approve) => {
    setActionLoading(artisanId)
    try {
      const endpoint = `/api/admin/verify-artisan/${artisanId}`
      const response = await apiClient.post(endpoint, { status: approve ? 'approved' : 'rejected' })

      if (response.data?.success) {
        toast.success(approve ? "Artisan credentials approved!" : "Application rejected.")
        setPendingArtisans(prev => prev.filter(a => a._id !== artisanId))
        fetchAdminData() // Refresh general platform counts
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update artisan status.")
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="font-serif italic text-muted-foreground">Opening Master Console...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12 md:py-20 font-sans selection:bg-primary/20 selection:text-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pb-6 border-b border-border">
          <div>
            <div className="inline-flex items-center gap-2 text-primary mb-2">
              <ShieldAlert className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest font-mono">Platform Governance</span>
            </div>
            <h1 className="text-4xl font-serif font-bold text-foreground">Command Console</h1>
          </div>
          <div className="bg-secondary/60 px-6 py-3 rounded-lg border border-border flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm font-serif italic text-muted-foreground">Logged in as Administrator</span>
          </div>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { title: "Total Users", value: metrics.totalUsers, icon: Users, color: "text-blue-600 bg-blue-50" },
            { title: "Active Karigars", value: metrics.totalArtisans, icon: LotusMotif, color: "text-orange-600 bg-orange-50" },
            { title: "Total Acquisitions", value: metrics.totalOrders, icon: ShoppingBag, color: "text-indigo-600 bg-indigo-50" },
            { title: "Platform Volume", value: `₹${metrics.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-emerald-600 bg-emerald-50" },
          ].map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-card border border-border p-6 rounded-xl shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-serif text-muted-foreground mb-1">{card.title}</p>
                <p className="text-3xl font-serif font-bold text-foreground">{card.value}</p>
              </div>
              <div className={`p-4 rounded-xl ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* ARTISAN APPROVAL AREA */}
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-border bg-secondary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-serif font-bold text-foreground">Pending Artisan Verifications</h2>
              <p className="text-sm text-muted-foreground font-serif italic mt-0.5">Audit and approve heritage credentials before studio onboarding.</p>
            </div>
            <span className="px-3 py-1 bg-primary/10 text-primary font-mono text-xs font-bold rounded-full">
              {pendingArtisans.length} Awaiting
            </span>
          </div>

          {pendingArtisans.length === 0 ? (
            <div className="text-center py-20">
              <CheckCircle className="w-12 h-12 text-emerald-500/40 mx-auto mb-4" />
              <p className="text-lg font-serif font-bold text-foreground">Registry Up to Date</p>
              <p className="text-sm text-muted-foreground font-serif italic">No outstanding artisan profiles require validation at this time.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {pendingArtisans.map((artisan) => (
                <div key={artisan._id} className="p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-secondary/10 transition-colors">
                  
                  {/* Artisan Metadata */}
                  <div className="flex items-start gap-5">
                    <div className="w-16 h-16 rounded-full border border-border overflow-hidden bg-secondary flex-shrink-0">
                      <img 
                        src={artisan.profileImage || artisan.user?.profileImage || 'https://placehold.co/150'} 
                        alt="" 
                        className="w-full h-full object-cover filter sepia-[0.1]"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-serif font-bold text-foreground">
                        {artisan.shopName || "Untitled Studio"}
                      </h3>
                      <p className="text-sm text-muted-foreground font-serif italic">by {artisan.name || artisan.user?.name || "Unknown Artisan"}</p>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground/70 mt-3 font-mono">
                        <span className="bg-secondary px-2 py-0.5 rounded border border-border">Exp: {artisan.experience || 0} Years</span>
                        <span className="bg-secondary px-2 py-0.5 rounded border border-border">State: {artisan.state || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Craft Categories */}
                  <div className="flex flex-wrap gap-2 max-w-md">
                    {artisan.craftCategories?.map((craft, i) => (
                      <span key={i} className="px-2.5 py-1 bg-background border border-border rounded text-xs font-serif text-muted-foreground">
                        {craft}
                      </span>
                    ))}
                  </div>

                  {/* Administrative Action Control Triggers */}
                  <div className="flex items-center gap-3 self-end lg:self-center">
                    <button
                      onClick={() => handleVerification(artisan._id, false)}
                      disabled={actionLoading === artisan._id}
                      className="px-4 py-2 border border-destructive/30 rounded text-destructive hover:bg-destructive/5 text-sm transition-colors flex items-center gap-2 font-medium disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                    <button
                      onClick={() => handleVerification(artisan._id, true)}
                      disabled={actionLoading === artisan._id}
                      className="px-5 py-2 bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium rounded shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {actionLoading === artisan._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Approve & Verify
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}