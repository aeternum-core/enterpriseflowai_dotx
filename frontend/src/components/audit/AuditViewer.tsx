import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  ShieldCheck,
  ShieldAlert,
  Download,
  RefreshCw,
  Hash,
  AlertTriangle,
  Lock,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api, AuditEvent, AuditVerification } from '../../services/api';

export const AuditViewer: React.FC = () => {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [verification, setVerification] = useState<AuditVerification | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState('');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.listAuditEvents();
      setEvents(res.events || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      setVerifying(true);
      const res = await api.verifyAuditChain();
      setVerification(res);
      setMessage(res.message);
    } catch (err: any) {
      setMessage('Verification failed: ' + err.message);
    } finally {
      setVerifying(false);
    }
  };

  const handleSimulateTamper = async () => {
    try {
      setMessage('Simulating unauthorized database record tampering...');
      await api.simulateTamperTest(1);
      // Immediately run verification to demonstrate detection
      const res = await api.verifyAuditChain();
      setVerification(res);
      setMessage('Tamper simulation complete! Verification detected cryptographic break in chain.');
      fetchEvents();
    } catch (err: any) {
      setMessage('Simulation error: ' + err.message);
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(events, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `enterpriseflow_audit_chain_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  useEffect(() => {
    fetchEvents();
    handleVerify();
  }, []);

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Cryptographic Tamper-Evident Audit Trail
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Append-only ledger with SHA-256 hash chaining. Every agent delegation, tool execution, and human decision is cryptographically anchored.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSimulateTamper}
            className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg flex items-center gap-1.5 transition-colors"
            title="Demonstrate Tamper Detection by modifying an event without updating SHA-256"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Simulate Tamper Test</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Report (JSON)</span>
          </button>

          <button
            onClick={handleVerify}
            disabled={verifying}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${verifying ? 'animate-spin' : ''}`} />
            <span>{verifying ? 'Verifying Chain...' : 'Verify Chain Integrity'}</span>
          </button>
        </div>
      </div>

      {/* Verification Status Card */}
      {verification && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs transition-all ${
            verification.valid
              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
              : 'bg-rose-50/80 border-rose-300 text-rose-900 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-3">
            {verification.valid ? (
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-rose-100 text-rose-700 animate-bounce">
                <ShieldAlert className="w-5 h-5 stroke-[2.2]" />
              </div>
            )}
            <div>
              <div className="font-bold text-sm">
                {verification.valid ? 'Hash Chain Integrity 100% Verified' : 'Cryptographic Tampering Detected!'}
              </div>
              <div className="text-[11px] opacity-90">{verification.message}</div>
            </div>
          </div>

          <div className="text-right font-mono text-[11px]">
            <div>Total Events: <strong>{verification.total_events}</strong></div>
            <div className="truncate max-w-xs text-[10px] text-slate-500">
              Root Hash: {verification.latest_root_hash || 'N/A'}
            </div>
          </div>
        </div>
      )}

      {/* Audit Events Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            Chained Event Log ({events.length} records)
          </span>
          <span className="text-[11px] text-slate-400">Genesis SHA-256: 000000000000...</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-16">Seq #</th>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Actor & Type</th>
                <th className="py-3 px-3">Event Type</th>
                <th className="py-3 px-3">Action Description</th>
                <th className="py-3 px-3">Result</th>
                <th className="py-3 px-3 font-mono">Current Hash (SHA-256)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading audit trail...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No audit events found.
                  </td>
                </tr>
              ) : (
                events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      #{evt.sequence_number}
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                      {new Date(evt.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{evt.actor_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{evt.actor_type}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px]">
                        {evt.event_type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700 max-w-sm truncate">
                      {evt.action_description}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          evt.execution_result === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : evt.execution_result === 'PAUSED'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {evt.execution_result}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500 max-w-xs truncate" title={evt.current_hash}>
                      {evt.current_hash.slice(0, 16)}...{evt.current_hash.slice(-8)}
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

