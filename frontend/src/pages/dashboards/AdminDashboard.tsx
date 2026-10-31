import React, { useState, useEffect } from 'react';
import { Workflow, ApprovalRequest, AuditLog } from '../../types';
import {
  Activity,
  GitBranch,
  CheckCircle2,
  AlertTriangle,
  Clock,
  CheckSquare,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  Users
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<any>({
    totalWorkflows: 5,
    activeWorkflows: 2,
    pendingApprovals: 2,
    completedWorkflows: 2,
    failedWorkflows: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSimulatingFailure, setIsSimulatingFailure] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [wfRes, apprRes, auditRes, statsRes] = await Promise.all([
        fetch('/api/workflows'),
        fetch('/api/approvals?state=PENDING'),
        fetch('/api/audit-logs'),
        fetch('/api/planner/stats')
      ]);

      if (wfRes.ok) {
        const d = await wfRes.json();
        setWorkflows(Array.isArray(d) ? d : d.items || []);
      }
      if (apprRes.ok) {
        const d = await apprRes.json();
        setApprovals(Array.isArray(d) ? d : d.items || []);
      }
      if (auditRes.ok) {
        const d = await auditRes.json();
        setAuditLogs(Array.isArray(d) ? d : d.events || d.items || []);
      }
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulateFailure = async () => {
    setIsSimulatingFailure(true);
    // Find an active workflow
    const targetWf = workflows.find(w => w.status === 'RUNNING' || w.status === 'WAITING_FOR_APPROVAL') || workflows[0];
    if (targetWf) {
      const targetTask = targetWf.tasks.find(t => t.status === 'IN_PROGRESS' || t.status === 'PENDING') || targetWf.tasks[0];
      try {
        await fetch(`/api/workflows/${targetWf.id}/simulate-failure`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId: targetTask?.id })
        });
        await fetchDashboardData();
      } catch (e) {
        console.error(e);
      }
    }
    setTimeout(() => setIsSimulatingFailure(false), 2500);
  };

  const getWorkflowBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'RUNNING':
        return 'bg-blue-100 text-blue-800 border-blue-200 animate-pulse';
      case 'WAITING_FOR_APPROVAL':
        return 'bg-amber-100 text-amber-800 border-amber-200 font-bold';
      case 'FAILED':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'REQUIRES_ATTENTION':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Title & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Enterprise Operations Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Central Planner Agent coordinating 5 autonomous enterprise workflows & 31 specialized agents.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Hackathon Failure & Self-Healing Trigger */}
          <button
            onClick={handleSimulateFailure}
            disabled={isSimulatingFailure}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20 flex items-center gap-2 transition cursor-pointer"
          >
            <Zap className={`w-3.5 h-3.5 ${isSimulatingFailure ? 'animate-spin' : ''}`} />
            <span>{isSimulatingFailure ? 'Injecting Fault...' : 'Simulate Failure & Replan'}</span>
          </button>

          <button
            onClick={() => onNavigate('/workflows?create=true')}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-2 transition cursor-pointer"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>New Workflow</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">All Workflows</span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.totalWorkflows || workflows.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Across 5 departments</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Execution</span>
            <Activity className="w-4 h-4 text-blue-600 animate-spin" />
          </div>
          <div className="text-2xl font-black text-blue-600">{stats.activeWorkflows}</div>
          <div className="text-[11px] text-slate-500 mt-1">Autonomous orchestration</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Approvals</span>
            <CheckSquare className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{stats.pendingApprovals}</div>
          <div className="text-[11px] text-slate-500 mt-1">Human-in-the-loop gates</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Success Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">98.4%</div>
          <div className="text-[11px] text-slate-500 mt-1">Self-healing enabled</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Specialized Agents</span>
            <Cpu className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600">31</div>
          <div className="text-[11px] text-slate-500 mt-1">Under Central Planner</div>
        </div>

      </div>

      {/* Main Grid: Workflows Table & Approvals Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: 5 Mandatory Enterprise Workflows Overview */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-blue-600" />
                Active & Monitored Workflows
              </h2>
              <p className="text-xs text-slate-500">Live state across all 5 enterprise business workflows</p>
            </div>
            <button
              onClick={() => onNavigate('/workflows')}
              className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {workflows.slice(0, 5).map(wf => (
              <div
                key={wf.id}
                onClick={() => onNavigate(`/workflows/${wf.id}`)}
                className="py-3.5 px-2 hover:bg-slate-50/80 rounded-xl cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-slate-400">{wf.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getWorkflowBadge(wf.status || '')}`}>
                      {String(wf.status || 'PENDING').replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      By {wf.submittedByName || 'Enterprise Platform'} ({String(wf.submittedByRole || 'STAFF').replace(/_/g, ' ')})
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 leading-tight">
                    {wf.title || 'Enterprise Workflow Execution'}
                  </h3>
                  <div className="text-xs text-slate-500 flex items-center gap-3">
                    <span>Current Stage: <strong className="text-slate-700">{wf.currentAgentName || 'Central Planner'}</strong></span>
                    <span>•</span>
                    <span>Tasks: {Array.isArray(wf.tasks) ? wf.tasks.filter(t => t.status === 'COMPLETED').length : 0}/{Array.isArray(wf.tasks) ? wf.tasks.length : 0}</span>
                  </div>
                </div>

                {/* Progress Bar & Open Arrow */}
                <div className="flex items-center gap-4 sm:shrink-0">
                  <div className="w-28 text-right">
                    <div className="text-xs font-bold text-slate-700 mb-1">
                      {wf.progress ?? (Array.isArray(wf.tasks) && wf.tasks.length > 0 ? Math.round((wf.tasks.filter(t => t.status === 'COMPLETED').length / wf.tasks.length) * 100) : 0)}%
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${wf.progress ?? (Array.isArray(wf.tasks) && wf.tasks.length > 0 ? Math.round((wf.tasks.filter(t => t.status === 'COMPLETED').length / wf.tasks.length) * 100) : 0)}%` }}
                      />
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Pending Human Approvals */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-amber-600" />
                Pending Approvals ({approvals.length})
              </h2>
              <button
                onClick={() => onNavigate('/approvals')}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                Desk
              </button>
            </div>

            <div className="space-y-3 mt-4">
              {approvals.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No approvals currently pending.
                </div>
              ) : (
                approvals.map(appr => (
                  <div
                    key={appr.id}
                    onClick={() => onNavigate('/approvals')}
                    className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 cursor-pointer transition"
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-amber-800 mb-1">
                      <span>Risk: {appr.riskLevel || 'STANDARD'}</span>
                      <span>Requires: {String(appr.approverRoleRequired || (appr as any).required_role || 'APPROVER').replace(/_/g, ' ')}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                      {appr.actionRequested || (appr as any).action_type || 'Authorization Request'}
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                      Requested by {appr.requestedByAgent || (appr as any).requested_by_agent || 'EnterpriseFlow Engine'}
                    </p>
                    <div className="mt-2 text-right">
                      <span className="text-[10px] text-blue-700 font-bold hover:underline">
                        Review & Authorize →
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Central Planner Orchestrator Banner */}
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Central Planner DAG Engine
            </div>
            <p className="text-[11px] text-slate-300 leading-snug mb-3">
              Dynamic dependency scheduling with autonomous retry and self-healing.
            </p>
            <button
              onClick={() => onNavigate('/planner')}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition"
            >
              Open Live Planner Graph
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Section: Recent Audit Trails & Agent History */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" />
              Live Enterprise Audit Trail
            </h2>
            <p className="text-xs text-slate-500">Immutable record of agent handoffs, planner decisions, and human authorizations</p>
          </div>
          <button
            onClick={() => onNavigate('/audit')}
            className="text-xs text-blue-600 hover:underline font-semibold"
          >
            All Logs →
          </button>
        </div>

        <div className="divide-y divide-slate-100 mt-2 text-xs">
          {auditLogs.slice(0, 4).map(log => (
            <div key={log.id} className="py-2.5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase mt-0.5 ${
                  log.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' :
                  log.status === 'WARNING' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {log.actorType}
                </span>
                <div>
                  <div className="font-semibold text-slate-800">
                    {log.actorName} <span className="font-normal text-slate-400">({log.eventType})</span>
                  </div>
                  <div className="text-slate-600 mt-0.5">{log.description}</div>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
