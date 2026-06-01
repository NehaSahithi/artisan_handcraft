import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, MapPin, CheckCircle, Package, User, Phone, Clipboard, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { useOrderStore } from '../../store/orderStore';
import Pagination from '../../components/common/Pagination';
import { Button } from "@/components/ui/button";

const LotusMotif = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <path d="M50 10 C30 30 10 50 10 70 C10 85 25 95 50 95 C75 95 90 85 90 70 C90 50 70 30 50 10 Z M50 25 C65 45 75 60 75 70 C75 80 65 85 50 85 C35 85 25 80 25 70 C25 60 35 45 50 25 Z"/>
    <path d="M20 60 C5 70 0 85 10 95 C25 90 35 75 40 60 C25 55 10 60 20 60 Z"/>
    <path d="M80 60 C95 70 100 85 90 95 C75 90 65 75 60 60 C75 55 90 60 80 60 Z"/>
  </svg>
);

const BlockPrintPattern = () => (
  <svg
    className="inset-0 w-full h-full opacity-[0.03] pointer-events-none z-0"
    style={{ position: 'fixed' }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern id="paisley-seller-orders" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M30 10 C45 10 50 25 45 35 C40 45 25 50 20 40 C15 30 20 15 30 10 Z" fill="currentColor" />
        <circle cx="30" cy="25" r="4" fill="transparent" stroke="currentColor" strokeWidth="2" />
      </pattern>
    </defs>
    <rect x="0" y="0" width="100%" height="100%" fill="url(#paisley-seller-orders)" />
  </svg>
);

export default function SellerOrdersPage() {
  const { user } = useAuthStore();
  const { 
    orders = [], 
    pagination, 
    getSellerOrders, 
    updateItemStatus, 
    loading 
  } = useOrderStore();

  const [page, setPage] = useState(1);

  useEffect(() => {
    getSellerOrders(page, 10);
  }, [page, getSellerOrders]);

  const handleUpdateStatus = async (orderId, itemId, newStatus) => {
    try {
      await updateItemStatus(orderId, itemId, newStatus);
      toast.success(`Fulfillment status updated to ${newStatus}`);
      getSellerOrders(page, 10);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update status.");
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      pending: 'bg-amber-50 text-amber-700 border-amber-250',
      confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
      processing: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      shipped: 'bg-purple-50 text-purple-700 border-purple-200',
      delivered: 'bg-emerald-50 text-emerald-700 border-emerald-250',
      cancelled: 'bg-red-50 text-red-700 border-red-200'
    };
    return styles[status] || styles.pending;
  };

  return (
    <div className="min-h-screen bg-stone-50/50 relative py-12 md:py-20 font-sans selection:bg-primary/20 selection:text-primary">
      <BlockPrintPattern />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header bar */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-amber-100/60">
          <div>
            <Link 
              to="/seller/dashboard" 
              className="flex items-center gap-1 text-sm font-semibold text-stone-500 hover:text-primary transition-all duration-200 mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-serif font-bold text-stone-800 flex items-center gap-2">
              <Clipboard className="w-8 h-8 text-primary" /> Fulfillment Ledger
            </h1>
          </div>
        </div>

        {/* Orders Table list */}
        <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden p-6">
          {loading && orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="font-serif italic text-stone-500 text-sm">Opening fulfillment ledger archives...</p>
            </div>
          ) : !orders || orders.length === 0 ? (
            <div className="text-center py-20">
              <LotusMotif className="w-16 h-16 text-primary/10 mx-auto mb-4" />
              <p className="text-lg font-serif text-stone-800">Your ledger has no acquisitions yet.</p>
              <p className="text-stone-500 font-serif italic text-sm mt-1">Products sold in the collector gallery will appear here for preparation.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center text-xs text-stone-500 font-medium pb-2 border-b border-stone-100">
                <span>Total records: {pagination.total}</span>
                <span>Page {pagination.page} of {pagination.pages}</span>
              </div>

              <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                  {orders.map((order, idx) => {
                    const artisanId = user?._id || user?.id;
                    const myItems = order.items?.filter((item) => 
                      (item.product?.artisan === artisanId) || 
                      (item.product?.artisan?._id === artisanId) || 
                      (item.artisan === artisanId) ||
                      (item.artisan?._id === artisanId)
                    ) || [];

                    if (myItems.length === 0) return null;

                    return (
                      <motion.div 
                        key={order._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        className="bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden flex flex-col md:flex-row hover:border-primary/20 transition-all"
                      >
                        {/* Left block - order details & shipping address */}
                        <div className="p-6 md:w-1/3 border-b md:border-b-0 md:border-r border-stone-100 space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs text-stone-400 font-bold uppercase">
                              #{order.orderNumber || order._id.slice(-8)}
                            </span>
                            <span className="text-[10px] text-stone-400 font-bold font-sans">
                              {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>

                          <div className="space-y-2 text-xs">
                            <h4 className="font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-primary" /> Collector Details
                            </h4>
                            <p className="font-serif font-bold text-stone-850 text-sm">
                              {order.shippingAddress?.fullName || 'Heritage Collector'}
                            </p>
                            <p className="text-stone-600 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-stone-400" /> {order.shippingAddress?.phone}
                            </p>
                          </div>

                          <div className="space-y-2 text-xs">
                            <h4 className="font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-primary" /> Delivery Destination
                            </h4>
                            <p className="text-stone-600 leading-normal font-serif">
                              {order.shippingAddress?.street}, <br/>
                              {order.shippingAddress?.city}, {order.shippingAddress?.state} - <span className="font-sans font-bold">{order.shippingAddress?.pincode}</span>
                            </p>
                          </div>
                        </div>

                        {/* Right block - order items & status transition actions */}
                        <div className="p-6 flex-grow flex flex-col justify-between gap-4">
                          <div className="space-y-4">
                            <h4 className="font-bold text-xs text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                              <Package className="w-4 h-4 text-primary" /> Acquired Pieces
                            </h4>
                            
                            <div className="space-y-3">
                              {myItems.map((item, i) => {
                                const itemStatus = item.status || 'pending';
                                return (
                                  <div key={i} className="flex justify-between items-center bg-stone-50 p-3 rounded-lg border border-stone-150">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 border border-stone-200 rounded overflow-hidden bg-stone-100 flex-shrink-0">
                                        <img 
                                          src={item.product?.images?.[0]?.url || 'https://placehold.co/100'} 
                                          alt={item.name} 
                                          className="w-full h-full object-cover filter sepia-[0.05]" 
                                        />
                                      </div>
                                      <div>
                                        <p className="text-sm font-serif font-bold text-stone-850 leading-snug">{item.name || item.product?.name || 'Artifact'}</p>
                                        <p className="text-xs text-stone-500 font-serif italic mt-0.5">Value: ₹{item.price?.toLocaleString('en-IN')} each</p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-right">
                                      <div className="text-xs text-stone-700">
                                        Qty: <span className="font-bold text-stone-900">{item.quantity}</span>
                                      </div>
                                      
                                      <div className="flex flex-col gap-1 items-end">
                                        <span className={`px-2 py-0.5 text-[9px] rounded border font-bold uppercase tracking-wider ${getStatusStyle(itemStatus)}`}>
                                          {itemStatus}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Quick single item status actions (if single or bulk items in this order) */}
                          <div className="flex justify-between items-center pt-4 border-t border-stone-100 mt-2">
                            <span className="text-xs text-stone-400 font-bold uppercase tracking-wider">
                              Total Order Value: <span className="text-stone-900 font-serif font-bold text-sm">₹{myItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString('en-IN')}</span>
                            </span>

                            <div className="flex items-center gap-2">
                              {myItems.map((item, i) => {
                                const itemStatus = item.status || 'pending';
                                return (
                                  <div key={i}>
                                    {itemStatus === 'pending' || itemStatus === 'confirmed' ? (
                                      <Button 
                                        size="sm"
                                        onClick={() => handleUpdateStatus(order._id, item._id, 'processing')}
                                        className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                                      >
                                        Start Preparing
                                      </Button>
                                    ) : itemStatus === 'processing' ? (
                                      <Button 
                                        size="sm"
                                        onClick={() => handleUpdateStatus(order._id, item._id, 'shipped')}
                                        className="h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold"
                                      >
                                        Mark as Dispatched
                                      </Button>
                                    ) : itemStatus === 'shipped' ? (
                                      <Button 
                                        size="sm"
                                        onClick={() => handleUpdateStatus(order._id, item._id, 'delivered')}
                                        className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                      >
                                        Confirm Delivery
                                      </Button>
                                    ) : (
                                      <span className="text-xs text-stone-400 font-bold uppercase tracking-wider italic flex items-center gap-1">
                                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Fully Settled
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Server Pagination */}
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
