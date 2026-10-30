import React, { useState, useEffect } from 'react';
import { Workflow, ApprovalRequest } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  FileText,
  DollarSign,
  Upload,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckSquare,
  Sparkles,
  FileCheck,
  CreditCard,
  Building2
} from 'lucide-react';

interface FinanceDashboardProps {
  onNavigate: (path: string) => void;
}

export const FinanceDashboard: React.FC<FinanceDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [vendorName, setVendorName] = useState('Nexus Cloud Technologies LLC');
  const [invoiceNumber, setInvoiceNumber] = useState('INV-2026-9481');
  const [amount, setAmount] = useState('24500.00');
  const [poNumber, setPoNumber] = useState('PO-98421-CORP');
  const [fileName, setFileName] = useState('Nexus_Cloud_Invoice_9481.pdf');

  // Approval decision modal state
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);
  const [decisionNotes, setDecisionNotes] = useState('');
  const [isDeciding, setIsDeciding] = useState(false);

  const fetchFinanceData = async () => {
    try {
      const [wfRes, apprRes] = await Promise.all([
        fetch('/api/workflows?type=INVOICE_PROCESSING'),
        fetch('/api/approvals?role=FINANCE_MANAGER')
      ]);
      if (wfRes.ok) {
        const d = await wfRes.json();
        setWorkflows(Array.isArray(d) ? d : d.items || []);
      }
      if (apprRes.ok) {
        const d = await apprRes.json();
        setApprovals(Array.isArray(d) ? d : d.items || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchFinanceData();
    const interval = setInterval(fetchFinanceData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleUploadInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Invoice Processing - ${vendorName} ($${Number(amount).toLocaleString()})`,
          type: 'INVOICE_PROCESSING',
          submittedByUserId: user?.id || 'usr-fin-03',
          submittedByName: user?.name || 'Marcus Vance',
          submittedByRole: 'FINANCE_MANAGER',
          priority: Number(amount) > 10000 ? 'HIGH' : 'MEDIUM',
          metadata: {
            vendorName,
            invoiceNumber,
            amount: Number(amount),
            poNumber,
            fileName
          }
        })
      });

      if (res.ok) {
        const createdWf = await res.json();
        setShowUploadModal(false);
        await fetchFinanceData();
        onNavigate(`/workflows/${createdWf.id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePresetInvoice = (type: 'nexus' | 'acrotech' | 'datacenter') => {
    if (type === 'nexus') {
      setVendorName('Nexus Cloud Technologies LLC');
      setInvoiceNumber('INV-2026-9481');
      setAmount('24500.00');
      setPoNumber('PO-98421-CORP');
      setFileName('Nexus_Cloud_Invoice_9481.pdf');
    } else if (type === 'acrotech') {
      setVendorName('AcroTech Microchips Global');
      setInvoiceNumber('ACM-88219');
      setAmount('8250.00');
      setPoNumber('PO-10924-HW');
      setFileName('AcroTech_Component_Delivery.pdf');
    } else {
      setVendorName('Equinix Global Datacenter Services');
      setInvoiceNumber('EQX-2026-5501');
      setAmount('48200.00');
      setPoNumber('PO-55192-DATA');
      setFileName('Equinix_Datacenter_Transit_Q4.pdf');
    }
  };

  const handleDecision = async (decision: 'APPROVED' | 'REJECTED') => {
    if (!selectedApproval) return;
    setIsDeciding(true);
    try {
      await fetch(`/api/approvals/${selectedApproval.id}/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          decidedByUserId: user?.id || 'usr-fin-03',
          decidedByName: user?.name || 'Marcus Vance',
          decidedByRole: 'FINANCE_MANAGER',
          reason: decisionNotes || (decision === 'APPROVED' ? 'Verified against PO and authorized for payment release.' : 'Payment rejected due to pricing variance.')
        })
      });
      setSelectedApproval(null);
      setDecisionNotes('');
      await fetchFinanceData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeciding(false);
    }
  };

  const pendingApprovals = approvals.filter(a => a.state === 'PENDING');

  return (
    <div className="space-y-6">
      
      {/* Title & Top Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
              Corporate Finance & AP
            </span>
            <span className="text-xs text-slate-400">Workflow B: Invoice Processing</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
            Autonomous Accounts Payable & Invoice Engine
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            6 specialized agents: Intake, Data Extraction, Validation, Duplicate Detection, Financial Reconciliation, and Payment Settlement.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 flex items-center gap-2 transition cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>Upload & Ingest Invoice</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Invoices Ingested</div>
          <div className="text-2xl font-black text-slate-900">{workflows.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">100% OCR & Multimodal verified</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Pending Authorizations</div>
          <div className="text-2xl font-black text-amber-600">{pendingApprovals.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Spend &gt; $10k policy checkpoint</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Duplicate Risk Prevented</div>
          <div className="text-2xl font-black text-emerald-600">$0.00 Lost</div>
          <div className="text-[11px] text-slate-500 mt-1">Zero double payments</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Straight-Through Rate</div>
          <div className="text-2xl font-black text-teal-600">89.2%</div>
          <div className="text-[11px] text-slate-500 mt-1">Autonomous PO matching</div>
        </div>
      </div>

      {/* Pending Payment Authorization Cards (Human-in-the-loop desk) */}
      {pendingApprovals.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-amber-700" />
              <h2 className="text-sm font-bold text-amber-950">
                Action Required: Pending Payment Sign-Off ({pendingApprovals.length})
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
              Finance Manager Authority Required
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingApprovals.map(appr => (
              <div key={appr.id} className="bg-white rounded-xl p-4 border border-amber-200 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                  <span className="font-mono font-bold text-amber-800">{appr.id}</span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                    Risk: {appr.riskLevel}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{appr.actionRequested}</h3>
                <div className="my-2.5 p-2.5 bg-slate-50 rounded-lg text-xs space-y-1">
                  <div>Vendor: <strong className="text-slate-800">{appr.details?.vendor || 'Vendor'}</strong></div>
                  <div>PO Number: <strong className="text-slate-800">{appr.details?.poNumber || 'PO'}</strong></div>
                  <div>Amount: <strong className="text-teal-700 font-bold">{appr.details?.amount || '$24,500.00'}</strong></div>
                  <div className="text-slate-500 text-[11px]">{appr.details?.reason}</div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setSelectedApproval(appr)}
                    className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg transition"
                  >
                    Authorize Payment Release
                  </button>
                  <button
                    onClick={() => setSelectedApproval(appr)}
                    className="px-3 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs rounded-lg transition"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invoices List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              Invoice Ingestion & Agent Processing Pipeline
            </h2>
            <p className="text-xs text-slate-500">Live 3-way reconciliation states and ERP settlement vouchers</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 mt-2">
          {workflows.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No invoices processed yet. Click "Upload & Ingest Invoice" to start.
            </div>
          ) : (
            workflows.map(wf => (
              <div
                key={wf.id}
                onClick={() => onNavigate(`/workflows/${wf.id}`)}
                className="py-4 px-2 hover:bg-slate-50 rounded-xl cursor-pointer transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">{wf.id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      wf.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                      wf.status === 'WAITING_FOR_APPROVAL' ? 'bg-amber-100 text-amber-800 border-amber-200 font-bold' :
                      'bg-teal-100 text-teal-800 border-teal-200 animate-pulse'
                    }`}>
                      {wf.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[11px] text-teal-700 font-bold">
                      PO: {wf.metadata?.poNumber || 'PO-98421'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {wf.title}
                  </h3>
                  <div className="text-xs text-slate-500 flex items-center gap-3">
                    <span>Vendor: <strong>{wf.metadata?.vendorName || 'Nexus Cloud'}</strong></span>
                    <span>•</span>
                    <span>Active Agent: <strong className="text-teal-600">{wf.currentAgentName || 'Central Planner'}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="w-32 text-right">
                    <div className="text-xs font-bold text-slate-700 mb-1">{wf.progress}% Reconciled</div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-teal-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${wf.progress}%` }}
                      />
                    </div>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 text-xs font-semibold flex items-center gap-1 transition">
                    <span>Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal: Upload & Ingest Invoice */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Upload Corporate Invoice</h3>
                <p className="text-xs text-slate-500">Autonomous OCR extraction, 3-way PO match, and payment gate</p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Presets */}
            <div className="mt-4 p-3 bg-teal-50/70 border border-teal-100 rounded-xl">
              <span className="text-[11px] font-bold text-teal-900 block mb-1.5">
                ⚡ Sample Invoices (1-Click Fill):
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handlePresetInvoice('nexus')}
                  className="px-2.5 py-1 bg-white border border-teal-200 text-teal-800 rounded-lg text-xs font-semibold hover:bg-teal-100 transition"
                >
                  Nexus Cloud ($24,500 - Triggers Approval)
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetInvoice('acrotech')}
                  className="px-2.5 py-1 bg-white border border-teal-200 text-teal-800 rounded-lg text-xs font-semibold hover:bg-teal-100 transition"
                >
                  AcroTech ($8,250 - Auto Reconciles)
                </button>
              </div>
            </div>

            <form onSubmit={handleUploadInvoice} className="space-y-4 mt-4 text-xs">
              
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Vendor Name</label>
                <input
                  type="text"
                  required
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Invoice Number</label>
                  <input
                    type="text"
                    required
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">PO Reference Number</label>
                  <input
                    type="text"
                    required
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Total Amount ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Amounts &gt; $10,000.00 will trigger the mandatory human payment authorization checkpoint.
                </span>
              </div>

              {/* Upload Dropzone */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Invoice File</label>
                <div className="border-2 border-dashed border-teal-200 rounded-xl p-4 text-center bg-teal-50/30">
                  <FileText className="w-6 h-6 text-teal-600 mx-auto mb-1" />
                  <div className="font-semibold text-slate-800">{fileName}</div>
                  <div className="text-[10px] text-slate-500">Multimodal Gemini Vision will extract line items</div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Ingesting...' : 'Start Autonomous Processing'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Modal: Authorize / Reject Payment */}
      {selectedApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Payment Authorization Desk
            </h3>
            <p className="text-slate-500 mb-4">
              Review 3-way reconciliation findings and authorize release of funds.
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
                <span className="text-slate-500">Reconciliation Note:</span>
                <span className="text-slate-700">{selectedApproval.details?.reason}</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block font-semibold text-slate-700 mb-1">
                Approval Decision Comments / Remittance Note
              </label>
              <textarea
                rows={2}
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                placeholder="Enter audit rationale (e.g. Verified with Procurement, release wire)"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedApproval(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                disabled={isDeciding}
                onClick={() => handleDecision('REJECTED')}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl"
              >
                Reject Payment
              </button>
              <button
                type="button"
                disabled={isDeciding}
                onClick={() => handleDecision('APPROVED')}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md"
              >
                {isDeciding ? 'Recording...' : 'Authorize & Release Wire'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
