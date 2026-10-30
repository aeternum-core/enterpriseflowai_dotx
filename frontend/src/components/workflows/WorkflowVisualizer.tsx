import React, { useState } from 'react';
import {
  Play,
  GitFork,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Bot,
  Cpu,
  Layers,
  Shield,
  ArrowRight,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { api, WorkflowDetail } from '../../services/api';

interface WorkflowVisualizerProps {
  onWorkflowCreated?: (workflowId: string) => void;
  onNavigateToApproval?: (approvalId: string) => void;
}

export const WorkflowVisualizer: React.FC<WorkflowVisualizerProps> = ({
  onWorkflowCreated,
  onNavigateToApproval
}) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeWorkflow, setActiveWorkflow] = useState<WorkflowDetail | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // 5 Mandatory Workflow Presets
  const presets = [
    {
      id: 'onboarding',
      domain: 'Employee Onboarding',
      title: 'Senior Cloud Architect Hire',
      prompt: 'Onboard new hire Jordan Vance into Engineering as Staff Cloud Architect starting Nov 15. Verify I-9 documentation, create Workday profile, and provision Okta SSO credentials.',
      color: 'border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-blue-900',
      tag: 'Workflow 01'
    },
    {
      id: 'invoice',
      domain: 'Invoice Processing',
      title: 'Datadog Annual Telemetry ($18,450)',
      prompt: 'Process annual enterprise infrastructure telemetry invoice from Datadog for $18,450.00. Extract line items, perform 3-way PO matching, scan duplicate ledger, and disburse via SAP S/4HANA.',
      color: 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-900',
      tag: 'Workflow 02'
    },
    {
      id: 'customer',
      domain: 'Customer Operations',
      title: 'GlobalCorp SLA Dispute ($450)',
      prompt: 'Customer GlobalCorp demands $450 credit adjustment for EU-West API degradation. Classify sentiment, verify contractual SLA latency logs, and apply credit memo via Zendesk ticket.',
      color: 'border-purple-200 bg-purple-50/50 hover:bg-purple-50 text-purple-900',
      tag: 'Workflow 03'
    },
    {
      id: 'procurement',
      domain: 'Procurement & Vendors',
      title: 'NVIDIA H100 Cluster PO ($78,500)',
      prompt: 'Procure 8x NVIDIA H100 DGX nodes under enterprise research agreement for $78,500.00. Evaluate supplier warranty, activate vendor in Coupa master record, and dispatch binding Purchase Order.',
      color: 'border-amber-200 bg-amber-50/50 hover:bg-amber-50 text-amber-900',
      tag: 'Workflow 04'
    },
    {
      id: 'it_incident',
      domain: 'IT Incident & Access',
      title: 'Emergency K8s ClusterAdmin PAM',
      prompt: 'Request emergency JIT ClusterAdmin access to k8s-prod-us-east-1 for memory leak hotfix patching. Investigate crash frequency, verify threat classification, and grant 4-hour ephemeral CyberArk token.',
      color: 'border-rose-200 bg-rose-50/50 hover:bg-rose-50 text-rose-900',
      tag: 'Workflow 05'
    }
  ];

  const handleLaunch = async (textToRun: string) => {
    if (!textToRun.trim()) return;
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await api.startWorkflow(textToRun);
      // Fetch full workflow details
      const detail = await api.getWorkflowDetail(res.workflow_id);
      setActiveWorkflow(detail);
      if (onWorkflowCreated) onWorkflowCreated(res.workflow_id);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to start workflow');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshWorkflow = async () => {
    if (!activeWorkflow) return;
    try {
      const detail = await api.getWorkflowDetail(activeWorkflow.id);
      setActiveWorkflow(detail);
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Launch Banner & Natural Language Input */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Natural-Language Multi-Agent Business Orchestrator
              </h3>
              <p className="text-xs text-slate-500">
                Level 1 Request Understanding dynamically maps business intent to Level 2 Central Planner DAG decomposition.
              </p>
            </div>
          </div>
        </div>

        {/* Input box */}
        <div className="flex gap-3">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type any natural-language enterprise business request (e.g. 'Process invoice for Datadog for $18,450.00' or 'Onboard Jordan Vance in Engineering')..."
            rows={2}
            className="flex-1 p-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 focus:bg-white"
          />
          <button
            onClick={() => handleLaunch(prompt)}
            disabled={loading || !prompt.trim()}
            className="px-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-sm shrink-0"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{loading ? 'Decomposing...' : 'Decompose & Execute'}</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-2.5 rounded-lg bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Quick Demo Scenarios (All 5 Workflows) */}
        <div className="mt-5">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            One-Click Reproducible Workflow Demonstrations:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
            {presets.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setPrompt(p.prompt);
                  handleLaunch(p.prompt);
                }}
                className={`p-3 text-left rounded-lg border transition-all text-xs flex flex-col justify-between ${p.color}`}
              >
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    {p.tag}
                  </div>
                  <div className="font-bold text-slate-900 mb-1 leading-snug">{p.title}</div>
                </div>
                <div className="text-[10px] text-blue-600 font-semibold flex items-center gap-1 mt-2">
                  <span>Run Scenario</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Workflow Visualizer */}
      {activeWorkflow && (
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 font-semibold">
                  {activeWorkflow.id}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase">
                  {activeWorkflow.domain}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    activeWorkflow.status === 'COMPLETED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : activeWorkflow.status === 'WAITING_APPROVAL'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {activeWorkflow.status}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">{activeWorkflow.title}</h3>
            </div>
            <button
              onClick={handleRefreshWorkflow}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 text-xs"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh State</span>
            </button>
          </div>

          {/* Hierarchical Level 1 & 2 Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-blue-600" />
                Level 1: Request Understanding Output
              </div>
              <div className="text-slate-700 bg-white p-2.5 rounded border border-slate-200">
                <div className="font-semibold text-slate-800">{activeWorkflow.extracted_entities?.intent}</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Domain: <strong>{activeWorkflow.domain}</strong> | Extracted Value:{' '}
                  <strong>
                    {activeWorkflow.extracted_entities?.extracted_amount
                      ? `$${activeWorkflow.extracted_entities.extracted_amount}`
                      : 'N/A'}
                  </strong>
                </div>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <GitFork className="w-3.5 h-3.5 text-blue-600" />
                Level 2: Central Planner Decomposition
              </div>
              <div className="text-slate-700 bg-white p-2.5 rounded border border-slate-200">
                <div className="font-semibold text-slate-800">
                  DAG generated: {activeWorkflow.tasks.length} specialized agent subtasks
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Completed: {activeWorkflow.tasks.filter((t) => t.status === 'COMPLETED').length} / {activeWorkflow.tasks.length}
                </div>
              </div>
            </div>
          </div>

          {/* DAG Task Pipeline Cards */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Hierarchical Task Pipeline Execution (Level 3 Specialized Agents & Level 4 Governance)
            </h4>
            <div className="space-y-3">
              {activeWorkflow.tasks.map((task, idx) => {
                const isCompleted = task.status === 'COMPLETED';
                const isWaiting = task.status === 'WAITING_APPROVAL';
                const isInProgress = task.status === 'IN_PROGRESS';

                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isCompleted
                        ? 'border-emerald-200 bg-emerald-50/30'
                        : isWaiting
                        ? 'border-amber-300 bg-amber-50/60 shadow-xs'
                        : isInProgress
                        ? 'border-blue-300 bg-blue-50/50'
                        : 'border-slate-200 bg-white opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isCompleted
                              ? 'bg-emerald-600 text-white'
                              : isWaiting
                              ? 'bg-amber-500 text-white animate-pulse'
                              : isInProgress
                              ? 'bg-blue-600 text-white animate-spin'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">{task.title}</div>
                          <div className="text-[11px] text-blue-600 font-medium flex items-center gap-1">
                            <Bot className="w-3 h-3" />
                            <span>{task.agent_name}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-800'
                              : isWaiting
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : isInProgress
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {task.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 ml-8 mb-2">{task.description}</p>

                    {/* Waiting Approval Alert & Quick Navigation */}
                    {isWaiting && (
                      <div className="ml-8 p-3 rounded-lg bg-amber-100/70 border border-amber-300 flex items-center justify-between text-xs text-amber-900">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-amber-700 shrink-0" />
                          <span>
                            <strong>HUMAN-IN-THE-LOOP PAUSE:</strong> This sensitive operation is protected by Enterprise Policy. Waiting for human sign-off in the Approval Center.
                          </span>
                        </div>
                        {task.required_approval_id && onNavigateToApproval && (
                          <button
                            onClick={() => onNavigateToApproval(task.required_approval_id!)}
                            className="px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded text-xs shrink-0 shadow-2xs"
                          >
                            Open in Approval Center
                          </button>
                        )}
                      </div>
                    )}

                    {/* Output Inspector */}
                    {task.output_payload && Object.keys(task.output_payload).length > 0 && (
                      <div className="ml-8 mt-2 p-2.5 rounded bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-32 border border-slate-800">
                        {JSON.stringify(task.output_payload, null, 2)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

