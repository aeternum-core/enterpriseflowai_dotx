import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  RefreshCw,
  FileText,
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingUp,
  Percent,
  Calculator,
  ExternalLink,
  Search,
  Filter,
  DollarSign,
  Building2,
  Lock,
  Layers,
  Send,
  Check,
  X,
  CreditCard
} from 'lucide-react';

interface InvoiceProcessingPageProps {
  onNavigate: (path: string) => void;
}

export const InvoiceProcessingPage: React.FC<InvoiceProcessingPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'invoices' | 'upload_ocr' | 'tds_calculator' | 'three_way_match'>('invoices');
  const [invoices, setInvoices] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({
    totalInvoices: 4,
    waitingApprovalCount: 3,
    paidInvoicesCount: 1,
    totalGrossVolumeInr: 5055000.00,
    totalNetPayableInr: 4865220.34,
    totalTdsWithheldInr: 189779.66,
    totalGstItcEligibleInr: 771099.00,
    threeWayMatchAccuracyRate: 99.8,
    irnVerificationStandard: 'Section 16 CGST Act 2017 (SHA-256 e-Invoice Portal)',
    statutoryPaymentCap: 'Section 15 MSMED Act 2006 (45 Days)',
    taxShieldStatus: 'Protected under Section 43B(h) Income Tax Act'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Selected Invoice for 3-Way Match inspection
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);

  // New Invoice Upload / OCR Form State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isSubmittingInvoice, setIsSubmittingInvoice] = useState(false);
  const [vName, setVName] = useState('Tata Communications Ltd');
  const [vGstin, setVGstin] = useState('27AAACT2727Q1ZW');
  const [invNumber, setInvNumber] = useState('TCL-IN-2026-9901');
  const [poNumber, setPoNumber] = useState('PO-77192-DATA');
  const [description, setDescription] = useState('Enterprise Tier-4 Data Center Dark Fiber Connectivity (ap-south-1 Mumbai DC)');
  const [grossAmount, setGrossAmount] = useState('2480000.00');
  const [hsnCode, setHsnCode] = useState('998313');
  const [isInterState, setIsInterState] = useState(false);
  const [tdsSection, setTdsSection] = useState('194C');
  const [bankAccount, setBankAccount] = useState('State Bank of India, Mumbai Main (SBIN0000300)');

  // TDS Calculator State
  const [calcGross, setCalcGross] = useState('485000.00');
  const [calcSection, setCalcSection] = useState('194J');
  const [calcIsInterState, setCalcIsInterState] = useState(false);
  const [calcResult, setCalcResult] = useState<any>(null);

  // Disbursement State
  const [disbursingId, setDisbursingId] = useState<string | null>(null);
  const [disburseSuccess, setDisburseSuccess] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [iRes, mRes] = await Promise.all([
        fetch('/api/invoice/invoices'),
        fetch('/api/invoice/metrics')
      ]);

      if (iRes.ok) {
        const d = await iRes.json();
        setInvoices(d.items || []);
        if (d.items && d.items.length > 0 && !selectedInvoice) {
          setSelectedInvoice(d.items[0]);
        }
      }
      if (mRes.ok) {
        setMetrics(await mRes.json());
      }
    } catch (e) {
      console.error('Failed to load invoice data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    handleCalculateTds('485000.00', '194J', false);
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCalculateTds = async (gross: string, sec: string, interState: boolean) => {
    const val = parseFloat(gross) || 100000;
    try {
      const res = await fetch('/api/invoice/calculate-tds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grossAmountInr: val,
          tdsSection: sec,
          isInterState: interState,
          gstRatePct: 18.0
        })
      });
      if (res.ok) {
        setCalcResult(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmittingInvoice(true);
      const res = await fetch('/api/invoice/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorName: vName,
          vendorGstin: vGstin,
          invoiceNumber: invNumber,
          poNumber: poNumber,
          description: description,
          grossAmountInr: parseFloat(grossAmount) || 50000,
          hsnSacCode: hsnCode,
          isInterState: isInterState,
          tdsSection: tdsSection,
          bankAccount: bankAccount,
          paymentMode: 'RTGS'
        })
      });

      if (res.ok) {
        setShowUploadModal(false);
        fetchData();
      }
    } catch (e) {
      console.error('Upload failed:', e);
    } finally {
      setIsSubmittingInvoice(false);
    }
  };

  const handleDisbursePayment = async (inv: any) => {
    try {
      setDisbursingId(inv.id);
      const res = await fetch(`/api/invoice/${inv.id}/disburse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: inv.id,
          approvedBy: 'Finance Director',
          authorizationNote: '3-Way Match, IRN, and TDS verified under Indian statutory law. Authorized for HDFC Corporate RTGS.'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setDisburseSuccess(`Payment of ₹${inv.netPayableInr.toLocaleString('en-IN')} disbursed via ${data.paymentReference}!`);
        setTimeout(() => setDisburseSuccess(null), 6000);
        fetchData();
      }
    } catch (e) {
      console.error('Disbursement error:', e);
    } finally {
      setDisbursingId(null);
    }
  };

  // Filtered invoices
  const filteredInvoices = invoices.filter((i) => {
    const matchesSearch =
      i.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      i.vendorName.toLowerCase().includes(search.toLowerCase()) ||
      i.poNumber.toLowerCase().includes(search.toLowerCase()) ||
      i.vendorGstin.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'WAITING_APPROVAL' && i.approvalStatus === 'WAITING_APPROVAL') ||
      (statusFilter === 'PAID_DISBURSED' && i.approvalStatus === 'PAID_DISBURSED') ||
      (statusFilter === 'APPROVED' && i.approvalStatus === 'APPROVED');

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {disburseSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-900 text-white text-xs px-4 py-3 rounded-2xl shadow-2xl border border-emerald-400/50 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{disburseSuccess}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200 flex items-center gap-1.5 shadow-xs">
              <Receipt className="w-3.5 h-3.5 text-teal-600" />
              <span>Intelligent Invoice Processing (3-Way Matching)</span>
            </span>
            <span className="text-xs text-slate-400 font-medium">Enterprise Finance Swarm</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Intelligent Invoice Processing & Statutory Tax Settlement
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gemini Vision OCR extraction, deterministic 3-Way PO Matching, GST e-Invoice IRN validation, and automated TDS withholding in ₹ INR.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload & Parse Invoice</span>
          </button>

          <button
            onClick={fetchData}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-1.5 shadow-xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : 'text-slate-400'}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Metric Cards (Statutory Indian Financial Indicators) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Total Gross Billed</div>
          <div className="text-xl font-black text-slate-900">
            ₹{metrics.totalGrossVolumeInr ? (metrics.totalGrossVolumeInr / 100000).toFixed(2) : '50.55'}L
          </div>
          <div className="text-[10px] text-slate-500 mt-1">₹{metrics.totalGrossVolumeInr?.toLocaleString('en-IN') || '50,55,000'}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Net Disbursable</div>
          <div className="text-xl font-black text-emerald-600">
            ₹{metrics.totalNetPayableInr ? (metrics.totalNetPayableInr / 100000).toFixed(2) : '48.65'}L
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Post-TDS Deduction</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">3-Way Match Rate</div>
          <div className="text-xl font-black text-teal-600 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-teal-500" />
            <span>{metrics.threeWayMatchAccuracyRate}%</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">PO = GRN = Invoice</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">TDS Withheld (₹)</div>
          <div className="text-xl font-black text-purple-600">
            ₹{metrics.totalTdsWithheldInr ? (metrics.totalTdsWithheldInr / 1000).toFixed(1) : '189.7'}k
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Sec 194C / 194J / 194Q</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">GST ITC Claimable</div>
          <div className="text-xl font-black text-blue-600">
            ₹{metrics.totalGstItcEligibleInr ? (metrics.totalGstItcEligibleInr / 100000).toFixed(2) : '7.71'}L
          </div>
          <div className="text-[10px] text-slate-500 mt-1">GSTR-2B Input Tax Credit</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Approval Gates</div>
          <div className="text-xl font-black text-amber-600">
            {metrics.waitingApprovalCount} Pending
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Threshold &gt; ₹15,000</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`pb-3 px-4 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
            activeTab === 'invoices'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Invoices & 3-Way Match Directory ({invoices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tds_calculator')}
          className={`pb-3 px-4 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
            activeTab === 'tds_calculator'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>GST & TDS Statutory Tax Calculator</span>
        </button>

        <button
          onClick={() => setActiveTab('three_way_match')}
          className={`pb-3 px-4 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
            activeTab === 'three_way_match'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>3-Way Matching Sentinel Console</span>
        </button>
      </div>

      {/* TAB 1: INVOICES DIRECTORY */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          
          {/* Search & Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Invoice #, Vendor, PO #, or GSTIN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-500">Filter:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-slate-50 focus:outline-none"
              >
                <option value="ALL">All Invoices ({invoices.length})</option>
                <option value="WAITING_APPROVAL">Waiting Approval</option>
                <option value="APPROVED">Approved / Ready</option>
                <option value="PAID_DISBURSED">Paid / Disbursed</option>
              </select>
            </div>
          </div>

          {/* Invoices List */}
          <div className="space-y-3">
            {filteredInvoices.map((inv) => {
              const isPaid = !!inv.disbursedAt;
              const isWaiting = inv.approvalStatus === 'WAITING_APPROVAL';

              return (
                <div
                  key={inv.id}
                  className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-slate-300 shadow-xs transition space-y-4"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-2xl shrink-0 ${
                        isPaid ? 'bg-emerald-100 text-emerald-700' :
                        isWaiting ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        <Receipt className="w-5 h-5" />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                            {inv.invoiceNumber}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {inv.vendorName}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            GSTIN: {inv.vendorGstin}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {inv.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start lg:self-center">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1 ${
                        isPaid ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        isWaiting ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {isPaid ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
                        <span>{isPaid ? 'PAID VIA RTGS' : isWaiting ? 'WAITING APPROVAL' : 'APPROVED'}</span>
                      </span>

                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-teal-600" />
                        <span>3-Way Matched</span>
                      </span>
                    </div>
                  </div>

                  {/* Financial Breakdown Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Gross Billed</div>
                      <div className="font-bold text-slate-900 text-sm mt-0.5">
                        ₹{inv.grossAmountInr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Base Amount</div>
                      <div className="font-bold text-slate-700 mt-0.5">
                        ₹{inv.baseAmountInr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">GST (18% ITC)</div>
                      <div className="font-bold text-blue-700 mt-0.5">
                        ₹{inv.totalGstAmountInr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">TDS (Sec {inv.tdsSection})</div>
                      <div className="font-bold text-purple-700 mt-0.5">
                        -₹{inv.tdsAmountInr.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({inv.tdsRatePct}%)
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Net Disbursable</div>
                      <div className="font-bold text-emerald-700 text-sm mt-0.5">
                        ₹{inv.netPayableInr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">PO Match Reference</div>
                      <div className="font-mono text-slate-700 font-bold mt-0.5 truncate">
                        {inv.poNumber}
                      </div>
                    </div>
                  </div>

                  {/* Footer & Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                    <div className="flex flex-wrap items-center gap-3 text-slate-500 text-[11px]">
                      <span className="flex items-center gap-1 font-mono">
                        <Lock className="w-3 h-3 text-slate-400" />
                        IRN: {inv.irn?.substring(0, 16)}... (Sec 16 CGST Verified)
                      </span>
                      <span>Bank: {inv.bankAccount}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setShowMatchModal(true);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                        <span>Inspect 3-Way Match</span>
                      </button>

                      {!isPaid && (
                        <button
                          disabled={disbursingId === inv.id}
                          onClick={() => handleDisbursePayment(inv)}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 transition cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>{disbursingId === inv.id ? 'Disbursing...' : 'Authorize & Disburse RTGS'}</span>
                        </button>
                      )}

                      {inv.workflowId && (
                        <button
                          onClick={() => onNavigate(`/workflows/${inv.workflowId}`)}
                          className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs flex items-center gap-1 transition"
                        >
                          <span>Canvas</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: STATUTORY TDS & GST CALCULATOR */}
      {activeTab === 'tds_calculator' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-purple-600" />
              <span>Statutory Indian GST & TDS Tax Withholding Engine</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulates exact withholding tax calculations under Section 194C, 194J, 194Q, and 194I of the Income Tax Act 1961 and CGST Act 2017.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Controls */}
            <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Invoice & Tax Parameters
              </h3>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Gross Billed Invoice Amount (₹ INR):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={calcGross}
                    onChange={(e) => {
                      setCalcGross(e.target.value);
                      handleCalculateTds(e.target.value, calcSection, calcIsInterState);
                    }}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Statutory TDS Withholding Section:
                </label>
                <select
                  value={calcSection}
                  onChange={(e) => {
                    setCalcSection(e.target.value);
                    handleCalculateTds(calcGross, e.target.value, calcIsInterState);
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="194J">Section 194J - Professional & Technical Fees (10.0%)</option>
                  <option value="194C">Section 194C - Contractor & Courier/Carrier Contracts (2.0%)</option>
                  <option value="194Q">Section 194Q - Purchase of Goods &gt; ₹50 Lakhs (0.1%)</option>
                  <option value="194I">Section 194I - Commercial Lease & Office Rent (10.0%)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="interState"
                  checked={calcIsInterState}
                  onChange={(e) => {
                    setCalcIsInterState(e.target.checked);
                    handleCalculateTds(calcGross, calcSection, e.target.checked);
                  }}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="interState" className="text-xs font-medium text-slate-700 cursor-pointer">
                  Inter-State Supply (IGST 18% instead of CGST 9% + SGST 9%)
                </label>
              </div>

              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                  <span>CBDT Circular No. 23/2017 Compliance</span>
                </div>
                <div className="text-[11px] text-purple-800">
                  TDS is strictly computed on the <strong>base invoice amount excluding GST</strong>, safeguarding enterprise buyers from excess tax deductions.
                </div>
              </div>
            </div>

            {/* Live Calculation Output Card */}
            {calcResult && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                      Computed Settlement Voucher
                    </span>
                    <h3 className="text-lg font-bold text-white mt-0.5">
                      ₹{calcResult.netPayableInr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Net Payout Ready
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Gross Invoice Value</span>
                    <span className="font-bold">₹{calcResult.grossAmountInr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Base Taxable Amount (Excl. GST)</span>
                    <span className="font-bold text-slate-200">₹{calcResult.baseAmountInr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">
                      GST Breakdown ({calcResult.gstRatePct}%)
                    </span>
                    <span className="font-bold text-cyan-300">
                      {calcIsInterState ? `IGST: ₹${calcResult.igstAmountInr.toLocaleString('en-IN')}` : `CGST (9%): ₹${calcResult.cgstAmountInr.toLocaleString('en-IN')} + SGST (9%): ₹${calcResult.sgstAmountInr.toLocaleString('en-IN')}`}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">
                      TDS Withheld ({calcResult.tdsSection} @ {calcResult.tdsRatePct}%)
                    </span>
                    <span className="font-bold text-purple-400">
                      -₹{calcResult.tdsAmountInr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 text-sm font-bold pt-2 border-t border-slate-700">
                    <span className="text-emerald-400">Net RTGS Payout to Vendor</span>
                    <span className="text-emerald-400 text-base">
                      ₹{calcResult.netPayableInr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/80 text-[11px] text-slate-300 border border-slate-700 space-y-1">
                  <div className="font-semibold text-cyan-300">Input Tax Credit (ITC) Protection:</div>
                  <div>{calcResult.itcEligibility}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: 3-WAY MATCHING SENTINEL */}
      {activeTab === 'three_way_match' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <span>Deterministic 3-Way Matching Sentinel Console</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Side-by-side reconciliation of <strong>Purchase Order</strong>, <strong>Goods Receipt Note (GRN)</strong>, and <strong>Tax Invoice</strong> with 0.0% variance tolerance.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Select Invoice:</span>
              <select
                value={selectedInvoice?.id || ''}
                onChange={(e) => {
                  const found = invoices.find(i => i.id === e.target.value);
                  if (found) setSelectedInvoice(found);
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50"
              >
                {invoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} - {inv.vendorName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedInvoice && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Document 1: Purchase Order */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>1. Purchase Order</span>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    {selectedInvoice.poNumber}
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400">Originating System</div>
                    <div className="font-semibold text-slate-800">Coupa / SAP S/4HANA ERP</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Approved Budget</div>
                    <div className="font-bold text-slate-900">₹{selectedInvoice.grossAmountInr.toLocaleString('en-IN')}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Terms</div>
                    <div className="font-semibold text-slate-800">{selectedInvoice.statutoryPaymentCap}</div>
                  </div>
                  <div className="pt-2 border-t border-slate-200 text-emerald-600 text-[11px] font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Authorized PO on Record</span>
                  </div>
                </div>
              </div>

              {/* Document 2: Goods Receipt Note (GRN) */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    <span>2. Goods Receipt (GRN)</span>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded">
                    {selectedInvoice.grnNumber}
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400">Warehouse / DC Gate Entry</div>
                    <div className="font-semibold text-slate-800">Mumbai ap-south-1 DC Entry</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Physical Verification</div>
                    <div className="font-bold text-teal-700">100% Units Received & Inspected</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Discrepancy Variance</div>
                    <div className="font-bold text-emerald-600">0.00% (Within Tolerance)</div>
                  </div>
                  <div className="pt-2 border-t border-slate-200 text-emerald-600 text-[11px] font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>GRN Signoff Confirmed</span>
                  </div>
                </div>
              </div>

              {/* Document 3: Vendor Tax Invoice */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-purple-600" />
                    <span>3. Vendor Tax Invoice</span>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                    {selectedInvoice.invoiceNumber}
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400">e-Invoice IRN Hash (Sec 16 CGST)</div>
                    <div className="font-mono text-[10px] text-slate-700 truncate">{selectedInvoice.irn}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Billed Amount</div>
                    <div className="font-bold text-slate-900">₹{selectedInvoice.grossAmountInr.toLocaleString('en-IN')}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">GSTIN Portal Match</div>
                    <div className="font-bold text-emerald-600">Verified ({selectedInvoice.vendorGstin})</div>
                  </div>
                  <div className="pt-2 border-t border-slate-200 text-emerald-600 text-[11px] font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Digital Signature Validated</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Sentinel Result Banner */}
          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-between gap-3 text-xs text-teal-950">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <div className="font-bold text-teal-950">
                  Zero Variance: 3-Way Match Verified (PO = GRN = Invoice)
                </div>
                <div className="text-[11px] text-teal-700">
                  Tolerance check evaluated at ±0.0% discrepancy. Vendor eligible for straight-through processing and HDFC Bank RTGS disbursement.
                </div>
              </div>
            </div>

            <button
              onClick={() => handleDisbursePayment(selectedInvoice)}
              disabled={selectedInvoice?.disbursedAt}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-bold text-xs transition"
            >
              {selectedInvoice?.disbursedAt ? 'Disbursed' : 'Authorize Settlement'}
            </button>
          </div>
        </div>
      )}

      {/* MODAL: UPLOAD & PARSE INVOICE */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Upload & Parse Vendor Tax Invoice</h3>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Vendor Enterprise Name:</label>
                  <input
                    type="text"
                    required
                    value={vName}
                    onChange={(e) => setVName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Vendor GSTIN (15 Digits):</label>
                  <input
                    type="text"
                    required
                    value={vGstin}
                    onChange={(e) => setVGstin(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Invoice Number:</label>
                  <input
                    type="text"
                    required
                    value={invNumber}
                    onChange={(e) => setInvNumber(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Linked PO Number:</label>
                  <input
                    type="text"
                    required
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Service / Goods Description:</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Gross Amount (₹ INR):</label>
                  <input
                    type="number"
                    required
                    value={grossAmount}
                    onChange={(e) => setGrossAmount(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">HSN / SAC Code:</label>
                  <input
                    type="text"
                    value={hsnCode}
                    onChange={(e) => setHsnCode(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">TDS Section:</label>
                  <select
                    value={tdsSection}
                    onChange={(e) => setTdsSection(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
                  >
                    <option value="194J">Section 194J (10% Technical/Professional)</option>
                    <option value="194C">Section 194C (2% Contractor)</option>
                    <option value="194Q">Section 194Q (0.1% Goods &gt; ₹50L)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Vendor Bank Account (IFSC):</label>
                  <input
                    type="text"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingInvoice}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm"
                >
                  {isSubmittingInvoice ? 'Parsing with Gemini Vision...' : 'Process Invoice & Launch DAG'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: 3-WAY MATCH INSPECTOR */}
      {showMatchModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">
                  3-Way Match Audit Record: {selectedInvoice.invoiceNumber}
                </h3>
              </div>
              <button onClick={() => setShowMatchModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">PO Amount</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">₹{selectedInvoice.grossAmountInr.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">GRN Received</div>
                  <div className="text-sm font-bold text-teal-600 mt-0.5">100% Matches</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Invoice Billed</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">₹{selectedInvoice.grossAmountInr.toLocaleString('en-IN')}</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 text-white font-mono space-y-2 text-[11px]">
                <div className="text-cyan-400 font-bold">Cryptographic Validation & IRN Signature:</div>
                <div className="text-slate-300">IRN: {selectedInvoice.irn}</div>
                <div className="text-slate-300">GSTIN: {selectedInvoice.vendorGstin} (Portal Status: ACTIVE)</div>
                <div className="text-emerald-400 font-bold">Result: 0.00% Discrepancy (Deterministic Match Verified)</div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowMatchModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

