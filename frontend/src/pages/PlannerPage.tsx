import React, { useState, useEffect } from 'react';
import { Agent, Workflow, AgentMessage } from '../types';
import {
  Network,
  Cpu,
  GitBranch,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Zap,
  Terminal,
  ShieldCheck,
  Layers,
  ArrowRight,
  Play,
  Flame,
  Clock,
  Users,
  Receipt,
  MessageSquare,
  ShoppingCart,
  ShieldAlert,
  Check,
  RotateCcw,
  Info,
  Lock,
  ChevronRight,
  ExternalLink,
  Shield
} from 'lucide-react';

interface PlannerPageProps {
  onNavigateWorkflow: (id: string) => void;
}

interface DAGNode {
  id: string;
  taskKey: string;
  title: string;
  description: string;
  agentName: string;
  agentKey: string;
  executionOrder: number;
  topologicalLevel: number;
  requiresApproval: boolean;
  riskLevel: string;
  requiredRole?: string;
  dependencies: string[];
  estimatedDurationMs: number;
  status: string;
}

interface DAGEdge {
  id: string;
  source: string;
  target: string;
  type: string;
}

interface ReasoningStep {
  step: number;
  phase: string;
  status: string;
  details: string;
}

interface DecomposeResponse {
  success: boolean;
  goal: string;
  domain: string;
  workflowTitle: string;
  understanding: any;
  dagSummary: {
    nodeCount: number;
    edgeCount: number;
    topologicalLevels: number;
    approvalGateCount: number;
    isValidDAG: boolean;
    validationErrors: string[];
    planningLatencyMs: number;
  };
  nodes: DAGNode[];
  edges: DAGEdge[];
  reasoningSteps: ReasoningStep[];
}

export const PlannerPage: React.FC<PlannerPageProps> = ({ onNavigateWorkflow }) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'decomposer' | 'self_healing' | 'swarms' | 'active_dags'>('decomposer');

  // Live telemetry & stats
  const [stats, setStats] = useState<any>({
    totalWorkflows: 14,
    activeWorkflows: 3,
    pendingApprovals: 2,
    completedWorkflows: 9,
    failedWorkflows: 0,
    totalAgents: 31,
    plannerHealth: 'OPTIMAL',
    avgTaskCompletionMs: 340,
    cycleDetectionStatus: 'SECURE_ACYCLIC',
    selfHealingRate: '100%',
    coordinationLatencyMs: 42
  });

  const [telemetry, setTelemetry] = useState<any>(null);
  const [activeWorkflows, setActiveWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

  // Decomposer State
  const [goalPrompt, setGoalPrompt] = useState<string>(
    'Onboard Principal Site Reliability Engineer Daniel Craig with ₹28,50,000 CTC and ₹3,00,000 joining bonus in Bengaluru Tech Hub'
  );
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [isDecomposing, setIsDecomposing] = useState<boolean>(false);
  const [decompositionResult, setDecompositionResult] = useState<DecomposeResponse | null>(null);
  const [selectedNode, setSelectedNode] = useState<DAGNode | null>(null);

  // Execution State
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<any>(null);

  // Self-Healing State
  const [selectedFailureType, setSelectedFailureType] = useState<string>('HTTP_409_USERNAME_COLLISION');
  const [healPrompt, setHealPrompt] = useState<string>(
    'Onboard Principal Site Reliability Engineer Daniel Craig with ₹28,50,000 CTC in Bengaluru office'
  );
  const [directorFeedback, setDirectorFeedback] = useState<string>(
    'Disallow discretionary sign-on bonus exceeding ₹2,50,000 without Director approval; mandate PF deduction.'
  );
  const [isHealing, setIsHealing] = useState<boolean>(false);
  const [healResult, setHealResult] = useState<any>(null);

  // Pre-configured real-world enterprise domain goals
  const sampleGoals = [
    {
      title: 'HR Employee Onboarding',
      domain: 'onboarding',
      icon: Users,
      color: 'indigo',
      prompt: 'Onboard Principal Site Reliability Engineer Daniel Craig with ₹28,50,000 CTC and ₹3,00,000 joining bonus in Bengaluru Tech Hub'
    },
    {
      title: 'Finance Invoice Processing',
      domain: 'invoice',
      icon: Receipt,
      color: 'teal',
      prompt: 'Process GST Invoice INV-2026-8812 for ₹4,85,000 from Wipro Technologies for Cloud Migration with 3-Way PO Match'
    },
    {
      title: 'Customer Triage & RBI TAT',
      domain: 'customer',
      icon: MessageSquare,
      color: 'pink',
      prompt: 'Investigate disputed UPI transaction reversal ₹18,500 for Swiggy with T+4 breach under RBI Harmonisation of TAT'
    },
    {
      title: 'MSME Procurement & PO',
      domain: 'procurement',
      icon: ShoppingCart,
      color: 'amber',
      prompt: 'Onboard MSME Hardware Vendor L&T Cloud and dispatch PO for ₹52,00,000 with GeM clearance and Section 15 45-day cap'
    },
    {
      title: 'IT Incident & CERT-In PAM',
      domain: 'it_incident',
      icon: ShieldAlert,
      color: 'blue',
      prompt: 'Investigate Sev-1 Kubernetes Container OOM crash in Mumbai DC and request 4-hour JIT PAM ClusterAdmin access'
    }
  ];

  const fetchTelemetry = async () => {
    try {
      const [sRes, tRes, wRes] = await Promise.all([
        fetch('/api/planner/stats'),
        fetch('/api/planner/telemetry'),
        fetch('/api/workflows')
      ]);

      if (sRes.ok) {
        setStats(await sRes.json());
      }
      if (tRes.ok) {
        setTelemetry(await tRes.json());
      }
      if (wRes.ok) {
        const d = await wRes.json();
        const items = Array.isArray(d) ? d : d.items || [];
        setActiveWorkflows(items);
        if (!selectedWorkflow && items.length > 0) {
          setSelectedWorkflow(items[0]);
        }
      }
    } catch (e) {
      console.error('Failed to fetch planner telemetry:', e);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    // Run initial decomposition
    handleDecompose(goalPrompt);
    const interval = setInterval(fetchTelemetry, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleDecompose = async (promptToUse?: string) => {
    const p = promptToUse || goalPrompt;
    if (!p.trim()) return;

    try {
      setIsDecomposing(true);
      setExecutionResult(null);
      const res = await fetch('/api/planner/decompose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: p,
          domain: selectedDomain === 'all' ? undefined : selectedDomain,
          strictMode: true
        })
      });

      if (res.ok) {
        const data: DecomposeResponse = await res.json();
        setDecompositionResult(data);
        if (data.nodes && data.nodes.length > 0) {
          setSelectedNode(data.nodes[0]);
        }
      }
    } catch (e) {
      console.error('Decomposition failed:', e);
    } finally {
      setIsDecomposing(false);
    }
  };

  const handleExecute = async () => {
    if (!goalPrompt.trim()) return;
    try {
      setIsExecuting(true);
      const res = await fetch('/api/planner/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: goalPrompt,
          requesterId: 'user_marcus_brody'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setExecutionResult(data);
        fetchTelemetry();
      }
    } catch (e) {
      console.error('Plan execution failed:', e);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSelfHeal = async () => {
    try {
      setIsHealing(true);
      const res = await fetch('/api/planner/self-heal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          failureType: selectedFailureType,
          prompt: healPrompt,
          feedback: directorFeedback
        })
      });

      if (res.ok) {
        const data = await res.json();
        setHealResult(data);
      }
    } catch (e) {
      console.error('Self-healing failed:', e);
    } finally {
      setIsHealing(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-100 text-cyan-800 border border-cyan-200 flex items-center gap-1.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
              <span>Hierarchical Level 2 Central Planner</span>
            </span>
            <span className="text-xs text-slate-400 font-medium">Authoritative DAG Supervisor</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <span>Central Planner Agent Architecture & DAG Scheduler</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Single authoritative coordinator decomposing business goals, managing DAG dependencies, evaluating policy sentinels, and executing autonomous self-healing recovery.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDecompose()}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-1.5 shadow-xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isDecomposing ? 'animate-spin text-blue-600' : 'text-slate-400'}`} />
            <span>Re-evaluate DAG</span>
          </button>
        </div>
      </div>

      {/* Primary Planner Health & Telemetry Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Planner State</div>
          <div className="text-xl font-black text-slate-900 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">Supervisor Level 2</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Acyclicity Health</div>
          <div className="text-xl font-black text-emerald-600 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>100% Strict</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">0 Graph Cycles</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Worker Swarms</div>
          <div className="text-xl font-black text-purple-600">31 Agents</div>
          <div className="text-[10px] text-slate-500 mt-1">5 Business Domains</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">DAG Dispatch Latency</div>
          <div className="text-xl font-black text-cyan-600">
            {stats.coordinationLatencyMs || 42} ms
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Topological Batching</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Active Workflows</div>
          <div className="text-xl font-black text-blue-600">{stats.activeWorkflows} DAGs</div>
          <div className="text-[10px] text-slate-500 mt-1">In Real Execution</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Self-Healing Recovery</div>
          <div className="text-xl font-black text-amber-600">{stats.selfHealingRate || '100%'}</div>
          <div className="text-[10px] text-slate-500 mt-1">0 Dropped Pipelines</div>
        </div>
      </div>

      {/* Interactive Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('decomposer')}
          className={`pb-3 px-4 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
            activeTab === 'decomposer'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Network className="w-4 h-4" />
          <span>Interactive Goal Decomposer & Live DAG</span>
        </button>

        <button
          onClick={() => setActiveTab('self_healing')}
          className={`pb-3 px-4 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
            activeTab === 'self_healing'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Self-Healing Recovery Simulator</span>
        </button>

        <button
          onClick={() => setActiveTab('swarms')}
          className={`pb-3 px-4 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
            activeTab === 'swarms'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Five Swarms Architecture (31 Agents)</span>
        </button>

        <button
          onClick={() => setActiveTab('active_dags')}
          className={`pb-3 px-4 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
            activeTab === 'active_dags'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>Live Executed Workflows ({activeWorkflows.length})</span>
        </button>
      </div>

      {/* TAB 1: INTERACTIVE GOAL DECOMPOSER */}
      {activeTab === 'decomposer' && (
        <div className="space-y-6">
          
          {/* Natural Language Business Goal Input Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-blue-600" />
                  <span>Real Business Goal Input Console</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Type any natural language business instruction or select an Indian enterprise preset. The Central Planner parses entities, evaluates statutory laws, and compiles an acyclic DAG.
                </p>
              </div>

              {/* Domain Preset Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Presets:</span>
                {sampleGoals.map((sample, idx) => {
                  const Icon = sample.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setGoalPrompt(sample.prompt);
                        setSelectedDomain(sample.domain);
                        handleDecompose(sample.prompt);
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 transition flex items-center gap-1 cursor-pointer"
                    >
                      <Icon className="w-3 h-3 text-slate-500" />
                      <span>{sample.title.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input Form */}
            <div className="relative">
              <textarea
                rows={3}
                value={goalPrompt}
                onChange={(e) => setGoalPrompt(e.target.value)}
                placeholder="E.g., Onboard Senior Site Reliability Engineer with ₹25,00,000 CTC in Bengaluru or Disburse vendor payment ₹18,40,000 to Wipro under MSMED Act 2006..."
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Currency: <strong className="text-slate-800">₹ INR</strong>
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                  Statutory Guardrails: <strong className="text-slate-800">Active</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={isDecomposing}
                  onClick={() => handleDecompose()}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-2 transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                  <span>{isDecomposing ? 'Decomposing...' : 'Compile DAG Graph'}</span>
                </button>

                <button
                  disabled={isExecuting || isDecomposing}
                  onClick={handleExecute}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2 shadow-sm shadow-blue-500/20 transition cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isExecuting ? 'Starting Autonomous Workers...' : 'Execute Plan in Backend'}</span>
                </button>
              </div>
            </div>

            {/* Live Execution Success Notice */}
            {executionResult && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between gap-3 animate-fadeIn">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <div className="font-bold text-emerald-950">
                      Workflow Scheduled in Real Database! (ID: {executionResult.workflowId})
                    </div>
                    <div className="text-[11px] text-emerald-700">
                      Central Planner assigned {executionResult.tasks?.length || 0} subtasks to autonomous worker agents. Current Status: <strong className="uppercase">{executionResult.status}</strong>.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigateWorkflow(executionResult.workflowId)}
                    className="px-3.5 py-1.5 rounded-xl bg-white text-emerald-800 font-bold border border-emerald-300 hover:bg-emerald-100 transition flex items-center gap-1.5"
                  >
                    <span>Inspect Live Canvas</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Decomposed DAG Visualization & Inspector */}
          {decompositionResult && (
            <div className="space-y-4">
              
              {/* DAG Header & Summary Strip */}
              <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-lg border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {decompositionResult.domain.toUpperCase()} DOMAIN
                      </span>
                      <span className="text-xs text-slate-400">
                        Topological Decomposition Complete
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mt-1">
                      {decompositionResult.workflowTitle}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-bold rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{decompositionResult.dagSummary.isValidDAG ? 'Valid Acyclic DAG' : 'Invalid Cycle'}</span>
                    </span>
                    <span className="px-3 py-1 bg-blue-500/20 text-cyan-300 font-bold rounded-full border border-blue-500/30">
                      {decompositionResult.dagSummary.planningLatencyMs} ms compile
                    </span>
                  </div>
                </div>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Nodes</div>
                    <div className="text-lg font-bold text-white mt-0.5">{decompositionResult.dagSummary.nodeCount} Subtasks</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Dependency Edges</div>
                    <div className="text-lg font-bold text-white mt-0.5">{decompositionResult.dagSummary.edgeCount} Directed Edges</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Execution Levels</div>
                    <div className="text-lg font-bold text-cyan-400 mt-0.5">{decompositionResult.dagSummary.topologicalLevels} Parallel Stages</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Approval Gates</div>
                    <div className="text-lg font-bold text-amber-400 mt-0.5">{decompositionResult.dagSummary.approvalGateCount} Human Gates</div>
                  </div>
                </div>

                {/* Reasoning Trace Steps */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Central Planner Decision Reasoning Stream:</span>
                  </div>
                  <div className="space-y-1.5 text-[11px] font-mono">
                    {decompositionResult.reasoningSteps.map((step) => (
                      <div key={step.step} className="flex items-start gap-2 text-slate-300">
                        <span className="text-cyan-400 font-bold shrink-0">[{step.step}/5]</span>
                        <span className="text-slate-400 font-semibold shrink-0">{step.phase}:</span>
                        <span className="text-slate-200">{step.details}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Interactive Topological Level DAG Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left (2 cols): DAG Pipeline Stages */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Topological Execution Sequence (Batched by Parallel Stage)
                    </h4>
                    <span className="text-[11px] text-slate-400">Click any subtask to inspect details</span>
                  </div>

                  <div className="space-y-3">
                    {decompositionResult.nodes.map((node) => {
                      const isSelected = selectedNode?.id === node.id;
                      return (
                        <div
                          key={node.id}
                          onClick={() => setSelectedNode(node)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-500/20 shadow-md'
                              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                node.requiresApproval
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : 'bg-blue-100 text-blue-800 border border-blue-200'
                              }`}>
                                {node.executionOrder}
                              </div>
                              <div>
                                <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                                  <span>{node.title}</span>
                                  {node.requiresApproval && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                                      <Lock className="w-2.5 h-2.5 text-amber-600" />
                                      Human Gate ({node.requiredRole})
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                                  {node.description}
                                </div>
                              </div>
                            </div>

                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 shrink-0 font-mono">
                              Level {node.topologicalLevel}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-100 text-[11px]">
                            <div className="flex items-center gap-2 text-slate-500">
                              <Cpu className="w-3.5 h-3.5 text-purple-600" />
                              <span>Worker: <strong className="text-slate-800">{node.agentName}</strong></span>
                            </div>

                            <div className="flex items-center gap-3">
                              {node.dependencies.length > 0 ? (
                                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                  <ArrowRight className="w-3 h-3 text-slate-400" />
                                  Depends on: {node.dependencies.join(', ')}
                                </span>
                              ) : (
                                <span className="text-[10px] text-emerald-600 font-semibold">
                                  ● Root Task (Runs immediately)
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400">~{node.estimatedDurationMs}ms</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right (1 col): Selected Subtask Inspector */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Task & Policy Inspector
                  </h4>

                  {selectedNode ? (
                    <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                      <div className="pb-3 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 font-mono">
                            {selectedNode.taskKey}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            selectedNode.requiresApproval ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {selectedNode.requiresApproval ? 'APPROVAL REQUIRED' : 'AUTONOMOUS EXECUTION'}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-2">
                          {selectedNode.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          {selectedNode.description}
                        </p>
                      </div>

                      {/* Subtask Attributes */}
                      <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-50">
                          <span className="text-slate-400">Assigned Worker</span>
                          <span className="font-bold text-purple-700">{selectedNode.agentName}</span>
                        </div>

                        <div className="flex justify-between py-1 border-b border-slate-50">
                          <span className="text-slate-400">Topological Level</span>
                          <span className="font-bold text-slate-800">Stage {selectedNode.topologicalLevel}</span>
                        </div>

                        <div className="flex justify-between py-1 border-b border-slate-50">
                          <span className="text-slate-400">Risk Assessment</span>
                          <span className={`font-bold ${selectedNode.riskLevel === 'CRITICAL' ? 'text-rose-600' : selectedNode.riskLevel === 'HIGH' ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {selectedNode.riskLevel}
                          </span>
                        </div>

                        {selectedNode.requiresApproval && (
                          <div className="flex justify-between py-1 border-b border-slate-50">
                            <span className="text-slate-400">Mandated Authorizer</span>
                            <span className="font-bold text-amber-800">{selectedNode.requiredRole}</span>
                          </div>
                        )}

                        <div className="flex justify-between py-1 border-b border-slate-50">
                          <span className="text-slate-400">Dependencies</span>
                          <span className="font-mono text-[11px] text-slate-700">
                            {selectedNode.dependencies.length > 0 ? selectedNode.dependencies.join(', ') : 'None (Level 0)'}
                          </span>
                        </div>

                        <div className="flex justify-between py-1 border-b border-slate-50">
                          <span className="text-slate-400">Statutory Standard</span>
                          <span className="font-semibold text-slate-700">
                            {decompositionResult.domain === 'onboarding' ? 'DPDP Act 2023 & EPFO' :
                             decompositionResult.domain === 'invoice' ? 'Section 16 CGST Act & e-Invoice' :
                             decompositionResult.domain === 'customer' ? 'RBI DPSS.CO.PD No.629' :
                             decompositionResult.domain === 'procurement' ? 'MSMED Act 2006 (Sec 15/16)' :
                             'CERT-In Sec 70B(6) IT Act'}
                          </span>
                        </div>
                      </div>

                      {/* Action trigger button */}
                      <div className="pt-2">
                        <button
                          onClick={handleExecute}
                          className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-sm flex items-center justify-center gap-1.5 transition"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Dispatch this DAG in Backend</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-400">
                      Select a subtask on the left to inspect its parameters, role requirements, and statutory shields.
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 2: SELF-HEALING RECOVERY SIMULATOR */}
      {activeTab === 'self_healing' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>Autonomous Self-Healing Recovery Simulator</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Test the Central Planner's algorithmic resilience. Inject real enterprise faults into active pipelines and observe how the supervisor dynamically modifies the DAG in real-time.
              </p>
            </div>

            {/* Failure Mode Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                {
                  id: 'HTTP_409_USERNAME_COLLISION',
                  title: 'Okta Directory 409 Collision',
                  desc: 'Candidate email or username already taken; injects collision-avoidance hash algorithm.',
                  badge: 'IdP Resilience'
                },
                {
                  id: 'HTTP_429_RATE_LIMIT',
                  title: 'Payment Gateway 429 Throttle',
                  desc: 'HDFC / Razorpay upstream rate limit; computes exponential backoff with full jitter.',
                  badge: 'Congestion Control'
                },
                {
                  id: 'TIMEOUT_IDEMPOTENCY',
                  title: 'Disbursement Timeout (SHA-256)',
                  desc: 'Network severed mid-transaction; verifies cryptographic idempotency cache to prevent double-debit.',
                  badge: 'Exactly-Once Guarantee'
                },
                {
                  id: 'HUMAN_FEEDBACK_CHANGES',
                  title: 'Human Reviewer Requested Changes',
                  desc: 'Director requests CTC or terms modification; splices revision subtasks into the active DAG.',
                  badge: 'Dynamic Replanning'
                },
                {
                  id: 'SCHEMA_DRIFT',
                  title: 'GSTIN / Invoice Schema Drift',
                  desc: 'Malformed JSON payload from vendor portal; automatically normalizes against Indian standard.',
                  badge: 'Schema Healing'
                }
              ].map((fault) => (
                <div
                  key={fault.id}
                  onClick={() => setSelectedFailureType(fault.id)}
                  className={`p-4 rounded-2xl border transition cursor-pointer space-y-1.5 ${
                    selectedFailureType === fault.id
                      ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-500/20 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{fault.title}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                      {fault.badge}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">{fault.desc}</div>
                </div>
              ))}
            </div>

            {/* Human Feedback field if selected */}
            {selectedFailureType === 'HUMAN_FEEDBACK_CHANGES' && (
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-slate-700">Director / Reviewer Feedback Input:</label>
                <input
                  type="text"
                  value={directorFeedback}
                  onChange={(e) => setDirectorFeedback(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            )}

            {/* Trigger Button */}
            <div className="flex justify-end pt-2">
              <button
                disabled={isHealing}
                onClick={handleSelfHeal}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isHealing ? 'animate-spin' : ''}`} />
                <span>{isHealing ? 'Executing Self-Healing...' : 'Simulate Fault & Run Self-Healing'}</span>
              </button>
            </div>
          </div>

          {/* Self-Healing Result Comparison */}
          {healResult && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Central Planner Recovery Algorithmic Action
                    </h3>
                    <p className="text-xs text-slate-500">
                      Pipeline repaired in {healResult.selfHealingLatencyMs}ms. Status: <strong className="text-emerald-700">{healResult.replanStatus}</strong>.
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">
                  Tasks Healed: {healResult.originalTaskCount} → {healResult.healedTaskCount}
                </span>
              </div>

              {/* Strategy Card */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-700" />
                  <span>Algorithmic Mitigation Applied:</span>
                </div>
                <div className="text-xs text-amber-950 font-medium">
                  {healResult.recoveryStrategy}
                </div>
                <div className="text-[11px] font-mono text-amber-800 pt-1 border-t border-amber-200">
                  {healResult.auditAction}
                </div>
              </div>

              {/* Before vs After Task List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                <div className="space-y-2">
                  <div className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    Original DAG Tasks ({healResult.originalTaskCount})
                  </div>
                  <div className="space-y-2">
                    {healResult.originalPlan.map((t: any, i: number) => (
                      <div key={i} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                        <span className="font-bold text-slate-800">#{t.execution_order || i + 1} {t.title}</span>
                        <span className="text-[10px] text-slate-500">{t.agent_name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="font-bold text-emerald-700 uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>Self-Healed DAG Tasks ({healResult.healedTaskCount})</span>
                  </div>
                  <div className="space-y-2">
                    {healResult.healedPlan.map((t: any, i: number) => {
                      const isNew = !healResult.originalPlan.some((orig: any) => orig.task_key === t.task_key);
                      return (
                        <div
                          key={i}
                          className={`p-3 rounded-xl border flex items-center justify-between ${
                            isNew
                              ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-400 font-bold text-emerald-950'
                              : 'bg-white border-slate-200 text-slate-800'
                          }`}
                        >
                          <div>
                            <span className="font-bold">#{t.execution_order || i + 1} {t.title}</span>
                            {isNew && (
                              <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] bg-emerald-600 text-white uppercase">
                                INJECTED HEALING TASK
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500">{t.agent_name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* TAB 3: FIVE SWARMS ARCHITECTURE */}
      {activeTab === 'swarms' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-[#031338] via-[#091b4a] to-[#040f28] rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-blue-900/60">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Network className="w-5 h-5 text-cyan-400" />
                  <span>Central Planner Multi-Agent Coordination Topology</span>
                </h2>
                <p className="text-xs text-slate-300">
                  The Central Planner evaluates goals, generates deterministic acyclic DAGs, dynamically routes tasks to specialized worker swarms, and enforces statutory Indian regulations.
                </p>
              </div>

              <span className="px-3 py-1 bg-blue-500/20 text-cyan-300 text-xs font-bold rounded-full border border-cyan-400/30">
                31 Active Specialized Agents
              </span>
            </div>

            {/* 5 Swarm Detail Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Swarm 1 */}
              <div className="p-5 rounded-2xl bg-indigo-950/70 border border-indigo-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-400" />
                    <span>Employee Onboarding Swarm</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 font-bold">
                    6 Agents
                  </span>
                </div>
                <div className="text-[11px] text-slate-300">
                  Identity Intake → Aadhaar/PAN OCR → HCM Workday → Payroll EPFO Form 11 → IT Okta/Laptop Provisioning → Welcome Pack Dispatch
                </div>
                <div className="text-[10px] text-indigo-400 font-semibold pt-2 border-t border-indigo-900">
                  Shield: DPDP Act 2023 & EPFO Statutory Vault
                </div>
              </div>

              {/* Swarm 2 */}
              <div className="p-5 rounded-2xl bg-teal-950/70 border border-teal-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-teal-400" />
                    <span>Invoice Processing Swarm</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-teal-500/20 text-teal-300 font-bold">
                    6 Agents
                  </span>
                </div>
                <div className="text-[11px] text-slate-300">
                  Vendor Email Ingest → Gemini Vision OCR → Double-Deduplication Sentinel → 3-Way Coupa PO Match → SAP S/4HANA → HDFC RTGS Disbursement
                </div>
                <div className="text-[10px] text-teal-400 font-semibold pt-2 border-t border-teal-900">
                  Shield: Section 16 CGST Act & e-Invoice IRN
                </div>
              </div>

              {/* Swarm 3 */}
              <div className="p-5 rounded-2xl bg-pink-950/70 border border-pink-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-pink-300 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-pink-400" />
                    <span>Customer Resolution Swarm</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-pink-500/20 text-pink-300 font-bold">
                    6 Agents
                  </span>
                </div>
                <div className="text-[11px] text-slate-300">
                  Zendesk Ticket Ingest → Sentiment Scoring → Account History Correlation → Gemini Synthesis → Suo Motu Delay Compensation → Ticket Resolution
                </div>
                <div className="text-[10px] text-pink-400 font-semibold pt-2 border-t border-pink-900">
                  Shield: RBI DPSS.CO.PD No.629 (T+1/T+5 & ₹100/day)
                </div>
              </div>

              {/* Swarm 4 */}
              <div className="p-5 rounded-2xl bg-amber-950/70 border border-amber-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <ShoppingCart className="w-4 h-4 text-amber-400" />
                    <span>Procurement & MSME Swarm</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-bold">
                    6 Agents
                  </span>
                </div>
                <div className="text-[11px] text-slate-300">
                  Requisition Intake → Udyam Verification → GeM Catalog Search → MSME 45-Day Cap Check → Coupa PO Dispatch → 3x Penal Interest Guard
                </div>
                <div className="text-[10px] text-amber-400 font-semibold pt-2 border-t border-amber-900">
                  Shield: Section 15 & 16 MSMED Act & Sec 43B(h) IT Act
                </div>
              </div>

              {/* Swarm 5 */}
              <div className="p-5 rounded-2xl bg-blue-950/70 border border-blue-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-blue-400" />
                    <span>IT Incident & PAM Access Swarm</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300 font-bold">
                    7 Agents
                  </span>
                </div>
                <div className="text-[11px] text-slate-300">
                  Datadog Telemetry Ingest → Sev-1 Alert → CERT-In 6-Hour Countdown → Gemini Root Cause Analysis → ServiceNow Automated Runbook → Ephemeral JIT PAM → Post-Mortem
                </div>
                <div className="text-[10px] text-blue-400 font-semibold pt-2 border-t border-blue-900">
                  Shield: Section 70B(6) IT Act 2000 & 180-Day ICT Lock
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LIVE EXECUTED WORKFLOWS */}
      {activeTab === 'active_dags' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Live Executed Pipelines in Database ({activeWorkflows.length})
              </h2>
              <p className="text-xs text-slate-500">
                Workflows decomposed and dispatched by the Central Planner. Click to inspect or authorize human gates.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {activeWorkflows.map((wf) => (
              <div
                key={wf.id}
                className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">
                      {wf.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      wf.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                      wf.status === 'RUNNING' || wf.status === 'EXECUTING' ? 'bg-blue-100 text-blue-800 animate-pulse' :
                      wf.status === 'WAITING_FOR_APPROVAL' || wf.status === 'WAITING_APPROVAL' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {String(wf.status).replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-slate-400 capitalize">
                      {wf.domain?.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mt-1">
                    {wf.title}
                  </h4>
                  <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                    {wf.rawInput || 'Central Planner orchestrated workflow'}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => onNavigateWorkflow(wf.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <span>Inspect DAG & Approvals</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
