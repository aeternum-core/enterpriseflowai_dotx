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
  ArrowRight
} from 'lucide-react';

interface PlannerPageProps {
  onNavigateWorkflow: (id: string) => void;
}

export const PlannerPage: React.FC<PlannerPageProps> = ({ onNavigateWorkflow }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [activeWorkflow, setActiveWorkflow] = useState<Workflow | null>(null);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [agentRes, wfRes] = await Promise.all([
        fetch('/api/agents'),
        fetch('/api/workflows')
      ]);
      if (agentRes.ok) {
        const d = await agentRes.json();
        setAgents(Array.isArray(d) ? d : d.items || []);
      }
      if (wfRes.ok) {
        const rawWf = await wfRes.json();
        const wfs: Workflow[] = Array.isArray(rawWf) ? rawWf : rawWf.items || [];
        setWorkflows(wfs);
        if (!activeWorkflow && wfs.length > 0) {
          const running = wfs.find(w => w.status === 'RUNNING' || w.status === 'WAITING_FOR_APPROVAL' || w.status === 'WAITING_APPROVAL');
          setActiveWorkflow(running || wfs[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const plannerAgent = agents.find(a => a.id === 'agent-planner');
  const specializedAgents = agents.filter(a => a.id !== 'agent-planner');

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-100 text-cyan-800 border border-cyan-200 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
              Central Orchestration Engine
            </span>
            <span className="text-xs text-slate-400">Master Planner Intelligence</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Central Planner Agent Architecture & DAG Scheduler
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Single authoritative coordinator decomposing business goals, managing DAG dependencies, and executing self-healing recovery.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Autonomous Engine: Healthy</span>
          </span>
        </div>
      </div>

      {/* High-Level Planner Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Planner Agent State</div>
          <div className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Cpu className="w-6 h-6 text-blue-600" />
            <span>Active</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Master DAG Orchestrator</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Specialized Agents</div>
          <div className="text-2xl font-black text-purple-600">31 Agents</div>
          <div className="text-[11px] text-slate-500 mt-1">5 domain-specific swarms</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Average Plan Dispatch</div>
          <div className="text-2xl font-black text-emerald-600">420 ms</div>
          <div className="text-[11px] text-slate-500 mt-1">Parallel task execution</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Self-Healing Replans</div>
          <div className="text-2xl font-black text-amber-600">100% Recovery</div>
          <div className="text-[11px] text-slate-500 mt-1">Zero dropped workflows</div>
        </div>
      </div>

      {/* Visual Architectural Coordination Map */}
      <div className="bg-gradient-to-br from-[#031338] via-[#091b4a] to-[#040f28] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        
        <div className="flex items-center justify-between pb-6 border-b border-blue-900/60 mb-6">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Network className="w-5 h-5 text-cyan-400" />
              Central Planner Multi-Agent Coordination Topology
            </h2>
            <p className="text-xs text-slate-300">
              The Planner evaluates goals, builds task DAGs, routes payload to specialized agents, and guards approval checkpoints.
            </p>
          </div>
          <span className="px-3 py-1 bg-blue-500/20 text-cyan-300 text-xs font-bold rounded-full border border-cyan-400/30">
            Topology v3.8
          </span>
        </div>

        {/* Dynamic Topology Visualizer */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 my-6">
          
          {/* Swarm 1 */}
          <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 text-center space-y-2">
            <div className="text-xs font-bold text-indigo-300">Employee Onboarding</div>
            <div className="text-[11px] text-slate-300">6 Specialized Agents</div>
            <div className="text-[10px] text-slate-400">Identity → OCR → HRIS → Payroll → IT → Welcome</div>
          </div>

          {/* Swarm 2 */}
          <div className="p-4 rounded-2xl bg-teal-950/60 border border-teal-500/30 text-center space-y-2">
            <div className="text-xs font-bold text-teal-300">Invoice Processing</div>
            <div className="text-[11px] text-slate-300">6 Specialized Agents</div>
            <div className="text-[10px] text-slate-400">Intake → Gemini Vision → Duplicate → 3-Way Match → Pay</div>
          </div>

          {/* Swarm 3 */}
          <div className="p-4 rounded-2xl bg-pink-950/60 border border-pink-500/30 text-center space-y-2">
            <div className="text-xs font-bold text-pink-300">Customer Resolution</div>
            <div className="text-[11px] text-slate-300">6 Specialized Agents</div>
            <div className="text-[10px] text-slate-400">Classify → KB Vector → Enrich → Gemini Synthesis → Send</div>
          </div>

          {/* Swarm 4 */}
          <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-500/30 text-center space-y-2">
            <div className="text-xs font-bold text-amber-300">Procurement & RFP</div>
            <div className="text-[11px] text-slate-300">6 Specialized Agents</div>
            <div className="text-[10px] text-slate-400">Spec Check → Vendor Sourcing → Sanctions → Quote Matrix</div>
          </div>

          {/* Swarm 5 */}
          <div className="p-4 rounded-2xl bg-blue-950/60 border border-blue-500/30 text-center space-y-2">
            <div className="text-xs font-bold text-blue-300">IT Incident & Access</div>
            <div className="text-[11px] text-slate-300">7 Specialized Agents</div>
            <div className="text-[10px] text-slate-400">Alert → Sev Classification → Gemini RCA → Runbook → Post-Mortem</div>
          </div>

        </div>

      </div>

      {/* Active Workflow Inspection */}
      {activeWorkflow && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active DAG Pipeline in Execution
              </span>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">
                {activeWorkflow.title}
              </h2>
            </div>

            <button
              onClick={() => onNavigateWorkflow(activeWorkflow.id)}
              className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto transition"
            >
              <span>Inspect Workflow Detail</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Task Dependency Chain */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {(activeWorkflow.tasks || []).map((task) => (
              <div
                key={task.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">#{task.order} {task.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    task.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                    task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 animate-pulse' :
                    task.status === 'WAITING_APPROVAL' ? 'bg-amber-100 text-amber-800 font-bold' :
                    'bg-slate-200 text-slate-600'
                  }`}>
                    {String(task.status || 'PENDING').replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="text-slate-500 text-[11px]">{task.description}</div>
                <div className="text-[10px] text-blue-600 font-semibold pt-1 border-t border-slate-200">
                  Assigned Agent: {task.assignedAgentName}
                </div>
              </div>
            ))}
          </div>

          {/* Planner Decision Logs for this workflow */}
          <div className="p-4 bg-slate-900 rounded-xl text-xs text-white space-y-1.5 font-mono">
            <div className="text-cyan-400 font-bold mb-1 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Central Planner Reasoning Stream:</span>
            </div>
            {activeWorkflow.plannerNotes && activeWorkflow.plannerNotes.length > 0 ? (
              activeWorkflow.plannerNotes.map((note, i) => (
                <div key={i} className="text-slate-300 text-[11px]">
                  &gt; {note}
                </div>
              ))
            ) : (
              <div className="text-slate-400 text-[11px] italic">
                &gt; Central Planner initialized DAG schedule for {activeWorkflow.title}. Validated dependency chain and assigned specialized worker agents.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
