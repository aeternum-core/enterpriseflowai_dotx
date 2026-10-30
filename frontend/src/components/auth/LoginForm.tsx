import React, { useState } from 'react';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';
import { PasswordInput } from './PasswordInput';
import { MicrosoftLoginButton } from './MicrosoftLoginButton';
import { ForgotPasswordModal } from './ForgotPasswordModal';

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  onMicrosoftLogin: () => Promise<void>;
  defaultEmail?: string;
  defaultPassword?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onLogin,
  onMicrosoftLogin,
  defaultEmail = 'admin@enterpriseflow.ai',
  defaultPassword = 'Admin@Enterprise2026!'
}) => {
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState(defaultPassword);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isMicrosoftLoading, setIsMicrosoftLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic email validation
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid enterprise email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const success = await onLogin(email, password);
      if (!success) {
        setErrorMessage('Invalid credentials. You may use admin@enterpriseflow.ai to log in.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred during authentication. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicrosoftClick = async () => {
    setErrorMessage(null);
    setIsMicrosoftLoading(true);
    try {
      await onMicrosoftLogin();
    } catch {
      setErrorMessage('Microsoft SSO failed. Please try standard sign-in.');
    } finally {
      setIsMicrosoftLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[410px] bg-white text-slate-900 rounded-[28px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] p-7 sm:p-8 border border-slate-100 relative">
      
      {/* Header */}
      <div className="mb-5">
        <p className="text-slate-600 text-sm font-normal">Welcome to</p>
        <h2 className="text-3xl font-extrabold tracking-tight text-[#0a1128] flex items-center leading-tight mt-0.5">
          <span>EnterpriseFlow</span>
          <span className="text-[#1a73e8] ml-1.5 font-black">AI</span>
        </h2>
        <p className="text-slate-500 text-xs sm:text-[13px] mt-1 font-normal">
          Sign in to access your workspace
        </p>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-4 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-in fade-in duration-200"
        >
          {errorMessage}
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Address */}
        <div>
          <label htmlFor="company-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Email address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="company-email"
              type="email"
              required
              disabled={isLoading || isMicrosoftLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your company email"
              className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs sm:text-[13px] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent transition disabled:opacity-60"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="user-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Password
          </label>
          <PasswordInput
            id="user-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading || isMicrosoftLoading}
            placeholder="Enter your password"
          />
        </div>

        {/* Remember me & Forgot Password */}
        <div className="flex items-center justify-between text-xs pt-0.5">
          <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none text-xs">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading || isMicrosoftLoading}
              className="w-4 h-4 text-[#1a73e8] rounded border-slate-300 focus:ring-[#1a73e8] cursor-pointer"
            />
            <span>Remember me</span>
          </label>
          <button
            type="button"
            onClick={() => setIsForgotModalOpen(true)}
            className="text-[#1a73e8] hover:text-blue-700 font-medium text-xs transition cursor-pointer"
          >
            Forgot password?
          </button>
        </div>

        {/* Primary Blue Sign In Button */}
        <button
          type="submit"
          disabled={isLoading || isMicrosoftLoading}
          className="w-full py-3 px-4 bg-gradient-to-r from-[#1a73e8] to-[#1557b0] hover:from-[#1868f0] hover:to-[#124ca0] active:from-[#144ea3] active:to-[#0f3d82] text-white font-medium rounded-lg text-sm shadow-sm flex items-center justify-center gap-2 transition duration-200 disabled:opacity-70 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Horizontal Divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-slate-400 font-normal">or</span>
        </div>
      </div>

      {/* Microsoft SSO */}
      <MicrosoftLoginButton
        onClick={handleMicrosoftClick}
        disabled={isLoading || isMicrosoftLoading}
        isLoading={isMicrosoftLoading}
      />

      {/* Footer Security Badge */}
      <div className="mt-5 pt-3 border-t border-slate-100 text-center">
        <p className="text-[11px] text-slate-400 font-normal tracking-wide">
          Secure • Role-based Access • Enterprise Ready
        </p>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        defaultEmail={email}
      />

    </div>
  );
};
