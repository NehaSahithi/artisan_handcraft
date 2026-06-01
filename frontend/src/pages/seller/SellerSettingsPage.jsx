import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft, ShieldCheck, Store, MapPin, BadgeCheck, Upload, Image } from 'lucide-react';
import { useArtisanStore } from '../../store/artisanStore';
import { LotusMotif } from '../../components/common/Heritage';

const craftOptions = [
  'Pottery & Ceramics',
  'Textiles & Weaving',
  'Wood Carving',
  'Metal Work',
  'Jewelry',
  'Leather Craft',
  'Bamboo & Cane',
  'Stone Carving',
  'Painting & Art',
  'Embroidery',
  'Block Printing',
  'Papier Mache',
  'Glass Work',
  'Jute Craft',
  'Lac Work',
  'Bell Metal',
  'Dhokra Art'
];

const initialProfile = {
  shopName: '',
  tagline: '',
  story: '',
  craftTradition: '',
  yearsOfExperience: '',
  village: '',
  district: '',
  state: '',
  pincode: '',
  craftCategories: [],
  socialLinks: {
    website: '',
    instagram: '',
    facebook: '',
    youtube: ''
  }
};

const initialKyc = {
  aadhaarNumber: '',
  panNumber: '',
  bankAccountNumber: '',
  ifscCode: '',
  bankName: '',
};

export default function SellerSettingsPage() {
  const { getDashboardStats, getMyProfile, updateProfile, submitKYC, updateShopMedia } = useArtisanStore();
  
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [submittingKyc, setSubmittingKyc] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [isNewArtisan, setIsNewArtisan] = useState(false);

  const [profile, setProfile] = useState(initialProfile);
  const [kyc, setKyc] = useState(initialKyc);
  const [kycStatus, setKycStatus] = useState('not_submitted');
  const [kycRejectionReason, setKycRejectionReason] = useState('');
  
  // File attachments state
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [panFile, setPanFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);

  // Previews
  const [logoPreview, setLogoPreview] = useState('');
  const [bannerPreview, setBannerPreview] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const profileData = await getMyProfile();
        
        if (profileData) {
          setProfile({
            shopName: profileData.shopName || '',
            tagline: profileData.tagline || '',
            story: profileData.story || '',
            craftTradition: profileData.craftTradition || '',
            yearsOfExperience: profileData.yearsOfExperience || '',
            village: profileData.location?.village || '',
            district: profileData.location?.district || '',
            state: profileData.location?.state || '',
            pincode: profileData.location?.pincode || '',
            craftCategories: profileData.craftCategories || [],
            socialLinks: profileData.socialLinks || { website: '', instagram: '', facebook: '', youtube: '' }
          });

          setKyc({
            aadhaarNumber: '',
            panNumber: '',
            bankAccountNumber: '',
            ifscCode: profileData.kyc?.bankDetails?.ifsc || '',
            bankName: profileData.kyc?.bankDetails?.bankName || '',
          });

          setKycStatus(profileData.kyc?.status || 'not_submitted');
          setKycRejectionReason(profileData.kyc?.rejectionReason || '');
          
          if (profileData.shopLogo) setLogoPreview(profileData.shopLogo);
          if (profileData.shopBanner) setBannerPreview(profileData.shopBanner);
        }
        
        // Dynamic fetch of statistics
        await getDashboardStats();
      } catch (error) {
        // Silently capture and ignore the expected 404 for newly registered accounts
        if (error.response && error.response.status === 404) {
          console.info("🆕 New Artisan Account detected. Awaiting first-time profile creation...");
          setIsNewArtisan(true);
        } else {
          toast.error(error.response?.data?.message || 'Failed to load studio configuration settings.');
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [getMyProfile, getDashboardStats]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('social_')) {
      const field = name.replace('social_', '');
      setProfile((current) => ({
        ...current,
        socialLinks: {
          ...current.socialLinks,
          [field]: value
        }
      }));
    } else {
      setProfile((current) => ({ ...current, [name]: value }));
    }
  };

  const handleKycChange = (e) => {
    const { name, value } = e.target;
    setKyc((current) => ({ ...current, [name]: value }));
  };

  const toggleCraft = (craft) => {
    setProfile((current) => {
      const selected = current.craftCategories.includes(craft);
      return {
        ...current,
        craftCategories: selected
          ? current.craftCategories.filter((item) => item !== craft)
          : [...current.craftCategories, craft],
      };
    });
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!profile.shopName) {
      return toast.error("Please provide your studio or shop name.");
    }

    setSavingProfile(true);
    try {
      const payload = {
        ...profile,
        location: {
          village: profile.village,
          district: profile.district,
          state: profile.state,
          pincode: profile.pincode
        },
        yearsOfExperience: profile.yearsOfExperience === '' ? undefined : Number(profile.yearsOfExperience),
      };
      // Delete temporary local flat keys
      delete payload.village;
      delete payload.district;
      delete payload.state;
      delete payload.pincode;

      await updateProfile(payload);
      toast.success('Studio configuration profile saved.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not save studio profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleKycSubmit = async (e) => {
    e.preventDefault();
    if (!kyc.aadhaarNumber || !kyc.panNumber || !kyc.bankAccountNumber || !kyc.ifscCode || !kyc.bankName) {
      return toast.error("Please fill in all KYC details completely.");
    }
    if (!aadhaarFile || !panFile) {
      return toast.error("Please attach copy files of both Aadhaar and PAN documents.");
    }

    setSubmittingKyc(true);
    const data = new FormData();
    data.append('aadhaarNumber', kyc.aadhaarNumber);
    data.append('panNumber', kyc.panNumber);
    data.append('bankDetails', JSON.stringify({
      accountNumber: kyc.bankAccountNumber,
      ifsc: kyc.ifscCode,
      bankName: kyc.bankName
    }));
    data.append('aadhaarDoc', aadhaarFile);
    data.append('panDoc', panFile);

    const toastId = toast.loading('Uploading and submitting KYC verification...');
    try {
      await submitKYC(data);
      toast.success('KYC details uploaded and submitted for audit review.', { id: toastId });
      setKycStatus('pending');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register KYC verification details.', { id: toastId });
    } finally {
      setSubmittingKyc(false);
    }
  };

  const handleMediaSubmit = async (e) => {
    e.preventDefault();
    if (!logoFile && !bannerFile) {
      return toast.error("Please select a Logo or Banner to upload first.");
    }

    setUploadingMedia(true);
    const data = new FormData();
    if (logoFile) data.append('shopLogo', logoFile);
    if (bannerFile) data.append('shopBanner', bannerFile);

    const toastId = toast.loading('Uploading studio assets to Cloudinary...');
    try {
      const res = await updateShopMedia(data);
      toast.success('Studio visual media assets uploaded and saved.', { id: toastId });
      if (res.profile?.shopLogo) setLogoPreview(res.profile.shopLogo);
      if (res.profile?.shopBanner) setBannerPreview(res.profile.shopBanner);
      setLogoFile(null);
      setBannerFile(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload studio media assets.', { id: toastId });
    } finally {
      setUploadingMedia(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="font-serif italic text-stone-500 text-sm">Opening studio workspace settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50/50 py-12 md:py-20 font-sans selection:bg-primary/20 selection:text-primary">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link to="/seller/dashboard" className="inline-flex items-center gap-2 text-stone-500 hover:text-primary mb-8 font-serif italic">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Quick status cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
            <Store className="w-5 h-5 text-primary mb-3" />
            <div className="text-xs text-stone-400 uppercase font-bold tracking-wider mb-1">Studio Shop</div>
            <div className="text-xl font-serif font-bold text-stone-900">{profile.shopName || 'Untitled Studio'}</div>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
            <MapPin className="w-5 h-5 text-primary mb-3" />
            <div className="text-xs text-stone-400 uppercase font-bold tracking-wider mb-1">Provenance State</div>
            <div className="text-xl font-serif font-bold text-stone-900">{profile.state || 'Not Set'}</div>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
            <ShieldCheck className="w-5 h-5 text-primary mb-3" />
            <div className="text-xs text-stone-400 uppercase font-bold tracking-wider mb-1">KYC Status</div>
            <div className={`text-sm font-bold uppercase tracking-wider ${
              kycStatus === 'verified' ? 'text-emerald-600' :
              kycStatus === 'pending' ? 'text-blue-650' :
              kycStatus === 'rejected' ? 'text-red-650' : 'text-stone-500'
            }`}>
              {kycStatus === 'verified' ? 'Verified Master' :
               kycStatus === 'pending' ? 'Pending Review' :
               kycStatus === 'rejected' ? 'Rejected' : 'Not Submitted'}
            </div>
          </div>
        </div>

        {isNewArtisan && (
          <div className="mb-8 p-6 rounded-xl border border-amber-100 bg-amber-50/40 text-amber-900 flex items-start gap-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
            <LotusMotif className="w-10 h-10 text-primary flex-shrink-0" />
            <div>
              <h3 className="font-serif font-bold text-lg mb-1">Namaste! Welcome to Karigar</h3>
              <p className="text-stone-600 font-serif italic text-sm leading-relaxed">
                We are honored to showcase your heritage craft. To start listing your masterpieces in our public gallery, please begin by setting up your Studio Profile and submitting your KYC documents below. Our administrative team will review your application within 24-48 hours.
              </p>
            </div>
          </div>
        )}

        {kycStatus === 'rejected' && kycRejectionReason && (
          <div className="bg-red-50 border border-red-150 rounded-xl p-4 mb-8 text-xs font-medium text-red-800 font-serif">
            <strong>KYC Rejection Audit Reason:</strong> "{kycRejectionReason}". Please re-submit correct details.
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-12 items-start">
          
          {/* LEFT: Profile & Shop Info Form (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-8">
            <section className="rounded-2xl border border-stone-200 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6 pb-2 border-b border-stone-100 flex items-center gap-2">
                <Store className="w-6 h-6 text-primary" /> Studio Profile
              </h2>
              
              <form onSubmit={saveProfile} className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-stone-450">Studio Shop Name *</label>
                    <input className="w-full rounded-lg border border-stone-200 bg-stone-50/20 px-3.5 py-2 text-sm focus:outline-none focus:border-primary" name="shopName" value={profile.shopName} onChange={handleProfileChange} required />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-stone-450">Studio Tagline</label>
                    <input className="w-full rounded-lg border border-stone-200 bg-stone-50/20 px-3.5 py-2 text-sm focus:outline-none focus:border-primary" name="tagline" value={profile.tagline} onChange={handleProfileChange} placeholder="e.g. Master weaving passed down through generations" />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-stone-450">Artisan Biography / Studio Story *</label>
                    <textarea className="w-full rounded-lg border border-stone-200 bg-stone-50/20 px-3.5 py-2 text-sm focus:outline-none focus:border-primary min-h-24 font-serif" name="story" value={profile.story} onChange={handleProfileChange} required placeholder="Tell collectors about your handcraft journey, heritage inspiration..." />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-stone-450">Craft Tradition / Material Details</label>
                    <textarea className="w-full rounded-lg border border-stone-200 bg-stone-50/20 px-3.5 py-2 text-sm focus:outline-none focus:border-primary min-h-20 font-serif" name="craftTradition" value={profile.craftTradition} onChange={handleProfileChange} placeholder="e.g. Generation legacy of Dhokra metal casting..." />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-stone-450">Studio Village</label>
                    <input className="w-full rounded-lg border border-stone-200 bg-stone-50/20 px-3.5 py-2 text-sm focus:outline-none focus:border-primary" name="village" value={profile.village} onChange={handleProfileChange} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-stone-450">Studio District</label>
                    <input className="w-full rounded-lg border border-stone-200 bg-stone-50/20 px-3.5 py-2 text-sm focus:outline-none focus:border-primary" name="district" value={profile.district} onChange={handleProfileChange} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-stone-450">Studio State</label>
                    <input className="w-full rounded-lg border border-stone-200 bg-stone-50/20 px-3.5 py-2 text-sm focus:outline-none focus:border-primary" name="state" value={profile.state} onChange={handleProfileChange} placeholder="e.g. West Bengal" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-stone-450">Studio Pincode</label>
                    <input className="w-full rounded-lg border border-stone-200 bg-stone-50/20 px-3.5 py-2 text-sm focus:outline-none focus:border-primary" name="pincode" value={profile.pincode} onChange={handleProfileChange} placeholder="e.g. 700001" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-stone-450">Years of Experience</label>
                    <input className="w-full rounded-lg border border-stone-200 bg-stone-50/20 px-3.5 py-2 text-sm focus:outline-none focus:border-primary" name="yearsOfExperience" value={profile.yearsOfExperience} onChange={handleProfileChange} type="number" min="0" />
                  </div>
                </div>

                <div className="mt-6">
                  <div className="text-xs font-bold uppercase tracking-wider text-stone-450 mb-3">Craft Masteries Practice Areas</div>
                  <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto border border-stone-150 p-2.5 rounded-lg bg-stone-50/35 scrollbar-thin">
                    {craftOptions.map((craft) => (
                      <button
                        key={craft}
                        type="button"
                        onClick={() => toggleCraft(craft)}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                          profile.craftCategories.includes(craft) 
                            ? 'bg-primary text-white border-primary shadow-sm' 
                            : 'bg-white border-stone-200 text-stone-700 hover:border-primary'
                        }`}
                      >
                        {craft}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Social media connections */}
                <div className="space-y-3 pt-4 border-t border-stone-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">Social Connections</h4>
                  <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
                    <input className="rounded-lg border border-stone-200 bg-stone-50/20 px-3.5 py-2 text-xs focus:outline-none focus:border-primary" name="social_website" value={profile.socialLinks?.website || ''} onChange={handleProfileChange} placeholder="Website Link" />
                    <input className="rounded-lg border border-stone-200 bg-stone-50/20 px-3.5 py-2 text-xs focus:outline-none focus:border-primary" name="social_instagram" value={profile.socialLinks?.instagram || ''} onChange={handleProfileChange} placeholder="Instagram Link" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-white font-bold text-sm shadow hover:bg-primary/95 transition-all disabled:opacity-75"
                >
                  {savingProfile ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <BadgeCheck className="w-4.5 h-4.5" />}
                  Save Studio Profile
                </button>
              </form>
            </section>
          </div>

          {/* RIGHT: KYC & Shop Media Assets (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Shop logo & banner upload card */}
            <section className="rounded-2xl border border-stone-200 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-serif font-bold text-stone-900 mb-6 pb-2 border-b border-stone-100 flex items-center gap-2">
                <Image className="w-5 h-5 text-primary" /> Visual Assets
              </h2>

              <form onSubmit={handleMediaSubmit} className="space-y-6">
                
                {/* Shop Logo upload */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-stone-450 block">Studio Logo / Portrait</span>
                  <div className="flex items-center gap-4">
                    {logoPreview && (
                      <img src={logoPreview} alt="Logo" className="w-16 h-16 rounded-full object-cover border border-stone-200" />
                    )}
                    <label className="flex-grow border-2 border-dashed border-stone-200 hover:border-primary/50 rounded-lg p-4 flex flex-col items-center justify-center bg-stone-50/30 transition-all cursor-pointer relative text-center">
                      <input type="file" accept="image/*" onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setLogoFile(file);
                          setLogoPreview(URL.createObjectURL(file));
                        }
                      }} className="absolute inset-0 opacity-0 cursor-pointer" />
                      <Upload className="w-5 h-5 text-stone-400 mb-1" />
                      <span className="text-xs font-semibold text-stone-700">{logoFile ? logoFile.name : 'Select Logo File'}</span>
                    </label>
                  </div>
                </div>

                {/* Shop Banner upload */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-stone-450 block">Studio Backdrop Banner</span>
                  <div className="space-y-3">
                    {bannerPreview && (
                      <div className="w-full h-20 rounded-lg overflow-hidden border border-stone-200">
                        <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <label className="border-2 border-dashed border-stone-200 hover:border-primary/50 rounded-lg p-4 flex flex-col items-center justify-center bg-stone-50/30 transition-all cursor-pointer relative text-center">
                      <input type="file" accept="image/*" onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setBannerFile(file);
                          setBannerPreview(URL.createObjectURL(file));
                        }
                      }} className="absolute inset-0 opacity-0 cursor-pointer" />
                      <Upload className="w-5 h-5 text-stone-400 mb-1" />
                      <span className="text-xs font-semibold text-stone-700">{bannerFile ? bannerFile.name : 'Select Banner File'}</span>
                    </label>
                  </div>
                </div>

                {(logoFile || bannerFile) && (
                  <button
                    type="submit"
                    disabled={uploadingMedia}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-white font-bold text-xs shadow hover:bg-primary/95 transition-all"
                  >
                    {uploadingMedia ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    Upload Assets to Cloudinary
                  </button>
                )}
              </form>
            </section>
            
            {/* KYC details verification form */}
            <section className="rounded-2xl border border-stone-200 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-serif font-bold text-stone-900 mb-6 pb-2 border-b border-stone-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" /> KYC Verification
              </h2>

              {kycStatus === 'verified' ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 text-center space-y-3">
                  <ShieldCheck className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h3 className="font-serif font-bold text-emerald-900 text-lg">Verification Settled</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    Your master karigar identity and bank credentials have been fully verified. You are authorised to sell artifacts publicly in the gallery.
                  </p>
                </div>
              ) : kycStatus === 'pending' ? (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center space-y-3">
                  <Loader2 className="w-12 h-12 animate-spin text-blue-650 mx-auto" />
                  <h3 className="font-serif font-bold text-blue-900 text-lg">Audit Review Pending</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    Your KYC document buffers have been successfully uploaded and are currently under administrative verification. Please allow 1-2 business days.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleKycSubmit} className="space-y-4">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-stone-450 block">Aadhaar UID Number *</label>
                      <input className="w-full rounded-lg border border-stone-200 bg-stone-50/20 px-3.5 py-2 text-sm focus:outline-none focus:border-primary" name="aadhaarNumber" value={kyc.aadhaarNumber} onChange={handleKycChange} required placeholder="12-digit UID" maxLength="12" autoComplete="off" />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-stone-450 block">PAN ID Card Number *</label>
                      <input className="w-full rounded-lg border border-stone-200 bg-stone-50/20 px-3.5 py-2 text-sm focus:outline-none focus:border-primary" name="panNumber" value={kyc.panNumber} onChange={handleKycChange} required placeholder="10-digit Alphanumeric" maxLength="10" autoComplete="off" />
                    </div>

                    {/* Aadhaar File Upload */}
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-stone-450 block">Aadhaar PDF/Image Document *</label>
                      <label className="border border-stone-200 bg-stone-50/20 hover:border-primary/50 rounded-lg p-3.5 flex items-center justify-between transition-all cursor-pointer text-xs">
                        <input type="file" required accept=".pdf,image/*" onChange={(e) => setAadhaarFile(e.target.files[0])} className="hidden" />
                        <span className="font-medium text-stone-700">{aadhaarFile ? aadhaarFile.name : 'Select File Copy'}</span>
                        <Upload className="w-4 h-4 text-stone-400" />
                      </label>
                    </div>

                    {/* PAN File Upload */}
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-stone-450 block">PAN PDF/Image Document *</label>
                      <label className="border border-stone-200 bg-stone-50/20 hover:border-primary/50 rounded-lg p-3.5 flex items-center justify-between transition-all cursor-pointer text-xs">
                        <input type="file" required accept=".pdf,image/*" onChange={(e) => setPanFile(e.target.files[0])} className="hidden" />
                        <span className="font-medium text-stone-700">{panFile ? panFile.name : 'Select File Copy'}</span>
                        <Upload className="w-4 h-4 text-stone-400" />
                      </label>
                    </div>

                    <div className="h-px bg-stone-100 my-4" />
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-1">Livelihood Bank Settlement details</span>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-stone-450 block">Bank Account Number *</label>
                      <input className="w-full rounded-lg border border-stone-200 bg-stone-50/20 px-3.5 py-2 text-sm focus:outline-none focus:border-primary" name="bankAccountNumber" value={kyc.bankAccountNumber} onChange={handleKycChange} required type="password" placeholder="Account Number" autoComplete="new-password" />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-stone-450 block">IFSC Bank Code *</label>
                      <input className="w-full rounded-lg border border-stone-200 bg-stone-50/20 px-3.5 py-2 text-sm focus:outline-none focus:border-primary font-mono uppercase" name="ifscCode" value={kyc.ifscCode} onChange={handleKycChange} required placeholder="IFSC Code" maxLength="11" />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-stone-450 block">Settlement Bank Name *</label>
                      <input className="w-full rounded-lg border border-stone-200 bg-stone-50/20 px-3.5 py-2 text-sm focus:outline-none focus:border-primary" name="bankName" value={kyc.bankName} onChange={handleKycChange} required placeholder="Bank Name" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingKyc}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-white font-bold text-sm shadow hover:bg-primary/95 transition-all disabled:opacity-75 mt-4"
                  >
                    {submittingKyc ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <ShieldCheck className="w-4.5 h-4.5" />}
                    Submit KYC Verification
                  </button>
                </form>
              )}
            </section>
          </div>

        </div>

      </div>
    </div>
  );
}