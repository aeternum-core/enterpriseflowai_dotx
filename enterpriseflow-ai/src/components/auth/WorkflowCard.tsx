import React from 'react';
import { LucideIcon } from 'lucide-react';

export type WorkflowTheme = 'purple' | 'cyan' | 'pink' | 'orange' | 'blue';

interface WorkflowCardProps {
  theme: WorkflowTheme;
  icon: LucideIcon;
  lines: string[];
  className?: string;
}

const themeStyles: Record<
  WorkflowTheme,
  {
    bg: string;
    border: string;
    shadow: string;
    iconBoxBg: string;
    iconBoxBorder: string;
    iconColor: string;
  }
> = {
  purple: {
    bg: 'bg-gradient-to-b from-[#241c61]/95 to-[#191347]/95',
    border: 'border-indigo-400/40',
    shadow: 'shadow-[0_8px_24px_rgba(99,102,241,0.25)]',
    iconBoxBg: 'bg-indigo-500/25',
    iconBoxBorder: 'border-indigo-400/40',
    iconColor: 'text-indigo-200'
  },
  cyan: {
    bg: 'bg-gradient-to-b from-[#063b4b]/95 to-[#042833]/95',
    border: 'border-teal-400/40',
    shadow: 'shadow-[0_8px_24px_rgba(45,212,191,0.25)]',
    iconBoxBg: 'bg-teal-500/25',
    iconBoxBorder: 'border-teal-400/40',
    iconColor: 'text-teal-200'
  },
  pink: {
    bg: 'bg-gradient-to-b from-[#4d133e]/95 to-[#330a27]/95',
    border: 'border-pink-400/40',
    shadow: 'shadow-[0_8px_24px_rgba(244,114,182,0.25)]',
    iconBoxBg: 'bg-pink-500/25',
    iconBoxBorder: 'border-pink-400/40',
    iconColor: 'text-pink-200'
  },
  orange: {
    bg: 'bg-gradient-to-b from-[#4a260f]/95 to-[#2f1606]/95',
    border: 'border-amber-500/40',
    shadow: 'shadow-[0_8px_24px_rgba(245,158,11,0.25)]',
    iconBoxBg: 'bg-amber-500/25',
    iconBoxBorder: 'border-amber-400/40',
    iconColor: 'text-amber-200'
  },
  blue: {
    bg: 'bg-gradient-to-b from-[#0b3363]/95 to-[#062144]/95',
    border: 'border-blue-400/40',
    shadow: 'shadow-[0_8px_24px_rgba(59,130,246,0.25)]',
    iconBoxBg: 'bg-blue-500/25',
    iconBoxBorder: 'border-blue-400/40',
    iconColor: 'text-blue-200'
  }
};

export const WorkflowCard: React.FC<WorkflowCardProps> = ({
  theme,
  icon: Icon,
  lines,
  className = ''
}) => {
  const styles = themeStyles[theme];

  return (
    <div
      className={`flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl border backdrop-blur-md text-center transition-transform duration-300 hover:scale-105 select-none ${styles.bg} ${styles.border} ${styles.shadow} ${className}`}
    >
      <div
        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center mb-1.5 shadow-inner ${styles.iconBoxBg} ${styles.iconBoxBorder} ${styles.iconColor}`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex flex-col items-center justify-center">
        {lines.map((line, i) => (
          <span
            key={i}
            className="text-[11px] sm:text-xs font-semibold text-white tracking-wide leading-tight whitespace-nowrap"
          >
            {line}
          </span>
        ))}
      </div>
    </div>
  );
};
