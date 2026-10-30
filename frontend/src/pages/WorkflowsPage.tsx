import React, { useState, useEffect } from 'react';
import { Workflow, WorkflowType, WorkflowStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  GitBranch,
  Search,
  Filter,
  Plus,
  ArrowRight,
  Layers,
  Sparkles,
  Users,
  FileText,
  Headphones,
  ShoppingCart,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface WorkflowsPageProps {
  onNavigateWorkflow: (id: string) => void;
  initialCreateOpen?: boolean;
}

export const WorkflowsPage: React.FC<WorkflowsPageProps> = ({
  onNavigateWorkflow,
  initialCreateOpen = false
}) => {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(initialCreateOpen);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Workflow Modal Form State
  const [workflowType, setWorkflowType] = useState<WorkflowType>('EMPLOYEE_ONBOARDING');
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');

  // Dynamic fields
  const [candidateName, setCandidateName] = useState('Daniel Craig');
  const [vendorName, setVendorName] = useState('Global Fiber Networks');
  const [amount, setAmount] = useState('18400.00');
  const [customerName, setCustomerName] = useState('Stripe Connect FinTech');
  const [inquiryText, setInquiryText] = useState('Webhook signature verification failure on live API');
  const [procurementItem, setProcurementItem] = useState('16x NVidia H100 Server Nodes');
  const [budget, setBudget] = useState('450000');
  const [incidentTitle, setIncidentTitle] = useState('Unauthorized sudo escalation attempt in prod-db-02');

  const fetchWorkflows = async () => {
    try {
      const res = await fetch('/api/workflows');
      if (res.ok) {
        const d = await res.json();
        setWorkflows(Array.isArray(d) ? d : d.items || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchWorkflows();
    const interval = setInterval(fetchWorkflows, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    let finalTitle = title;
    let metadata: Record<string, any> = {};

    if (workflowType === 'EMPLOYEE_ONBOARDING') {
      finalTitle = title || `Employee Onboarding - ${candidateName} (Senior Engineer)`;
      metadata = { candidateName, roleTitle: 'Senior Infrastructure Engineer', department: 'Cloud Infra' };
    } else if (workflowType === 'INVOICE_PROCESSING') {
      finalTitle = title || `Invoice Processing - ${vendorName} ($${Number(amount).toLocaleString()})`;
      metadata = { vendorName, amount: Number(amount), invoiceNumber: `INV-${Date.now().toString().slice(-5)}`, poNumber: 'PO-88421' };
    } else if (workflowType === 'CUSTOMER_REQUEST_RESOLUTION') {
      finalTitle = title || `Customer Resolution - ${customerName}`;
      metadata = { customerName, inquiryText, ticketNumber: `TKT-${Date.now().toString().slice(-5)}` };
    } else if (workflowType === 'PROCUREMENT_VENDOR_ONBOARDING') {
      finalTitle = title || `Enterprise Procurement - ${procurementItem}`;
      metadata = { item: procurementItem, budget: Number(budget) };
    } else if (workflowType === 'IT_INCIDENT_ACCESS_GOVERNANCE') {
      finalTitle = title || `IT Incident Response - ${incidentTitle}`;
      metadata = { incidentTitle, severity: 'SEV_1_CRITICAL' };
    }

    try {
      const res = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: finalTitle,
          type: workflowType,
          submittedByUserId: user?.id || 'usr-admin-01',
          submittedByName: user?.name || 'Admin',
          submittedByRole: user?.role || 'ADMIN',
          priority,
          metadata
        })
      });

      if (res.ok) {
        const created = await res.json();
        setShowCreateModal(false);
        setTitle('');
        await fetchWorkflows();
        onNavigateWorkflow(created.id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter workflows
  const filtered = workflows.filter(w => {
    const matchesSearch = w.title.toLowerCase().includes(search.toLowerCase()) || w.id.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === 'ALL' || w.type === selectedType;
    const matchesStatus = selectedStatus === 'ALL' || w.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeIcon = (type: WorkflowType) => {
    switch (type) {
      case 'EMPLOYEE_ONBOARDING': return Users;
      case 'INVOICE_PROCESSING': return FileText;
      case 'CUSTOMER_REQUEST_RESOLUTION': return Headphones;
      case 'PROCUREMENT_VENDOR_ONBOARDING': return ShoppingCart;
      case 'IT_INCIDENT_ACCESS_GOVERNANCE': return ShieldCheck;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Enterprise Workflows & DAG Pipelines
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status across all 5 autonomous enterprise workflows coordinated by Central Planner Agent.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-2 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Workflow</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, ID, vendor, or candidate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none"
          >
            <option value="ALL">All 5 Workflows</option>
            <option value="EMPLOYEE_ONBOARDING">Employee Onboarding</option>
            <option value="INVOICE_PROCESSING">Invoice Processing</option>
            <option value="CUSTOMER_REQUEST_RESOLUTION">Customer Resolution</option>
            <option value="PROCUREMENT_VENDOR_ONBOARDING">Enterprise Procurement</option>
            <option value="IT_INCIDENT_ACCESS_GOVERNANCE">IT Incident & Access</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="RUNNING">Running</option>
            <option value="WAITING_FOR_APPROVAL">Waiting for Approval</option>
            <option value="COMPLETED">Completed</option>
            <option value="REQUIRES_ATTENTION">Requires Attention</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

      </div>

      {/* Workflows Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              No workflows match your search or filter criteria.
            </div>
          ) : (
            filtered.map(wf => {
              const Icon = getTypeIcon(wf.type);
              return (
                <div
                  key={wf.id}
                  onClick={() => onNavigateWorkflow(wf.id)}
                  className="p-4 sm:p-5 hover:bg-slate-50/80 cursor-pointer transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-700 mt-0.5">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-slate-400">{wf.id}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          wf.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                          wf.status === 'WAITING_FOR_APPROVAL' ? 'bg-amber-100 text-amber-800 border-amber-200 font-bold' :
                          wf.status === 'FAILED' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                          'bg-blue-100 text-blue-800 border-blue-200 animate-pulse'
                        }`}>
                          {wf.status.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Priority: <strong>{wf.priority}</strong>
                        </span>
                      </div>

                      <h2 className="text-sm font-bold text-slate-900 leading-snug">
                        {wf.title}
                      </h2>

                      <div className="text-xs text-slate-500 flex items-center gap-3 flex-wrap">
                        <span>Submitted by: <strong>{wf.submittedByName}</strong></span>
                        <span>•</span>
                        <span>Current Agent: <strong className="text-blue-600">{wf.currentAgentName || 'Central Planner'}</strong></span>
                        <span>•</span>
                        <span>Tasks: {wf.tasks.filter(t => t.status === 'COMPLETED').length}/{wf.tasks.length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end">
                    <div className="w-32 text-right">
                      <div className="text-xs font-bold text-slate-700 mb-1">{wf.progress}% Complete</div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${wf.progress}%` }}
                        />
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal: Create Workflow (All 5 workflows supported) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto text-xs">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Initiate Autonomous Enterprise Workflow</h3>
                <p className="text-slate-500">Decomposed into specialized tasks by Central Planner Agent</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              
              {/* Workflow Type Selection */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Workflow Domain</label>
                <select
                  value={workflowType}
                  onChange={(e) => setWorkflowType(e.target.value as WorkflowType)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none"
                >
                  <option value="EMPLOYEE_ONBOARDING">A. Employee Onboarding (6 Agents + IT Access Gate)</option>
                  <option value="INVOICE_PROCESSING">B. Invoice Processing (6 Agents + Payment Authorization)</option>
                  <option value="CUSTOMER_REQUEST_RESOLUTION">C. Customer Request Resolution (6 Agents + Gemini LLM)</option>
                  <option value="PROCUREMENT_VENDOR_ONBOARDING">D. Enterprise Procurement & RFP (6 Agents + PO Approval)</option>
                  <option value="IT_INCIDENT_ACCESS_GOVERNANCE">E. IT Incident Response & Governance (7 Agents + RCA)</option>
                </select>
              </div>

              {/* Dynamic Inputs based on type */}
              {workflowType === 'EMPLOYEE_ONBOARDING' && (
                <div className="space-y-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">New Employee Name</label>
                    <input
                      type="text"
                      required
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900"
                    />
                  </div>
                </div>
              )}

              {workflowType === 'INVOICE_PROCESSING' && (
                <div className="space-y-3 p-3 bg-teal-50/50 rounded-xl border border-teal-100">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Vendor Name</label>
                      <input
                        type="text"
                        required
                        value={vendorName}
                        onChange={(e) => setVendorName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Invoice Total ($ USD)</label>
                      <input
                        type="number"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {workflowType === 'CUSTOMER_REQUEST_RESOLUTION' && (
                <div className="space-y-3 p-3 bg-pink-50/50 rounded-xl border border-pink-100">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Customer Account</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Issue Description</label>
                    <textarea
                      rows={2}
                      required
                      value={inquiryText}
                      onChange={(e) => setInquiryText(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900"
                    />
                  </div>
                </div>
              )}

              {workflowType === 'PROCUREMENT_VENDOR_ONBOARDING' && (
                <div className="space-y-3 p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Requisition Item</label>
                      <input
                        type="text"
                        required
                        value={procurementItem}
                        onChange={(e) => setProcurementItem(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Authorized Budget ($)</label>
                      <input
                        type="number"
                        required
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {workflowType === 'IT_INCIDENT_ACCESS_GOVERNANCE' && (
                <div className="space-y-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Incident Alert Title</label>
                    <input
                      type="text"
                      required
                      value={incidentTitle}
                      onChange={(e) => setIncidentTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900"
                    />
                  </div>
                </div>
              )}

              {/* Priority */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Execution Priority</label>
                <div className="flex gap-2">
                  {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex-1 py-1.5 rounded-lg border font-bold text-xs transition ${
                        priority === p ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Planning...' : 'Launch Central Planner'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
