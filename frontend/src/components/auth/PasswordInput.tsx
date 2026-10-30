import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  id?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  id = 'password',
  value,
  onChange,
  placeholder = 'Enter your password',
  required = true,
  disabled = false
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
        <Lock className="w-4 h-4" />
      </div>
      <input
        id={id}
        type={showPassword ? 'text' : 'password'}
        required={required}
        disabled={disabled}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg text-xs sm:text-[13px] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent transition disabled:opacity-60"
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => setShowPassword(!showPassword)}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer disabled:cursor-not-allowed"
      >
        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
};
