import React from 'react';
import { LucideIcon } from 'lucide-react';

export type CardTheme = 'purple' | 'cyan' | 'pink' | 'orange' | 'blue';

interface WorkflowCardProps {
  theme: CardTheme;
  icon: LucideIcon;
  lines: string[];
  className?: string;
}

const themeClasses: Record<
  CardTheme,
  {
    cardClass: string;
    iconBoxBg: string;
    iconBoxBorder: string;
    iconColor: string;
    hoverGlow: string;
  }
> = {
  purple: {
    cardClass: 'glass-card-purple',
    iconBoxBg: 'bg-[#7547FF]/25',
    iconBoxBorder: 'border-[#7547FF]/40',
    iconColor: 'text-[#C4B5FD]',
    hoverGlow: 'hover:shadow-[0_0_25px_rgba(117,71,255,0.5)]'
  },
  cyan: {
    cardClass: 'glass-card-cyan',
    iconBoxBg: 'bg-[#20B9F4]/25',
    iconBoxBorder: 'border-[#20B9F4]/40',
    iconColor: 'text-[#67E8F9]',
    hoverGlow: 'hover:shadow-[0_0_25px_rgba(32,185,244,0.5)]'
  },
  pink: {
    cardClass: 'glass-card-pink',
    iconBoxBg: 'bg-[#E34BA7]/25',
    iconBoxBorder: 'border-[#E34BA7]/40',
    iconColor: 'text-[#F472B6]',
    hoverGlow: 'hover:shadow-[0_0_25px_rgba(227,75,167,0.5)]'
  },
  orange: {
    cardClass: 'glass-card-orange',
    iconBoxBg: 'bg-[#FF991F]/25',
    iconBoxBorder: 'border-[#FF991F]/40',
    iconColor: 'text-[#FCD34D]',
    hoverGlow: 'hover:shadow-[0_0_25px_rgba(255,153,31,0.5)]'
  },
  blue: {
    cardClass: 'glass-card-blue',
    iconBoxBg: 'bg-[#1769FF]/25',
    iconBoxBorder: 'border-[#1769FF]/40',
    iconColor: 'text-[#93C5FD]',
    hoverGlow: 'hover:shadow-[0_0_25px_rgba(23,105,255,0.5)]'
  }
};

export const WorkflowCard: React.FC<WorkflowCardProps> = ({
  theme,
  icon: Icon,
  lines,
  className = ''
}) => {
  const cfg = themeClasses[theme];

  return (
    <div
      className={`flex flex-col items-center justify-center p-3 rounded-2xl select-none backdrop-blur-md transition-all duration-300 transform hover:-translate-y-1 cursor-default ${cfg.cardClass} ${cfg.hoverGlow} ${className}`}
    >
      <div
        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center mb-1.5 shadow-inner ${cfg.iconBoxBg} ${cfg.iconBoxBorder} ${cfg.iconColor}`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex flex-col items-center justify-center text-center">
        {lines.map((text, idx) => (
          <span
            key={idx}
            className="text-[11px] sm:text-xs font-semibold text-white tracking-wide leading-tight whitespace-nowrap"
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  );
};
