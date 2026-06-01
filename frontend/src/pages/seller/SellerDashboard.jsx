import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useProductStore } from '../../store/productStore';
import { useOrderStore } from '../../store/orderStore';
import { useArtisanStore } from '../../store/artisanStore';
import Pagination from '../../components/common/Pagination';
import { 
  Store, 
  Package, 
  IndianRupee, 
  TrendingUp, 
  PlusCircle, 
  Settings,
  Loader2,
  AlertCircle,
  CheckCircle,
  ShieldCheck,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from "@/components/ui/button";

// --- REUSABLE HERITAGE ELEMENTS ---
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
      <pattern id="paisley-seller" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M30 10 C45 10 50 25 45 35 C40 45 25 50 20 40 C15 30 20 15 30 10 Z" fill="currentColor" />
        <circle cx="30" cy="25" r="4" fill="transparent" stroke="currentColor" strokeWidth="2" />
      </pattern>
    </defs>
    <rect x="0" y="0" width="100%" height="100%" fill="url(#paisley-seller)" />
  </svg>
);

export default function SellerDashboard() {
  const { user } = useAuthStore();
  const { getMyProfile } = useArtisanStore();
  
  // Onboarding States
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(false);

  // Stores
  const { products, getMyProducts, deleteProduct, loading: productLoading } = useProductStore();
  const { 
    orders = [], 
    salesStats, 
    pagination, 
    getSellerOrders, 
    getSalesStats, 
    updateItemStatus, 
    loading: orderLoading 
  } = useOrderStore();

  const [activeTab, setActiveTab] = useState('catalog');
  const [catalogPage, setCatalogPage] = useState(1);
  const [ledgerPage, setLedgerPage] = useState(1);
  const [dataSyncing, setDataSyncing] = useState(false);

  useEffect(() => {
    const fetchArtisanProfile = async () => {
      setProfileLoading(true);
      try {
        const profileData = await getMyProfile();
        setProfile(profileData);
        setProfileError(false);
      } catch (err) {
        if (err.response?.status === 404) {
          setProfileError(true);
        } else {
          toast.error(err.response?.data?.message || "Failed to load studio details.");
        }
      } finally {
        setProfileLoading(false);
      }
    };

    fetchArtisanProfile();
  }, [getMyProfile]);

  useEffect(() => {
    if (!profileError && profile) {
      syncDashboardData();
    }
  }, [profile, profileError]);

  useEffect(() => {
    if (!profileError && profile) {
      if (activeTab === 'catalog') {
        getMyProducts(catalogPage, 8);
      } else {
        getSellerOrders(ledgerPage, 6);
      }
    }
  }, [activeTab, catalogPage, ledgerPage, getMyProducts, getSellerOrders, user, profile, profileError]);

  const syncDashboardData = async () => {
    setDataSyncing(true);
    try {
      await getSalesStats();
      if (activeTab === 'catalog') {
        await getMyProducts(catalogPage, 8);
      } else {
        await getSellerOrders(ledgerPage, 6);
      }
    } catch (error) {
      console.error("Dashboard synchronization error:", error);
      if (error.response?.status !== 404) {
        toast.error("Failed to sync studio performance metrics.");
      }
    } finally {
      setDataSyncing(false);
    }
  };

  const handleRetireProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to retire this handcrafted artifact from public display in the gallery?")) return;
    try {
      await deleteProduct(productId);
      toast.success("Artifact retired from the collection.");
      getMyProducts(catalogPage, 8);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not retire listing.");
    }
  };

  const handleUpdateItemStatus = async (orderId, itemId, newStatus) => {
    try {
      await updateItemStatus(orderId, itemId, newStatus);
      toast.success(`Acquisition status transitioned to ${newStatus}.`);
      getSellerOrders(ledgerPage, 6);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update status.");
    }
  };

  const dashboardLoading = dataSyncing || productLoading || orderLoading;

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-stone-50/50 flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="font-serif italic text-stone-500">Opening Studio Workspace...</p>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-[85vh] bg-stone-50/50 relative py-12 md:py-20 font-sans flex items-center justify-center">
        <BlockPrintPattern />
        <div className="max-w-xl w-full bg-white border border-amber-100/60 rounded-2xl p-8 md:p-12 shadow-sm text-center relative z-10 flex flex-col items-center">
          <LotusMotif className="w-16 h-16 text-primary mb-6" />
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-3">
            Welcome to Karigar!
          </h1>
          <p className="text-stone-500 font-serif italic text-base leading-relaxed mb-8 max-w-md">
            "Your studio workspace is waiting. Introduce your unique craft tradition, tell your heritage story, and securely upload your KYC identity to begin listing handcrafted treasures."
          </p>

          <div className="w-full space-y-4 mb-8 text-left text-sm font-sans font-medium text-stone-600 border border-stone-100 p-5 rounded-xl bg-stone-50/40">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
              <div>
                <strong className="text-stone-850 font-semibold block">Artisan Studio Story</strong>
                Configure your shop name, experience, district, and biography.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
              <div>
                <strong className="text-stone-850 font-semibold block">KYC Identity Documents</strong>
                Attach copies of Aadhaar, PAN, and settlement bank details for trust verification.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
              <div>
                <strong className="text-stone-850 font-semibold block">Marketplace Authorisation</strong>
                Publish products in the discovery directory immediately upon audit approval!
              </div>
            </div>
          </div>

          <Link to="/seller/settings" className="w-full">
            <Button className="w-full h-12 text-sm font-bold bg-primary text-white hover:bg-primary/95 flex items-center justify-center gap-2 rounded-lg shadow-sm border border-primary font-serif">
              Set Up Studio Profile <ArrowRight className="w-4.5 h-4.5" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const kycVerified = profile?.kyc?.status === 'verified';
  const kycStatus = profile?.kyc?.status || 'not_submitted';

  return (
    <div className="min-h-screen bg-stone-50/50 relative py-12 md:py-20 font-sans selection:bg-primary/20 selection:text-primary">
      <BlockPrintPattern />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-6 border-b border-stone-200">
          <div>
            <div className="inline-flex items-center gap-2 text-primary mb-3">
              <Store className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest font-sans">Karigar Studio</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 leading-tight">
              Welcome, <span className="text-primary italic">{user?.name?.split(' ')[0] || 'Karigar'}</span>
            </h1>
            <p className="text-stone-500 font-serif italic mt-2">Manage your studio, track catalog listings, and fulfill collector acquisitions.</p>
          </div>
          
          <div className="flex gap-3">
            {kycVerified ? (
              <Link to="/seller/products/new">
                <Button className="font-serif text-sm font-bold bg-primary text-white hover:bg-primary/95 flex items-center gap-2 px-5 py-2.5 rounded-lg shadow-sm border border-primary">
                  <PlusCircle className="w-4.5 h-4.5" /> Add Artifact
                </Button>
              </Link>
            ) : (
              <Button 
                onClick={() => toast.error("Verification Required: Product creation is locked until KYC documents are approved.")}
                className="font-serif text-sm font-bold bg-primary/60 text-white cursor-not-allowed flex items-center gap-2 px-5 py-2.5 rounded-lg shadow-sm border border-primary/20"
              >
                <PlusCircle className="w-4.5 h-4.5 animate-pulse" /> Add Artifact
              </Button>
            )}
            <Link to="/seller/settings">
              <Button variant="outline" className="font-serif text-sm font-bold bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 flex items-center gap-2 px-5 py-2.5 rounded-lg shadow-sm">
                <Settings className="w-4.5 h-4.5" /> Studio Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Verification Status Alert Banner */}
        {!kycVerified && (
          <div className={`mb-8 p-4 rounded-xl border flex items-start gap-3.5 font-serif text-sm ${
            kycStatus === 'pending' 
              ? 'bg-blue-50 border-blue-100 text-blue-800' 
              : kycStatus === 'rejected'
              ? 'bg-red-50 border-red-150 text-red-800'
              : 'bg-amber-50 border-amber-100 text-amber-800'
          }`}>
            <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              kycStatus === 'pending' ? 'text-blue-600' : kycStatus === 'rejected' ? 'text-red-650' : 'text-amber-600'
            }`} />
            <div>
              {kycStatus === 'pending' && (
                <>
                  <strong>KYC Audit Under Review:</strong> Your credentials and documents are currently awaiting review by the administrative team. Access to the product listing catalog and acquisitions preparation is locked during this verification phase. Please allow up to 48 hours.
                </>
              )}
              {kycStatus === 'rejected' && (
                <>
                  <strong>KYC Audit Rejected:</strong> Your verification application was rejected by the administrator. Reason: <span className="italic">"{profile?.kyc?.rejectionReason || 'Incomplete details'}"</span>. Please visit the Studio settings to re-submit correct details.
                </>
              )}
              {kycStatus === 'not_submitted' && (
                <>
                  <strong>Verification Required:</strong> Your identity and settlement bank credentials have not been submitted yet. Please complete your KYC verification under the Studio Profile settings to unlock product listing capabilities.
                </>
              )}
            </div>
          </div>
        )}

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {/* Total Revenue */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-stone-200 p-6 rounded-xl shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-10 group-hover:scale-105 transition-transform" />
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">
                <IndianRupee className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Livelihood Revenue</p>
            </div>
            <h3 className="text-3xl font-serif font-bold text-stone-900">₹{(salesStats?.totalRevenue || 0).toLocaleString('en-IN')}</h3>
          </motion.div>

          {/* Total Orders */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white border border-stone-200 p-6 rounded-xl shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10 group-hover:scale-105 transition-transform" />
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                <Package className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Acquisitions Flipped</p>
            </div>
            <h3 className="text-3xl font-serif font-bold text-stone-900">{salesStats?.totalOrders || 0} Orders</h3>
          </motion.div>

          {/* Total Items Sold */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white border border-stone-200 p-6 rounded-xl shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-24 h-24 bg-amber-50 rounded-bl-full -z-10 group-hover:scale-105 transition-transform" />
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-amber-50 text-amber-700 rounded-lg border border-amber-100">
                <TrendingUp className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Pieces Dispatched</p>
            </div>
            <h3 className="text-3xl font-serif font-bold text-stone-900">{salesStats?.totalItemsSold || 0} Items</h3>
          </motion.div>
        </div>

        {/* TABS */}
        <div className="flex border-b border-stone-200 mb-8 font-sans font-bold text-stone-600">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`pb-4 px-6 border-b-2 text-base transition-all ${
              activeTab === 'catalog'
                ? 'border-primary text-primary font-serif font-bold text-lg'
                : 'border-transparent hover:text-stone-900'
            }`}
          >
            Studio Catalog
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`pb-4 px-6 border-b-2 text-base transition-all ${
              activeTab === 'ledger'
                ? 'border-primary text-primary font-serif font-bold text-lg'
                : 'border-transparent hover:text-stone-900'
            }`}
          >
            Fulfillment Ledger
          </button>
        </div>

        {/* TAB CONTENTS */}
        {activeTab === 'catalog' ? (
          <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
              <h2 className="text-lg font-serif font-bold text-stone-900">Your Masterpieces</h2>
              <button 
                onClick={syncDashboardData}
                className="text-xs font-semibold text-stone-400 hover:text-primary transition-colors uppercase tracking-wider"
              >
                Sync Catalog
              </button>
            </div>

            {dashboardLoading && products.length === 0 ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            ) : !products || products.length === 0 ? (
              <div className="text-center py-20 bg-white">
                <LotusMotif className="w-16 h-16 text-primary/10 mx-auto mb-4" />
                <p className="text-lg font-serif text-stone-800">Your studio catalog is empty.</p>
                <p className="text-stone-500 font-serif italic text-sm mt-1">Introduce your handcrafted masterpieces to collectors around the world.</p>
                <Link to="/seller/products/new" className="mt-6 inline-block">
                  <Button className="bg-primary text-white text-xs font-bold uppercase py-2 px-5 rounded-lg shadow hover:bg-primary/95">
                    Launch New Artifact
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-xs font-bold text-stone-400 uppercase tracking-wider">
                      <th className="p-4 font-bold">Artifact</th>
                      <th className="p-4 font-bold">Heritage Tradition</th>
                      <th className="p-4 font-bold">Price Value</th>
                      <th className="p-4 font-bold">Edition Stock</th>
                      <th className="p-4 font-bold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-sm font-serif">
                    <AnimatePresence mode="popLayout">
                      {products.map((product) => (
                        <motion.tr 
                          key={product._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="hover:bg-stone-50/50 transition-colors"
                        >
                          <td className="p-4 flex items-center gap-3">
                            <div className="w-12 h-12 border border-stone-200 rounded overflow-hidden bg-stone-50 flex-shrink-0">
                              <img 
                                src={product.images?.[0]?.url || 'https://placehold.co/100'} 
                                alt={product.name} 
                                className="w-full h-full object-cover filter sepia-[0.05]" 
                              />
                            </div>
                            <div>
                              <p className="text-stone-900 font-bold leading-snug">{product.name}</p>
                              <p className="text-xs text-stone-400 line-clamp-1 max-w-[280px] font-sans font-medium mt-0.5">{product.originState || 'India'}</p>
                            </div>
                          </td>
                          <td className="p-4 text-stone-700 text-xs font-sans font-bold uppercase tracking-wider">{product.category}</td>
                          <td className="p-4 font-bold text-stone-900">₹{product.price.toLocaleString('en-IN')}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 text-xs rounded border font-sans font-bold ${
                              product.stock > 5 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                              product.stock > 0 ? 'bg-amber-50 text-amber-700 border-amber-100' :
                              'bg-red-50 text-red-700 border-red-150'
                            }`}>
                              {product.stock === 0 ? 'Sold Out' : `${product.stock} units`}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2 font-sans">
                            <Link to={`/seller/products/edit/${product._id}`}>
                              <Button size="sm" variant="outline" className="h-8 text-xs border-stone-200 hover:bg-stone-50 text-stone-700">
                                Edit
                              </Button>
                            </Link>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleRetireProduct(product._id)} 
                              className="h-8 text-xs"
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

            {/* Pagination */}
            {activeTab === 'catalog' && products.length > 0 && (
              <div className="p-4 border-t border-stone-100">
                <Pagination
                  currentPage={catalogPage}
                  totalPages={Math.ceil(products.length / 8)} // local estimation or store paginated values
                  onPageChange={(page) => setCatalogPage(page)}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
              <h2 className="text-lg font-serif font-bold text-stone-900">Fulfillment Ledger</h2>
              <button 
                onClick={syncDashboardData}
                className="text-xs font-semibold text-stone-400 hover:text-primary transition-colors uppercase tracking-wider"
              >
                Sync Ledger
              </button>
            </div>

            {dashboardLoading && orders.length === 0 ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            ) : !orders || orders.length === 0 ? (
              <div className="text-center py-20 bg-white">
                <LotusMotif className="w-16 h-16 text-primary/10 mx-auto mb-4" />
                <p className="text-lg font-serif text-stone-850">The ledger is currently blank.</p>
                <p className="text-stone-500 font-serif italic text-sm mt-1">Once collectors acquire your studio products, they will register here for shipping.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-xs font-bold text-stone-400 uppercase tracking-wider">
                      <th className="p-4 font-bold">Order Number</th>
                      <th className="p-4 font-bold">Collector Details</th>
                      <th className="p-4 font-bold">Fulfillment Item(s)</th>
                      <th className="p-4 font-bold">Artisan Value</th>
                      <th className="p-4 font-bold">Fulfillment Status</th>
                      <th className="p-4 font-bold text-right">Transition Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-sm font-serif">
                    <AnimatePresence mode="popLayout">
                      {orders.map((order) => {
                        const artisanId = user?._id || user?.id;
                        // Filter items that belong exclusively to this artisan
                        const myItems = order.items?.filter((item) => 
                          (item.product?.artisan === artisanId) || 
                          (item.product?.artisan?._id === artisanId) || 
                          (item.artisan === artisanId) ||
                          (item.artisan?._id === artisanId)
                        ) || [];
                        
                        if (myItems.length === 0) return null;

                        const firstItem = myItems[0];
                        const itemStatus = firstItem?.status || 'pending';

                        return (
                          <motion.tr 
                            key={order._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="hover:bg-stone-50/50 transition-colors"
                          >
                            <td className="p-4 font-mono text-xs text-stone-500 font-bold uppercase">
                              {order.orderNumber || order._id.slice(-8)}
                            </td>
                            <td className="p-4">
                              <p className="text-stone-900 font-bold">{order.shippingAddress?.fullName || 'Collector'}</p>
                              <p className="text-[10px] text-stone-400 font-sans font-bold uppercase mt-0.5">
                                {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-col gap-1">
                                {myItems.map((item, i) => (
                                  <span key={i} className="text-stone-800 text-sm font-semibold flex items-center gap-1.5">
                                    {item.name || item.product?.name || 'Artifact'} 
                                    <span className="text-stone-400 text-xs font-sans font-medium bg-stone-100 border border-stone-200 px-1.5 py-0.2 rounded">
                                      x{item.quantity}
                                    </span>
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="p-4 font-bold text-stone-900">
                              ₹{myItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString('en-IN')}
                            </td>
                            <td className="p-4 font-sans">
                              <span className={`px-2.5 py-1 text-xs rounded border font-bold ${
                                itemStatus === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                itemStatus === 'shipped' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                itemStatus === 'processing' ? 'bg-indigo-50 text-indigo-700 border-indigo-150' :
                                itemStatus === 'confirmed' ? 'bg-blue-50 text-blue-700 border-blue-150' :
                                'bg-amber-50 text-amber-700 border-amber-150'
                              }`}>
                                {itemStatus.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-4 text-right font-sans">
                              {itemStatus === 'pending' || itemStatus === 'confirmed' ? (
                                <Button 
                                  size="sm" 
                                  onClick={() => handleUpdateItemStatus(order._id, firstItem._id, 'processing')} 
                                  className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-semibold rounded-lg"
                                >
                                  Start Prep
                                </Button>
                              ) : itemStatus === 'processing' ? (
                                <Button 
                                  size="sm" 
                                  onClick={() => handleUpdateItemStatus(order._id, firstItem._id, 'shipped')} 
                                  className="h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white shadow-sm font-semibold rounded-lg"
                                >
                                  Dispatch Ship
                                </Button>
                              ) : itemStatus === 'shipped' ? (
                                <Button 
                                  size="sm" 
                                  onClick={() => handleUpdateItemStatus(order._id, firstItem._id, 'delivered')} 
                                  className="h-8 text-xs bg-emerald-600 hover:bg-emerald-750 text-white shadow-sm font-semibold rounded-lg"
                                >
                                  Confirm Delivery
                                </Button>
                              ) : (
                                <span className="text-xs text-stone-400 font-bold uppercase tracking-wider italic flex items-center justify-end gap-1">
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Settled
                                </span>
                              )}
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {orders.length > 0 && (
              <div className="p-4 border-t border-stone-100">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.pages}
                  onPageChange={(page) => setLedgerPage(page)}
                />
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}