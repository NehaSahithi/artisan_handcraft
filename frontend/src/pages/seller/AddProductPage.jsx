import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Package, Info, Tag, Layers, IndianRupee, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useProductStore } from '../../store/productStore';
import { useArtisanStore } from '../../store/artisanStore';

const staticCategories = [
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

export default function AddProductPage() {
  const navigate = useNavigate();
  const { createProduct, loading, categories, getCategories } = useProductStore();
  const { getMyProfile } = useArtisanStore();

  const [checkingProfile, setCheckingProfile] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    discount: '0',
    stock: '1',
    materials: '',
    technique: '',
    craftingTime: '',
    originState: '',
    originDistrict: '',
    giCertified: false,
    customizable: false,
    tags: ''
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  useEffect(() => {
    const checkVerification = async () => {
      try {
        const profile = await getMyProfile();
        if (!profile || !profile.isVerified || profile.kyc?.status !== 'verified') {
          toast.error("Verification Required: Access locked until KYC is approved.");
          navigate('/seller/dashboard');
          return;
        }
        await getCategories();
        setCheckingProfile(false);
      } catch (err) {
        toast.error("Verification Required: Please complete your studio profile first.");
        navigate('/seller/dashboard');
      }
    };
    checkVerification();
  }, [getMyProfile, getCategories, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      return toast.error("You can upload a maximum of 5 images.");
    }
    setSelectedFiles(files);
    
    // Create preview urls for selected files
    const filePreviews = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(filePreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      return toast.error("Please upload at least one product image.");
    }

    if (!formData.category) {
      return toast.error("Please select a craft category.");
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });

    selectedFiles.forEach(file => {
      data.append('images', file);
    });

    const toastId = toast.loading('Publishing product to gallery...');
    try {
      await createProduct(data);
      toast.success('Craft product published successfully!', { id: toastId });
      navigate('/seller/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish product details.', { id: toastId });
    }
  };

  if (checkingProfile) {
    return (
      <div className="min-h-screen bg-stone-50/50 flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="font-serif italic text-stone-500">Verifying artisan credentials...</p>
      </div>
    );
  }

  const activeCategories = categories && categories.length > 0 ? categories : staticCategories;

  return (
    <div className="container-custom py-12 font-sans max-w-4xl">
      
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
          <h1 className="text-3xl font-serif font-bold text-stone-800">
            Publish New Masterpiece
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white border border-amber-100/60 rounded-xl p-6 md:p-8 shadow-sm">
        
        {/* Section 1: Basic details */}
        <div className="space-y-5">
          <h2 className="text-lg font-serif font-semibold text-stone-700 flex items-center gap-2 pb-2 border-b border-stone-50">
            <Info className="w-5 h-5 text-primary" /> Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block">Product Name *</label>
              <input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Handmade Blue Pottery Vase"
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:border-primary text-sm bg-stone-50/20"
              />
            </div>
            
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block">Description *</label>
              <textarea
                required
                rows="4"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:border-primary text-sm bg-stone-50/20"
                placeholder="Describe your handcraft, its cultural history, generation legacy, and materials used..."
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block">Craft Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:border-primary text-sm bg-stone-50/20 text-stone-700 font-medium"
              >
                <option value="">Select Category</option>
                {activeCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block">Inventory Stock *</label>
              <input
                type="number"
                required
                min="0"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:border-primary text-sm bg-stone-50/20"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Pricing details */}
        <div className="space-y-5">
          <h2 className="text-lg font-serif font-semibold text-stone-700 flex items-center gap-2 pb-2 border-b border-stone-50">
            <Tag className="w-5 h-5 text-primary" /> Pricing & Discount
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block">Price (INR) *</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-stone-400 text-sm">₹</span>
                <input
                  type="number"
                  required
                  min="1"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full pl-8 pr-3 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:border-primary text-sm bg-stone-50/20"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block">Discount %</label>
              <input
                type="number"
                min="0"
                max="99"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:border-primary text-sm bg-stone-50/20"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Provenance details */}
        <div className="space-y-5">
          <h2 className="text-lg font-serif font-semibold text-stone-700 flex items-center gap-2 pb-2 border-b border-stone-50">
            <Layers className="w-5 h-5 text-primary" /> Craft Details & Provenance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block">Origin State</label>
              <input
                type="text"
                name="originState"
                value={formData.originState}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:border-primary text-sm bg-stone-50/20"
                placeholder="e.g. Rajasthan"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block">Origin District</label>
              <input
                type="text"
                name="originDistrict"
                value={formData.originDistrict}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:border-primary text-sm bg-stone-50/20"
                placeholder="e.g. Jaipur"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block">Technique Used</label>
              <input
                type="text"
                name="technique"
                value={formData.technique}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:border-primary text-sm bg-stone-50/20"
                placeholder="e.g. Traditional hand casting, natural block prints"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block">Crafting Duration</label>
              <input
                type="text"
                name="craftingTime"
                value={formData.craftingTime}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:border-primary text-sm bg-stone-50/20"
                placeholder="e.g. 3-4 days"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block">Materials Used (comma-separated)</label>
              <input
                type="text"
                name="materials"
                value={formData.materials}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:border-primary text-sm bg-stone-50/20"
                placeholder="e.g. Local clay, organic indigo, natural glazes"
              />
            </div>
            
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block">Search Tags (comma-separated)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:border-primary text-sm bg-stone-50/20"
                placeholder="e.g. organic, jaipur, traditional, blue pottery"
              />
            </div>

            <div className="flex gap-8 pt-3 md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-stone-700">
                <input
                  type="checkbox"
                  name="giCertified"
                  checked={formData.giCertified}
                  onChange={handleChange}
                  className="w-4.5 h-4.5 accent-primary rounded cursor-pointer"
                />
                GI Tag Certified (Geographical Indication)
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-stone-700">
                <input
                  type="checkbox"
                  name="customizable"
                  checked={formData.customizable}
                  onChange={handleChange}
                  className="w-4.5 h-4.5 accent-primary rounded cursor-pointer"
                />
                Available for Custom Orders
              </label>
            </div>
          </div>
        </div>

        {/* Section 4: Image uploads */}
        <div className="space-y-5">
          <h2 className="text-lg font-serif font-semibold text-stone-700 flex items-center gap-2 pb-2 border-b border-stone-50">
            <Upload className="w-5 h-5 text-primary" /> Product Images
          </h2>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-stone-200 hover:border-primary/50 rounded-xl p-8 flex flex-col items-center justify-center bg-stone-50/30 transition-all cursor-pointer relative">
              <input
                type="file"
                multiple
                required
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload className="w-10 h-10 text-stone-400 mb-3" />
              <p className="text-stone-700 text-sm font-semibold mb-1">Click to upload product images *</p>
              <p className="text-stone-400 text-xs">Supports JPG, PNG, WEBP (Max 5 images). High-resolution shots recommended.</p>
            </div>

            {/* Preview Grid */}
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                {previewUrls.map((url, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden border border-stone-200 relative bg-stone-50">
                    <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 left-2 bg-stone-900/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Image {index + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit action */}
        <div className="pt-6 border-t border-stone-100 flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary py-3 px-8 flex items-center justify-center gap-2 flex-grow sm:flex-none"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Publish Product Listing
          </button>
          
          <Link
            to="/seller/dashboard"
            className="btn-outline py-3 px-8 text-center"
          >
            Cancel
          </Link>
        </div>

      </form>
    </div>
  );
}
