import React from 'react';
import { Users, FileText, Headphones, ShieldCheck, UserCircle } from 'lucide-react';
import { WorkflowCard } from './WorkflowCard';

interface WorkflowVisualizationProps {
  className?: string;
}

export const WorkflowVisualization: React.FC<WorkflowVisualizationProps> = ({ className = '' }) => {
  return (
    <div className={`relative flex items-center justify-center w-full max-w-[520px] h-[340px] sm:h-[370px] mx-auto select-none ${className}`}>
      
      {/* Background Orbital Neon Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
        <div className="w-[360px] h-[360px] border border-[#258BFF]/20 rounded-full" />
        <div className="absolute w-[260px] h-[260px] border border-[#20B9F4]/20 rounded-full" />
        <div className="absolute w-[170px] h-[170px] border border-[#7547FF]/25 rounded-full" />
      </div>

      {/* SVG Glowing Curved Connecting Lines — precisely aligned to card anchors */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        viewBox="0 0 520 370"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Glow filter for endpoints */}
          <filter id="glow-purple" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="glow-cyan" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="glow-pink" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="glow-orange" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="glow-blue" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>

          <linearGradient id="glowTop" x1="260" y1="185" x2="260" y2="52" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#258BFF" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#7547FF" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="glowLeft" x1="260" y1="185" x2="100" y2="128" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#258BFF" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#20B9F4" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="glowRight" x1="260" y1="185" x2="420" y2="128" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#258BFF" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#E34BA7" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="glowBottomLeft" x1="260" y1="185" x2="118" y2="300" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#258BFF" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#E34BA7" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="glowBottomRight" x1="260" y1="185" x2="402" y2="300" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#258BFF" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#1769FF" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* 1. Center → Employee Onboarding (Top center: card is at top-1/2 transform, anchor ~260,52) */}
        <path
          d="M260 175 C260 145 260 105 260 52"
          stroke="url(#glowTop)"
          strokeWidth="2"
          strokeDasharray="5 5"
          strokeLinecap="round"
          style={{ animation: 'flowDash 1.4s linear infinite' }}
        />
        <circle cx="260" cy="52" r="4" fill="#7547FF" filter="url(#glow-purple)" />
        <circle cx="260" cy="52" r="7" fill="#7547FF" fillOpacity="0.2" />

        {/* 2. Center → Invoice Processing (Left: card left-0 top-[26%] ~100,128) */}
        <path
          d="M248 178 C200 170 148 152 100 128"
          stroke="url(#glowLeft)"
          strokeWidth="2"
          strokeDasharray="5 5"
          strokeLinecap="round"
          style={{ animation: 'flowDash 1.4s linear infinite 0.28s' }}
        />
        <circle cx="100" cy="128" r="4" fill="#20B9F4" filter="url(#glow-cyan)" />
        <circle cx="100" cy="128" r="7" fill="#20B9F4" fillOpacity="0.2" />

        {/* 3. Center → Customer Request Resolution (Right: card right-0 top-[26%] ~420,128) */}
        <path
          d="M272 178 C320 170 372 152 420 128"
          stroke="url(#glowRight)"
          strokeWidth="2"
          strokeDasharray="5 5"
          strokeLinecap="round"
          style={{ animation: 'flowDash 1.4s linear infinite 0.56s' }}
        />
        <circle cx="420" cy="128" r="4" fill="#E34BA7" filter="url(#glow-pink)" />
        <circle cx="420" cy="128" r="7" fill="#E34BA7" fillOpacity="0.2" />

        {/* 4. Center → Procurement & Vendor Onboarding (Bottom left: left-3 bottom-0 ~118,300) */}
        <path
          d="M248 196 C210 232 160 268 118 300"
          stroke="url(#glowBottomLeft)"
          strokeWidth="2"
          strokeDasharray="5 5"
          strokeLinecap="round"
          style={{ animation: 'flowDash 1.4s linear infinite 0.84s' }}
        />
        <circle cx="118" cy="300" r="4" fill="#E34BA7" filter="url(#glow-pink)" />
        <circle cx="118" cy="300" r="7" fill="#E34BA7" fillOpacity="0.2" />

        {/* 5. Center → IT Incident Response (Bottom right: right-3 bottom-0 ~402,300) */}
        <path
          d="M272 196 C310 232 360 268 402 300"
          stroke="url(#glowBottomRight)"
          strokeWidth="2"
          strokeDasharray="5 5"
          strokeLinecap="round"
          style={{ animation: 'flowDash 1.4s linear infinite 1.12s' }}
        />
        <circle cx="402" cy="300" r="4" fill="#1769FF" filter="url(#glow-blue)" />
        <circle cx="402" cy="300" r="7" fill="#1769FF" fillOpacity="0.2" />
      </svg>

      {/* Central AI Network Globe – SVG-based glowing sphere */}
      <div className="relative z-10 flex items-center justify-center" style={{ width: 110, height: 110 }}>
        <svg viewBox="0 0 110 110" width="110" height="110" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Outer deep-blue glow */}
            <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1565FF" stopOpacity="0.55"/>
              <stop offset="60%" stopColor="#0A2A8C" stopOpacity="0.35"/>
              <stop offset="100%" stopColor="#020D30" stopOpacity="0"/>
            </radialGradient>
            {/* Inner sphere fill */}
            <radialGradient id="sphereFill" cx="38%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#3B8FFF" stopOpacity="0.90"/>
              <stop offset="45%" stopColor="#1040CC" stopOpacity="0.85"/>
              <stop offset="100%" stopColor="#050F35" stopOpacity="0.95"/>
            </radialGradient>
            {/* Highlight sheen */}
            <radialGradient id="sheen" cx="35%" cy="28%" r="40%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.28"/>
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0"/>
            </radialGradient>
            <filter id="nodeGlow" x="-120%" y="-120%" width="340%" height="340%">
              <feGaussianBlur stdDeviation="2.2" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="outerGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="7" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <clipPath id="sphereClip">
              <circle cx="55" cy="55" r="36"/>
            </clipPath>
          </defs>

          {/* Outer ambient glow disk */}
          <circle cx="55" cy="55" r="52" fill="url(#bgGlow)"/>

          {/* Pulsing outer ring (animated) */}
          <circle cx="55" cy="55" r="44" stroke="#258BFF" strokeWidth="1" strokeOpacity="0.55"
            strokeDasharray="4 3"
            style={{ animation: 'footerDash1 3s linear infinite', transformOrigin: '55px 55px' }}/>
          <circle cx="55" cy="55" r="50" stroke="#20B9F4" strokeWidth="0.6" strokeOpacity="0.30"
            strokeDasharray="2 5"
            style={{ animation: 'footerDash2 5s linear infinite reverse', transformOrigin: '55px 55px' }}/>

          {/* Main sphere body */}
          <circle cx="55" cy="55" r="36" fill="url(#sphereFill)" filter="url(#outerGlow)"/>
          <circle cx="55" cy="55" r="36" fill="url(#sheen)"/>
          <circle cx="55" cy="55" r="36" stroke="#4CA3FF" strokeWidth="1.2" strokeOpacity="0.7"/>

          {/* Latitude lines (clipped to sphere) */}
          <g clipPath="url(#sphereClip)" stroke="#58AAFF" strokeWidth="0.7" strokeOpacity="0.55" fill="none">
            <ellipse cx="55" cy="55" rx="36" ry="10"/>
            <ellipse cx="55" cy="55" rx="36" ry="22"/>
            <ellipse cx="55" cy="44" rx="36" ry="10"/>
            <ellipse cx="55" cy="66" rx="36" ry="10"/>
          </g>

          {/* Longitude / meridian lines (clipped) */}
          <g clipPath="url(#sphereClip)" stroke="#58AAFF" strokeWidth="0.7" strokeOpacity="0.55" fill="none">
            <ellipse cx="55" cy="55" rx="12" ry="36"/>
            <ellipse cx="55" cy="55" rx="24" ry="36"/>
            <ellipse cx="55" cy="55" rx="36" ry="36"/>
          </g>

          {/* Radial outer spokes to network nodes */}
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
                  stroke={col} strokeWidth="1" strokeOpacity="0.75"
                  strokeDasharray="2 2"/>
                <circle cx={x2} cy={y2} r={nodeR} fill={col} filter="url(#nodeGlow)"/>
                <circle cx={x2} cy={y2} r={nodeR + 2.5} fill={col} fillOpacity="0.18"/>
              </g>
            );
          })}

          {/* "AI" label */}
          <text
            x="55" y="62"
            textAnchor="middle"
            fontSize="20"
            fontWeight="900"
            letterSpacing="2"
            fill="white"
            style={{ filter: 'drop-shadow(0 0 8px rgba(100,180,255,0.9))' }}
          >AI</text>
        </svg>
      </div>

      {/* 1. Employee Request Management (Top) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
        <WorkflowCard
          theme="purple"
          icon={Users}
          lines={['Employee Request', 'Management']}
          className="w-38 sm:w-42"
        />
      </div>

      {/* 2. Invoice Processing (Left) */}
      <div className="absolute left-0 top-[26%] z-20">
        <WorkflowCard
          theme="cyan"
          icon={FileText}
          lines={['Invoice', 'Processing']}
          className="w-34 sm:w-38"
        />
      </div>

      {/* 3. Customer Request Management (Right) */}
      <div className="absolute right-0 top-[26%] z-20">
        <WorkflowCard
          theme="pink"
          icon={Headphones}
          lines={['Customer Request', 'Management']}
          className="w-38 sm:w-42"
        />
      </div>

      {/* 4. Service Manager (Bottom Left) */}
      <div className="absolute bottom-0 left-1 sm:left-3 z-20">
        <WorkflowCard
          theme="pink"
          icon={UserCircle}
          lines={['Service', 'Manager']}
          className="w-38 sm:w-42"
        />
      </div>

      {/* 5. IT Incident Response & Access Governance (Bottom Right) */}
      <div className="absolute bottom-0 right-1 sm:right-3 z-20">
        <WorkflowCard
          theme="blue"
          icon={ShieldCheck}
          lines={['IT Incident Response', '& Access Governance']}
          className="w-38 sm:w-42"
        />
      </div>

    </div>
  );
};
