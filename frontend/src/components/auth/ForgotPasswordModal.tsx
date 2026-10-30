import React, { useState } from 'react';
import { X, CheckCircle2, Mail } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  defaultEmail = ''
}) => {
  const [resetEmail, setResetEmail] = useState(defaultEmail);
  const [isSent, setIsSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 border border-slate-100 relative text-slate-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {isSent ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Reset Link Sent</h3>
            <p className="text-xs text-slate-500 mb-4">
              We've dispatched password reset instructions to <span className="font-semibold text-slate-700">{resetEmail}</span>.
            </p>
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium text-xs rounded-lg transition"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Reset your password</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter your enterprise email address and we will send you a secure verification link to regain access.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your company email"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-blue-50/80 rounded-lg text-[11px] text-blue-800 border border-blue-100">
                <span className="font-semibold">Demo credentials:</span> admin@enterpriseflow.ai / Admin@Enterprise2026!
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 px-3 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium text-xs rounded-lg transition disabled:opacity-70"
                >
                  {isSubmitting ? 'Sending...' : 'Send Link'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
