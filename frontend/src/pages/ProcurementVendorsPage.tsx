import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Building2,
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
  ExternalLink
} from 'lucide-react';

interface ProcurementVendorsPageProps {
  onNavigate: (path: string) => void;
}

export const ProcurementVendorsPage: React.FC<ProcurementVendorsPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'vendors' | 'purchase_orders' | 'msme_calculator'>('vendors');
  const [vendors, setVendors] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({
    totalVendors: 3,
    msmeRegisteredVendors: 3,
    gemRegisteredVendors: 3,
    activePurchaseOrders: 2,
    totalCommittedBudgetInr: 11270000.0,
    msmedActComplianceRate: 100.0,
    statutoryPaymentCap: '45 Days (Section 15 MSMED Act 2006)',
    penalInterestRate: '3x RBI Bank Rate (Section 16 MSMED Act 2006)',
    taxShieldStatus: 'Protected under Section 43B(h) Income Tax Act'
  });
  const [isLoading, setIsLoading] = useState(false);

  // New Vendor Form
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [isSubmittingVendor, setIsSubmittingVendor] = useState(false);
  const [vName, setVName] = useState('Larsen & Toubro Cloud Infrastructure');
  const [vContact, setVContact] = useState('Rajeev Menon');
  const [vEmail, setVEmail] = useState('procurement@lt-infra.com');
  const [vGstin, setVGstin] = useState('27AAACL0123M1Z2');
  const [vPan, setVPan] = useState('AAACL0123M');
  const [vUdyam, setVUdyam] = useState('UDYAM-MH-02-0081920');
  const [vCategory, setVCategory] = useState('MEDIUM_ENTERPRISE');
  const [vBank, setVBank] = useState('HDFC Bank, Fort Branch, Mumbai');
  const [vIfsc, setVIfsc] = useState('HDFC0000060');
  const [vTerms, setVTerms] = useState(30);

  // New PO Form
  const [showPoModal, setShowPoModal] = useState(false);
  const [isSubmittingPo, setIsSubmittingPo] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [poTitle, setPoTitle] = useState('Enterprise Tier-4 Fiber Optic Multiplexers');
  const [poDept, setPoDept] = useState('Cloud Infrastructure');
  const [poAmount, setPoAmount] = useState('4200000.00');

  // MSME Penal Calculator
  const [calcPrincipal, setCalcPrincipal] = useState('5000000.00');
  const [calcDaysDelayed, setCalcDaysDelayed] = useState(25);
  const [calcResult, setCalcResult] = useState<any>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [vRes, oRes, mRes] = await Promise.all([
        fetch('/api/procurement/vendors'),
        fetch('/api/procurement/orders'),
        fetch('/api/procurement/metrics')
      ]);
      if (vRes.ok) {
        const d = await vRes.json();
        setVendors(d.items || []);
        if (d.items && d.items.length > 0 && !selectedVendorId) {
          setSelectedVendorId(d.items[0].id);
        }
      }
      if (oRes.ok) {
        const d = await oRes.json();
        setOrders(d.items || []);
      }
      if (mRes.ok) {
        setMetrics(await mRes.json());
      }
    } catch (e) {
      console.error('Failed to load procurement data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleOnboardVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingVendor(true);
    try {
      const res = await fetch('/api/procurement/vendors/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorName: vName,
          contactPerson: vContact,
          email: vEmail,
          gstin: vGstin,
          pan: vPan,
          msmeUdyamNumber: vUdyam,
          msmeCategory: vCategory,
          bankAccount: vBank,
          ifscCode: vIfsc,
          agreedPaymentTermsDays: parseInt(vTerms.toString())
        })
      });
      if (res.ok) {
        setShowVendorModal(false);
        await fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingVendor(false);
    }
  };

  const handleCreatePo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingPo(true);
    try {
      const res = await fetch('/api/procurement/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: selectedVendorId,
          requisitionTitle: poTitle,
          department: poDept,
          amountInr: parseFloat(poAmount),
          expectedDeliveryDays: 14
        })
      });
      if (res.ok) {
        setShowPoModal(false);
        await fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingPo(false);
    }
  };

  const runMsmeCalculator = async () => {
    try {
      const now = new Date();
      const due = new Date();
      due.setDate(now.getDate() - calcDaysDelayed);
      const res = await fetch('/api/procurement/calculate-msme-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          principalAmountInr: parseFloat(calcPrincipal),
          dueDate: due.toISOString(),
          actualPaymentDate: now.toISOString(),
          rbiBankRatePct: 6.50
        })
      });
      if (res.ok) {
        setCalcResult(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Banner */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Procurement & Vendor Governance
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              MSMED Act 2006 Sec 15 (45-Day Cap)
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
              Section 43B(h) Shield
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Autonomous procurement hub enforcing MSMED Act 2006 Section 15 statutory 45-day payment cap, Section 16 penal interest (3x RBI bank rate), Coupa PO dispatch, and GeM integration.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPoModal(true)}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Purchase Order</span>
          </button>
          <button
            onClick={() => setShowVendorModal(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Building2 className="w-4 h-4" />
            <span>Onboard Vendor</span>
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
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Active Vendors</div>
          <div className="text-2xl font-black text-slate-900">{metrics.totalVendors}</div>
          <div className="text-[11px] text-emerald-600 font-bold mt-1">
            {metrics.msmeRegisteredVendors} MSME Udyam Verified
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Statutory Payment Cap</div>
          <div className="text-2xl font-black text-amber-600">45 Days</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Strict Section 15 MSMED Act limit
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Committed Capital</div>
          <div className="text-2xl font-black text-slate-900">
            ₹{Number(metrics.totalCommittedBudgetInr || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Coupa & SAP PO commitments
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tax Disallowance Guard</div>
          <div className="text-2xl font-black text-emerald-600 flex items-center gap-1.5">
            <span>100%</span>
            <span className="text-xs font-bold text-emerald-600 px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200">Shielded</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Sec 43B(h) Income Tax compliant
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('vendors')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'vendors' ? 'border-amber-600 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Vendor Master Directory ({vendors.length})
        </button>
        <button
          onClick={() => setActiveTab('purchase_orders')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'purchase_orders' ? 'border-amber-600 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Purchase Orders & Coupa PO Dispatch ({orders.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('msme_calculator');
            runMsmeCalculator();
          }}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'msme_calculator' ? 'border-amber-600 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          MSMED Act Section 16 Interest Calculator
        </button>
      </div>

      {/* TAB 1: Vendor Directory */}
      {activeTab === 'vendors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendors.map((v) => (
            <div key={v.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-slate-400">{v.id}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {v.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">{v.vendorName}</h3>
                <div className="text-xs text-slate-500 mt-1">{v.registeredAddress}</div>

                <div className="mt-3 p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">GSTIN:</span>
                    <strong className="font-mono text-slate-800">{v.gstin}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Udyam No:</span>
                    <strong className="font-mono text-amber-800">{v.msmeUdyamNumber}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">GeM Seller ID:</span>
                    <strong className="font-mono text-indigo-700">{v.gemSellerId}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payment Terms:</span>
                    <strong className="text-slate-900">{v.agreedPaymentTermsDays} Days (Max 45)</strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Total Committed</span>
                  <div className="font-black text-slate-900">₹{Number(v.totalOrdersInr || 0).toLocaleString('en-IN')}</div>
                </div>
                <button
                  onClick={() => {
                    setSelectedVendorId(v.id);
                    setShowPoModal(true);
                  }}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl font-bold transition border border-amber-200 text-xs"
                >
                  Issue PO &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: Purchase Orders */}
      {activeTab === 'purchase_orders' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 text-xs">
            {orders.map((po) => (
              <div key={po.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-slate-400">{po.id}</span>
                    <span className="font-bold text-slate-800">{po.vendorName}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {po.department}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      po.approvalStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                      'bg-amber-100 text-amber-800 border-amber-200 animate-pulse'
                    }`}>
                      {po.approvalStatus}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">{po.requisitionTitle}</h4>
                  <div className="text-slate-500 flex items-center gap-3">
                    <span>Terms: <strong>{po.paymentTerms}</strong></span>
                    <span>&bull;</span>
                    <span>Coupa PO: <strong className="font-mono">{po.coupaPoId}</strong></span>
                    <span>&bull;</span>
                    <span>Destination: <strong>{po.deliveryLocation}</strong></span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-base font-black text-slate-900">
                    ₹{Number(po.amountInr).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-bold">
                    Section 43B(h) Protected
                  </div>
                  {po.workflowId && (
                    <button
                      onClick={() => onNavigate(`/workflows/${po.workflowId}`)}
                      className="mt-1 text-xs text-blue-600 hover:underline font-bold flex items-center gap-1 justify-end ml-auto"
                    >
                      <span>Ledger View</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MSME Penal Interest Calculator */}
      {activeTab === 'msme_calculator' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-amber-600" />
              MSMED Act Section 16 Compound Penal Interest Calculator
            </h2>
            <p className="text-xs text-slate-500">
              Under Section 16 of the MSMED Act 2006, delayed payments to registered Micro/Small enterprises carry a mandatory compound interest penalty at 3x the RBI Bank Rate with monthly rests.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Invoice Principal Amount (₹ INR)</label>
              <input
                type="number"
                value={calcPrincipal}
                onChange={(e) => setCalcPrincipal(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Days Elapsed Beyond 45-Day Statutory Cap: <span className="text-amber-600 font-bold">{calcDaysDelayed} Day(s)</span>
              </label>
              <input
                type="range"
                min="0"
                max="90"
                value={calcDaysDelayed}
                onChange={(e) => setCalcDaysDelayed(parseInt(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>

            <button
              onClick={runMsmeCalculator}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20 transition cursor-pointer"
            >
              Compute Penal Interest
            </button>
          </div>

          {calcResult && (
            <div className="p-6 bg-gradient-to-br from-slate-900 to-amber-950 text-white rounded-2xl shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-amber-300">MSMED Act Statutory Calculation</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  calcResult.delayDays > 0 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {calcResult.delayDays > 0 ? 'PENAL INTEREST MANDATORY' : 'COMPLIANT'}
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Current RBI Bank Rate:</span>
                  <strong className="text-white">{calcResult.rbiBankRatePct}% p.a.</strong>
                </div>
                <div className="flex justify-between">
                  <span>Statutory Penal Rate (3x):</span>
                  <strong className="text-amber-400 font-bold">{calcResult.penalInterestRateAnnualPct}% p.a. Compounded Monthly</strong>
                </div>
                <div className="flex justify-between">
                  <span>Days Overdue:</span>
                  <strong className="text-white">{calcResult.delayDays} Day(s)</strong>
                </div>
                <div className="flex justify-between text-amber-300 font-bold pt-2 border-t border-slate-800">
                  <span>Compounded Penal Interest:</span>
                  <span>₹{Number(calcResult.calculatedPenalInterestInr).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-cyan-400 font-black text-sm pt-2 border-t border-slate-800">
                  <span>Total Liability:</span>
                  <span>₹{Number(calcResult.totalAmountDueInr).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-[10px] text-rose-300 leading-snug">
                Warning: Under Section 43B(h) of the Income Tax Act 1961, any unpaid sum due to a micro/small supplier beyond 45 days is disallowed as a business deduction in the financial year.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Onboard Vendor Modal */}
      {showVendorModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Onboard Enterprise Supplier</h3>
              <button onClick={() => setShowVendorModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <form onSubmit={handleOnboardVendor} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Company / Legal Entity Name</label>
                <input
                  type="text"
                  required
                  value={vName}
                  onChange={(e) => setVName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">GSTIN (15-Digit)</label>
                  <input
                    type="text"
                    required
                    value={vGstin}
                    onChange={(e) => setVGstin(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">PAN Card Number</label>
                  <input
                    type="text"
                    required
                    value={vPan}
                    onChange={(e) => setVPan(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">MSME Udyam Registration</label>
                  <input
                    type="text"
                    required
                    value={vUdyam}
                    onChange={(e) => setVUdyam(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Cap (Sec 15)</label>
                  <select
                    value={vTerms}
                    onChange={(e) => setVTerms(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold"
                  >
                    <option value="30">30 Days (Recommended)</option>
                    <option value="45">45 Days (Statutory Maximum)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bank Account</label>
                  <input
                    type="text"
                    required
                    value={vBank}
                    onChange={(e) => setVBank(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">IFSC Code</label>
                  <input
                    type="text"
                    required
                    value={vIfsc}
                    onChange={(e) => setVIfsc(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowVendorModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingVendor}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition disabled:opacity-50"
                >
                  {isSubmittingVendor ? 'Onboarding...' : 'Onboard & Activate Coupa Master'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create PO Modal */}
      {showPoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Issue Purchase Order</h3>
              <button onClick={() => setShowPoModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreatePo} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Supplier</label>
                <select
                  value={selectedVendorId}
                  onChange={(e) => setSelectedVendorId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold"
                >
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.vendorName} ({v.msmeCategory})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Requisition Description</label>
                <input
                  type="text"
                  required
                  value={poTitle}
                  onChange={(e) => setPoTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={poDept}
                    onChange={(e) => setPoDept(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Commitment Value (₹ INR)</label>
                  <input
                    type="number"
                    required
                    value={poAmount}
                    onChange={(e) => setPoAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px]">
                Statutory Notice: Payment terms will be bounded to a maximum of 45 days under Section 15 of MSMED Act 2006 to maintain Section 43B(h) Income Tax deduction eligibility.
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPoModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPo}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition disabled:opacity-50"
                >
                  {isSubmittingPo ? 'Issuing...' : 'Commit & Dispatch Coupa PO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
