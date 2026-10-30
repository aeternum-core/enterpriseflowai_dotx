import React from 'react';

export const ParticleWaves: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`pointer-events-none overflow-hidden absolute inset-x-0 bottom-0 h-32 ${className}`}>
      <svg
        className="w-full h-full opacity-40"
        viewBox="0 0 1000 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
            <stop offset="40%" stopColor="#06b6d4" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="waveGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.1" />
            <stop offset="60%" stopColor="#818cf8" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Smooth undulating dotted particle waves */}
        <path
          d="M0 130 C200 70, 450 150, 700 85 C850 45, 950 110, 1000 90"
          stroke="url(#waveGrad1)"
          strokeWidth="2.5"
          strokeDasharray="4 6"
        />
        <path
          d="M0 100 C250 145, 500 60, 750 120 C880 150, 960 70, 1000 80"
          stroke="url(#waveGrad2)"
          strokeWidth="2"
          strokeDasharray="3 5"
        />
        <path
          d="M0 145 C180 110, 420 130, 650 65 C800 20, 920 100, 1000 130"
          stroke="url(#waveGrad3)"
          strokeWidth="1.5"
          strokeDasharray="2 4"
        />

        {/* Small glowing nodes on wave peaks */}
        <circle cx="280" cy="100" r="3" fill="#38bdf8" filter="drop-shadow(0 0 6px #38bdf8)" />
        <circle cx="480" cy="85" r="2.5" fill="#67e8f9" filter="drop-shadow(0 0 6px #67e8f9)" />
        <circle cx="700" cy="85" r="3.5" fill="#818cf8" filter="drop-shadow(0 0 6px #818cf8)" />
        <circle cx="850" cy="65" r="2.5" fill="#38bdf8" filter="drop-shadow(0 0 6px #38bdf8)" />
      </svg>
    </div>
  );
};
