import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowLeft, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { LotusMotif } from '../../components/common/Heritage';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuthStore();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return toast.error('Please enter a new password.');
    if (password.length < 8) return toast.error('Password must be at least 8 characters long.');
    if (password !== confirmPassword) return toast.error('Passwords do not match.');

    setLoading(true);
    const toastId = toast.loading('Updating password...');
    try {
      await resetPassword(token, password);
      toast.success('Password updated successfully! Welcome.', { id: toastId });
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password update failed. Link may be expired.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full bg-white p-8 rounded-xl border border-amber-100/60 shadow-sm relative overflow-hidden flex flex-col items-center">
        
        {/* Symmetrical brand floating lotus */}
        <LotusMotif className="w-12 h-12 text-primary mb-4" />

        <h2 className="text-3xl font-serif font-bold text-stone-800 mb-2 text-center">
          Choose New Password
        </h2>
        <p className="text-stone-500 text-sm text-center mb-8 max-w-xs leading-relaxed">
          Please select a strong password of at least 8 characters to secure your Karigar account.
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-5">
          {/* 1. New Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
              New Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:border-primary text-sm bg-stone-50/30"
              />
            </div>
          </div>

          {/* 2. Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:border-primary text-sm bg-stone-50/30"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            {loading ? 'Saving Password...' : 'Save New Password'}
          </button>
        </form>

        {/* Back Link */}
        <Link 
          to="/login" 
          className="mt-8 flex items-center gap-1.5 text-sm font-semibold text-stone-600 hover:text-primary transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        {/* Background visual motif */}
        <div className="absolute -bottom-8 -right-8 opacity-[0.02]">
          <LotusMotif className="w-32 h-32 text-stone-900" />
        </div>
      </div>
    </div>
  );
}
