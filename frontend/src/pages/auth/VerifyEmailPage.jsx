import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import API from '../../lib/apiClient';
import { LotusMotif } from '../../components/common/Heritage';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await API.get(`/auth/verify-email/${token}`);
        setSuccess(true);
        setMessage(response.data.message || 'Email verified successfully!');
      } catch (err) {
        setSuccess(false);
        setMessage(err.response?.data?.message || 'Verification link is invalid or has expired.');
      } finally {
        setVerifying(false);
      }
    };
    verifyToken();
  }, [token]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full bg-white p-8 rounded-xl border border-amber-100/60 shadow-sm relative overflow-hidden flex flex-col items-center">
        
        {/* Floating brand icon */}
        <LotusMotif className="w-12 h-12 text-primary mb-6" />

        {verifying ? (
          <div className="text-center py-8">
            <LoadingSpinner size="md" message="Verifying your email address..." />
          </div>
        ) : (
          <div className="text-center w-full flex flex-col items-center animate-fade-in">
            {success ? (
              <>
                <div className="p-3 bg-green-50 text-green-500 rounded-full mb-6">
                  <CheckCircle className="w-14 h-14" />
                </div>
                <h2 className="text-3xl font-serif font-bold text-stone-800 mb-2">
                  Email Verified!
                </h2>
                <p className="text-stone-500 text-sm leading-relaxed mb-8 max-w-xs">
                  {message} Your account is fully activated. You can now log in to explore premium traditional crafts.
                </p>
                <Link to="/login" className="w-full btn-primary py-3 flex items-center justify-center gap-2">
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            ) : (
              <>
                <div className="p-3 bg-red-50 text-red-500 rounded-full mb-6">
                  <AlertTriangle className="w-14 h-14 animate-bounce" />
                </div>
                <h2 className="text-3xl font-serif font-bold text-stone-800 mb-2">
                  Verification Failed
                </h2>
                <p className="text-stone-500 text-sm leading-relaxed mb-8 max-w-xs">
                  {message} Email verification links are valid for 24 hours. Please request a new verification email from your dashboard.
                </p>
                <div className="flex gap-4 w-full">
                  <Link to="/" className="w-full btn-outline py-2.5 text-sm">
                    Back to Home
                  </Link>
                  <Link to="/login" className="w-full btn-primary py-2.5 text-sm">
                    Sign In
                  </Link>
                </div>
              </>
            )}
          </div>
        )}

        {/* Decorative elements */}
        <div className="absolute -bottom-8 -right-8 opacity-[0.02]">
          <LotusMotif className="w-32 h-32 text-stone-900" />
        </div>
      </div>
    </div>
  );
}
