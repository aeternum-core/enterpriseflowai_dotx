import React from 'react';
import { BrandLogo } from './BrandLogo';
import { WorkflowVisualization } from './WorkflowVisualization';

export const HeroSection: React.FC = () => {
  return (
    <div className="w-full lg:w-[54%] xl:w-[55%] h-full flex flex-col justify-between p-6 sm:p-8 lg:p-9 xl:p-11 z-10 relative overflow-hidden text-white">
      
      {/* Top Branding & Main Headlines */}
      <div className="relative z-10">
        {/* Premium Enterprise Badge Row */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <BrandLogo />
          {/* Enterprise badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-[#258BFF]/30 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-[10px] font-semibold tracking-widest text-[#A5B4FC] uppercase">Enterprise Platform</span>
          </div>
        </div>

        {/* Accent bar + headline */}
        <div className="flex items-center gap-4 mb-4 sm:mb-5">
          <div className="w-1.5 h-14 bg-gradient-to-b from-[#258BFF] to-[#7547FF] rounded-full flex-shrink-0" />
          <div>
            <h1
              className="font-black tracking-[-0.04em] leading-[1.08] text-white"
              style={{ fontSize: 'clamp(36px, 4.5vw, 60px)', fontFamily: 'Inter, sans-serif' }}
            >
              One Platform.<br />
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(90deg, #258BFF 0%, #20C9FF 50%, #20B9F4 100%)' }}
              >
                Multiple Possibilities.
              </span>
            </h1>
          </div>
        </div>

        {/* Description */}
        <p
          className="text-[#B8C8E8] leading-[1.75] max-w-xl font-normal"
          style={{ fontSize: 'clamp(13px, 1.1vw, 15px)', fontFamily: 'Inter, sans-serif' }}
        >
          AI-powered agents to streamline your enterprise workflows — from onboarding to finance, procurement to customer support — all in one place.
        </p>

      </div>

      {/* Middle AI Workflow Visualization Diagram */}
      <div className="relative z-10 my-auto py-2 sm:py-3">
        <WorkflowVisualization />
      </div>



    </div>
  );
};
