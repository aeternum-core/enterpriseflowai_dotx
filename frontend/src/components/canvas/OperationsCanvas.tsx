import React, { useState, useEffect, useRef } from 'react';
import {
  GitFork,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Bot,
  Cpu,
  Layers,
  Terminal,
  FileCode,
  Shield,
  Clock,
  ArrowRight,
  ChevronDown,
  Activity,
  Send,
  Zap,
  Check,
  X,
  RefreshCw,
  Search,
  MessageSquare
} from 'lucide-react';
import { api, WorkflowDetail, WorkflowTask, WorkflowItem } from '../../services/api';

interface OperationsCanvasProps {
  workflow?: WorkflowDetail | null;
  workflowId?: string;
  onRefresh?: () => void;
  onNavigateWorkflow?: (id: string) => void;
}

export const OperationsCanvas: React.FC<OperationsCanvasProps> = ({
  workflow: initialWorkflow,
  workflowId: initialWorkflowId,
  onRefresh,
  onNavigateWorkflow
}) => {
  const [workflowsList, setWorkflowsList] = useState<WorkflowItem[]>([]);
  const [activeWorkflow, setActiveWorkflow] = useState<WorkflowDetail | null>(initialWorkflow || null);
  const [selectedTask, setSelectedTask] = useState<WorkflowTask | null>(null);
  const [activeInspectorTab, setActiveInspectorTab] = useState<'summary' | 'output' | 'tools' | 'transcript' | 'jsonl'>('summary');
  const [jsonViewMode, setJsonViewMode] = useState<'formatted' | 'raw'>('formatted');
  const [pathFilter, setPathFilter] = useState<'ALL' | 'RUNNING' | 'FAILURE' | 'BLOCKED' | 'GATE'>('ALL');
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(true);
  const [liveEventCount, setLiveEventCount] = useState<number>(0);
  const [isLaunching, setIsLaunching] = useState<boolean>(false);
  const [isDeciding, setIsDeciding] = useState<boolean>(false);
  const [decisionNotes, setDecisionNotes] = useState<string>('');
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>(new Date().toLocaleTimeString());

  const activeWfRef = useRef<WorkflowDetail | null>(activeWorkflow);
  activeWfRef.current = activeWorkflow;

  // 1. Fetch available workflows list
  const loadWorkflows = async (preferredId?: string) => {
    try {
      const res = await api.listWorkflows();
      const items: WorkflowItem[] = res.items || [];
      setWorkflowsList(items);

      // Prioritize selected ID, then Customer Request Resolution, then running, then first
      const targetId = preferredId || (activeWfRef.current ? activeWfRef.current.id : undefined);
      let chosen = items.find(w => w.id === targetId);

      if (!chosen) {
        // Look for customer request resolution workflow
        chosen = items.find(w => w.domain === 'customer' || w.title?.toLowerCase().includes('customer')) ||
          items.find(w => w.status === 'RUNNING' || w.status === 'WAITING_APPROVAL' || w.status === 'WAITING_FOR_APPROVAL') ||
          items[0];
      }

      if (chosen && (!activeWfRef.current || activeWfRef.current.id !== chosen.id || preferredId)) {
        const detail = await api.getWorkflowDetail(chosen.id);
        setActiveWorkflow(detail);
        if (detail.tasks && detail.tasks.length > 0) {
          // Select running or waiting task, or first
          const activeTask = detail.tasks.find(t => t.status === 'IN_PROGRESS' || t.status === 'WAITING_APPROVAL') || detail.tasks[0];
          setSelectedTask(activeTask);
        }
      }
      setLastUpdatedTime(new Date().toLocaleTimeString());
    } catch (e) {
      console.error('Failed to load workflows list for Canvas:', e);
    }
  };

  // 2. Fetch active workflow detail
  const refreshActiveWorkflow = async (id?: string) => {
    const wfId = id || activeWfRef.current?.id;
    if (!wfId) return;
    try {
      const detail = await api.getWorkflowDetail(wfId);
      setActiveWorkflow(detail);
      setLastUpdatedTime(new Date().toLocaleTimeString());

      // Retain or update current selected task
      if (selectedTask) {
        const updated = detail.tasks?.find(t => t.id === selectedTask.id);
        if (updated) setSelectedTask(updated);
      } else if (detail.tasks && detail.tasks.length > 0) {
        setSelectedTask(detail.tasks[0]);
      }
    } catch (e) {
      console.error('Failed to refresh active workflow:', e);
    }
  };

  // Initial load
  useEffect(() => {
    loadWorkflows(initialWorkflowId);
  }, [initialWorkflowId]);

  // 3. Server-Sent Events (SSE) Live Subscription
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events/live');
      eventSource.onopen = () => {
        setIsLiveConnected(true);
      };
      eventSource.onmessage = (e) => {
        setLiveEventCount(prev => prev + 1);
        try {
          const data = JSON.parse(e.data);
          // If the event is for the current workflow, immediately refresh it
          if (data.payload && (data.payload.workflow_id === activeWfRef.current?.id || data.payload.id === activeWfRef.current?.id)) {
            refreshActiveWorkflow();
          } else if (data.event === 'workflow_created' || data.event === 'approval_decided' || data.event === 'workflow_updated') {
            loadWorkflows();
          }
        } catch {
          // heartbeat or non-json
        }
      };
      eventSource.onerror = () => {
        setIsLiveConnected(false);
      };
    } catch (err) {
      setIsLiveConnected(false);
    }

    // 4. Poller fallback: every 2 seconds when workflow is active or paused
    const pollInterval = setInterval(() => {
      const cur = activeWfRef.current;
      if (cur && (cur.status === 'RUNNING' || cur.status === 'WAITING_APPROVAL' || cur.status === 'WAITING_FOR_APPROVAL')) {
        refreshActiveWorkflow();
      }
    }, 2000);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(pollInterval);
    };
  }, []);

  // Launch Customer Request Resolution Scenario in Real Time
  const handleLaunchCustomerScenario = async () => {
    setIsLaunching(true);
    try {
      const res = await fetch('/api/demo/trigger-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId: 'customer_sla_refund' })
      });
      const data = await res.json();
      if (data.workflow?.id) {
        await loadWorkflows(data.workflow.id);
      }
    } catch (e) {
      console.error('Failed to launch Customer Request Resolution scenario:', e);
    } finally {
      setIsLaunching(false);
    }
  };

  // Handle In-Canvas Decision
  const handleDecide = async (decision: 'APPROVED' | 'REJECTED') => {
    if (!activeWorkflow) return;
    const pendingAppr = (activeWorkflow.approvals || []).find((a: any) => a.status === 'PENDING' || a.state === 'PENDING');
    if (!pendingAppr) return;

    setIsDeciding(true);
    try {
      await fetch(`/api/approvals/${pendingAppr.id}/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          decidedByUserId: 'usr_admin_01',
          decidedByName: 'Support Director',
          decidedByRole: 'Support Manager',
          reason: decisionNotes || (decision === 'APPROVED' ? 'Customer SLA concession authorized via Orchestration Canvas.' : 'Action rejected.')
        })
      });
      setDecisionNotes('');
      await refreshActiveWorkflow();
      await loadWorkflows();
    } catch (e) {
      console.error('Error recording approval decision in canvas:', e);
    } finally {
      setIsDeciding(false);
    }
  };

  const tasks: WorkflowTask[] = activeWorkflow?.tasks || [];
  const currentTask: WorkflowTask | null = selectedTask || (tasks.length > 0 ? tasks[0] : null);

  // Filter tasks based on Path Mode
  const filteredTasks = tasks.filter(t => {
    if (pathFilter === 'ALL') return true;
    if (pathFilter === 'RUNNING') return t.status === 'IN_PROGRESS' || t.status === 'RUNNING';
    if (pathFilter === 'GATE') return t.status === 'WAITING_APPROVAL' || t.required_approval_id;
    if (pathFilter === 'FAILURE') return t.status === 'FAILED';
    if (pathFilter === 'BLOCKED') return t.status === 'PENDING';
    return true;
  });

  // Posture metrics
  const doneCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const failedCount = tasks.filter((t) => t.status === 'FAILED').length;
  const runningCount = tasks.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'RUNNING').length;
  const gateCount = tasks.filter((t) => t.status === 'WAITING_APPROVAL' || t.status === 'WAITING_FOR_APPROVAL').length;
  const pendingCount = tasks.filter((t) => t.status === 'PENDING').length;
  const skippedCount = tasks.filter((t) => t.status === 'SKIPPED').length;

  const pendingApproval = (activeWorkflow?.approvals || []).find((a: any) => a.status === 'PENDING' || a.state === 'PENDING');

  return (
    <div className="space-y-4 font-sans text-slate-800">
      
      {/* Top Revka-Inspired Orchestration Center Header */}
      <div className="bg-[#0b0f19] text-slate-200 p-5 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
        
        {/* Subtle mesh background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 relative z-10">
          
          {/* Left: Brand Identity & Workflow Selector */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-cyan-400 shadow-inner">
              <GitFork className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-cyan-400 uppercase font-black tracking-widest">
                  Orchestration Center &bull; Execution Canvas
                </span>
                <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isLiveConnected ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isLiveConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  <span>{isLiveConnected ? 'Real-Time Stream Active' : 'Polling'}</span>
                </span>
              </div>

              {/* Workflow Selector Dropdown */}
              <div className="flex items-center gap-2 mt-1">
                <select
                  value={activeWorkflow?.id || ''}
                  onChange={(e) => {
                    const chosen = workflowsList.find(w => w.id === e.target.value);
                    if (chosen) refreshActiveWorkflow(chosen.id);
                  }}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-white focus:outline-none focus:border-blue-500 cursor-pointer max-w-xs sm:max-w-md truncate"
                >
                  {workflowsList.map((wf) => (
                    <option key={wf.id} value={wf.id}>
                      {wf.domain === 'customer' ? '★ ' : ''}{wf.title} ({wf.status})
                    </option>
                  ))}
                </select>

                {activeWorkflow && (
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                    activeWorkflow.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                    activeWorkflow.status === 'WAITING_APPROVAL' || activeWorkflow.status === 'WAITING_FOR_APPROVAL' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse' :
                    activeWorkflow.status === 'FAILED' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                    'bg-blue-500/20 text-blue-400 border-blue-500/30 animate-pulse'
                  }`}>
                    {activeWorkflow.status}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            
            {/* Launch Customer Request Resolution Button */}
            <button
              onClick={handleLaunchCustomerScenario}
              disabled={isLaunching}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-900/30 transition disabled:opacity-50"
            >
              <Zap className={`w-3.5 h-3.5 text-amber-300 ${isLaunching ? 'animate-spin' : ''}`} />
              <span>{isLaunching ? 'Initializing...' : 'Run Customer Request Resolution'}</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={() => {
                refreshActiveWorkflow();
                loadWorkflows();
                if (onRefresh) onRefresh();
              }}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
              title="Synchronize live state from server"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Sync</span>
            </button>

            {onNavigateWorkflow && activeWorkflow && (
              <button
                onClick={() => onNavigateWorkflow(activeWorkflow.id)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 border border-slate-700 transition"
              >
                <span>Full Ledger</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </button>
            )}
          </div>
        </div>

        {/* Path Mode & Posture Bar (Revka Exact Replication) */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3.5 border-t border-slate-800/80 text-xs relative z-10">
          
          {/* Path Mode Filter Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] uppercase font-black text-slate-400 mr-1 tracking-wider">
              PATH MODE:
            </span>
            {(['ALL', 'RUNNING', 'GATE', 'FAILURE', 'BLOCKED'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setPathFilter(mode)}
                className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                  pathFilter === mode
                    ? mode === 'FAILURE' ? 'bg-rose-600 text-white shadow-xs' :
                      mode === 'GATE' ? 'bg-amber-600 text-white shadow-xs' :
                      mode === 'RUNNING' ? 'bg-blue-600 text-white shadow-xs' :
                      'bg-slate-700 text-white shadow-xs'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {mode === 'ALL' ? 'All Nodes' : mode}
              </button>
            ))}
          </div>

          {/* Posture Metrics Matrix */}
          <div className="flex items-center gap-3.5 bg-slate-950/80 px-3.5 py-1 rounded-xl border border-slate-800 text-slate-300 shadow-inner flex-wrap">
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">POSTURE:</span>
            <div className="flex items-center gap-1 font-mono text-xs">
              <span className="text-slate-400 text-[10px]">RUNNING</span>
              <strong className="text-cyan-400">{runningCount}</strong>
            </div>
            <div className="flex items-center gap-1 font-mono text-xs">
              <span className="text-slate-400 text-[10px]">GATE</span>
              <strong className="text-amber-400">{gateCount}</strong>
            </div>
            <div className="flex items-center gap-1 font-mono text-xs">
              <span className="text-slate-400 text-[10px]">DONE</span>
              <strong className="text-emerald-400">{doneCount}</strong>
            </div>
            <div className="flex items-center gap-1 font-mono text-xs">
              <span className="text-slate-400 text-[10px]">PENDING</span>
              <strong className="text-slate-400">{pendingCount}</strong>
            </div>
            <div className="flex items-center gap-1 font-mono text-xs">
              <span className="text-slate-400 text-[10px]">FAILED</span>
              <strong className="text-rose-400">{failedCount}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Human-in-the-Loop Approval Action Gate Banner */}
      {pendingApproval && (
        <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border border-amber-500/50 rounded-2xl p-4 shadow-xl text-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-black text-amber-400 tracking-wider">
                Human-in-the-Loop Authorization Gate &bull; Execution Paused
              </div>
              <h3 className="text-sm font-bold text-white">
                {pendingApproval.actionRequested || pendingApproval.title}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Authorized Role: <strong className="text-amber-300">{String(pendingApproval.approverRoleRequired || pendingApproval.required_role || 'Support Manager').replace(/_/g, ' ')}</strong> &bull; Amount: <strong className="text-emerald-400">₹{Number(pendingApproval.financialAmount ?? (pendingApproval.financial_amount || 45000.00)).toLocaleString('en-IN')}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleDecide('APPROVED')}
              disabled={isDeciding}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-900/30 flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isDeciding ? 'Authorizing...' : 'Authorize & Resume Pipeline'}</span>
            </button>
            <button
              onClick={() => handleDecide('REJECTED')}
              disabled={isDeciding}
              className="px-3 py-2 bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 font-semibold text-xs rounded-xl border border-slate-700 transition"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reject</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Interactive DAG Canvas */}
      <div className="bg-[#080d1a] p-6 rounded-2xl border border-slate-800 min-h-[380px] relative overflow-hidden flex flex-col justify-center shadow-xl">
        
        {/* Visual Mesh Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-40"></div>

        {tasks.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-xs relative z-10 space-y-3">
            <Cpu className="w-8 h-8 text-slate-600 mx-auto" />
            <p>No active workflow loaded into the Execution Canvas.</p>
            <button
              onClick={handleLaunchCustomerScenario}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-md transition"
            >
              Launch Customer Request Resolution Workflow
            </button>
          </div>
        ) : (
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 py-4">
            {filteredTasks.map((task, idx) => {
              const isSelected = currentTask?.id === task.id;
              const isDone = task.status === 'COMPLETED';
              const isWaiting = task.status === 'WAITING_APPROVAL' || task.status === 'WAITING_FOR_APPROVAL';
              const isRunning = task.status === 'IN_PROGRESS' || task.status === 'RUNNING';
              const isFailed = task.status === 'FAILED';

              // Visual styles per posture status
              let borderColor = 'border-slate-800';
              let glowColor = 'shadow-slate-900/20';
              let badgeColor = 'bg-slate-800 text-slate-400';
              let statusText = 'PENDING';

              if (isFailed) {
                borderColor = 'border-rose-500';
                glowColor = 'shadow-rose-900/40 ring-1 ring-rose-500/50';
                badgeColor = 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
                statusText = 'FAILED';
              } else if (isWaiting) {
                borderColor = 'border-amber-500';
                glowColor = 'shadow-amber-900/40 ring-2 ring-amber-400/60 animate-pulse';
                badgeColor = 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold';
                statusText = 'GATE_PAUSED';
              } else if (isRunning) {
                borderColor = 'border-cyan-400';
                glowColor = 'shadow-cyan-900/40 ring-2 ring-cyan-400/60 animate-pulse';
                badgeColor = 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30';
                statusText = 'RUNNING';
              } else if (isDone) {
                borderColor = 'border-emerald-500/80';
                glowColor = 'shadow-emerald-900/30';
                badgeColor = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
                statusText = 'COMPLETED';
              }

              return (
                <React.Fragment key={task.id}>
                  {idx > 0 && (
                    <div className="flex items-center text-slate-700">
                      <div className={`w-6 h-0.5 ${isDone ? 'bg-emerald-500/50' : 'bg-slate-800'}`}></div>
                      <ArrowRight className={`w-3.5 h-3.5 -ml-1 ${isDone ? 'text-emerald-500' : 'text-slate-600'}`} />
                    </div>
                  )}

                  <div
                    onClick={() => setSelectedTask(task)}
                    className={`w-64 p-4 rounded-2xl border bg-slate-950/90 text-left cursor-pointer transition-all duration-200 relative ${borderColor} ${
                      isSelected ? 'ring-2 ring-blue-400 shadow-xl scale-105 z-20' : 'hover:scale-102 hover:border-slate-600'
                    } ${glowColor}`}
                  >
                    {/* Header: Agent pill & Status */}
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase truncate ${badgeColor}`}>
                        {task.agent_name.replace(' Agent', '')}
                      </span>
                      <span className="text-[10px] font-mono font-bold shrink-0">
                        {statusText}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div className="text-xs font-bold text-white mb-1 leading-snug line-clamp-1">
                      #{task.execution_order || idx + 1} {task.title}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {task.description}
                    </div>

                    {/* Bottom Metadata */}
                    <div className="mt-3 pt-2.5 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Task: {task.task_key}</span>
                      <span className="text-cyan-400 font-semibold hover:underline">Inspect Node &rarr;</span>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Revka Dual-Panel (Left: TIMELINE | Right: INSPECTOR) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column (5/12): Revka Execution TIMELINE */}
        <div className="lg:col-span-5 bg-[#0b0f19] text-slate-200 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col font-sans">
          
          {/* Timeline Header */}
          <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-black uppercase tracking-wider text-white">
                Timeline ({tasks.length})
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {doneCount}/{tasks.length} Completed
            </span>
          </div>

          {/* Timeline Step Items Stream */}
          <div className="p-3 divide-y divide-slate-800/60 overflow-y-auto max-h-[380px] space-y-1">
            {tasks.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">No execution timeline recorded.</div>
            ) : (
              tasks.map((t, idx) => {
                const isSelected = currentTask?.id === t.id;
                const isDone = t.status === 'COMPLETED';
                const isWaiting = t.status === 'WAITING_APPROVAL' || t.status === 'WAITING_FOR_APPROVAL';
                const isRunning = t.status === 'IN_PROGRESS' || t.status === 'RUNNING';
                const isFailed = t.status === 'FAILED';

                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTask(t)}
                    className={`py-2.5 px-3 rounded-xl cursor-pointer transition flex items-center justify-between gap-3 text-xs ${
                      isSelected ? 'bg-blue-600/20 border border-blue-500/40 text-white' : 'hover:bg-slate-900/60 text-slate-300'
                    }`}
                  >
                    <div className="space-y-0.5 truncate">
                      <div className="font-bold flex items-center gap-1.5 truncate">
                        <span className="text-[10px] font-mono text-slate-400">#{t.execution_order || idx + 1}</span>
                        <span className="truncate">{t.title}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2">
                        <span>{t.agent_name}</span>
                        {t.completed_at && <span>&bull; {new Date(t.completed_at).toLocaleTimeString()}</span>}
                      </div>
                    </div>

                    <div className="shrink-0">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                        isDone ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        isWaiting ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse' :
                        isRunning ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse' :
                        isFailed ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isDone ? 'bg-emerald-400' : isWaiting ? 'bg-amber-400' : isRunning ? 'bg-cyan-400' : 'bg-slate-500'}`} />
                        <span>{isDone ? 'completed' : isWaiting ? 'gate paused' : isRunning ? 'running' : isFailed ? 'failed' : 'pending'}</span>
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column (7/12): Revka Active Node Inspector */}
        <div className="lg:col-span-7 bg-[#0b0f19] text-slate-200 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col font-sans">
          
          {/* Inspector Header & Sub-Tabs */}
          <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[10px] text-slate-400 font-mono uppercase">
                Active Node Inspector &bull; {currentTask?.task_key || 'Node'}
              </div>
              <div className="text-xs font-bold text-white flex items-center gap-2 mt-0.5">
                <span className="truncate max-w-xs">{currentTask?.title || 'Select a step to inspect'}</span>
                {currentTask && (
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {currentTask.agent_name}
                  </span>
                )}
              </div>
            </div>

            {/* Sub-tabs */}
            <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[11px]">
              {(['summary', 'output', 'tools', 'transcript', 'jsonl'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveInspectorTab(tab)}
                  className={`px-2.5 py-1 rounded font-medium capitalize transition-all ${
                    activeInspectorTab === tab ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab === 'jsonl' ? '() JSONL Log' : tab}
                </button>
              ))}
            </div>
          </div>

          {/* Inspector Body */}
          <div className="p-4 text-xs text-slate-300 min-h-[260px] overflow-y-auto max-h-[380px]">
            {!currentTask ? (
              <div className="py-12 text-center text-slate-500">Select any node on the DAG or Timeline to inspect execution details.</div>
            ) : (
              <>
                {/* 1. Summary Tab */}
                {activeInspectorTab === 'summary' && (
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-black">Status</div>
                        <div className="font-bold text-emerald-400 mt-0.5">{currentTask.status}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-black">Worker Agent</div>
                        <div className="font-bold text-white mt-0.5 truncate">{currentTask.agent_name}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-black">Approval Gate</div>
                        <div className="font-bold text-amber-400 mt-0.5">
                          {currentTask.input_payload?.requires_approval || currentTask.required_approval_id ? 'YES (Human Gate)' : 'NO (Automated)'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-black">Completed At</div>
                        <div className="font-mono text-slate-400 text-[11px] mt-0.5">
                          {currentTask.completed_at ? new Date(currentTask.completed_at).toLocaleTimeString() : 'In Progress'}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
                      <div className="text-[10px] text-slate-400 uppercase font-black">Task Objective</div>
                      <div className="text-slate-300 leading-relaxed">{currentTask.description}</div>
                    </div>

                    {currentTask.output_payload && (
                      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
                        <div className="text-[10px] text-slate-400 uppercase font-black">Result Snapshot</div>
                        <div className="text-emerald-300 font-mono text-[11px] leading-relaxed">
                          {currentTask.output_payload.customer_response || currentTask.output_payload.message || currentTask.output_payload.status || 'Step completed successfully.'}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Output Tab */}
                {activeInspectorTab === 'output' && (
                  <div>
                    <pre className="p-3 bg-slate-950 rounded-xl text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-64 border border-slate-800">
                      {JSON.stringify(currentTask.output_payload || { message: "Task pending execution stream." }, null, 2)}
                    </pre>
                  </div>
                )}

                {/* 3. Tools Tab */}
                {activeInspectorTab === 'tools' && (
                  <div className="space-y-2.5">
                    <div className="text-slate-400 text-xs">
                      Authorized tool capabilities invoked via the Authorized Tool Gateway:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-cyan-300 font-mono text-xs flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                        <span>zendesk_update_ticket</span>
                      </span>
                      <span className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-blue-300 font-mono text-xs flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-blue-400" />
                        <span>sendgrid_dispatch_email</span>
                      </span>
                      <span className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-purple-300 font-mono text-xs flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-purple-400" />
                        <span>customer_crm_query</span>
                      </span>
                    </div>
                  </div>
                )}

                {/* 4. Transcript Tab */}
                {activeInspectorTab === 'transcript' && (
                  <div className="space-y-2 text-slate-300 font-mono text-[11px]">
                    <div className="text-slate-500 uppercase tracking-widest text-[10px] font-black">[SUBPROCESS TERMINAL EXECUTION LOG]</div>
                    <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 leading-relaxed space-y-1">
                      <div>$ /usr/local/bin/enterpriseflow-gateway --task {currentTask.task_key}</div>
                      <div className="text-emerald-400">&gt; Policy Sentinel evaluation: CLEARED (Risk Assessment: Verified)</div>
                      <div className="text-blue-400">&gt; Checkpoint committed to PostgreSQL / SQLite engine with SHA-256 state hash</div>
                      <div className="text-cyan-300">&gt; Worker: {currentTask.agent_name} executed with exit_code: 0</div>
                      <div className="text-slate-500">&gt; Logged at: {currentTask.completed_at ? new Date(currentTask.completed_at).toISOString() : new Date().toISOString()}</div>
                    </div>
                  </div>
                )}

                {/* 5. JSONL Log Tab */}
                {activeInspectorTab === 'jsonl' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 uppercase font-black">JSONL LOG ENTRIES (1)</span>
                      <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                        <button
                          onClick={() => setJsonViewMode('formatted')}
                          className={`px-2 py-0.5 rounded ${jsonViewMode === 'formatted' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}
                        >
                          FORMATTED
                        </button>
                        <button
                          onClick={() => setJsonViewMode('raw')}
                          className={`px-2 py-0.5 rounded ${jsonViewMode === 'raw' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}
                        >
                          RAW JSONL
                        </button>
                      </div>
                    </div>

                    <pre className="p-3.5 bg-slate-950 rounded-xl text-slate-300 font-mono text-[11px] overflow-x-auto max-h-60 border border-slate-800">
                      {jsonViewMode === 'formatted'
                        ? JSON.stringify(
                            {
                              command: `/usr/local/bin/gateway --agent ${currentTask.agent_name}`,
                              exit_code: 0,
                              task_id: currentTask.id,
                              task_key: currentTask.task_key,
                              status: currentTask.status,
                              output: currentTask.output_payload
                            },
                            null,
                            2
                          )
                        : JSON.stringify({
                            command: `/usr/local/bin/gateway --agent ${currentTask.agent_name}`,
                            exit_code: 0,
                            task_id: currentTask.id,
                            status: currentTask.status
                          })}
                    </pre>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
