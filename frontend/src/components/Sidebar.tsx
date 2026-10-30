import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  GitFork,
  ClipboardList,
  Play,
  Flame,
  Users,
  Receipt,
  MessageSquare,
  ShoppingCart,
  ShieldAlert,
  FileCheck2,
  Clock,
  BarChart3,
  Bot,
  Cpu,
  ShieldCheck,
  Settings,
  Shield
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, pendingCount = 0 }) => {
  const generalNav = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'approvals', label: 'Approvals', icon: CheckSquare, badge: pendingCount },
    { id: 'canvas', label: 'Operations Canvas', icon: GitFork },
    { id: 'workflows', label: 'Workflows & Orchestrator', icon: Play },
    { id: 'chaos', label: 'Chaos Testing Console', icon: Flame },
    { id: 'my-tasks', label: 'My Tasks', icon: ClipboardList },
  ];

  const workflowNav = [
    { id: 'wf-onboarding', label: 'Employee Onboarding', icon: Users },
    { id: 'wf-invoice', label: 'Invoice Processing', icon: Receipt },
    { id: 'wf-customer', label: 'Customer Requests', icon: MessageSquare },
    { id: 'wf-procurement', label: 'Procurement & Vendors', icon: ShoppingCart },
    { id: 'wf-it-incident', label: 'IT Incident & Access', icon: ShieldAlert },
  ];

  const reportNav = [
    { id: 'audit-trail', label: 'Audit Trail (Hash-Chain)', icon: FileCheck2 },
    { id: 'cycle-times', label: 'Cycle Times & SLA', icon: Clock },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const systemNav = [
    { id: 'agents', label: 'Agent Management', icon: Bot },
    { id: 'tool-gateway', label: 'Authorized Tool Gateway', icon: Cpu },
    { id: 'policies', label: 'Policies & Guardrails', icon: ShieldCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#090d16] text-slate-300 flex flex-col shrink-0 border-r border-slate-800 h-screen select-none font-sans">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-slate-800 gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-900/40">
          <Shield className="w-5 h-5 text-white stroke-[2.2]" />
        </div>
        <div>
          <div className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
            EnterpriseFlow <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">AI</span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium tracking-wide uppercase">Multi-Agent Operations</div>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 text-xs">
        {/* GENERAL */}
        <div>
          <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">General</div>
          <div className="space-y-0.5">
            {generalNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                        isActive ? 'bg-white text-blue-700' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* WORKFLOWS */}
        <div>
          <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Workflows</div>
          <div className="space-y-0.5">
            {workflowNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* REPORTS */}
        <div>
          <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Reports & Audit</div>
          <div className="space-y-0.5">
            {reportNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SYSTEM */}
        <div>
          <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">System</div>
          <div className="space-y-0.5">
            {systemNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer System Status */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-emerald-950/40 border border-emerald-800/40 text-[11px] text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium truncate">Policy Engine: Active</span>
        </div>
        <div className="mt-1 px-2 text-[10px] text-slate-400 flex items-center justify-between">
          <span>SHA-256 Chained</span>
          <span className="text-slate-300 font-mono">v2.4.0</span>
        </div>
      </div>
    </aside>
  );
};

