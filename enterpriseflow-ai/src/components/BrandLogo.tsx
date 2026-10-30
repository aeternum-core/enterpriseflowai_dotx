import React from 'react';

interface BrandLogoProps {
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center gap-3.5 select-none ${className}`}>
      {/* Logo mark — dark rounded square with chained nodes */}
      <div className="relative flex-shrink-0 w-11 h-11 rounded-[14px] overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0D1B3E 0%, #0A1535 100%)' }}
      >
        <svg
          viewBox="0 0 44 44"
          width="44"
          height="44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logoGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7C6EF5" />
              <stop offset="100%" stopColor="#5B55E8" />
            </linearGradient>
            <linearGradient id="logoGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4D8EF8" />
              <stop offset="100%" stopColor="#3574E8" />
            </linearGradient>
            <linearGradient id="logoGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60A8FF" />
              <stop offset="100%" stopColor="#4590F0" />
            </linearGradient>
            {/* Connector pill gradients */}
            <linearGradient id="connGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6A62F0" />
              <stop offset="100%" stopColor="#4D8EF8" />
            </linearGradient>
            <linearGradient id="connGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4D8EF8" />
              <stop offset="100%" stopColor="#5BC0FA" />
            </linearGradient>
          </defs>

          {/* Top-left large node (purple/indigo) */}
          <circle cx="14" cy="15" r="6.5" fill="url(#logoGrad1)" />

          {/* Thick rounded connector from top-left to middle */}
          <rect
            x="18" y="19"
            width="10" height="5"
            rx="2.5"
            transform="rotate(-38 18 19)"
            fill="url(#connGrad1)"
          />

          {/* Middle node (medium blue) */}
          <circle cx="24" cy="22" r="5" fill="url(#logoGrad2)" />

          {/* Thick rounded connector from middle to bottom-right */}
          <rect
            x="26" y="24"
            width="10" height="5"
            rx="2.5"
            transform="rotate(35 26 24)"
            fill="url(#connGrad2)"
          />

          {/* Bottom-right node (cyan blue) */}
          <circle cx="32" cy="30" r="6" fill="url(#logoGrad3)" />
        </svg>
      </div>

      <div>
        {/* Brand name */}
        <div
          className="font-black leading-none tracking-[-0.025em] text-white flex items-baseline"
          style={{ fontSize: 'clamp(22px, 2.2vw, 34px)', fontFamily: 'Inter, sans-serif' }}
        >
          <span>EnterpriseFlow</span>
          <span className="ml-2 font-black" style={{ color: '#4D9FFF' }}>AI</span>
        </div>

        {/* Tagline */}
        <p
          className="text-[#8FA6C8] font-normal tracking-[0.01em] mt-1"
          style={{ fontSize: 'clamp(11px, 0.9vw, 13px)', fontFamily: 'Inter, sans-serif' }}
        >
          Intelligent Automation. Seamless Enterprise Operations.
        </p>
      </div>
    </div>
  );
};
