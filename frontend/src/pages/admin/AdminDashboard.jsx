import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import apiClient from '../../lib/apiClient';
import { 
  ShieldAlert, 
  Users, 
  ShoppingBag, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  FileText,
  DollarSign,
  Download,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

// --- REUSABLE HERITAGE ELEMENTS ---
const LotusMotif = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <path d="M50 10 C30 30 10 50 10 70 C10 85 25 95 50 95 C75 95 90 85 90 70 C90 50 70 30 50 10 Z M50 25 C65 45 75 60 75 70 C75 80 65 85 50 85 C35 85 25 80 25 70 C25 60 35 45 50 25 Z"/>
    <path d="M20 60 C5 70 0 85 10 95 C25 90 35 75 40 60 C25 55 10 60 20 60 Z"/>
    <path d="M80 60 C95 70 100 85 90 95 C75 90 65 75 60 60 C75 55 90 60 80 60 Z"/>
  </svg>
);

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalArtisans: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [pendingProfiles, setPendingProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Fetch platform overview statistics
      const metricsRes = await apiClient.get('/admin/metrics');
      if (metricsRes.data?.success) {
        setMetrics(metricsRes.data.metrics);
      }

      // Fetch unverified artisans awaiting approval
      const kycRes = await apiClient.get('/admin/kyc/pending');
      if (kycRes.data?.success) {
        setPendingProfiles(kycRes.data.profiles || kycRes.data.artisans || []);
      }
    } catch (error) {
      console.error("Error fetching administrative data:", error);
      toast.error("Failed to sync administrative control console.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (profileId, approve) => {
    let rejectionReason = undefined;
    if (!approve) {
      const reason = window.prompt("Enter rejection reason for the artisan audit rejection:");
      if (reason === null) return; // cancel
      if (!reason.trim()) {
        return toast.error("Rejection reason is required.");
      }
      rejectionReason = reason;
    }

    setActionLoading(profileId);
    try {
      const response = await apiClient.put(`/admin/kyc/${profileId}/verify`, { 
        status: approve ? 'approved' : 'rejected',
        rejectionReason
      });

      if (response.data?.success) {
        toast.success(approve ? "Artisan credentials approved and verified!" : "Application audit rejected.");
        setPendingProfiles(prev => prev.filter(p => p._id !== profileId));
        // Refresh counts
        const metricsRes = await apiClient.get('/admin/metrics');
        if (metricsRes.data?.success) {
          setMetrics(metricsRes.data.metrics);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to finalize artisan audit status.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="font-serif italic text-stone-500">Opening Platform Command Console...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50/50 py-12 md:py-20 font-sans selection:bg-primary/20 selection:text-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pb-6 border-b border-stone-200">
          <div>
            <div className="inline-flex items-center gap-2 text-primary mb-2">
              <ShieldAlert className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest font-sans">Platform Governance</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 leading-tight">Command Console</h1>
          </div>
          <div className="bg-white px-5 py-2.5 rounded-lg border border-stone-200 flex items-center gap-3 shadow-xs">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-serif italic text-stone-500">Logged in as Administrator</span>
          </div>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { title: "Total Users", value: metrics.totalUsers, icon: Users, color: "text-blue-600 bg-blue-50 border-blue-100" },
            { title: "Active Karigars", value: metrics.totalArtisans, icon: LotusMotif, color: "text-amber-600 bg-amber-50 border-amber-100" },
            { title: "Acquisitions Ledger", value: metrics.totalOrders, icon: ShoppingBag, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
            { title: "Gross Platform Volume", value: `₹${(metrics.totalRevenue || 0).toLocaleString('en-IN')}`, icon: DollarSign, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
          ].map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white border border-stone-200 p-6 rounded-xl shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">{card.title}</p>
                <p className="text-2xl font-serif font-bold text-stone-900 leading-snug">{card.value}</p>
              </div>
              <div className={`p-3.5 rounded-xl border ${card.color}`}>
                <card.icon className="w-5.5 h-5.5" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* ARTISAN APPROVAL AREA */}
        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-stone-200 bg-stone-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-stone-900">Pending Artisan Verifications</h2>
              <p className="text-xs text-stone-500 font-serif italic mt-0.5">Audit and approve heritage credentials before studio onboarding.</p>
            </div>
            <span className="px-3.5 py-1 bg-primary/10 text-primary font-sans text-xs font-bold rounded-full border border-primary/20">
              {pendingProfiles.length} Awaiting Audit
            </span>
          </div>

          {pendingProfiles.length === 0 ? (
            <div className="text-center py-20 bg-white">
              <CheckCircle className="w-12 h-12 text-emerald-500/40 mx-auto mb-4" />
              <p className="text-lg font-serif font-bold text-stone-800">Registry Audits Up-to-Date</p>
              <p className="text-stone-500 font-serif italic text-sm mt-1">No outstanding artisan profiles require validation audits at this time.</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100 bg-white">
              {pendingProfiles.map((profile) => (
                <div key={profile._id} className="p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-stone-50/30 transition-colors">
                  
                  {/* Artisan Metadata */}
                  <div className="flex items-start gap-5 max-w-lg">
                    <div className="w-16 h-16 rounded-full border border-stone-200 overflow-hidden bg-stone-50 flex-shrink-0">
                      <img 
                        src={profile.shopLogo || profile.user?.avatar || 'https://placehold.co/150'} 
                        alt="" 
                        className="w-full h-full object-cover filter sepia-[0.05]"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-serif font-bold text-stone-900">
                        {profile.shopName || "Untitled Studio"}
                      </h3>
                      <p className="text-xs text-stone-500 font-serif italic">by {profile.user?.name || "Unknown Artisan"} ({profile.user?.email})</p>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-stone-600 mt-2.5 font-sans font-bold">
                        <span className="bg-stone-50 px-2 py-0.5 rounded border border-stone-200">EXPERIENCE: {profile.yearsOfExperience || 0} Years</span>
                        <span className="bg-stone-50 px-2 py-0.5 rounded border border-stone-200">STATE: {profile.location?.state || "N/A"}</span>
                      </div>

                      {/* Display Audit Documents details */}
                      <div className="mt-4 flex flex-wrap gap-3">
                        {profile.kyc?.aadhaarDoc && (
                          <a 
                            href={profile.kyc.aadhaarDoc} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-bold border border-primary/20 rounded px-2.5 py-1 bg-primary/5 shadow-inner"
                          >
                            <FileText className="w-3.5 h-3.5" /> View Aadhaar Card <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {profile.kyc?.panDoc && (
                          <a 
                            href={profile.kyc.panDoc} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-bold border border-primary/20 rounded px-2.5 py-1 bg-primary/5 shadow-inner"
                          >
                            <FileText className="w-3.5 h-3.5" /> View PAN Card <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Craft Categories */}
                  <div className="flex flex-wrap gap-1.5 max-w-xs">
                    {profile.craftCategories?.map((craft, i) => (
                      <span key={i} className="px-2 py-0.5 bg-stone-50 border border-stone-200 rounded text-[10px] font-sans font-bold uppercase tracking-wider text-stone-500">
                        {craft}
                      </span>
                    ))}
                  </div>

                  {/* Administrative Action Control Triggers */}
                  <div className="flex items-center gap-2.5 self-end lg:self-center font-sans">
                    <button
                      onClick={() => handleVerification(profile._id, false)}
                      disabled={actionLoading === profile._id}
                      className="px-4 py-2 border border-red-200 hover:border-red-300 rounded-lg text-red-600 hover:bg-red-50 text-xs transition-colors flex items-center gap-1.5 font-bold disabled:opacity-50 shadow-sm bg-white"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                    <button
                      onClick={() => handleVerification(profile._id, true)}
                      disabled={actionLoading === profile._id}
                      className="px-5 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-lg shadow hover:shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 border border-primary"
                    >
                      {actionLoading === profile._id ? (
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
  );
}