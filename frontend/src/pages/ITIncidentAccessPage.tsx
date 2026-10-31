import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  Terminal,
  KeyRound,
  Radio,
  FileText,
  Lock,
  ArrowRight,
  ExternalLink,
  Zap,
  Server
} from 'lucide-react';

interface ITIncidentAccessPageProps {
  onNavigate: (path: string) => void;
}

export const ITIncidentAccessPage: React.FC<ITIncidentAccessPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'incidents' | 'pam' | 'certin_logs'>('incidents');
  const [incidents, setIncidents] = useState<any[]>([]);
  const [pamSessions, setPamSessions] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({
    totalIncidents: 3,
    activeIncidents: 2,
    activePamSessions: 1,
    certInDisclosuresFiled: 2,
    certInComplianceRate: 100.0,
    mandatoryReportingWindow: '6 Hours (Section 70B(6) IT Act 2000)',
    mandatoryLogRetention: '180 Days within Indian Jurisdiction',
    ntpSyncAuthority: 'NIC / National Physical Laboratory (NPL) Aligned'
  });
  const [isLoading, setIsLoading] = useState(false);

  // New PAM Elevation Modal
  const [showPamModal, setShowPamModal] = useState(false);
  const [isSubmittingPam, setIsSubmittingPam] = useState(false);
  const [pamEmail, setPamEmail] = useState('alex.rivera@enterpriseflow.corp');
  const [pamCluster, setPamCluster] = useState('k8s-prod-in-west-1 (Mumbai DC)');
  const [pamDuration, setPamDuration] = useState(4);
  const [pamJustification, setPamJustification] = useState('Emergency zero-day CVE patching for auth-proxy container crash loops');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [iRes, pRes, mRes] = await Promise.all([
        fetch('/api/it-incident/incidents'),
        fetch('/api/it-incident/pam-sessions'),
        fetch('/api/it-incident/metrics')
      ]);
      if (iRes.ok) {
        const d = await iRes.json();
        setIncidents(d.items || []);
      }
      if (pRes.ok) {
        const d = await pRes.json();
        setPamSessions(d.items || []);
      }
      if (mRes.ok) {
        setMetrics(await mRes.json());
      }
    } catch (e) {
      console.error('Failed to load IT incident data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleReportCertIn = async (incidentId: string) => {
    try {
      const res = await fetch('/api/it-incident/report-certin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentId,
          incidentSummary: 'Mandatory cybersecurity incident disclosure filed under Section 70B(6) IT Act 2000.',
          affectedSystems: 'Production Cluster k8s-prod-in-west-1 (Mumbai DC)'
        })
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemediate = async (incidentId: string) => {
    try {
      const res = await fetch('/api/it-incident/remediate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentId,
          serviceAction: 'Cycled connection pool and restarted container pods via ServiceNow table API'
        })
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleElevatePam = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingPam(true);
    try {
      const res = await fetch('/api/it-incident/elevate-pam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: pamEmail,
          targetCluster: pamCluster,
          durationHours: pamDuration,
          justification: pamJustification,
          mfaToken: 'FIDO2_YUBIKEY_VERIFIED'
        })
      });
      if (res.ok) {
        setShowPamModal(false);
        await fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingPam(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Banner */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              IT Incident & CERT-In Access Governance
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              CERT-In 6-Hour Reporting Mandate
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
              CyberArk / Okta PAM JIT
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Emergency response console tracking Section 70B(6) IT Act 2000 mandatory 6-hour CERT-In disclosure, 180-day ICT immutable logs, NIC/NPL NTP clock synchronization, and ephemeral JIT access.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPamModal(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>Request JIT PAM Elevation</span>
          </button>
          <button
            onClick={fetchData}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4 Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Active Incidents</div>
          <div className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <span>{metrics.activeIncidents}</span>
            <span className="text-xs font-bold text-rose-600 px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200">SEV-1 / SEV-2</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Mumbai DC (k8s-prod-in-west-1)
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">CERT-In 6-Hour Countdown</div>
          <div className="text-2xl font-black text-rose-600 flex items-center gap-1.5">
            <Clock className="w-5 h-5 text-rose-500 animate-pulse" />
            <span>5h 15m</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Mandated Section 70B(6) limit
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Active JIT Privileges</div>
          <div className="text-2xl font-black text-purple-600 flex items-center gap-1.5">
            <KeyRound className="w-5 h-5 text-purple-500" />
            <span>{metrics.activePamSessions} Session</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Ephemeral 4-hour ClusterAdmin token
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">ICT Log Retention</div>
          <div className="text-2xl font-black text-emerald-600 flex items-center gap-1.5">
            <span>180 Days</span>
            <span className="text-xs font-bold text-emerald-700 px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200">Locked</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            NIC / NPL Atomic NTP Synced
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('incidents')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'incidents' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Active Incidents & CERT-In Disclosure ({incidents.length})
        </button>
        <button
          onClick={() => setActiveTab('pam')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'pam' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          CyberArk / Okta PAM JIT Sessions ({pamSessions.length})
        </button>
        <button
          onClick={() => setActiveTab('certin_logs')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'certin_logs' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          180-Day ICT Audit Trail & NPL NTP Sync
        </button>
      </div>

      {/* TAB 1: Incidents List */}
      {activeTab === 'incidents' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 text-xs">
            {incidents.map((inc) => (
              <div key={inc.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-slate-400">{inc.id}</span>
                    <span className="font-bold text-slate-800">{inc.targetSystem}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {inc.region}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      inc.severity.includes('CRITICAL') ? 'bg-rose-100 text-rose-800 border-rose-200 font-bold' :
                      'bg-amber-100 text-amber-800 border-amber-200'
                    }`}>
                      {inc.severity.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{inc.title}</h3>
                  <div className="text-slate-500 flex items-center gap-3">
                    <span>Anomaly: <strong className="text-slate-700">{inc.anomaly}</strong></span>
                    <span>&bull;</span>
                    <span>Blast Radius: <strong className="text-rose-600">{inc.blastRadius}</strong></span>
                  </div>

                  <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-200 text-blue-900 flex items-center gap-3">
                    <span className="font-bold">CERT-In Status:</span>
                    <span className="font-mono">{inc.certInReportStatus} ({inc.certInTicket})</span>
                    <span>&bull;</span>
                    <span>Deadline: <strong className="text-rose-700">Within 6 Hours (Rule 6 IT Act)</strong></span>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-2 shrink-0">
                  {inc.status !== 'RESOLVED' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReportCertIn(inc.id)}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition text-xs flex items-center gap-1 shadow-xs"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>File CERT-In Report</span>
                      </button>
                      <button
                        onClick={() => handleRemediate(inc.id)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition text-xs flex items-center gap-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Auto-Remediate (ServiceNow)</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Incident Resolved & Reported</span>
                    </div>
                  )}

                  {inc.workflowId && (
                    <button
                      onClick={() => onNavigate(`/workflows/${inc.workflowId}`)}
                      className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1 ml-auto"
                    >
                      <span>Central Planner Execution Plan</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: PAM JIT Sessions */}
      {activeTab === 'pam' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pamSessions.map((s) => (
              <div key={s.sessionId} className="p-5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl shadow-lg space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-cyan-400" />
                    <span className="font-mono text-xs font-bold text-cyan-300">{s.sessionId}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {s.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span>Authorized User:</span>
                    <strong className="text-white">{s.user}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Target Infrastructure:</span>
                    <strong className="text-white">{s.targetCluster}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Privilege Elevation:</span>
                    <strong className="text-cyan-400">{s.privilegeLevel}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Authentication Method:</span>
                    <strong className="text-amber-300">{s.mfaMethod}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Immutable Audit Vault:</span>
                    <strong className="font-mono text-[10px] text-slate-400">{s.immutableLogVault}</strong>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-800/60 rounded-xl text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Session Keystrokes Monitored</span>
                  <span className="text-emerald-400 font-bold">&bull; Live Recording Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: 180-Day ICT Audit Trail */}
      {activeTab === 'certin_logs' && (
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-600" />
                180-Day ICT Log Vault & Atomic NTP Clock Synchronization
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Compliant with Rule 6 of Cyber Security Directions under Section 70B(6) IT Act 2000.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">
              Atomic NTP: Synced with NIC / NPL
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Storage Jurisdiction</div>
              <div className="text-sm font-bold text-slate-800">Indian Sovereign Territory</div>
              <div className="text-xs text-slate-500 mt-1">Data resident strictly in Mumbai & Bengaluru data centers.</div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Clock Sync Standard</div>
              <div className="text-sm font-bold text-slate-800">NIC / NPL Atomic Standard</div>
              <div className="text-xs text-slate-500 mt-1">Zero jitter, drift bounded to &lt; 5 microseconds.</div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Retention Window</div>
              <div className="text-sm font-bold text-slate-800">180 Days Mandatory Lock</div>
              <div className="text-xs text-slate-500 mt-1">Immutable WORM (Write Once Read Many) storage.</div>
            </div>
          </div>
        </div>
      )}

      {/* PAM Elevation Modal */}
      {showPamModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Request Ephemeral JIT PAM Privileges</h3>
              <button onClick={() => setShowPamModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <form onSubmit={handleElevatePam} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Requester Identity</label>
                <input
                  type="email"
                  required
                  value={pamEmail}
                  onChange={(e) => setPamEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Production Infrastructure</label>
                <select
                  value={pamCluster}
                  onChange={(e) => setPamCluster(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold"
                >
                  <option value="k8s-prod-in-west-1 (Mumbai DC)">Production K8s Cluster (k8s-prod-in-west-1, Mumbai DC)</option>
                  <option value="db-prod-mumbai-01">PostgreSQL Primary Database (db-prod-mumbai-01)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Elevation Duration (JIT Window)</label>
                <select
                  value={pamDuration}
                  onChange={(e) => setPamDuration(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold"
                >
                  <option value="1">1 Hour (Quick Hotfix)</option>
                  <option value="4">4 Hours (Standard Ephemeral Session)</option>
                  <option value="8">8 Hours (Full Maintenance Shift)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Business & Security Justification</label>
                <textarea
                  rows={2}
                  required
                  value={pamJustification}
                  onChange={(e) => setPamJustification(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-900 text-[11px]">
                Notice: All interactive shell sessions and keystrokes will be captured and streamed to the 180-day immutable CERT-In audit vault. Requires IT Security Admin authorization.
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPamModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPam}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition disabled:opacity-50"
                >
                  {isSubmittingPam ? 'Provisioning...' : 'Submit Request to IT Security Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
