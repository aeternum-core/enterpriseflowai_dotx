import React, { useState } from 'react';
import { X, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title: string;
}

export const RejectModal: React.FC<RejectModalProps> = ({ isOpen, onClose, onConfirm, title }) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 5) {
      setError('Please provide a descriptive reason (at least 5 characters).');
      return;
    }
    onConfirm(reason);
    setReason('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
          <div className="flex items-center gap-2.5 text-rose-700 font-semibold text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <span>Reject Request & Stop Execution</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          <div className="text-xs text-slate-600 mb-3">
            You are rejecting <strong className="text-slate-800">{title}</strong>. This decision is irreversible, will block the protected tool call, and will notify the Central Planner.
          </div>

          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Rejection Reason <span className="text-rose-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError('');
            }}
            placeholder="e.g. Missing budget allocation for FY26 Q4 or invalid vendor tax record..."
            rows={3}
            className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-800"
            autoFocus
          />
          {error && <div className="text-[11px] text-rose-600 font-medium mt-1">{error}</div>}

          <div className="flex justify-end gap-2.5 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
            >
              Confirm Rejection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface RequestChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (feedback: string) => void;
  title: string;
}

export const RequestChangesModal: React.FC<RequestChangesModalProps> = ({ isOpen, onClose, onConfirm, title }) => {
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback.trim().length < 5) {
      setError('Please provide detailed feedback for the agent (at least 5 characters).');
      return;
    }
    onConfirm(feedback);
    setFeedback('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
          <div className="flex items-center gap-2.5 text-amber-800 font-semibold text-sm">
            <RefreshCw className="w-5 h-5 text-amber-600" />
            <span>Request Changes & Trigger Re-Plan</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          <div className="text-xs text-slate-600 mb-3">
            Return task <strong className="text-slate-800">{title}</strong> to the responsible specialized agent. The Central Planner will ingest your feedback and re-synthesize parameters.
          </div>

          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Instructions / Required Adjustments <span className="text-amber-600">*</span>
          </label>
          <textarea
            value={feedback}
            onChange={(e) => {
              setFeedback(e.target.value);
              if (error) setError('');
            }}
            placeholder="e.g. Please negotiate a 10% volume discount or verify the revised PO number..."
            rows={3}
            className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
            autoFocus
          />
          {error && <div className="text-[11px] text-rose-600 font-medium mt-1">{error}</div>}

          <div className="flex justify-end gap-2.5 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm"
            >
              Return for Revision
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

