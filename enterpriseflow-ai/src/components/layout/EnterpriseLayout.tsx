import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLiveWorkflow } from '../../context/LiveWorkflowContext';
import { UserRole } from '../../types';
import {
  LayoutDashboard,
  GitBranch,
  Network,
  CheckSquare,
  FileSpreadsheet,
  Cpu,
  PlayCircle,
  Bell,
  Search,
  LogOut,
  ChevronDown,
  Activity,
  X,
  ExternalLink,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';

interface EnterpriseLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

export const EnterpriseLayout: React.FC<EnterpriseLayoutProps> = ({
  currentPath,
  onNavigate,
  children
}) => {
  const { user, logout, switchRole, getDashboardPath } = useAuth();
  const {
    isConnected,
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    activeToast,
    clearToast
  } = useLiveWorkflow();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const role = user?.role || 'ADMIN';

  // Format friendly role title
  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case 'ADMIN':
        return { label: 'Administrator', bg: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'HR_MANAGER':
        return { label: 'HR Manager', bg: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'EMPLOYEE_MANAGER':
        return { label: 'Employee Manager', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      case 'FINANCE_MANAGER':
        return { label: 'Finance Manager', bg: 'bg-teal-100 text-teal-800 border-teal-200' };
      case 'SERVICE_MANAGER':
        return { label: 'Service Manager', bg: 'bg-pink-100 text-pink-800 border-pink-200' };
      case 'CLIENT_MANAGER':
        return { label: 'Client Manager', bg: 'bg-rose-100 text-rose-800 border-rose-200' };
      default:
        return { label: 'User', bg: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  const roleInfo = getRoleBadge(role);
  const allRoles: UserRole[] = ['ADMIN', 'HR_MANAGER', 'EMPLOYEE_MANAGER', 'FINANCE_MANAGER', 'CLIENT_MANAGER', 'SERVICE_MANAGER'];

  const navItems = [
    {
      label: 'Role Dashboard',
      path: getDashboardPath(role),
      icon: LayoutDashboard,
      roles: allRoles
    },
    {
      label: 'Workflows & Pipeline',
      path: '/workflows',
      icon: GitBranch,
      roles: allRoles
    },
    {
      label: 'Central Planner Agent',
      path: '/planner',
      icon: Network,
      roles: allRoles
    },
    {
      label: 'Human Approvals',
      path: '/approvals',
      icon: CheckSquare,
      badge: notifications.filter(n => n.type === 'APPROVAL' && !n.read).length,
      roles: allRoles
    },
    {
      label: 'Audit Logs & History',
      path: '/audit',
      icon: FileSpreadsheet,
      roles: allRoles
    },
    {
      label: 'Specialized Agents (31)',
      path: '/agents',
      icon: Cpu,
      roles: allRoles
    },
    {
      label: 'Demo Scenarios & Tests',
      path: '/demo',
      icon: PlayCircle,
      highlight: true,
      roles: allRoles
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* Real-time Global Live Alert Toast */}
      {activeToast && (
        <div className="fixed top-4 right-4 z-50 max-w-md bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-2xl border border-blue-500/50 flex items-center justify-between gap-3 animate-bounce">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-medium">{activeToast}</span>
          </div>
          <button onClick={clearToast} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ================= TOP NAVIGATION BAR ================= */}
      <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        
        {/* Left: Brand Logo & Role Pill */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div 
            onClick={() => onNavigate(getDashboardPath(role))}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-400 flex items-center justify-center p-1.5 shadow-sm group-hover:scale-105 transition">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="6" cy="6" r="3" fill="#60a5fa" fillOpacity="0.8" />
                <circle cx="18" cy="8" r="2.5" fill="#38bdf8" />
                <circle cx="12" cy="18" r="3" fill="#818cf8" />
                <path d="M8.5 7.5L15.5 8" stroke="#93c5fd" />
                <path d="M7.5 8.5L10.5 15.5" stroke="#93c5fd" />
                <path d="M16.5 10L13.5 15.5" stroke="#93c5fd" />
              </svg>
            </div>
            <div>
              <div className="text-base font-extrabold tracking-tight text-slate-900 leading-tight">
                EnterpriseFlow <span className="text-blue-600">AI</span>
              </div>
              <div className="text-[10px] text-slate-500 font-medium">Autonomous Operations</div>
            </div>
          </div>

          {/* Current Role Badge */}
          <div className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${roleInfo.bg}`}>
            <Shield className="w-3.5 h-3.5" />
            <span>{roleInfo.label}</span>
          </div>

          {/* Live SSE Stream Health Indicator */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="font-medium text-[11px]">{isConnected ? 'Live Engine Active' : 'Connecting Engine...'}</span>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search workflows, agents, tasks, tickets, or audit logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onNavigate(`/workflows?q=${encodeURIComponent(searchQuery)}`);
                }
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Right: Actions, Notifications, User Menu */}
        <div className="flex items-center gap-3">
          
          {/* Quick Approvals Button */}
          <button
            onClick={() => onNavigate('/approvals')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition cursor-pointer"
          >
            <CheckSquare className="w-3.5 h-3.5 text-amber-600" />
            <span>Approvals</span>
            {notifications.filter(n => n.type === 'APPROVAL' && !n.read).length > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-600 text-white text-[10px] flex items-center justify-center font-bold">
                {notifications.filter(n => n.type === 'APPROVAL' && !n.read).length}
              </span>
            )}
          </button>

          {/* Notifications Popover Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 relative transition cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="font-bold text-slate-800 text-sm">Notifications & Alerts</span>
                  <span className="text-[11px] text-slate-400">{unreadNotificationCount} unread</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto my-2">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-slate-400">No recent notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationRead(n.id);
                          if (n.workflowId) onNavigate(`/workflows/${n.workflowId}`);
                          setShowNotifications(false);
                        }}
                        className={`py-2.5 px-2 rounded-lg cursor-pointer transition ${n.read ? 'opacity-70 hover:bg-slate-50' : 'bg-blue-50/50 hover:bg-blue-50'}`}
                      >
                        <div className="flex items-center justify-between font-semibold text-slate-800">
                          <span>{n.title}</span>
                          <span className="text-[10px] text-slate-400">{new Date(n.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-slate-600 mt-0.5 leading-snug">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="pt-2 border-t border-slate-100 text-center">
                  <button
                    onClick={() => {
                      onNavigate('/audit');
                      setShowNotifications(false);
                    }}
                    className="text-blue-600 hover:underline font-medium text-[11px]"
                  >
                    View complete audit log
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              <img
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={user?.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-200"
              />
              <div className="hidden sm:block text-left text-xs">
                <div className="font-semibold text-slate-900 leading-tight">{user?.name}</div>
                <div className="text-[10px] text-slate-500 capitalize">{role.toLowerCase().replace('_', ' ')}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 text-xs">
                <div className="p-2 border-b border-slate-100">
                  <div className="font-bold text-slate-900">{user?.name}</div>
                  <div className="text-slate-500 text-[11px] truncate">{user?.email}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{user?.department}</div>
                </div>

                <div className="py-2 border-b border-slate-100">
                  <div className="text-[10px] font-bold uppercase text-slate-400 px-2 mb-1.5">
                    Switch Workspace Role
                  </div>
                  <button
                    onClick={() => {
                      switchRole('ADMIN');
                      setShowUserMenu(false);
                      onNavigate('/admin/dashboard');
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-100 flex items-center justify-between"
                  >
                    <span>Admin</span>
                    {role === 'ADMIN' && <span className="text-blue-600 font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => {
                      switchRole('HR_MANAGER');
                      setShowUserMenu(false);
                      onNavigate('/hr/dashboard');
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-100 flex items-center justify-between"
                  >
                    <span>HR Manager</span>
                    {role === 'HR_MANAGER' && <span className="text-blue-600 font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => {
                      switchRole('EMPLOYEE_MANAGER');
                      setShowUserMenu(false);
                      onNavigate('/employee/dashboard');
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-100 flex items-center justify-between"
                  >
                    <span>Employee Manager</span>
                    {role === 'EMPLOYEE_MANAGER' && <span className="text-blue-600 font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => {
                      switchRole('SERVICE_MANAGER');
                      setShowUserMenu(false);
                      onNavigate('/client/dashboard');
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-100 flex items-center justify-between"
                  >
                    <span>Service Manager</span>
                    {role === 'SERVICE_MANAGER' && <span className="text-blue-600 font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => {
                      switchRole('FINANCE_MANAGER');
                      setShowUserMenu(false);
                      onNavigate('/finance/dashboard');
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-100 flex items-center justify-between"
                  >
                    <span>Finance Manager</span>
                    {role === 'FINANCE_MANAGER' && <span className="text-blue-600 font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => {
                      switchRole('CLIENT_MANAGER');
                      setShowUserMenu(false);
                      onNavigate('/client/dashboard');
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-100 flex items-center justify-between"
                  >
                    <span>Client Manager</span>
                    {role === 'CLIENT_MANAGER' && <span className="text-blue-600 font-bold">✓</span>}
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      logout();
                      onNavigate('/');
                    }}
                    className="w-full px-2 py-2 rounded-lg text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </header>

      {/* ================= BODY WRAPPER ================= */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ================= SIDEBAR ================= */}
        <aside className="w-60 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between py-4 shrink-0 shadow-xs">
          <div className="px-3 space-y-1">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Operations Center
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
              return (
                <button
                  key={item.path}
                  onClick={() => onNavigate(item.path)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : item.highlight
                      ? 'text-indigo-600 hover:bg-indigo-50 border border-indigo-200/60'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white text-blue-600' : 'bg-rose-500 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {item.highlight && !isActive && (
                    <Sparkles className="w-3 h-3 text-amber-500" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Sidebar Box: Central Planner Status */}
          <div className="px-3 pt-4 border-t border-slate-100">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 text-white">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-cyan-400" />
                  Planner Engine
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                  Autonomous
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Coordinating 31 specialized agents with self-healing DAG replanning.
              </p>
            </div>
          </div>
        </aside>

        {/* ================= MAIN CONTENT ================= */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

      </div>

    </div>
  );
};
