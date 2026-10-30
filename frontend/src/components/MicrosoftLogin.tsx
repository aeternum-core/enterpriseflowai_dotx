import React from 'react';

interface MicrosoftLoginProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export const MicrosoftLogin: React.FC<MicrosoftLoginProps> = ({
  onClick,
  disabled = false,
  isLoading = false
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className="w-full py-2.5 sm:py-3 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 font-medium rounded-lg text-xs sm:text-sm flex items-center justify-center gap-3 transition-colors shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {/* Microsoft 4-Color Windows Logo */}
      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 23 23" fill="none">
        <rect x="1" y="1" width="10" height="10" fill="#f35325" />
        <rect x="12" y="1" width="10" height="10" fill="#81bc06" />
        <rect x="1" y="12" width="10" height="10" fill="#05a6f0" />
        <rect x="12" y="12" width="10" height="10" fill="#ffba08" />
      </svg>
      <span>{isLoading ? 'Connecting to Microsoft...' : 'Sign in with Microsoft'}</span>
    </button>
  );
};
