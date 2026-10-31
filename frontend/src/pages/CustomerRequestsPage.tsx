import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  RefreshCw,
  Plus,
  ArrowRight,
  User,
  Zap,
  TrendingDown,
  DollarSign,
  FileText,
  BadgeAlert,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface CustomerRequestsPageProps {
  onNavigate: (path: string) => void;
}

export const CustomerRequestsPage: React.FC<CustomerRequestsPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'tickets' | 'rbi_calculator' | 'live_stream'>('tickets');
  const [tickets, setTickets] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({
    totalTickets: 4,
    resolvedTickets: 2,
    waitingApprovalCount: 1,
    rbiTatBreaches: 2,
    totalRefundValueInr: 69600.0,
    totalSuoMotuCompensationInr: 500.0,
    slaComplianceRate: 99.4,
    rbiTatStandard: 'RBI DPSS.CO.PD No.629 (T+1 UPI / T+5 Cards)',
    suoMotuRate: '₹100/day delay compensation'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  // New Ticket Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accountName, setAccountName] = useState('Swiggy Instamart Technologies');
  const [contactEmail, setContactEmail] = useState('fintech-recon@swiggy.in');
  const [customerTier, setCustomerTier] = useState('ENTERPRISE_PLATINUM');
  const [subject, setSubject] = useState('API Gateway 504 Timeout during peak lunch order spike');
  const [description, setDescription] = useState('High latency on payment gateway webhook caused 24 failed debit reconciliations. Requesting SLA credit refund under Tier-1 agreement.');
  const [disputedAmount, setDisputedAmount] = useState('18500.00');
  const [txType, setTxType] = useState('UPI_IMPS_REVERSAL');
  const [txDate, setTxDate] = useState('2026-10-28T14:30:00');

  // RBI Simulator State
  const [simTxType, setSimTxType] = useState('UPI_IMPS_REVERSAL');
  const [simAmount, setSimAmount] = useState('15000.00');
  const [simDaysDelayed, setSimDaysDelayed] = useState(3);
  const [simResult, setSimResult] = useState<any>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [tRes, mRes] = await Promise.all([
        fetch('/api/customer/tickets'),
        fetch('/api/customer/metrics')
      ]);
      if (tRes.ok) {
        const d = await tRes.json();
        setTickets(d.items || []);
        if (d.items && d.items.length > 0 && !selectedTicket) {
          setSelectedTicket(d.items[0]);
        }
      }
      if (mRes.ok) {
        setMetrics(await mRes.json());
      }
    } catch (e) {
      console.error('Failed to load customer tickets:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/customer/tickets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountName,
          contactEmail,
          customerTier,
          subject,
          description,
          disputedAmountInr: parseFloat(disputedAmount),
          transactionType: txType,
          transactionDate: txDate,
          priority: 'HIGH'
        })
      });
      if (res.ok) {
        setShowCreateModal(false);
        await fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolveTicket = async (tktId: string) => {
    try {
      const res = await fetch(`/api/customer/tickets/${tktId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          remedyNotes: 'Authorized credit adjustment and updated Zendesk customer record.',
          includeSuoMotuCompensation: true,
          approvedBy: 'Support Manager'
        })
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const runRbiSimulator = async () => {
    try {
      const now = new Date();
      now.setDate(now.getDate() - (simDaysDelayed + (simTxType === 'UPI_IMPS_REVERSAL' ? 1 : 5)));
      const res = await fetch('/api/customer/calculate-rbi-tat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionType: simTxType,
          transactionDate: now.toISOString(),
          amountInr: parseFloat(simAmount)
        })
      });
      if (res.ok) {
        setSimResult(await res.json());
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
            <div className="p-1.5 rounded-lg bg-pink-50 text-pink-600">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Customer Requests & RBI TAT Governance
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 border border-pink-200">
              RBI DPSS.CO.PD No.629 Compliant
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              ₹100/Day Suo Motu Rule
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Autonomous customer resolution desk with RBI turnaround tracking (T+1/T+5), automatic ₹100/day delay compensation, and Zendesk Support API v2 integration.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold shadow-md shadow-pink-600/20 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Customer Dispute</span>
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
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Active Escalations</div>
          <div className="text-2xl font-black text-slate-900">{metrics.totalTickets}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-pink-600 font-bold">{metrics.waitingApprovalCount}</span> awaiting manager sign-off
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">RBI TAT Turnaround</div>
          <div className="text-2xl font-black text-rose-600 flex items-center gap-1.5">
            <span>{metrics.rbiTatBreaches}</span>
            <span className="text-xs font-bold text-rose-500 px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200">Delayed</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            T+1 UPI &bull; T+5 Cards threshold
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Suo Motu Compensation</div>
          <div className="text-2xl font-black text-amber-600">
            ₹{Number(metrics.totalSuoMotuCompensationInr || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-600 font-bold mt-1">
            Auto-calculated @ ₹100/day
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Refunds Authorized</div>
          <div className="text-2xl font-black text-slate-900">
            ₹{Number(metrics.totalRefundValueInr || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Settled via RazorpayX rails
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('tickets')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'tickets' ? 'border-pink-600 text-pink-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Customer Support Escalations ({tickets.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('rbi_calculator');
            runRbiSimulator();
          }}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'rbi_calculator' ? 'border-pink-600 text-pink-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          RBI Harmonisation of TAT Calculator
        </button>
        <button
          onClick={() => setActiveTab('live_stream')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'live_stream' ? 'border-pink-600 text-pink-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Zendesk Integration & Customer Timeline
        </button>
      </div>

      {/* TAB 1: Support Escalations */}
      {activeTab === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Tickets List */}
          <div className="lg:col-span-2 space-y-3">
            {tickets.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTicket(t)}
                className={`p-4 bg-white rounded-xl border transition cursor-pointer ${
                  selectedTicket?.id === t.id ? 'border-pink-500 ring-2 ring-pink-500/10 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">{t.id}</span>
                    <span className="text-xs font-bold text-slate-800">{t.accountName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600">
                      {t.customerTier}
                    </span>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    t.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                    t.status === 'WAITING_APPROVAL' ? 'bg-amber-100 text-amber-800 border-amber-200 font-bold animate-pulse' :
                    'bg-blue-100 text-blue-800 border-blue-200'
                  }`}>
                    {t.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug mb-1">
                  {t.subject}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                  {t.description}
                </p>

                <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-3 text-slate-600">
                    <span>Disputed: <strong className="text-slate-900">₹{Number(t.disputedAmountInr).toLocaleString('en-IN')}</strong></span>
                    {t.suoMotuCompensationInr > 0 && (
                      <span className="text-amber-600 font-bold">
                        +₹{t.suoMotuCompensationInr} Suo Motu
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {t.tatBreached ? (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-500" />
                        RBI TAT Breached (+{t.tatDelayDays}d)
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        Within TAT
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono">ZD: {t.zendeskTicketId}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Col: Ticket Detail Drawer */}
          {selectedTicket && (
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="text-[10px] font-mono font-bold text-slate-400">{selectedTicket.id}</div>
                  <h2 className="text-sm font-bold text-slate-900">{selectedTicket.accountName}</h2>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  selectedTicket.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {selectedTicket.status}
                </span>
              </div>

              {/* RBI Statutory Breakdown Card */}
              <div className="p-3.5 bg-gradient-to-br from-amber-50/80 to-pink-50/50 rounded-xl border border-amber-200 space-y-2 text-xs">
                <div className="font-bold text-amber-900 flex items-center justify-between">
                  <span>RBI TAT Turnaround Assessment</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 font-bold">DPSS.CO.PD No.629</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Transaction Type:</span>
                  <strong className="text-slate-800">{selectedTicket.transactionType}</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Mandated TAT:</span>
                  <strong className="text-slate-800">T+{selectedTicket.mandatedTatDays} Business Day(s)</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Actual Elapsed:</span>
                  <strong className={selectedTicket.tatBreached ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                    {selectedTicket.turnaroundDays} Days ({selectedTicket.tatDelayDays} days beyond TAT)
                  </strong>
                </div>
                <div className="flex justify-between text-slate-600 pt-1 border-t border-amber-200/60 font-semibold">
                  <span>Suo Motu Compensation:</span>
                  <span className="text-amber-700 font-bold">₹{selectedTicket.suoMotuCompensationInr} (₹100/day)</span>
                </div>
                <div className="flex justify-between text-slate-900 pt-1 border-t border-amber-200 font-bold">
                  <span>Total Settlement Amount:</span>
                  <span className="text-pink-600 font-black">₹{Number(selectedTicket.proposedCreditInr).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Ticket Context */}
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400">Customer Contact:</span>
                  <div className="font-semibold text-slate-800">{selectedTicket.contactEmail}</div>
                </div>
                <div>
                  <span className="text-slate-400">SLA Agreement:</span>
                  <div className="font-semibold text-slate-800">{selectedTicket.slaPolicyTier}</div>
                </div>
                <div>
                  <span className="text-slate-400">Proposed Action:</span>
                  <div className="font-semibold text-slate-800">{selectedTicket.remedyAction}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                {selectedTicket.status !== 'RESOLVED' ? (
                  <button
                    onClick={() => handleResolveTicket(selectedTicket.id)}
                    className="w-full py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    Authorize Credit & Resolve via Zendesk
                  </button>
                ) : (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Dispute settled & credited to customer.</span>
                  </div>
                )}

                {selectedTicket.workflowId && (
                  <button
                    onClick={() => onNavigate(`/workflows/${selectedTicket.workflowId}`)}
                    className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition border border-slate-200 flex items-center justify-center gap-1.5"
                  >
                    <span>View Central Planner Execution Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RBI TAT Calculator */}
      {activeTab === 'rbi_calculator' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              RBI Turn Around Time & Penalty Calculator
            </h2>
            <p className="text-xs text-slate-500">
              Calculate turnaround times and automatic ₹100/day customer compensation under RBI Circular DPSS.CO.PD No.629/02.01.014/2019-20.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Transaction Category</label>
              <select
                value={simTxType}
                onChange={(e) => setSimTxType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value="UPI_IMPS_REVERSAL">UPI / IMPS Failed Transaction (Mandated: T+1)</option>
                <option value="CARD_PAYMENT_REVERSAL">Card Transaction / Merchant Settlement (Mandated: T+5)</option>
                <option value="ATM_REVERSAL">ATM Cash Withdrawal Failure (Mandated: T+5)</option>
                <option value="WALLET_REVERSAL">Prepaid Payment Instrument / Wallet (Mandated: T+1)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Disputed Amount (₹ INR)</label>
              <input
                type="number"
                value={simAmount}
                onChange={(e) => setSimAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Days Elapsed Beyond Mandated TAT: <span className="text-pink-600 font-bold">{simDaysDelayed} Day(s)</span>
              </label>
              <input
                type="range"
                min="0"
                max="15"
                value={simDaysDelayed}
                onChange={(e) => setSimDaysDelayed(parseInt(e.target.value))}
                className="w-full accent-pink-600 cursor-pointer"
              />
            </div>

            <button
              onClick={runRbiSimulator}
              className="w-full py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold shadow-md shadow-pink-600/20 transition cursor-pointer"
            >
              Recalculate Compensation
            </button>
          </div>

          {/* Calculator Output Card */}
          {simResult && (
            <div className="p-6 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-cyan-300">RBI Statutory Calculation Output</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {simResult.tatBreached ? 'PENALTY APPLICABLE' : 'COMPLIANT'}
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Mandated Turnaround:</span>
                  <strong className="text-white">T+{simResult.mandatedTatDays} Business Day(s)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Delay Beyond TAT:</span>
                  <strong className={simResult.delayDaysBeyondTat > 0 ? 'text-amber-400' : 'text-white'}>
                    {simResult.delayDaysBeyondTat} Day(s)
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Daily Penalty Rate:</span>
                  <strong className="text-white">₹{simResult.dailyPenaltyRateInr}/day</strong>
                </div>
                <div className="flex justify-between text-amber-300 font-bold pt-2 border-t border-slate-800">
                  <span>Suo Motu Compensation:</span>
                  <span>₹{simResult.totalSuoMotuCompensationInr.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-cyan-400 font-black text-sm pt-2 border-t border-slate-800">
                  <span>Total Due to Customer:</span>
                  <span>₹{simResult.finalSettlementAmountInr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-xl text-[10px] text-slate-400 leading-snug">
                {simResult.circularReference}. Section 10(2) read with Section 18 of Payment and Settlement Systems Act, 2007 requires automatic payment into customer account without requiring a separate claim.
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Zendesk Live Stream */}
      {activeTab === 'live_stream' && (
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Zendesk Support Integration & Settlement Feed
            </h2>
            <span className="text-xs text-slate-400 font-mono">Channel: REST API v2 + Webhooks</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {tickets.map((t, idx) => (
              <div key={idx} className="py-3 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-700">{t.zendeskTicketId}</span>
                    <span className="text-slate-400">&bull;</span>
                    <strong className="text-slate-800">{t.accountName}</strong>
                    <span className="text-[10px] text-slate-400">({t.contactEmail})</span>
                  </div>
                  <p className="text-slate-600">{t.subject}</p>
                  <div className="text-[11px] text-slate-400">
                    Remedy: <span className="font-semibold text-slate-700">{t.remedyAction}</span> &bull; Status: <span className="font-bold text-pink-600">{t.status}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-bold text-slate-900">₹{Number(t.proposedCreditInr).toLocaleString('en-IN')}</div>
                  <span className="text-[10px] text-slate-400 font-mono">RazorpayX Rail</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Log New Customer Dispute</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer Account</label>
                <input
                  type="text"
                  required
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Disputed Amount (₹ INR)</label>
                  <input
                    type="number"
                    required
                    value={disputedAmount}
                    onChange={(e) => setDisputedAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Method / Rail</label>
                <select
                  value={txType}
                  onChange={(e) => setTxType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold"
                >
                  <option value="UPI_IMPS_REVERSAL">UPI / IMPS (RBI T+1 Standard)</option>
                  <option value="CARD_PAYMENT_REVERSAL">Debit / Credit Card (RBI T+5 Standard)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Issue Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Detailed Description</label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Log Dispute & Trigger AI Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

