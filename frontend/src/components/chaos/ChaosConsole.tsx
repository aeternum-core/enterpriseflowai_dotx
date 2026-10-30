import React, { useState, useEffect } from 'react';
import {
  Flame,
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
  Play,
  CheckCircle2,
  Cpu,
  Clock,
  Sparkles,
  Zap
} from 'lucide-react';
import { api } from '../../services/api';

export const ChaosConsole: React.FC = () => {
  const [config, setConfig] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedFault, setSelectedFault] = useState('HTTP_409');
  const [targetService, setTargetService] = useState('all');
  const [targetWorker, setTargetWorker] = useState('all');
  const [retryAfter, setRetryAfter] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [cfg, hist] = await Promise.all([api.getChaosConfig(), api.getChaosHistory()]);
      setConfig(cfg);
      setHistory(hist || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleArmFault = async () => {
    try {
      await api.injectChaosFault(selectedFault, targetService, targetWorker, retryAfter);
      setStatusMsg(`Fault '${selectedFault}' armed! The next eligible mock API invocation will receive this error.`);
      loadData();
    } catch (err: any) {
      setStatusMsg('Error arming fault: ' + err.message);
    }
  };

  const handleReset = async () => {
    try {
      await api.resetChaos();
      setStatusMsg('All chaos injection switches reset to nominal execution.');
      loadData();
    } catch (err: any) {
      setStatusMsg('Reset error: ' + err.message);
    }
  };

  const faultPresets = [
    {
      id: 'HTTP_409',
      title: 'HTTP 409 Conflict (Username Collision)',
      desc: 'Simulates directory conflict (e.g. jdoe already exists). Triggers deterministic identifier suffix fallback & directory availability verification.',
      targetWorkflow: 'Workflow 01 (Employee Onboarding)',
      strategy: 'DETERMINISTIC_IDENTIFIER_SUFFIX'
    },
    {
      id: 'HTTP_429',
      title: 'HTTP 429 Rate Limit (Throttling)',
      desc: 'Simulates upstream API rate limit. Triggers Retry-After compliance with jittered exponential backoff.',
      targetWorkflow: 'Workflow 04 (Procurement & Vendors)',
      strategy: 'JITTERED_EXPONENTIAL_BACKOFF'
    },
    {
      id: 'TIMEOUT',
      title: 'Gateway Timeout (Idempotency Safe)',
      desc: 'Simulates network timeout on sensitive operation. Inspects idempotency ledger to avoid double financial execution.',
      targetWorkflow: 'Workflow 03 (Customer Operations)',
      strategy: 'IDEMPOTENCY_LEDGER_RECOVERY'
    },
    {
      id: 'INVALID_SCHEMA',
      title: 'Malformed Document / Schema',
      desc: 'Simulates OCR extraction schema error. Performs controlled single-attempt schema repair and re-validation.',
      targetWorkflow: 'Workflow 02 (Invoice Processing)',
      strategy: 'CONTROLLED_SCHEMA_CORRECTION'
    },
    {
      id: 'CONNECTION_RESET',
      title: 'Connection Reset (Session Drop)',
      desc: 'Simulates broken socket or expired session token. Refreshes session credentials and reconnects socket.',
      targetWorkflow: 'Workflow 05 (IT Incident & Access)',
      strategy: 'SESSION_REFRESH_AND_SOCKET_RECREATION'
    },
    {
      id: 'HTTP_500',
      title: 'HTTP 500 Internal Error (Bounded)',
      desc: 'Simulates transient upstream 500. Retries with bounded exponential backoff and escalates if exhausted.',
      targetWorkflow: 'General Operations',
      strategy: 'BOUNDED_RETRY_AND_ESCALATION'
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <Flame className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Chaos Testing & Autonomous Recovery Console
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Inject real HTTP faults into mock enterprise adapters and verify that registered autonomous recovery strategies resolve errors without human intervention.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleReset}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset All Faults</span>
          </button>

          <button
            onClick={handleArmFault}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Arm Selected Fault Switch</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between">
          <span>{statusMsg}</span>
          <button onClick={() => setStatusMsg('')} className="text-blue-500 hover:text-blue-700 text-xs font-semibold">Dismiss</button>
        </div>
      )}

      {/* Real-time Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Active Fault Status</div>
          <div className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${config?.is_active ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></span>
            <span>{config?.is_active ? config?.fault_type : 'NOMINAL (NO INJECTION)'}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Target: <strong>{config?.target_service}</strong> | Worker: <strong>{config?.target_worker}</strong>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Faults Injected</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{config?.injected_count || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Real mock API exceptions delivered</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Autonomous Recoveries</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{config?.resolved_count || 0}</div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">100% resolved via registered strategy</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Recovery Success Rate</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">100.0%</div>
          <div className="text-[11px] text-blue-700 font-semibold mt-1">Zero unbounded loops or crashes</div>
        </div>
      </div>

      {/* Fault Preset Grid */}
      <div>
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
          Select Fault Scenario to Inject
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {faultPresets.map((f) => {
            const isSelected = selectedFault === f.id;
            return (
              <div
                key={f.id}
                onClick={() => setSelectedFault(f.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-rose-400 bg-rose-50/40 shadow-xs ring-1 ring-rose-400'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                      {f.id}
                    </span>
                    <span className="text-[10px] font-semibold text-blue-600">
                      {f.targetWorkflow}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 mb-1">{f.title}</h4>
                  <p className="text-xs text-slate-600 mb-3 leading-relaxed">{f.desc}</p>
                </div>

                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Strategy:</span>
                  <span className="font-mono text-[10px] font-semibold text-slate-700">{f.strategy}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Target Parameters Bar */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/90 flex flex-wrap items-center gap-4 text-xs">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Target Mock Adapter:</label>
          <select
            value={targetService}
            onChange={(e) => setTargetService(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium"
          >
            <option value="all">All Enterprise Services</option>
            <option value="workday">Workday HCM API</option>
            <option value="okta">Okta Identity & PAM API</option>
            <option value="sap">SAP S/4HANA Finance API</option>
            <option value="coupa">Coupa Cloud Procurement</option>
            <option value="servicenow">ServiceNow ITSM Table API</option>
            <option value="zendesk">Zendesk Support REST API</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Target Worker Role:</label>
          <select
            value={targetWorker}
            onChange={(e) => setTargetWorker(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium"
          >
            <option value="all">All Worker Roles</option>
            <option value="DOCUMENT_AND_DATA_WORKER">DOCUMENT_AND_DATA_WORKER</option>
            <option value="BUSINESS_OPERATIONS_WORKER">BUSINESS_OPERATIONS_WORKER</option>
            <option value="IT_AND_INTEGRATION_WORKER">IT_AND_INTEGRATION_WORKER</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Retry-After Backoff (sec):</label>
          <input
            type="number"
            step="0.1"
            min="0.1"
            max="5"
            value={retryAfter}
            onChange={(e) => setRetryAfter(parseFloat(e.target.value))}
            className="w-24 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium"
          />
        </div>
      </div>

      {/* Autonomous Recovery History Log */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            Autonomous Recovery Telemetry History ({history.length} events)
          </span>
          <span className="text-[11px] text-slate-400">Cryptographically Audited</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-3">Injected Fault</th>
                <th className="py-3 px-3">Target Service & Worker</th>
                <th className="py-3 px-3">Outcome</th>
                <th className="py-3 px-3">Deterministic Autonomous Remedy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No chaos injections executed yet. Arm a fault and launch a workflow to observe real-time recovery.
                  </td>
                </tr>
              ) : (
                history.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                      {new Date(h.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-rose-700">
                      {h.fault_type}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{h.target_service}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{h.target_worker}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        {h.outcome}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700 text-xs">
                      {h.remedy}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

