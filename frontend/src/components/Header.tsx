import React, { useState } from 'react';
import { Search, Bell, Shield, ChevronDown, Check, UserCheck } from 'lucide-react';
import { User } from '../services/api';

interface HeaderProps {
  currentUser: User;
  allUsers: User[];
  onSelectUser: (user: User) => void;
  pendingCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  allUsers,
  onSelectUser,
  pendingCount = 0
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-10 font-sans">
      {/* Search Input */}
      <div className="flex items-center gap-3 w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search approvals, workflows, request IDs or vendors..."
            className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg pl-9 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Right Controls: Role & Persona Switcher */}
      <div className="flex items-center gap-4">
        {/* Governance Mode Pill */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-slate-100 rounded-md border border-slate-200 text-xs text-slate-600">
          <Shield className="w-3.5 h-3.5 text-blue-600" />
          <span>Governance: <strong className="text-slate-800 font-semibold">Strict Backend Enforced</strong></span>
        </div>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {pendingCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white"></span>
          )}
        </button>

        {/* Active Persona Switcher */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 p-1.5 pr-2.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left"
          >
            <img
              src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'}
              alt={currentUser.full_name}
              className="w-8 h-8 rounded-full object-cover border border-slate-200"
            />
            <div className="hidden sm:block">
              <div className="text-xs font-semibold text-slate-800 leading-tight flex items-center gap-1.5">
                {currentUser.full_name}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="text-[11px] text-blue-600 font-medium">
                {currentUser.roles[0] || 'User'}
              </div>
            </div>
          </button>

          {/* Persona Dropdown */}
          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1"
            >
              <div className="px-3 py-1.5 border-b border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Switch Testing Persona</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Test role-based approvals and permission gates</div>
              </div>

              <div className="py-1">
                {allUsers.map((u) => {
                  const isCurrent = u.id === currentUser.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        onSelectUser(u);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors ${
                        isCurrent ? 'bg-blue-50 text-blue-900 font-medium' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={u.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'}
                          alt={u.full_name}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-semibold text-slate-800 leading-tight">{u.full_name}</div>
                          <div className="text-[10px] text-slate-500">{u.roles.join(', ')}</div>
                        </div>
                      </div>
                      {isCurrent && <Check className="w-4 h-4 text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

