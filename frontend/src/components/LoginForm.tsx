import React, { useState } from 'react';
import { Mail, ArrowRight, Loader2, ShieldCheck, Users, FileText, Headphones, UserPlus, MessageSquare } from 'lucide-react';
import { UserRole } from '../types';
import { PasswordInput } from './PasswordInput';
import { ForgotPassword } from './ForgotPassword';

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  onQuickRoleLogin: (role: UserRole) => Promise<void>;
  defaultEmail?: string;
  defaultPassword?: string;
}

interface RoleShortcut {
  role: UserRole;
  title: string;
  subtitle: string;
  email: string;
  icon: React.ElementType;
  themeColor: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
}

const roleShortcuts: RoleShortcut[] = [
  {
    role: 'ADMIN',
    title: 'Admin',
    subtitle: 'All 5 Workflows & IT',
    email: 'admin@enterpriseflow.ai',
    icon: ShieldCheck,
    themeColor: '#258BFF',
    borderColor: 'border-blue-200 hover:border-blue-400',
    bgColor: 'bg-blue-50/50 hover:bg-blue-50',
    textColor: 'text-blue-700'
  },
  {
    role: 'HR_MANAGER',
    title: 'HR Manager',
    subtitle: 'Employee Onboarding',
    email: 'hr.manager@enterpriseflow.ai',
    icon: UserPlus,
    themeColor: '#7547FF',
    borderColor: 'border-purple-200 hover:border-purple-400',
    bgColor: 'bg-purple-50/50 hover:bg-purple-50',
    textColor: 'text-purple-700'
  },
  {
    role: 'EMPLOYEE_MANAGER',
    title: 'Employee Manager',
    subtitle: 'Employee Request Management',
    email: 'employee.manager@enterpriseflow.ai',
    icon: Users,
    themeColor: '#4F46E5',
    borderColor: 'border-indigo-200 hover:border-indigo-400',
    bgColor: 'bg-indigo-50/50 hover:bg-indigo-50',
    textColor: 'text-indigo-700'
  },
  {
    role: 'SERVICE_MANAGER',
    title: 'Service Manager',
    subtitle: 'Customer Request Manager',
    email: 'service.manager@enterpriseflow.ai',
    icon: Headphones,
    themeColor: '#E34BA7',
    borderColor: 'border-pink-200 hover:border-pink-400',
    bgColor: 'bg-pink-50/50 hover:bg-pink-50',
    textColor: 'text-pink-700'
  },
  {
    role: 'FINANCE_MANAGER',
    title: 'Finance Manager',
    subtitle: 'Invoice Processing',
    email: 'finance.manager@enterpriseflow.ai',
    icon: FileText,
    themeColor: '#20B9F4',
    borderColor: 'border-teal-200 hover:border-teal-400',
    bgColor: 'bg-teal-50/50 hover:bg-teal-50',
    textColor: 'text-teal-700'
  },
  {
    role: 'CLIENT_MANAGER',
    title: 'Client Manager',
    subtitle: 'Customer Success & SLA',
    email: 'client.manager@enterpriseflow.ai',
    icon: MessageSquare,
    themeColor: '#F43F5E',
    borderColor: 'border-rose-200 hover:border-rose-400',
    bgColor: 'bg-rose-50/50 hover:bg-rose-50',
    textColor: 'text-rose-700'
  }
];

export const LoginForm: React.FC<LoginFormProps> = ({
  onLogin,
  onQuickRoleLogin,
  defaultEmail = '',
  defaultPassword = ''
}) => {
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState(defaultPassword);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeRoleLoading, setActiveRoleLoading] = useState<UserRole | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // If blank, allow demo login with admin
    const targetEmail = email.trim() || 'admin@enterpriseflow.ai';
    const targetPassword = password || 'Admin@Enterprise2026!';

    if (email.trim() && !email.includes('@')) {
      setErrorMessage('Please enter a valid enterprise email address.');
      return;
    }

    setIsLoading(true);
    try {
      const success = await onLogin(targetEmail, targetPassword);
      if (!success) {
        setErrorMessage('Invalid credentials. You may use any of the 1-click role shortcuts below.');
      }
    } catch {
      setErrorMessage('Authentication service error. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShortcutClick = async (shortcut: RoleShortcut) => {
    setErrorMessage(null);
    setEmail(shortcut.email);
    setPassword('Enterprise2026!');
    setActiveRoleLoading(shortcut.role);
    try {
      await onQuickRoleLogin(shortcut.role);
    } catch {
      setErrorMessage(`Failed to login as ${shortcut.title}.`);
    } finally {
      setActiveRoleLoading(null);
    }
  };

  return (
    <div className="w-full">
      {errorMessage && (
        <div
          role="alert"
          className="mb-3.5 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-in fade-in duration-200"
        >
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5">
        {/* Email Address */}
        <div>
          <label htmlFor="company-email" className="block text-xs font-semibold text-slate-700 mb-1">
            Email address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="company-email"
              type="email"
              disabled={isLoading || activeRoleLoading !== null}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your company email"
              className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs sm:text-[13px] text-[#071735] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#258BFF] focus:border-transparent transition-all duration-200 disabled:opacity-60"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="user-password" className="block text-xs font-semibold text-slate-700 mb-1">
            Password
          </label>
          <PasswordInput
            id="user-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading || activeRoleLoading !== null}
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
              disabled={isLoading || activeRoleLoading !== null}
              className="w-4 h-4 text-[#258BFF] rounded border-slate-300 focus:ring-[#258BFF] cursor-pointer"
            />
            <span>Remember me</span>
          </label>
          <button
            type="button"
            onClick={() => setIsForgotModalOpen(true)}
            className="text-[#1769FF] hover:text-[#064CEB] font-medium text-xs transition cursor-pointer"
          >
            Forgot password?
          </button>
        </div>

        {/* Primary Blue Gradient Sign In Button */}
        <button
          type="submit"
          disabled={isLoading || activeRoleLoading !== null}
          className="w-full py-2.5 sm:py-3 px-4 bg-gradient-to-r from-[#258BFF] via-[#1769FF] to-[#064CEB] hover:from-[#1E78FF] hover:to-[#0540C9] active:from-[#155FD6] active:to-[#0433A3] text-white font-semibold rounded-lg text-xs sm:text-sm shadow-[0_4px_14px_rgba(37,139,255,0.32)] hover:shadow-[0_6px_18px_rgba(37,139,255,0.45)] flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-70 cursor-pointer"
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

      {/* 1-Click Role Access Shortcuts Header */}
      <div className="relative my-2 sm:my-2.5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
          <span className="bg-white px-3 text-slate-400 flex items-center gap-1.5">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-[#258BFF]">
              <path d="M5 0L6.12 3.38H9.51L6.94 5.47L8.06 8.85L5 6.76L1.94 8.85L3.06 5.47L0.49 3.38H3.88L5 0Z" fill="currentColor"/>
            </svg>
            1-Click Role Shortcuts
          </span>
        </div>
      </div>

      {/* Role Shortcuts Grid (Admin, HR Manager, Employee Manager, Service Manager, Finance Manager, Client Manager) */}
      <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-xs">
        {roleShortcuts.map((shortcut) => {
          const Icon = shortcut.icon;
          const isThisLoading = activeRoleLoading === shortcut.role;

          return (
            <button
              key={shortcut.role}
              type="button"
              disabled={isLoading || activeRoleLoading !== null}
              onClick={() => handleShortcutClick(shortcut)}
              className={`p-1.5 sm:p-2 rounded-xl border text-left transition-all duration-200 flex items-start gap-1.5 sm:gap-2 cursor-pointer shadow-xs ${shortcut.borderColor} ${shortcut.bgColor} disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              <div
                className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: `${shortcut.themeColor}18` }}
              >
                {isThisLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-700" />
                ) : (
                  <Icon className="w-3.5 h-3.5" style={{ color: shortcut.themeColor }} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className={`font-semibold text-xs leading-tight truncate ${shortcut.textColor}`}>
                  {shortcut.title}
                </div>
                <div className="text-[9px] sm:text-[9.5px] text-slate-500 truncate mt-0.5 leading-tight tracking-tight" title={shortcut.subtitle}>
                  {shortcut.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Security Badge — enhanced */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        {/* Security pills row */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {[
            { label: 'SSL Secured', color: '#10B981', icon: '🔒' },
            { label: 'Role-based', color: '#258BFF', icon: '🛡️' },
            { label: 'Enterprise', color: '#7547FF', icon: '⚡' },
          ].map(({ label, color, icon }) => (
            <div
              key={label}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-semibold tracking-wide"
              style={{ borderColor: `${color}40`, color, backgroundColor: `${color}0d` }}
            >
              <span className="text-[9px]">{icon}</span>
              {label}
            </div>
          ))}
        </div>
        {/* Version + copyright */}
        <p className="mt-2 text-center text-[9px] text-slate-300 font-normal tracking-wide">
          EnterpriseFlow AI v2.0 &nbsp;&bull;&nbsp; © 2026 All rights reserved
        </p>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPassword
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        defaultEmail={email}
      />
    </div>
  );
};
