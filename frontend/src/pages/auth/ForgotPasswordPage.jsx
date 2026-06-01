import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../lib/apiClient';
import { LotusMotif } from '../../components/common/Heritage';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email address.');

    setLoading(true);
    try {
      await API.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Password reset link sent! Check your inbox.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send recovery email. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full bg-white p-8 rounded-xl border border-amber-100/60 shadow-sm relative overflow-hidden flex flex-col items-center">
        
        {/* Floating brand icon */}
        <LotusMotif className="w-12 h-12 text-primary mb-4" />

        {!sent ? (
          <>
            <h2 className="text-3xl font-serif font-bold text-stone-800 mb-2 text-center">
              Recover Password
            </h2>
            <p className="text-stone-500 text-sm text-center mb-8 max-w-xs leading-relaxed">
              Enter your email address and we will forward a recovery link to choose a new password.
            </p>

            <form onSubmit={handleSubmit} className="w-full space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:border-primary text-sm bg-stone-50/30"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {loading ? 'Sending Recovery Link...' : 'Send Recovery Link'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center w-full">
            <h2 className="text-3xl font-serif font-bold text-stone-800 mb-2">
              Email Forwarded!
            </h2>
            <p className="text-stone-500 text-sm leading-relaxed mb-8">
              A recovery link has been sent to <strong>{email}</strong>. Please check your inbox and click the link within 30 minutes to reset your password.
            </p>
            <button
              onClick={() => setSent(false)}
              className="btn-outline py-2.5 px-6 border-amber-200 text-stone-700 text-sm mb-4"
            >
              Re-enter Email
            </button>
          </div>
        )}

        {/* Back Link */}
        <Link 
          to="/login" 
          className="mt-8 flex items-center gap-1.5 text-sm font-semibold text-stone-600 hover:text-primary transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        {/* Decorative Lotus in background */}
        <div className="absolute -bottom-8 -right-8 opacity-[0.02]">
          <LotusMotif className="w-32 h-32 text-stone-900" />
        </div>
      </div>
    </div>
  );
}
