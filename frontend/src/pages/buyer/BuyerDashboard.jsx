import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import { useOrderStore } from '../../store/orderStore'
import { Package, MapPin, Calendar, ArrowRight, ShieldCheck, Clock } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

// --- REUSABLE HERITAGE ELEMENTS ---
const LotusMotif = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <path d="M50 10 C30 30 10 50 10 70 C10 85 25 95 50 95 C75 95 90 85 90 70 C90 50 70 30 50 10 Z M50 25 C65 45 75 60 75 70 C75 80 65 85 50 85 C35 85 25 80 25 70 C25 60 35 45 50 25 Z"/>
    <path d="M20 60 C5 70 0 85 10 95 C25 90 35 75 40 60 C25 55 10 60 20 60 Z"/>
    <path d="M80 60 C95 70 100 85 90 95 C75 90 65 75 60 60 C75 55 90 60 80 60 Z"/>
  </svg>
)

const BlockPrintPattern = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none z-0 fixed" xmlns="http://www.w3.org/2000/svg">
    <defs><pattern id="paisley-buyer" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M30 10 C45 10 50 25 45 35 C40 45 25 50 20 40 C15 30 20 15 30 10 Z" fill="currentColor" /><circle cx="30" cy="25" r="4" fill="transparent" stroke="currentColor" strokeWidth="2" /></pattern></defs><rect x="0" y="0" width="100%" height="100%" fill="url(#paisley-buyer)" />
  </svg>
)

const HeritageDivider = () => (
  <div className="flex items-center justify-center w-full my-8 opacity-30">
    <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary to-transparent" />
    <LotusMotif className="w-4 h-4 text-primary mx-4 flex-shrink-0" />
    <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary to-transparent" />
  </div>
)

export default function BuyerDashboard() {
  const { user } = useAuthStore()
  const { orders, getOrders, loading } = useOrderStore()

  useEffect(() => {
    getOrders()
  }, [getOrders])

  // Helper to style status badges elegantly
  const getStatusDisplay = (status) => {
    const states = {
      pending: { color: 'text-amber-700 bg-amber-50 border-amber-200', text: 'Awaiting Fulfillment' },
      processing: { color: 'text-blue-700 bg-blue-50 border-blue-200', text: 'Artisan Preparing' },
      shipped: { color: 'text-indigo-700 bg-indigo-50 border-indigo-200', text: 'In Transit' },
      delivered: { color: 'text-emerald-700 bg-emerald-50 border-emerald-200', text: 'Acquired' },
      cancelled: { color: 'text-destructive bg-destructive/10 border-destructive/20', text: 'Voided' }
    }
    return states[status] || states.pending
  }

  return (
    <div className="min-h-screen bg-background relative py-12 md:py-24 font-sans selection:bg-primary/20 selection:text-primary">
      <BlockPrintPattern />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* HEADER: Personal Welcome */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-4 text-primary">
            <LotusMotif className="w-5 h-5" />
            <span className="text-sm font-semibold tracking-widest uppercase">Private Archive</span>
            <LotusMotif className="w-5 h-5" />
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-4">
            Welcome, <span className="text-primary italic">{user?.name?.split(' ')[0] || 'Collector'}</span>.
          </h1>
          <p className="text-lg text-muted-foreground font-serif italic max-w-xl mx-auto">
            Your personal gallery of acquired masterpieces and cultural heirlooms.
          </p>
        </motion.div>

        {/* MAIN CONTENT: Order History */}
        <div className="bg-secondary/40 backdrop-blur-sm border border-border rounded-2xl p-6 md:p-12 shadow-sm relative overflow-hidden">
          {/* Decorative Corner Architecture */}
          <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-primary/20 rounded-tl-2xl opacity-50" />
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-primary/20 rounded-br-2xl opacity-50" />

          <div className="flex items-center gap-3 mb-8">
            <Package className="w-6 h-6 text-primary" />
            <h2 className="text-3xl font-serif font-bold text-foreground">Your Acquisitions</h2>
          </div>

          {loading ? (
            <div className="space-y-6">
              {[1, 2].map(i => (
                <Skeleton key={i} className="h-48 w-full bg-background/50 border border-border rounded-xl" />
              ))}
            </div>
          ) : orders?.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="text-center py-16 bg-background rounded-xl border border-border shadow-inner"
            >
              <div className="w-20 h-20 mx-auto bg-secondary rounded-full flex items-center justify-center mb-6">
                <LotusMotif className="w-8 h-8 text-primary opacity-40" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-foreground mb-2">No Artifacts Yet</h3>
              <p className="text-muted-foreground font-serif italic mb-8">Your curated collection is currently empty.</p>
              <Link to="/products">
                <Button className="rounded-sm px-8 h-12 text-lg font-serif tracking-wide border-2 border-primary bg-primary text-primary-foreground hover:bg-transparent hover:text-primary transition-all shadow-md">
                  Wander the Gallery
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-8">
              <AnimatePresence>
                {orders.map((order, idx) => {
                  const statusInfo = getStatusDisplay(order.status)
                  return (
                    <motion.div
                      key={order._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-background border border-border rounded-xl overflow-hidden shadow-sm hover:border-primary/40 transition-colors"
                    >
                      {/* Order Header (Parchment Ticket Style) */}
                      <div className="bg-secondary/50 px-6 py-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-x-8 gap-y-2">
                          <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Acquisition Date</p>
                            <p className="font-serif text-foreground flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-primary" />
                              {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Contribution</p>
                            <p className="font-serif text-foreground font-bold">₹{order.totalAmount?.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Archive ID</p>
                            <p className="font-mono text-sm text-muted-foreground">{order._id.slice(-8).toUpperCase()}</p>
                          </div>
                        </div>
                        
                        <div className={`px-4 py-1.5 rounded-sm border ${statusInfo.color} font-serif font-bold text-sm text-center min-w-[140px]`}>
                          {statusInfo.text}
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="p-6">
                        <div className="space-y-6">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex gap-6 items-center">
                              <div className="w-24 h-24 flex-shrink-0 border-2 border-secondary overflow-hidden rounded-md shadow-inner">
                                <img 
                                  src={item.product?.images?.[0] || 'https://placehold.co/100x100?text=Art'} 
                                  alt={item.product?.name} 
                                  className="w-full h-full object-cover filter sepia-[0.2]"
                                />
                              </div>
                              <div className="flex-grow">
                                <Link to={`/products/${item.product?._id}`} className="text-xl font-serif font-bold text-foreground hover:text-primary transition-colors">
                                  {item.product?.name || 'Untitled Masterpiece'}
                                </Link>
                                <p className="text-muted-foreground font-serif italic text-sm mt-1">
                                  by {item.artisan?.name || 'Master Artisan'}
                                </p>
                                <div className="mt-2 text-sm text-foreground">
                                  <span className="font-bold">Qty:</span> {item.quantity} &nbsp;•&nbsp; <span className="font-bold">₹{item.price?.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <HeritageDivider />

                        {/* Shipping Info */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm text-muted-foreground font-serif">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-primary mt-0.5" />
                            <div>
                              <span className="font-bold text-foreground">Destined for:</span><br/>
                              {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}
                            </div>
                          </div>
                          
                          {order.status === 'delivered' ? (
                            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                              <ShieldCheck className="w-4 h-4" /> Safely in your possession
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                              <Clock className="w-4 h-4" /> Preservation in progress
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}