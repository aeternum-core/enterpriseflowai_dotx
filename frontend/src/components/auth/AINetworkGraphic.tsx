import React from 'react';
import { Users, FileText, Headphones, ShoppingCart, ShieldCheck } from 'lucide-react';
import { WorkflowCard } from './WorkflowCard';

export const AINetworkGraphic: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative flex items-center justify-center w-full max-w-[500px] h-[310px] sm:h-[340px] mx-auto select-none ${className}`}>
      
      {/* Background Orbital Rings & Energy Field */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-35">
        <div className="w-[340px] h-[340px] border border-blue-400/25 rounded-full" />
        <div className="absolute w-[250px] h-[250px] border border-cyan-400/25 rounded-full" />
        <div className="absolute w-[160px] h-[160px] border border-indigo-400/30 rounded-full" />
      </div>

      {/* Glowing Curved SVG Connector Lines with illuminated endpoints */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        viewBox="0 0 500 340"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="connGradTop" x1="250" y1="170" x2="250" y2="45" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="connGradLeft" x1="250" y1="170" x2="90" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="connGradRight" x1="250" y1="170" x2="410" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#f472b6" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="connGradBottomLeft" x1="250" y1="170" x2="110" y2="280" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="connGradBottomRight" x1="250" y1="170" x2="390" y2="280" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* 1. Line to Employee Onboarding (Top) */}
        <path d="M250 170 Q250 100 250 62" stroke="url(#connGradTop)" strokeWidth="1.8" strokeDasharray="3 3" />
        <circle cx="250" cy="62" r="3" fill="#818cf8" filter="drop-shadow(0 0 5px #818cf8)" />

        {/* 2. Line to Invoice Processing (Left) */}
        <path d="M250 170 Q160 160 105 125" stroke="url(#connGradLeft)" strokeWidth="1.8" strokeDasharray="3 3" />
        <circle cx="105" cy="125" r="3" fill="#2dd4bf" filter="drop-shadow(0 0 5px #2dd4bf)" />

        {/* 3. Line to Client Request Management (Right) */}
        <path d="M250 170 Q340 160 395 125" stroke="url(#connGradRight)" strokeWidth="1.8" strokeDasharray="3 3" />
        <circle cx="395" cy="125" r="3" fill="#f472b6" filter="drop-shadow(0 0 5px #f472b6)" />

        {/* 4. Line to Procurement & Vendor Onboarding (Bottom Left) */}
        <path d="M250 170 Q180 230 125 270" stroke="url(#connGradBottomLeft)" strokeWidth="1.8" strokeDasharray="3 3" />
        <circle cx="125" cy="270" r="3" fill="#fbbf24" filter="drop-shadow(0 0 5px #fbbf24)" />

        {/* 5. Line to IT Incident Response (Bottom Right) */}
        <path d="M250 170 Q320 230 375 270" stroke="url(#connGradBottomRight)" strokeWidth="1.8" strokeDasharray="3 3" />
        <circle cx="375" cy="270" r="3" fill="#60a5fa" filter="drop-shadow(0 0 5px #60a5fa)" />
      </svg>

      {/* Central AI Network Globe */}
      <div className="relative z-10 flex items-center justify-center" style={{ width: 100, height: 100 }}>
        <svg viewBox="0 0 110 110" width="100" height="100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="ngBgGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#1565FF" stopOpacity="0.55"/>
              <stop offset="60%"  stopColor="#0A2A8C" stopOpacity="0.35"/>
              <stop offset="100%" stopColor="#020D30" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="ngSphereFill" cx="38%" cy="35%" r="60%">
              <stop offset="0%"   stopColor="#3B8FFF" stopOpacity="0.90"/>
              <stop offset="45%"  stopColor="#1040CC" stopOpacity="0.85"/>
              <stop offset="100%" stopColor="#050F35" stopOpacity="0.95"/>
            </radialGradient>
            <radialGradient id="ngSheen" cx="35%" cy="28%" r="40%">
              <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.28"/>
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0"/>
            </radialGradient>
            <filter id="ngNodeGlow" x="-120%" y="-120%" width="340%" height="340%">
              <feGaussianBlur stdDeviation="2.2" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="ngOuterGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="7" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <clipPath id="ngSphereClip">
              <circle cx="55" cy="55" r="36"/>
            </clipPath>
          </defs>

          {/* Outer ambient glow */}
          <circle cx="55" cy="55" r="52" fill="url(#ngBgGlow)"/>

          {/* Pulsing dashed rings */}
          <circle cx="55" cy="55" r="44" stroke="#258BFF" strokeWidth="1" strokeOpacity="0.55"
            strokeDasharray="4 3"
            style={{ animation: 'footerDash1 3s linear infinite', transformOrigin: '55px 55px' }}/>
          <circle cx="55" cy="55" r="50" stroke="#20B9F4" strokeWidth="0.6" strokeOpacity="0.30"
            strokeDasharray="2 5"
            style={{ animation: 'footerDash2 5s linear infinite reverse', transformOrigin: '55px 55px' }}/>

          {/* Sphere body */}
          <circle cx="55" cy="55" r="36" fill="url(#ngSphereFill)" filter="url(#ngOuterGlow)"/>
          <circle cx="55" cy="55" r="36" fill="url(#ngSheen)"/>
          <circle cx="55" cy="55" r="36" stroke="#4CA3FF" strokeWidth="1.2" strokeOpacity="0.7"/>

          {/* Latitude lines */}
          <g clipPath="url(#ngSphereClip)" stroke="#58AAFF" strokeWidth="0.7" strokeOpacity="0.55" fill="none">
            <ellipse cx="55" cy="55" rx="36" ry="10"/>
            <ellipse cx="55" cy="55" rx="36" ry="22"/>
            <ellipse cx="55" cy="44" rx="36" ry="10"/>
            <ellipse cx="55" cy="66" rx="36" ry="10"/>
          </g>

          {/* Longitude / meridian lines */}
          <g clipPath="url(#ngSphereClip)" stroke="#58AAFF" strokeWidth="0.7" strokeOpacity="0.55" fill="none">
            <ellipse cx="55" cy="55" rx="12" ry="36"/>
            <ellipse cx="55" cy="55" rx="24" ry="36"/>
            <ellipse cx="55" cy="55" rx="36" ry="36"/>
          </g>

          {/* Radial spokes + colored nodes */}
          {[
            { angle: -90,  r: 44, nodeR: 3.5, col: '#7547FF' },
            { angle: -20,  r: 44, nodeR: 3,   col: '#E34BA7' },
            { angle:  50,  r: 44, nodeR: 3.5, col: '#20B9F4' },
            { angle: 130,  r: 44, nodeR: 3,   col: '#FF991F' },
            { angle: 200,  r: 44, nodeR: 3,   col: '#1769FF' },
            { angle: 270,  r: 44, nodeR: 3.5, col: '#258BFF' },
          ].map(({ angle, r, nodeR, col }) => {
            const rad = (angle * Math.PI) / 180;
            const x2 = 55 + r * Math.cos(rad);
            const y2 = 55 + r * Math.sin(rad);
            const x1 = 55 + 36 * Math.cos(rad);
            const y1 = 55 + 36 * Math.sin(rad);
            return (
              <g key={angle}>
                <line x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={col} strokeWidth="1" strokeOpacity="0.75" strokeDasharray="2 2"/>
                <circle cx={x2} cy={y2} r={nodeR} fill={col} filter="url(#ngNodeGlow)"/>
                <circle cx={x2} cy={y2} r={nodeR + 2.5} fill={col} fillOpacity="0.18"/>
              </g>
            );
          })}

          {/* AI label */}
          <text x="55" y="62" textAnchor="middle" fontSize="20" fontWeight="900"
            letterSpacing="2" fill="white"
            style={{ filter: 'drop-shadow(0 0 8px rgba(100,180,255,0.9))' }}>AI</text>
        </svg>
      </div>

      {/* 1. Employee Onboarding (Top) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
        <WorkflowCard
          theme="purple"
          icon={Users}
          lines={['Employee', 'Onboarding']}
          className="w-36 sm:w-40"
        />
      </div>

      {/* 2. Invoice Processing (Left) */}
      <div className="absolute left-0 top-[26%] z-20">
        <WorkflowCard
          theme="cyan"
          icon={FileText}
          lines={['Invoice', 'Processing']}
          className="w-32 sm:w-36"
        />
      </div>

      {/* 3. Client Request Management (Right) */}
      <div className="absolute right-0 top-[26%] z-20">
        <WorkflowCard
          theme="pink"
          icon={Headphones}
          lines={['Client Request', 'Management']}
          className="w-36 sm:w-40"
        />
      </div>

      {/* 4. Procurement & Vendor Onboarding (Bottom Left) */}
      <div className="absolute bottom-0 left-1 sm:left-3 z-20">
        <WorkflowCard
          theme="orange"
          icon={ShoppingCart}
          lines={['Procurement &', 'Vendor Onboarding']}
          className="w-36 sm:w-40"
        />
      </div>

      {/* 5. IT Incident Response & Access Governance (Bottom Right) */}
      <div className="absolute bottom-0 right-1 sm:right-3 z-20">
        <WorkflowCard
          theme="blue"
          icon={ShieldCheck}
          lines={['IT Incident Response', '& Access Governance']}
          className="w-36 sm:w-40"
        />
      </div>

    </div>
  );
};
