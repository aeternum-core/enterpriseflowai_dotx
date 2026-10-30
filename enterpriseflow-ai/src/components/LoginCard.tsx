import React from 'react';
import { UserRole } from '../types';
import { LoginForm } from './LoginForm';

interface LoginCardProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  onQuickRoleLogin: (role: UserRole) => Promise<void>;
  defaultEmail?: string;
  defaultPassword?: string;
}

export const LoginCard: React.FC<LoginCardProps> = ({
  onLogin,
  onQuickRoleLogin,
  defaultEmail = '',
  defaultPassword = ''
}) => {
  return (
    <div className="w-full max-w-[430px] xl:max-w-[460px] bg-white rounded-[30px] shadow-[0_24px_70px_rgba(2,16,48,0.22),0_1px_3px_rgba(0,0,0,0.06)] p-6 sm:p-7 xl:p-8 border border-slate-100/90 relative">
      
      {/* Card Header */}
      <div className="mb-4 sm:mb-5">
        <p className="text-slate-500 text-sm font-normal">Welcome to</p>
        <h2 className="text-3xl xl:text-[32px] font-extrabold tracking-tight text-[#071735] flex items-center leading-tight mt-0.5">
          <span>EnterpriseFlow</span>
          <span className="text-[#258BFF] ml-1.5 font-black">AI</span>
        </h2>
        <p className="text-slate-500 text-xs sm:text-[13px] mt-1 font-normal">
          Sign in to access your workspace
        </p>
      </div>

      {/* Interactive Form */}
      <LoginForm
        onLogin={onLogin}
        onQuickRoleLogin={onQuickRoleLogin}
        defaultEmail={defaultEmail}
        defaultPassword={defaultPassword}
      />
    </div>
  );
};
