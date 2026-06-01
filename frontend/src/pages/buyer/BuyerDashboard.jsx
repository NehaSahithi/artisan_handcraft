import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useOrderStore } from '../../store/orderStore';
import Pagination from '../../components/common/Pagination';
import { Package, MapPin, Calendar, ShieldCheck, Clock, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from "../../components/ui/button";

// --- REUSABLE HERITAGE ELEMENTS ---
const LotusMotif = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <path d="M50 10 C30 30 10 50 10 70 C10 85 25 95 50 95 C75 95 90 85 90 70 C90 50 70 30 50 10 Z M50 25 C65 45 75 60 75 70 C75 80 65 85 50 85 C35 85 25 80 25 70 C25 60 35 45 50 25 Z"/>
    <path d="M20 60 C5 70 0 85 10 95 C25 90 35 75 40 60 C25 55 10 60 20 60 Z"/>
    <path d="M80 60 C95 70 100 85 90 95 C75 90 65 75 60 60 C75 55 90 60 80 60 Z"/>
  </svg>
);

const BlockPrintPattern = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none z-0 fixed" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="paisley-buyer" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M30 10 C45 10 50 25 45 35 C40 45 25 50 20 40 C15 30 20 15 30 10 Z" fill="currentColor" />
        <circle cx="30" cy="25" r="4" fill="transparent" stroke="currentColor" strokeWidth="2" />
      </pattern>
    </defs>
    <rect x="0" y="0" width="100%" height="100%" fill="url(#paisley-buyer)" />
  </svg>
);

const HeritageDivider = () => (
  <div className="flex items-center justify-center w-full my-8 opacity-30">
    <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary to-transparent" />
    <LotusMotif className="w-4 h-4 text-primary mx-4 flex-shrink-0" />
    <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary to-transparent" />
  </div>
);

export default function BuyerDashboard() {
  const { user } = useAuthStore();
  const { orders = [], pagination, getMyOrders, cancelOrder, loading } = useOrderStore();
  const [page, setPage] = useState(1);

  useEffect(() => {
    getMyOrders(page, 5);
  }, [getMyOrders, page]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this acquisition? The reserved artisan stock will be released back into the gallery.")) return;
    try {
      await cancelOrder(orderId);
      toast.success("Acquisition cancelled and stock restored.");
      getMyOrders(page, 5);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel order");
    }
  };

  const getStatusDisplay = (status) => {
    const states = {
      pending: { color: 'text-amber-700 bg-amber-50 border-amber-200', text: 'Awaiting Payment' },
      confirmed: { color: 'text-blue-700 bg-blue-50 border-blue-200', text: 'Securely Confirmed' },
      processing: { color: 'text-indigo-700 bg-indigo-50 border-indigo-200', text: 'Karigar Preparing' },
      shipped: { color: 'text-purple-700 bg-purple-50 border-purple-200', text: 'In Transit' },
      delivered: { color: 'text-emerald-700 bg-emerald-50 border-emerald-200', text: 'Delivered / Secured' },
      cancelled: { color: 'text-red-700 bg-red-50 border-red-200', text: 'Cancelled / Void' }
    };
    return states[status] || states.pending;
  };

  return (
    <div className="min-h-screen bg-stone-50/50 relative py-12 md:py-24 font-sans selection:bg-primary/20 selection:text-primary">
      <BlockPrintPattern />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }} 
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-4 text-primary">
            <LotusMotif className="w-5 h-5" />
            <span className="text-xs font-semibold tracking-widest uppercase">Private Archive</span>
            <LotusMotif className="w-5 h-5" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-4 leading-tight">
            Welcome, <span className="text-primary italic">{user?.name?.split(' ')[0] || 'Collector'}</span>
          </h1>
          <p className="text-base md:text-lg text-stone-600 font-serif italic max-w-xl mx-auto">
            Your personal gallery of acquired masterpieces and cultural heritage.
          </p>
        </motion.div>

        {/* MAIN CONTENT */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 md:p-10 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-3 mb-8">
            <Package className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-serif font-bold text-stone-850">Your Acquisitions</h2>
          </div>

          {loading && orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="font-serif italic text-stone-500 text-sm">Gathering history from database...</p>
            </div>
          ) : !orders || orders.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="text-center py-16 bg-stone-50/50 rounded-xl border border-stone-200 border-dashed"
            >
              <div className="w-20 h-20 mx-auto bg-stone-100 rounded-full flex items-center justify-center mb-6">
                <LotusMotif className="w-8 h-8 text-primary opacity-30" />
              </div>
              <h3 className="text-xl font-serif font-bold text-stone-800 mb-2">No Artifacts Yet</h3>
              <p className="text-stone-500 font-serif italic mb-8 text-sm">Your private curated collection is currently empty.</p>
              <Link to="/products">
                <Button className="rounded-lg px-6 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-wider shadow hover:bg-primary/95 transition-all">
                  Wander the Gallery
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-8">
              <AnimatePresence mode="popLayout">
                {orders.map((order, idx) => {
                  const statusInfo = getStatusDisplay(order.status);
                  const isCancellable = order.status === 'pending' || order.status === 'confirmed';

                  return (
                    <motion.div 
                      key={order._id} 
                      initial={{ opacity: 0, y: 15 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.4, delay: idx * 0.05 }} 
                      className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm hover:border-primary/35 transition-all"
                    >
                      {/* Top Order Card Header */}
                      <div className="bg-stone-50 px-6 py-4 border-b border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-x-8 gap-y-2 text-xs">
                          <div>
                            <p className="font-bold text-stone-400 uppercase tracking-wider mb-0.5">Acquisition Date</p>
                            <p className="font-serif text-stone-800 font-medium flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-primary" />
                              {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                          </div>
                          <div>
                            <p className="font-bold text-stone-400 uppercase tracking-wider mb-0.5">Contribution</p>
                            <p className="font-serif text-stone-800 font-bold">₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                          </div>
                          <div>
                            <p className="font-bold text-stone-400 uppercase tracking-wider mb-0.5">Order Number</p>
                            <p className="font-mono font-semibold text-stone-600">{order.orderNumber || order._id?.slice(-8).toUpperCase()}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className={`px-3 py-1 rounded border ${statusInfo.color} font-serif font-bold text-xs min-w-[120px] text-center`}>
                            {statusInfo.text}
                          </div>
                          {isCancellable && (
                            <button
                              onClick={() => handleCancelOrder(order._id)}
                              className="text-stone-400 hover:text-red-600 border border-stone-200 hover:border-red-200 px-3 py-1 rounded bg-white text-xs font-bold transition-all shadow-sm flex items-center gap-1 font-sans"
                            >
                              <AlertCircle className="w-3.5 h-3.5" /> Cancel
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="p-6">
                        <div className="space-y-6">
                          {order.items?.map((item, index) => (
                            <div key={index} className="flex gap-6 items-center">
                              <div className="w-20 h-20 flex-shrink-0 border border-stone-200 overflow-hidden rounded shadow-sm bg-stone-50">
                                <img 
                                  src={item.product?.images?.[0]?.url || 'https://placehold.co/100x100?text=Art'} 
                                  alt={item.name} 
                                  className="w-full h-full object-cover filter sepia-[0.05]" 
                                />
                              </div>
                              <div className="flex-grow">
                                <Link to={`/products/${item.product?._id || item.product}`} className="text-lg font-serif font-bold text-stone-900 hover:text-primary transition-colors">
                                  {item.name || 'Untitled Masterpiece'}
                                </Link>
                                <p className="text-stone-500 font-serif italic text-xs mt-0.5">by {item.product?.artisan?.shopName || 'Karigar Master'}</p>
                                <div className="mt-1.5 text-xs text-stone-700 font-medium">
                                  <span>Qty: <span className="font-bold text-stone-900">{item.quantity}</span></span>
                                  <span className="mx-2 text-stone-300">•</span>
                                  <span>Unit Value: <span className="font-bold text-stone-900">₹{item.price?.toLocaleString('en-IN')}</span></span>
                                  {item.status && (
                                    <>
                                      <span className="mx-2 text-stone-300">•</span>
                                      <span className="px-1.5 py-0.5 bg-stone-100 border border-stone-200 text-stone-600 rounded text-[10px] font-bold uppercase tracking-wider">
                                        Item: {item.status}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <HeritageDivider />

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs text-stone-500 font-serif">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-primary mt-0.5" />
                            <div>
                              <span className="font-bold text-stone-850 font-sans">Destined for:</span><br/>
                              {order.shippingAddress?.fullName} &nbsp;•&nbsp; {order.shippingAddress?.phone}<br/>
                              {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100 uppercase tracking-wider text-[10px] font-bold">
                            <Clock className="w-3.5 h-3.5" /> Secure Passage Confirmed
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Server-side Pagination */}
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                onPageChange={(pageNumber) => setPage(pageNumber)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}