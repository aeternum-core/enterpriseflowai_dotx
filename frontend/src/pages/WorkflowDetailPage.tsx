import React, { useState, useEffect } from 'react';
import { Workflow, WorkflowTask, AgentMessage, ApprovalRequest } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Cpu,
  GitBranch,
  ShieldAlert,
  Zap,
  Play,
  CheckSquare,
  MessageSquare,
  FileText,
  Terminal,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Layers
} from 'lucide-react';

interface WorkflowDetailPageProps {
  workflowId: string;
  onBack: () => void;
  onNavigateApprovals?: () => void;
}

export const WorkflowDetailPage: React.FC<WorkflowDetailPageProps> = ({
  workflowId,
  onBack,
  onNavigateApprovals
}) => {
  const { user } = useAuth();
  const [data, setData] = useState<{
    workflow: Workflow;
    tasks: WorkflowTask[];
    messages: AgentMessage[];
    approvals: ApprovalRequest[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tasks' | 'messages' | 'planner' | 'result'>('tasks');
  const [isSimulatingFailure, setIsSimulatingFailure] = useState(false);

  // Decision Modal
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [decisionNotes, setDecisionNotes] = useState('');
  const [isDeciding, setIsDeciding] = useState(false);

  const fetchWorkflow = async () => {
    try {
      const res = await fetch(`/api/workflows/${workflowId}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        // Expand active or first task by default
        if (!expandedTaskId) {
          const active = json.tasks.find((t: WorkflowTask) => t.status === 'IN_PROGRESS' || t.status === 'WAITING_APPROVAL');
          setExpandedTaskId(active ? active.id : json.tasks[0]?.id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflow();
    const interval = setInterval(fetchWorkflow, 2500);
    return () => clearInterval(interval);
  }, [workflowId]);

  const handleSimulateFailure = async () => {
    if (!data) return;
    setIsSimulatingFailure(true);
    const targetTask = data.tasks.find(t => t.status === 'IN_PROGRESS' || t.status === 'WAITING_APPROVAL') || data.tasks[0];
    try {
      await fetch(`/api/workflows/${workflowId}/simulate-failure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: targetTask?.id })
      });
      await fetchWorkflow();
    } catch (e) {
      console.error(e);
    }
    setTimeout(() => setIsSimulatingFailure(false), 2000);
  };

  const handleDecision = async (decision: 'APPROVED' | 'REJECTED') => {
    if (!data || !data.approvals || data.approvals.length === 0) return;
    const approval = data.approvals[0];
    setIsDeciding(true);
    try {
      await fetch(`/api/approvals/${approval.id}/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          decidedByUserId: user?.id || 'usr-admin-01',
          decidedByName: user?.name || 'Administrator',
          decidedByRole: user?.role || 'ADMIN',
          reason: decisionNotes || (decision === 'APPROVED' ? 'Human authorization granted.' : 'Action rejected.')
        })
      });
      setShowApprovalModal(false);
      setDecisionNotes('');
      await fetchWorkflow();
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeciding(false);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500">Loading workflow execution plan...</p>
      </div>
    );
  }

  const { workflow, tasks, messages, approvals } = data;
  const pendingApproval = approvals.find(a => a.state === 'PENDING');

  const getTaskStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { label: 'Completed', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'IN_PROGRESS':
        return { label: 'In Progress', bg: 'bg-blue-100 text-blue-800 border-blue-200 animate-pulse' };
      case 'WAITING_APPROVAL':
        return { label: 'Awaiting Approval', bg: 'bg-amber-100 text-amber-800 border-amber-200 font-bold' };
      case 'RETRYING':
        return { label: 'Planner Retrying', bg: 'bg-purple-100 text-purple-800 border-purple-200 animate-bounce' };
      case 'FAILED':
        return { label: 'Failed', bg: 'bg-rose-100 text-rose-800 border-rose-200' };
      default:
        return { label: 'Pending', bg: 'bg-slate-100 text-slate-600 border-slate-200' };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-400">{workflow.id}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                workflow.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                workflow.status === 'WAITING_FOR_APPROVAL' ? 'bg-amber-100 text-amber-800 border-amber-200 font-bold' :
                workflow.status === 'FAILED' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                'bg-blue-100 text-blue-800 border-blue-200 animate-pulse'
              }`}>
                {String(workflow.status || 'PENDING').replace(/_/g, ' ')}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Priority: {workflow.priority}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {workflow.title}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {pendingApproval && (
            <button
              onClick={() => setShowApprovalModal(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition cursor-pointer"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Review Approval Checkpoint</span>
            </button>
          )}

          {/* Hackathon Failure & Replan Simulation */}
          <button
            onClick={handleSimulateFailure}
            disabled={isSimulatingFailure || workflow.status === 'COMPLETED'}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
          >
            <Zap className={`w-3.5 h-3.5 ${isSimulatingFailure ? 'animate-spin' : ''}`} />
            <span>Simulate Failure & Replan</span>
          </button>
        </div>
      </div>

      {/* Progress & Current Stage Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Active Autonomous Agent</div>
              <div className="text-base font-bold text-slate-900">
                {workflow.currentAgentName || 'Central Planner Agent'}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-400 font-medium">Orchestration Progress</div>
            <div className="text-xl font-black text-blue-600">{workflow.progress}%</div>
          </div>
        </div>

        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              workflow.status === 'COMPLETED' ? 'bg-emerald-500' :
              workflow.status === 'WAITING_FOR_APPROVAL' ? 'bg-amber-500' : 'bg-blue-600'
            }`}
            style={{ width: `${workflow.progress}%` }}
          />
        </div>

        {/* Metadata Badges */}
        <div className="flex items-center gap-4 text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100 flex-wrap">
          <div>Submitted by: <strong className="text-slate-800">{workflow.submittedByName || 'Platform User'}</strong></div>
          <div>•</div>
          <div>Department: <strong className="text-slate-800">{String(workflow.submittedByRole || 'Operations').replace(/_/g, ' ')}</strong></div>
          <div>•</div>
          <div>Created: <strong className="text-slate-800">{workflow.createdAt ? new Date(workflow.createdAt).toLocaleTimeString() : 'Recent'}</strong></div>
          {workflow.completedAt && (
            <>
              <div>•</div>
              <div>Completed: <strong className="text-emerald-700">{new Date(workflow.completedAt).toLocaleTimeString()}</strong></div>
            </>
          )}
        </div>
      </div>

      {/* Pending Approval Banner if Active */}
      {pendingApproval && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-amber-950">
                  Human-in-the-Loop Checkpoint Gate: {pendingApproval.actionRequested || (pendingApproval as any).title || 'Approval Required'}
                </h3>
                <p className="text-xs text-amber-800 mt-1">
                  Central Planner has paused autonomous execution until authorization is submitted by a <strong>{String(pendingApproval.approverRoleRequired || (pendingApproval as any).required_role || 'Authorized Approver').replace(/_/g, ' ')}</strong>.
                </p>
                <div className="mt-2 text-[11px] text-amber-900 font-medium">
                  {pendingApproval.details?.reason || 'Compliance and safety policy enforcement gate.'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowApprovalModal(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shrink-0 transition"
            >
              Sign Off Now
            </button>
          </div>
        </div>
      )}

      {/* Tabs Header */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'tasks' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>DAG Task Pipeline ({tasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'messages' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Agent-to-Agent Handoffs ({messages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('planner')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'planner' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Planner Reasoning Notes</span>
        </button>

        {workflow.finalResult && (
          <button
            onClick={() => setActiveTab('result')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'result' ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Final Synthesized Result</span>
          </button>
        )}
      </div>

      {/* Tab 1: DAG Task Execution Timeline */}
      {activeTab === 'tasks' && (
        <div className="space-y-3">
          {tasks.map((task, idx) => {
            const badge = getTaskStatusBadge(task.status);
            const isExpanded = expandedTaskId === task.id;

            return (
              <div
                key={task.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition"
              >
                {/* Task Accordion Bar */}
                <div
                  onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/70"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700">
                      {task.order}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm">{task.name}</h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.bg}`}>
                          {badge.label}
                        </span>
                        {task.requiresApproval && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            Approval Gate
                          </span>
                        )}
                        {task.retryCount > 0 && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                            Retry: {task.retryCount}/{task.maxRetries}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>Assigned Agent: <strong className="text-blue-600">{task.assignedAgentName}</strong></span>
                        <span>•</span>
                        <span>{task.description}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-600">{task.progress}%</span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Content: Output Payload & Error Message */}
                {isExpanded && (
                  <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs space-y-3">
                    
                    {task.errorMessage && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700">
                        <strong>Error encountered:</strong> {task.errorMessage}
                      </div>
                    )}

                    <div>
                      <div className="font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-slate-500" />
                        <span>Specialized Agent Output Payload:</span>
                      </div>
                      <pre className="p-3 bg-slate-900 text-cyan-300 rounded-xl font-mono text-[11px] overflow-x-auto max-h-56">
                        {task.output ? JSON.stringify(task.output, null, 2) : '// Task is currently pending execution'}
                      </pre>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-200">
                      <span>Task ID: {task.id}</span>
                      <span>Dependencies: {((task.dependencies || (task as any).dependsOn || []) as string[]).length > 0 ? ((task.dependencies || (task as any).dependsOn || []) as string[]).join(', ') : 'Root task'}</span>
                      {task.completedAt && <span>Completed at: {new Date(task.completedAt).toLocaleTimeString()}</span>}
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Agent-to-Agent Message Handoffs */}
      {activeTab === 'messages' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            Agent Handoff & Inter-Agent Dispatch Stream
          </h2>
          <div className="divide-y divide-slate-100">
            {messages.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">No agent messages logged yet.</div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className="py-3 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-700">{msg.fromAgent}</span>
                      <span className="text-slate-400">→</span>
                      <span className="font-bold text-indigo-700">{msg.toAgent}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-600">
                        {msg.messageType}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-slate-700 pl-2 border-l-2 border-blue-400 font-medium">
                    {msg.content}
                  </p>
                  {msg.payload && (
                    <pre className="p-2 bg-slate-900 text-emerald-300 rounded-lg text-[10px] font-mono mt-1 overflow-x-auto">
                      {JSON.stringify(msg.payload, null, 2)}
                    </pre>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Planner Reasoning Notes */}
      {activeTab === 'planner' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-cyan-600" />
            Central Planner Agent Dynamic Execution Ledger
          </h2>
          <div className="space-y-2 text-xs">
            {workflow.plannerNotes && workflow.plannerNotes.length > 0 ? (
              workflow.plannerNotes.map((note, i) => (
                <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 mt-1 shrink-0" />
                  <span className="text-slate-800 font-medium">{note}</span>
                </div>
              ))
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-xs italic">
                Central Planner evaluated DAG dependencies, validated compliance policies, and coordinated task dispatches.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Final Synthesized Result */}
      {activeTab === 'result' && workflow.finalResult && (
        <div className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-xs">
          <div className="flex items-center gap-3 pb-4 border-b border-emerald-100 mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Workflow Execution Complete</h2>
              <p className="text-xs text-emerald-700">All tasks completed and verified by Central Planner Agent</p>
            </div>
          </div>

          <pre className="p-4 bg-slate-950 text-emerald-400 rounded-2xl font-mono text-xs overflow-x-auto shadow-inner">
            {JSON.stringify(workflow.finalResult, null, 2)}
          </pre>
        </div>
      )}

      {/* Decision Modal */}
      {showApprovalModal && pendingApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Human-in-the-Loop Approval Decision
            </h3>
            <p className="text-slate-500 mb-4">
              Authorized sign-off required to resume autonomous execution.
            </p>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 mb-4 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Action:</span>
                <span className="font-bold text-slate-900">{pendingApproval.actionRequested}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Risk Assessment:</span>
                <span className="font-bold text-amber-700">{pendingApproval.riskLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Approver Role:</span>
                <span className="font-bold text-blue-700">{String(pendingApproval.approverRoleRequired || (pendingApproval as any).required_role || 'Authorized Approver').replace(/_/g, ' ')}</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block font-semibold text-slate-700 mb-1">
                Approval Decision Comments & Audit Rationale
              </label>
              <textarea
                rows={2}
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                placeholder="Enter audit notes (e.g. Verified credentials and authorized)"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowApprovalModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeciding}
                onClick={() => handleDecision('REJECTED')}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl"
              >
                Reject Action
              </button>
              <button
                type="button"
                disabled={isDeciding}
                onClick={() => handleDecision('APPROVED')}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md"
              >
                {isDeciding ? 'Recording...' : 'Approve & Resume Pipeline'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
