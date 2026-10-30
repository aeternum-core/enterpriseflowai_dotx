import React, { useState, useEffect } from 'react';
import { Cpu, ShieldCheck, CheckCircle2, AlertTriangle, Layers, Clock } from 'lucide-react';
import { api } from '../../services/api';

export const ToolGatewayViewer: React.FC = () => {
  const [tools, setTools] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [toolsRes, logsRes] = await Promise.all([api.listTools(), api.listToolLogs()]);
        setTools(toolsRes || []);
        setLogs(logsRes || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            <Cpu className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Authorized Enterprise Tool & API Gateway
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Agents never execute unvetted application or database operations directly. Every call is inspected for agent identity, risk policy, and Human Approval status.
        </p>
      </div>

      {/* Tools Catalog */}
      <div>
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
          Registered Enterprise Adapters & Simulated Endpoints
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((t) => (
            <div key={t.key} className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 uppercase">
                    {t.category}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      t.risk_level === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-700 border border-rose-200'
                        : t.risk_level === 'HIGH'
                        ? 'bg-amber-100 text-amber-700 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {t.risk_level} RISK
                  </span>
                </div>

                <div className="font-bold text-slate-900 text-xs mb-1">{t.name}</div>
                <div className="text-[10px] font-mono text-slate-400 mb-2">{t.key}</div>
                <p className="text-xs text-slate-600 mb-3">{t.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Backend Integration:</span>
                  <span className="font-semibold text-slate-700 text-right">{t.mock_service_name}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Simulated Service Pill:</span>
                  <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 font-semibold rounded text-[10px]">
                    SIMULATED PROTOTYPE
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Approval Required:</span>
                  <strong className={t.requires_approval ? 'text-amber-600' : 'text-slate-700'}>
                    {t.requires_approval ? 'YES (Human Gate)' : 'NO (Automated)'}
                  </strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Tool Execution Logs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            Live Tool Execution Gateway Logs ({logs.length} invocations)
          </span>
          <span className="text-[11px] text-slate-400">Idempotency & Payload Validated</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Tool Key</th>
                <th className="py-3 px-3">Agent</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Latency</th>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Service Response</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No tool execution logs recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {l.tool_key}
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {l.agent_id}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          l.status === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono">
                      {l.execution_time_ms}ms
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px]">
                      {new Date(l.created_at).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-xs truncate font-mono text-[11px]">
                      {JSON.stringify(l.response_payload)}
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

