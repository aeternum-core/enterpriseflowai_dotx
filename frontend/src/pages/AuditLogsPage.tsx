import React, { useState, useEffect } from 'react';
import { AuditLog, InteractionLog } from '../types';
import {
  FileSpreadsheet,
  Clock,
  Search,
  Filter,
  Download,
  ShieldCheck,
  Cpu,
  User,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export const AuditLogsPage: React.FC<{ onNavigateWorkflow: (id: string) => void }> = ({ onNavigateWorkflow }) => {
  const [activeTab, setActiveTab] = useState<'AUDIT' | 'INTERACTION'>('AUDIT');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [interactionLogs, setInteractionLogs] = useState<InteractionLog[]>([]);
  const [search, setSearch] = useState('');
  const [selectedActorType, setSelectedActorType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedEventType, setSelectedEventType] = useState<string>('ALL');

  const fetchLogs = async () => {
    try {
      const [auditRes, intRes] = await Promise.all([
        fetch('/api/audit-logs'),
        fetch('/api/interaction-logs')
      ]);
      if (auditRes.ok) {
        const d = await auditRes.json();
        setAuditLogs(Array.isArray(d) ? d : d.events || d.items || []);
      }
      if (intRes.ok) {
        const d = await intRes.json();
        setInteractionLogs(Array.isArray(d) ? d : d.items || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 4000);
    return () => clearInterval(interval);
  }, []);

  const filteredAudit = auditLogs.filter(log => {
    const s = search.toLowerCase();
    const matchesSearch = (log.description || '').toLowerCase().includes(s) ||
      (log.actorName || '').toLowerCase().includes(s) ||
      (log.workflowId && log.workflowId.toLowerCase().includes(s));
    const matchesActor = selectedActorType === 'ALL' || log.actorType === selectedActorType;
    const matchesStatus = selectedStatus === 'ALL' || log.status === selectedStatus;
    const matchesEvent = selectedEventType === 'ALL' || log.eventType === selectedEventType;
    return Boolean(matchesSearch && matchesActor && matchesStatus && matchesEvent);
  });

  const filteredInteraction = interactionLogs.filter(log => {
    const s = search.toLowerCase();
    return (log.action || '').toLowerCase().includes(s) ||
      (log.userName && log.userName.toLowerCase().includes(s)) ||
      (log.workflowId && log.workflowId.toLowerCase().includes(s));
  });

  const handleExportJSON = () => {
    const dataToExport = activeTab === 'AUDIT' ? filteredAudit : filteredInteraction;
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enterpriseflow_${activeTab.toLowerCase()}_logs.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              SOC2 & ISO27001 Compliance
            </span>
            <span className="text-xs text-slate-400">Section 8: Immutable Ledger</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Interaction History & System Audit Trails
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full recording of all user actions, Central Planner decisions, specialized agent handoffs, and approval decisions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export {activeTab === 'AUDIT' ? 'Audit Logs' : 'Interactions'} (JSON)</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'AUDIT' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>System Audit Logs ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('INTERACTION')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'INTERACTION' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <User className="w-4 h-4" />
          <span>User Interaction History ({interactionLogs.length})</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search logs by keyword, actor, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter Dropdowns for Audit Tab */}
        {activeTab === 'AUDIT' && (
          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
            <select
              value={selectedActorType}
              onChange={(e) => setSelectedActorType(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none"
            >
              <option value="ALL">All Actors</option>
              <option value="USER">User Actions</option>
              <option value="PLANNER">Planner Agent</option>
              <option value="AGENT">Specialized Agents</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">Success</option>
              <option value="WARNING">Warning</option>
              <option value="FAILURE">Failure</option>
              <option value="INFO">Info</option>
            </select>
          </div>
        )}

      </div>

      {/* Table: Audit Logs */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="divide-y divide-slate-100 text-xs">
            {filteredAudit.length === 0 ? (
              <div className="py-16 text-center text-slate-400">No audit log records found.</div>
            ) : (
              filteredAudit.map(log => (
                <div key={log.id} className="p-4 hover:bg-slate-50/70 transition space-y-1.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400 font-bold">{log.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        log.actorType === 'PLANNER' ? 'bg-cyan-100 text-cyan-800' :
                        log.actorType === 'AGENT' ? 'bg-indigo-100 text-indigo-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {log.actorType}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' :
                        log.status === 'WARNING' ? 'bg-amber-100 text-amber-800' :
                        log.status === 'FAILURE' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {log.status}
                      </span>
                      <span className="font-mono font-semibold text-slate-600">[{log.eventType}]</span>
                    </div>

                    <span className="text-slate-400 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-slate-800 font-medium">
                    {log.description}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                    <div className="flex items-center gap-3">
                      <span>Actor: <strong className="text-slate-700">{log.actorName}</strong></span>
                      {log.workflowId && (
                        <button
                          onClick={() => onNavigateWorkflow(log.workflowId!)}
                          className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <span>Workflow: {log.workflowId}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Table: User Interaction Logs */}
      {activeTab === 'INTERACTION' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="divide-y divide-slate-100 text-xs">
            {filteredInteraction.length === 0 ? (
              <div className="py-16 text-center text-slate-400">No user interaction logs found.</div>
            ) : (
              filteredInteraction.map(log => (
                <div key={log.id} className="p-4 hover:bg-slate-50/70 transition space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400 font-bold">{log.id}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {log.action}
                      </span>
                      <span className="font-semibold text-slate-800">
                        {log.userName || 'Anonymous User'} ({log.userRole?.replace('_', ' ') || 'Guest'})
                      </span>
                    </div>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>

                  {log.details && (
                    <div className="text-slate-600 text-[11px]">
                      {JSON.stringify(log.details)}
                    </div>
                  )}

                  {log.workflowId && (
                    <div className="pt-1">
                      <button
                        onClick={() => onNavigateWorkflow(log.workflowId!)}
                        className="text-blue-600 hover:underline text-[11px] font-semibold"
                      >
                        Associated Workflow: {log.workflowId} →
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
};
