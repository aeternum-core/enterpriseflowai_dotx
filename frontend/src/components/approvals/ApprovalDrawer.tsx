import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Send,
  AlertTriangle,
  Clock,
  Shield,
  Bot,
  FileText,
  DollarSign,
  Cpu,
  Layers,
  History
} from 'lucide-react';
import { ApprovalDetail, User, api } from '../../services/api';
import { RejectModal, RequestChangesModal } from './ActionModals';

interface ApprovalDrawerProps {
  approval: ApprovalDetail | null;
  currentUser: User;
  onClose: () => void;
  onApproved: () => void;
  onRejected: () => void;
  onChangesRequested: () => void;
  onCommentAdded: () => void;
}

export const ApprovalDrawer: React.FC<ApprovalDrawerProps> = ({
  approval,
  currentUser,
  onClose,
  onApproved,
  onRejected,
  onChangesRequested,
  onCommentAdded
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'ai_plan' | 'comments' | 'audit'>('overview');
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [approving, setApproving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [changesModalOpen, setChangesModalOpen] = useState(false);

  if (!approval) return null;

  const isPending = approval.status === 'PENDING';

  // Handle Approve
  const handleApprove = async () => {
    try {
      setApproving(true);
      setErrorMsg('');
      await api.approve(approval.id, {
        user_id: currentUser.id,
        user_name: currentUser.full_name,
        user_role: currentUser.roles[0] || 'Approver',
        notes: `Authorized by ${currentUser.full_name} (${currentUser.roles[0]})`
      });
      onApproved();
    } catch (err: any) {
      setErrorMsg(err.message || 'Approval authorization failed');
    } finally {
      setApproving(false);
    }
  };

  // Handle Reject
  const handleReject = async (reason: string) => {
    try {
      setErrorMsg('');
      await api.reject(approval.id, {
        user_id: currentUser.id,
        user_name: currentUser.full_name,
        user_role: currentUser.roles[0] || 'Approver',
        reason
      });
      setRejectModalOpen(false);
      onRejected();
    } catch (err: any) {
      setErrorMsg(err.message || 'Rejection failed');
    }
  };

  // Handle Request Changes
  const handleRequestChanges = async (feedback: string) => {
    try {
      setErrorMsg('');
      await api.requestChanges(approval.id, {
        user_id: currentUser.id,
        user_name: currentUser.full_name,
        user_role: currentUser.roles[0] || 'Approver',
        feedback
      });
      setChangesModalOpen(false);
      onChangesRequested();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to request changes');
    }
  };

  // Handle Add Comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      setSubmittingComment(true);
      await api.addComment(approval.id, {
        author_name: currentUser.full_name,
        author_role: currentUser.roles[0] || 'Reviewer',
        comment_text: commentText.trim()
      });
      setCommentText('');
      onCommentAdded();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
                {approval.id}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  approval.risk_level === 'CRITICAL'
                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                    : approval.risk_level === 'HIGH'
                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                    : 'bg-blue-100 text-blue-700 border border-blue-200'
                }`}
              >
                {approval.risk_level} RISK
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  approval.status === 'APPROVED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : approval.status === 'REJECTED'
                    ? 'bg-rose-100 text-rose-800'
                    : approval.status === 'CHANGES_REQUESTED'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {approval.status}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
              {approval.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mx-6 mt-3 px-3.5 py-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg('')} className="text-rose-400 hover:text-rose-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-200 px-6 gap-6 bg-white text-xs font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Business Details
          </button>
          <button
            onClick={() => setActiveTab('ai_plan')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'ai_plan'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            AI Execution & Tools
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'comments'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Comments ({approval.comments?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'audit'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Audit History ({approval.history?.length || 0})
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Overdue Warning */}
              {approval.is_overdue && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-medium">
                    This request has passed its policy SLA deadline ({new Date(approval.due_date || '').toLocaleString()}). Priority escalation applied.
                  </span>
                </div>
              )}

              {/* Meta Grid */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Domain / Workflow</div>
                  <div className="font-semibold text-slate-800 capitalize mt-0.5">{approval.domain.replace('_', ' ')}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Required Approver Role</div>
                  <div className="font-semibold text-blue-600 mt-0.5">{approval.required_role}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Initiating Agent</div>
                  <div className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1">
                    <Bot className="w-3.5 h-3.5 text-blue-600" />
                    {approval.requested_by_agent}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Human Requester</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{approval.requesting_employee || 'System Requisition'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Department</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{approval.department}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Financial Amount</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">
                    {approval.financial_amount && approval.financial_amount > 0
                      ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: approval.currency || 'INR' }).format(approval.financial_amount)
                      : 'N/A (Access / Policy Action)'}
                  </div>
                </div>
              </div>

              {/* Business Justification */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                  Business Justification
                </h4>
                <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-700 leading-relaxed shadow-2xs">
                  {approval.business_justification}
                </div>
              </div>

              {/* Exact Proposed Action */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                  Proposed Protected Action
                </h4>
                <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200 text-emerald-950 font-mono text-[11px] leading-relaxed">
                  {approval.proposed_action}
                </div>
              </div>

              {/* Proposed Payload Inspector */}
              {approval.proposed_payload && Object.keys(approval.proposed_payload).length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                    Authorized Execution Payload (Cryptographically Bound)
                  </h4>
                  <pre className="p-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] overflow-x-auto max-h-48 border border-slate-800">
                    {JSON.stringify(approval.proposed_payload, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {activeTab === 'ai_plan' && (
            <div className="space-y-5">
              {/* AI Summary */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-2 text-blue-800 font-semibold mb-1">
                  <Bot className="w-4 h-4 text-blue-600" />
                  <span>Central Planner Execution Summary</span>
                </div>
                <div className="text-blue-900/90 leading-relaxed">
                  {approval.ai_summary || 'Task decomposed dynamically by Level 2 Orchestrator.'}
                </div>
              </div>

              {/* Risk Assessment */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                  Automated Risk Engine Assessment
                </h4>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
                  {approval.risk_assessment}
                </div>
              </div>

              {/* Tools Invoked */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Protected Tools Invoked via Gateway
                </h4>
                <div className="flex flex-wrap gap-2">
                  {approval.tools_invoked?.map((tool, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-300 font-mono text-[11px] flex items-center gap-1.5"
                    >
                      <Cpu className="w-3 h-3 text-blue-600" />
                      {tool}
                    </span>
                  )) || <span className="text-slate-400">None</span>}
                </div>
              </div>

              {/* Validation Results */}
              {approval.validation_results && (
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Pre-Approval Evidence & Validation Checks
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(approval.validation_results).map(([k, v]) => (
                      <div
                        key={k}
                        className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between"
                      >
                        <span className="text-slate-500 font-medium capitalize text-[11px]">{k.replace('_', ' ')}</span>
                        <span className="font-semibold text-slate-800 font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-100">
                          {String(v)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-4">
              <div className="space-y-3">
                {approval.comments && approval.comments.length > 0 ? (
                  approval.comments.map((c) => (
                    <div key={c.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-900">{c.author_name}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-[10px] text-blue-600 font-medium mb-1.5">{c.author_role}</div>
                      <div className="text-slate-700 leading-relaxed">{c.comment_text}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-slate-400 text-xs">No comments yet. Start the discussion below.</div>
                )}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="pt-2 border-t border-slate-200">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={`Add a comment as ${currentUser.full_name} (${currentUser.roles[0] || 'User'})...`}
                  rows={2}
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={submittingComment || !commentText.trim()}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-xs flex items-center gap-1.5 disabled:opacity-50 transition-colors"
                  >
                    <Send className="w-3 h-3" />
                    <span>Post Comment</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-3">
              <div className="text-[11px] text-slate-500 mb-2">
                All lifecycle state transitions for this approval are recorded in the SHA-256 tamper-evident chain.
              </div>
              <div className="relative pl-6 space-y-4 border-l-2 border-slate-200">
                {approval.history?.map((h) => (
                  <div key={h.id} className="relative">
                    <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-blue-600 border-2 border-white"></div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{h.action}</span>
                      <span className="text-[10px] text-slate-400">{new Date(h.created_at).toLocaleString()}</span>
                    </div>
                    <div className="text-slate-600 mt-0.5">{h.notes}</div>
                    <div className="text-[10px] text-blue-600 font-medium mt-0.5">Actor: {h.actor_name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions (Approve, Reject, Request Changes) */}
        {isPending && (
          <div className="p-4 border-t border-slate-200 bg-slate-50/90 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(true)}
                className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>

              <button
                type="button"
                onClick={() => setChangesModalOpen(true)}
                className="px-3.5 py-2 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Request Changes</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleApprove}
              disabled={approving}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{approving ? 'Authorizing...' : 'Approve & Resume'}</span>
            </button>
          </div>
        )}

        {/* Action Modals */}
        <RejectModal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          onConfirm={handleReject}
          title={approval.title}
        />

        <RequestChangesModal
          isOpen={changesModalOpen}
          onClose={() => setChangesModalOpen(false)}
          onConfirm={handleRequestChanges}
          title={approval.title}
        />
      </div>
    </>
  );
};

