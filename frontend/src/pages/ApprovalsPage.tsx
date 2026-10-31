import React, { useState, useEffect } from 'react';
import { ApprovalRequest, ApprovalState } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  ShieldAlert,
  ArrowRight,
  Filter,
  Search,
  Building,
  Key,
  DollarSign,
  Cpu
} from 'lucide-react';

interface ApprovalsPageProps {
  onNavigateWorkflow: (id: string) => void;
}

export const ApprovalsPage: React.FC<ApprovalsPageProps> = ({ onNavigateWorkflow }) => {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);
  const [decisionNotes, setDecisionNotes] = useState('');
  const [isDeciding, setIsDeciding] = useState(false);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'DECIDED'>('PENDING');

  const fetchApprovals = async () => {
    try {
      const res = await fetch('/api/approvals');
      if (res.ok) {
        const d = await res.json();
        setApprovals(Array.isArray(d) ? d : d.items || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchApprovals();
    const interval = setInterval(fetchApprovals, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleDecision = async (decision: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED') => {
    if (!selectedApproval) return;
    setIsDeciding(true);
    try {
      await fetch(`/api/approvals/${selectedApproval.id}/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          decidedByUserId: user?.id || 'usr-admin-01',
          decidedByName: user?.name || 'Administrator',
          decidedByRole: user?.role || 'ADMIN',
          reason: decisionNotes || (decision === 'APPROVED' ? 'Human authorization granted.' : decision === 'REJECTED' ? 'Policy violation / unauthorized action.' : 'Changes requested.')
        })
      });
      setSelectedApproval(null);
      setDecisionNotes('');
      await fetchApprovals();
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeciding(false);
    }
  };

  const pendingList = approvals.filter(a => a.state === 'PENDING');
  const decidedList = approvals.filter(a => a.state !== 'PENDING');

  const currentList = activeTab === 'PENDING' ? pendingList : decidedList;

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'CRITICAL': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'HIGH': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'MEDIUM': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStateBadge = (state: ApprovalState) => {
    switch (state) {
      case 'APPROVED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'REJECTED': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'CHANGES_REQUESTED': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-amber-100 text-amber-800 border-amber-200 animate-pulse';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
              Governance & Safety Gate
            </span>
            <span className="text-xs text-slate-400">Human-in-the-Loop Protocol</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Executive Approvals Desk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Backend enforced authorization for privileged IT access, high-value payments, and high-impact actions.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'PENDING' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Pending Checkpoints</span>
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px]">
              {pendingList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('DECIDED')}
            className={`px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'DECIDED' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>History / Audit ({decidedList.length})</span>
          </button>
        </div>
      </div>

      {/* Main Approvals List */}
      <div className="space-y-4">
        {currentList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
            {activeTab === 'PENDING' ? 'No pending approval requests. All agent workflows are healthy.' : 'No decided approvals recorded yet.'}
          </div>
        ) : (
          currentList.map(appr => (
            <div
              key={appr.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs font-bold text-slate-400">{appr.id}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStateBadge(appr.state || (appr as any).status)}`}>
                    {String(appr.state || (appr as any).status || 'PENDING').replace(/_/g, ' ')}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRiskBadge(appr.riskLevel || (appr as any).risk_level)}`}>
                    Risk: {appr.riskLevel || (appr as any).risk_level || 'LOW'}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">
                    Authorized Role: <strong className="text-slate-800">{String(appr.approverRoleRequired || (appr as any).required_role || 'OPERATOR').replace(/_/g, ' ')}</strong>
                  </span>
                </div>

                <span className="text-[11px] text-slate-400 font-mono">
                  Requested: {appr.createdAt ? new Date(appr.createdAt).toLocaleString() : 'N/A'}
                </span>
              </div>

              {/* Action and Details */}
              <div className="my-4 space-y-2">
                <h3 className="text-base font-bold text-slate-900">
                  {appr.actionRequested}
                </h3>
                <p className="text-xs text-slate-600">
                  Requested by agent: <strong className="text-blue-600">{appr.requestedByAgent}</strong>
                </p>

                {/* Structured Payload Context */}
                {appr.details && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    {Object.entries(appr.details).map(([k, v]) => (
                      <div key={k} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-slate-500 capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>
                        <span className="font-semibold text-slate-800 text-right">
                          {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Audit Rationale if decided */}
                {appr.decidedAt && (
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-0.5">
                    <div className="font-bold text-emerald-900">
                      Decision: {appr.state} by {appr.approverName || 'Authorized Approver'}
                    </div>
                    <div className="text-emerald-800">{appr.decisionReason}</div>
                    <div className="text-[10px] text-slate-400">Timestamp: {new Date(appr.decidedAt).toLocaleString()}</div>
                  </div>
                )}
              </div>

              {/* Card Footer Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 flex-wrap gap-3">
                <button
                  onClick={() => onNavigateWorkflow(appr.workflowId)}
                  className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1"
                >
                  <span>View Associated Workflow ({appr.workflowId})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {appr.state === 'PENDING' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedApproval(appr)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                    >
                      Authorize / Review Decision Desk
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Decision Modal */}
      {selectedApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Human Authorization Decision Gate
            </h3>
            <p className="text-slate-500 mb-4">
              Your decision is cryptographically logged in the immutable audit ledger.
            </p>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 mb-4 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Action:</span>
                <span className="font-bold text-slate-900">{selectedApproval.actionRequested}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Risk Assessment:</span>
                <span className="font-bold text-amber-700">{selectedApproval.riskLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Approver Role:</span>
                <span className="font-bold text-blue-700">{String(selectedApproval.approverRoleRequired || (selectedApproval as any).required_role || 'OPERATOR').replace(/_/g, ' ')}</span>
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
                placeholder="Enter audit notes (e.g. Verified compliance, authorized release)"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 flex-wrap">
              <button
                type="button"
                onClick={() => setSelectedApproval(null)}
                className="px-3 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeciding}
                onClick={() => handleDecision('CHANGES_REQUESTED')}
                className="px-3 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 font-bold rounded-xl"
              >
                Request Changes
              </button>
              <button
                type="button"
                disabled={isDeciding}
                onClick={() => handleDecision('REJECTED')}
                className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl"
              >
                Reject
              </button>
              <button
                type="button"
                disabled={isDeciding}
                onClick={() => handleDecision('APPROVED')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md"
              >
                {isDeciding ? 'Recording...' : 'Authorize Action'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
