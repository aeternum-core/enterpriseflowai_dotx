import React from 'react';
import { AINetworkGraphic } from './AINetworkGraphic';
import { ParticleWaves } from './ParticleWaves';

export const BrandingPanel: React.FC = () => {
  return (
    <div className="w-full lg:w-[58%] xl:w-[60%] h-full flex flex-col justify-between p-6 sm:p-8 lg:p-9 xl:p-11 z-10 relative overflow-hidden bg-gradient-to-b from-[#031548] via-[#041d63] to-[#02123a]">
      
      {/* Brand Header */}
      <div className="relative z-10">
        <div className="flex items-center gap-3">
          {/* Custom Connected Glowing Node Logo */}
          <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10">
            <div className="absolute inset-0 bg-blue-500 rounded-xl blur-sm opacity-60" />
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-400 rounded-xl flex items-center justify-center p-1.5 shadow-md border border-cyan-400/30">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 sm:w-6 sm:h-6 text-white" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="6" cy="6" r="3" fill="#60a5fa" />
                <circle cx="18" cy="8" r="2.5" fill="#38bdf8" />
                <circle cx="12" cy="18" r="3" fill="#818cf8" />
                <path d="M8.5 7.5L15.5 8" stroke="#93c5fd" />
                <path d="M7.5 8.5L10.5 15.5" stroke="#93c5fd" />
                <path d="M16.5 10L13.5 15.5" stroke="#93c5fd" />
              </svg>
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black tracking-tight flex items-center leading-none text-white">
              <span>EnterpriseFlow</span>
              <span className="text-[#2563eb] ml-1.5">AI</span>
            </div>
            <p className="text-xs sm:text-[13px] text-blue-200/90 font-normal tracking-wide mt-1">
              Intelligent Automation. Seamless Enterprise Operations.
            </p>
          </div>
        </div>

        {/* Small horizontal blue accent bar */}
        <div className="w-9 h-1 bg-[#2563eb] rounded-full mt-4 sm:mt-5 mb-3 sm:mb-4" />

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.12] mb-2 text-white">
          One Platform.<br />
          <span className="text-[#258cfb]">
            Multiple Possibilities.
          </span>
        </h1>

        {/* Description */}
        <p className="text-blue-100/80 text-xs sm:text-sm max-w-xl font-normal leading-relaxed line-clamp-3 sm:line-clamp-none">
          AI-powered agents to streamline your enterprise workflows — from onboarding to finance, procurement to customer support — all in one place.
        </p>
      </div>

      {/* Center AI Network Graphic */}
      <div className="relative z-10 my-auto py-2 sm:py-4">
        <AINetworkGraphic />
      </div>

      {/* Bottom Particle Waves */}
      <ParticleWaves />

    </div>
  );
};
