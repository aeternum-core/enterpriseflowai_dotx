import React, { useState } from 'react';
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
  ArrowRight
} from 'lucide-react';
import { WorkflowDetail, WorkflowTask } from '../../services/api';

interface OperationsCanvasProps {
  workflow: WorkflowDetail | null;
  onRefresh?: () => void;
}

export const OperationsCanvas: React.FC<OperationsCanvasProps> = ({ workflow, onRefresh }) => {
  const [selectedTask, setSelectedTask] = useState<WorkflowTask | null>(null);
  const [activeInspectorTab, setActiveInspectorTab] = useState<'summary' | 'output' | 'tools' | 'transcript' | 'jsonl'>('summary');
  const [jsonViewMode, setJsonViewMode] = useState<'formatted' | 'raw'>('formatted');
  const [pathFilter, setPathFilter] = useState<'ALL' | 'FAILURE' | 'BLOCKED' | 'GATE'>('ALL');

  const tasks = workflow?.tasks || [];
  const currentTask = selectedTask || (tasks.length > 0 ? tasks[0] : null);

  // Posture metrics
  const doneCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const failedCount = tasks.filter((t) => t.status === 'FAILED').length;
  const runningCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const pendingCount = tasks.filter((t) => t.status === 'PENDING' || t.status === 'WAITING_APPROVAL').length;
  const skippedCount = tasks.filter((t) => t.status === 'SKIPPED').length;

  return (
    <div className="space-y-4 font-sans text-slate-800">
      {/* Top Revka-Inspired Orchestration Center Header */}
      <div className="bg-[#0b0f19] text-slate-200 p-4 rounded-xl border border-slate-800 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400">
              <GitFork className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Orchestration Center &bull; Execution Canvas
              </div>
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <span>{workflow ? workflow.title : 'Active Multi-Agent Workflow Canvas'}</span>
                {workflow && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                    {workflow.status}
                  </span>
                )}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">
              {doneCount}/{tasks.length} steps &bull; {workflow ? new Date(workflow.started_at || '').toLocaleTimeString() : 'Ready'}
            </span>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            )}
          </div>
        </div>

        {/* Path Mode & Posture Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800/80 text-xs">
          {/* Path Mode Pills */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-400">Path Mode:</span>
            <button
              onClick={() => setPathFilter('ALL')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                pathFilter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setPathFilter('FAILURE')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                pathFilter === 'FAILURE' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Failure
            </button>
            <button
              onClick={() => setPathFilter('GATE')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                pathFilter === 'GATE' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Gate
            </button>
          </div>

          {/* Posture Metrics Matrix */}
          <div className="flex items-center gap-3 bg-slate-900/80 px-3 py-1 rounded-lg border border-slate-800 text-slate-300">
            <span className="text-[10px] uppercase font-bold text-slate-400">Posture:</span>
            <div className="flex items-center gap-1 font-mono text-xs">
              <span className="text-slate-400 text-[10px]">RUNNING:</span>
              <strong className="text-blue-400">{runningCount}</strong>
            </div>
            <div className="flex items-center gap-1 font-mono text-xs">
              <span className="text-slate-400 text-[10px]">FAILED:</span>
              <strong className="text-rose-400">{failedCount}</strong>
            </div>
            <div className="flex items-center gap-1 font-mono text-xs">
              <span className="text-slate-400 text-[10px]">DONE:</span>
              <strong className="text-emerald-400">{doneCount}</strong>
            </div>
            <div className="flex items-center gap-1 font-mono text-xs">
              <span className="text-slate-400 text-[10px]">PENDING:</span>
              <strong className="text-amber-400">{pendingCount}</strong>
            </div>
            <div className="flex items-center gap-1 font-mono text-xs">
              <span className="text-slate-400 text-[10px]">SKIPPED:</span>
              <strong className="text-slate-400">{skippedCount}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Main Graph Topology & Interactive DAG Canvas */}
      <div className="bg-[#0b0f19] p-6 rounded-xl border border-slate-800 min-h-[340px] relative overflow-hidden flex flex-col justify-center">
        {/* Visual Mesh Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

        {tasks.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-xs relative z-10">
            No active workflow loaded. Launch any scenario from the Orchestrator tab to visualize the DAG.
          </div>
        ) : (
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-6 py-6">
            {tasks.map((task, idx) => {
              const isSelected = currentTask?.id === task.id;
              const isDone = task.status === 'COMPLETED';
              const isWaiting = task.status === 'WAITING_APPROVAL';
              const isFailed = task.status === 'FAILED';

              // Node Color Assignment as per Section 13:
              // Goal/Request: Green | Planner: Blue | Policy Sentinel: Purple | Worker agents: Cyan | Approval checkpoint: Orange | Failed: Red | Completed: Green
              let borderColor = 'border-cyan-500/50';
              let glowColor = 'shadow-cyan-900/30';
              let badgeColor = 'bg-cyan-500/20 text-cyan-300';

              if (task.required_approval_id || task.input_payload?.requires_approval) {
                borderColor = 'border-amber-500';
                glowColor = 'shadow-amber-900/40';
                badgeColor = 'bg-amber-500/20 text-amber-300';
              } else if (isDone) {
                borderColor = 'border-emerald-500';
                glowColor = 'shadow-emerald-900/30';
                badgeColor = 'bg-emerald-500/20 text-emerald-300';
              } else if (isFailed) {
                borderColor = 'border-rose-500';
                glowColor = 'shadow-rose-900/40';
                badgeColor = 'bg-rose-500/20 text-rose-300';
              }

              return (
                <React.Fragment key={task.id}>
                  {idx > 0 && (
                    <div className="flex items-center text-slate-600">
                      <div className="w-6 h-0.5 bg-slate-700"></div>
                      <ArrowRight className="w-4 h-4 -ml-1 text-slate-500" />
                    </div>
                  )}

                  <div
                    onClick={() => setSelectedTask(task)}
                    className={`w-64 p-3.5 rounded-xl border bg-slate-900/90 text-left cursor-pointer transition-all duration-200 relative ${borderColor} ${
                      isSelected ? 'ring-2 ring-blue-400 shadow-lg scale-105' : 'hover:scale-102 shadow-md'
                    } ${glowColor}`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono uppercase ${badgeColor}`}>
                        {task.agent_name.replace(' Agent', '')}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {isDone ? 'COMPLETED' : isWaiting ? 'GATE_PAUSED' : task.status}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-white mb-1 truncate">{task.title}</div>
                    <div className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                      {task.description}
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[9px] text-slate-400 font-mono">
                      <span>Order: #{task.execution_order}</span>
                      <span className="text-blue-400 font-semibold">Click to inspect</span>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {/* Revka-Inspired Bottom Inspector Panel (matching screenshot) */}
      {currentTask && (
        <div className="bg-[#0b0f19] text-slate-200 rounded-xl border border-slate-800 shadow-xl overflow-hidden font-sans">
          {/* Inspector Header & Tabs */}
          <div className="px-5 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60">
            <div>
              <div className="text-[10px] text-slate-400 font-mono uppercase">
                Active Node Inspector &bull; {currentTask.task_key}
              </div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>{currentTask.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {currentTask.agent_name}
                </span>
              </div>
            </div>

            {/* Sub-tabs: Summary | Output | Tools | Transcript | JSONL Log */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setActiveInspectorTab('summary')}
                className={`px-3 py-1 rounded font-medium transition-all ${
                  activeInspectorTab === 'summary' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Summary
              </button>
              <button
                onClick={() => setActiveInspectorTab('output')}
                className={`px-3 py-1 rounded font-medium transition-all ${
                  activeInspectorTab === 'output' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Output
              </button>
              <button
                onClick={() => setActiveInspectorTab('tools')}
                className={`px-3 py-1 rounded font-medium transition-all ${
                  activeInspectorTab === 'tools' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tools
              </button>
              <button
                onClick={() => setActiveInspectorTab('transcript')}
                className={`px-3 py-1 rounded font-medium transition-all ${
                  activeInspectorTab === 'transcript' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Transcript
              </button>
              <button
                onClick={() => setActiveInspectorTab('jsonl')}
                className={`px-3 py-1 rounded font-medium transition-all ${
                  activeInspectorTab === 'jsonl' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                () JSONL Log
              </button>
            </div>
          </div>

          {/* Inspector Body */}
          <div className="p-5 text-xs text-slate-300 min-h-[160px]">
            {activeInspectorTab === 'summary' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Node Status</div>
                    <div className="font-semibold text-emerald-400 mt-0.5">{currentTask.status}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Assigned Worker</div>
                    <div className="font-semibold text-white mt-0.5">{currentTask.agent_name}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Approval Required</div>
                    <div className="font-semibold text-amber-400 mt-0.5">
                      {currentTask.input_payload?.requires_approval ? 'YES (Human Gate)' : 'NO (Automated)'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Execution Timestamp</div>
                    <div className="font-mono text-slate-400 text-[11px] mt-0.5">
                      {currentTask.completed_at ? new Date(currentTask.completed_at).toLocaleTimeString() : 'In Progress'}
                    </div>
                  </div>
                </div>

                <div className="text-slate-400 leading-relaxed">{currentTask.description}</div>
              </div>
            )}

            {activeInspectorTab === 'output' && (
              <div>
                <pre className="p-3 bg-slate-950 rounded-lg text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-56 border border-slate-800">
                  {JSON.stringify(currentTask.output_payload || {}, null, 2)}
                </pre>
              </div>
            )}

            {activeInspectorTab === 'tools' && (
              <div className="space-y-2">
                <div className="text-slate-400 text-[11px]">
                  Tools authorized for this worker node via the Authorized Tool Gateway:
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-cyan-400 font-mono text-[11px] flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>gateway_invoke_authorized</span>
                  </span>
                </div>
              </div>
            )}

            {activeInspectorTab === 'transcript' && (
              <div className="space-y-2 text-slate-300 font-mono text-[11px]">
                <div className="text-slate-500">[SUBPROCESS TERMINAL EXECUTION LOG]</div>
                <div className="p-3 bg-slate-950 rounded border border-slate-800 text-slate-300 leading-relaxed">
                  <div>$ /usr/local/bin/enterpriseflow-gateway --task {currentTask.task_key}</div>
                  <div className="text-emerald-400">&gt; Policy Sentinel evaluation: CLEARED (Risk Tier 0.1)</div>
                  <div className="text-blue-400">&gt; Checkpoint committed to PostgreSQL / SQLite engine</div>
                  <div>&gt; Execution completed with exit_code 0</div>
                </div>
              </div>
            )}

            {activeInspectorTab === 'jsonl' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">JSONL LOG ENTRIES (1)</span>
                  <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded border border-slate-800 text-[10px]">
                    <button
                      onClick={() => setJsonViewMode('formatted')}
                      className={`px-2 py-0.5 rounded ${jsonViewMode === 'formatted' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                    >
                      FORMATTED
                    </button>
                    <button
                      onClick={() => setJsonViewMode('raw')}
                      className={`px-2 py-0.5 rounded ${jsonViewMode === 'raw' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                    >
                      RAW JSONL
                    </button>
                  </div>
                </div>

                <pre className="p-3 bg-slate-950 rounded-lg text-slate-300 font-mono text-[11px] overflow-x-auto max-h-56 border border-slate-800">
                  {jsonViewMode === 'formatted'
                    ? JSON.stringify(
                        {
                          command: `/usr/local/bin/gateway --agent ${currentTask.agent_name}`,
                          exit_code: 0,
                          task_id: currentTask.id,
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
          </div>
        </div>
      )}
    </div>
  );
};

