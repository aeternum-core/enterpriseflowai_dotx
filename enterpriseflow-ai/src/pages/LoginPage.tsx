import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { HeroSection } from '../components/HeroSection';
import { LoginCard } from '../components/LoginCard';
import '../styles/login.css';

interface LoginPageProps {
  onSuccessNavigate?: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccessNavigate }) => {
  const { login, quickLogin, getDashboardPath } = useAuth();

  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    const success = await login(email, password);
    if (success && onSuccessNavigate) {
      let role: UserRole = 'ADMIN';
      if (email.includes('employee')) role = 'EMPLOYEE_MANAGER';
      else if (email.includes('hr')) role = 'HR_MANAGER';
      else if (email.includes('service')) role = 'SERVICE_MANAGER';
      else if (email.includes('client')) role = 'CLIENT_MANAGER';
      else if (email.includes('finance')) role = 'FINANCE_MANAGER';
      onSuccessNavigate(getDashboardPath(role));
      return true;
    }
    return success;
  };

  const handleQuickRoleLogin = async (role: UserRole): Promise<void> => {
    const ok = await quickLogin(role);
    if (ok && onSuccessNavigate) {
      onSuccessNavigate(getDashboardPath(role));
    }
  };

  return (
    <div className="h-screen max-h-screen w-full relative bg-[#031B46] text-white selection:bg-[#258BFF] selection:text-white overflow-hidden font-sans">
      
      {/* ================= LAYER 1: ARCHITECTURAL CORPORATE BUILDING (RIGHT SECTION) ================= */}
      <div 
        className="hidden lg:block absolute right-0 top-0 bottom-0 w-[58%] xl:w-[54%] pointer-events-none z-0"
        style={{
          backgroundImage: `url('/assets/corporate_building.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center right',
        }}
      >
        {/* Wide smooth horizontal gradient blend on the left edge - perfectly blends into deep blue */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#031B46] via-[#031B46]/75 via-30% to-transparent pointer-events-none" />
        
        {/* Soft atmospheric daylight overhead glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-slate-900/10 pointer-events-none" />
      </div>

      {/* ================= LAYER 2: LUMINOUS CURVED BLUE SWOOSH / ENERGY FLOW ================= */}
      <div className="hidden lg:block absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <svg
          className="w-full h-full opacity-65"
          viewBox="0 0 1600 1000"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          {/* Sweeping organic blue wave curving from behind the AI hub up toward the top right behind the card */}
          <path
            d="M -100 1050 C 350 780, 650 920, 980 620 C 1220 400, 1420 250, 1700 150 L 1700 1050 Z"
            fill="url(#curvedWaveGrad)"
          />

          <defs>
            <linearGradient id="curvedWaveGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#041a54" stopOpacity="0.95" />
              <stop offset="40%" stopColor="#092975" stopOpacity="0.85" />
              <stop offset="70%" stopColor="#1750bf" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#258BFF" stopOpacity="0.0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ================= LAYER 3: FOREGROUND TWO-COLUMN CONTENT ================= */}
      <div className="relative z-10 w-full h-full flex flex-col lg:flex-row">
        
        {/* Left Section – Branding & AI Workflow Diagram */}
        <HeroSection />

        {/* Right Section – Login Card & Tagline */}
        <div className="w-full lg:w-[46%] xl:w-[45%] h-full relative flex items-center justify-center p-4 sm:p-6 lg:p-8">
          
          {/* Top Right Tagline */}
          <div className="absolute top-5 right-8 hidden lg:flex flex-col items-end z-20 pointer-events-none">
            <span className="text-[13px] font-medium tracking-wide text-slate-800 drop-shadow-[0_1px_1px_rgba(255,255,255,0.85)]">
              Smarter People. Smarter Operations.
            </span>
            <div className="w-10 h-0.5 bg-[#258BFF] rounded mt-1.5 shadow-sm" />
          </div>

          {/* White Login Card (Centered & Smoothly Elevated over the blended background) */}
          <div className="relative z-10 w-full flex justify-center py-6 lg:py-0">
            <LoginCard
              onLogin={handleLogin}
              onQuickRoleLogin={handleQuickRoleLogin}
            />
          </div>

        </div>

      </div>

      {/* ═══════════ FULL-WIDTH FOOTER WAVE (spans entire page) ═══════════ */}
      <div className="pointer-events-none overflow-hidden absolute inset-x-0 bottom-0 h-36 z-20">
        <svg
          className="w-full h-full"
          viewBox="0 0 1600 144"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            <filter id="wfp1" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="wfp2" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4.5" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* Wave 1 – electric blue */}
          <path
            d="M0 115 C180 72, 420 140, 680 92 C900 52, 1100 130, 1350 82 C1460 65, 1540 88, 1600 84"
            stroke="#258BFF"
            strokeWidth="2.2"
            strokeDasharray="7 7"
            strokeLinecap="round"
            opacity="0.75"
            style={{ animation: 'footerDash1 2.4s linear infinite' }}
          />

          {/* Wave 2 – cyan */}
          <path
            d="M0 88 C220 130, 480 58, 760 108 C980 145, 1200 62, 1450 98 C1530 108, 1575 100, 1600 98"
            stroke="#20B9F4"
            strokeWidth="1.8"
            strokeDasharray="5 7"
            strokeLinecap="round"
            opacity="0.60"
            style={{ animation: 'footerDash2 3s linear infinite' }}
          />

          {/* Wave 3 – purple */}
          <path
            d="M0 132 C300 98, 560 140, 840 75 C1050 28, 1280 112, 1600 122"
            stroke="#7547FF"
            strokeWidth="1.6"
            strokeDasharray="4 7"
            strokeLinecap="round"
            opacity="0.50"
            style={{ animation: 'footerDash3 3.6s linear infinite' }}
          />

          {/* Wave 4 – pink accent */}
          <path
            d="M0 102 C380 62, 700 132, 1000 70 C1200 30, 1420 108, 1600 94"
            stroke="#E34BA7"
            strokeWidth="1.2"
            strokeDasharray="3 9"
            strokeLinecap="round"
            opacity="0.35"
            style={{ animation: 'footerDash1 4.2s linear infinite reverse' }}
          />

          {/* 8 evenly-spaced glowing nodes across full width */}
          <circle cx="160"  cy="105" r="3.5" fill="#20B9F4" filter="url(#wfp1)" opacity="0.9" />
          <circle cx="380"  cy="128" r="3"   fill="#258BFF" filter="url(#wfp1)" opacity="0.9" />
          <circle cx="620"  cy="88"  r="4"   fill="#7547FF" filter="url(#wfp2)" opacity="0.9" />
          <circle cx="840"  cy="118" r="3"   fill="#20B9F4" filter="url(#wfp1)" opacity="0.9" />
          <circle cx="1060" cy="78"  r="3.5" fill="#E34BA7" filter="url(#wfp1)" opacity="0.9" />
          <circle cx="1280" cy="110" r="3"   fill="#FF991F" filter="url(#wfp1)" opacity="0.9" />
          <circle cx="1460" cy="82"  r="3.5" fill="#258BFF" filter="url(#wfp1)" opacity="0.9" />

          {/* Halo glow rings on key nodes */}
          <circle cx="160"  cy="105" r="8"  fill="#20B9F4" opacity="0.12" />
          <circle cx="620"  cy="88"  r="10" fill="#7547FF" opacity="0.10" />
          <circle cx="1060" cy="78"  r="8"  fill="#E34BA7" opacity="0.12" />
          <circle cx="1460" cy="82"  r="8"  fill="#258BFF" opacity="0.12" />
        </svg>


      </div>

    </div>
  );
};
