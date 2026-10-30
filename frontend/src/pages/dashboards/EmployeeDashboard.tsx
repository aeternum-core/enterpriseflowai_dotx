import React, { useState, useEffect } from 'react';
import { Workflow, ApprovalRequest } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Send,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertCircle,
  Laptop,
  Calendar,
  FileQuestion,
  ShieldCheck,
  Building,
  Briefcase
} from 'lucide-react';

interface EmployeeDashboardProps {
  onNavigate: (path: string) => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [employeeName, setEmployeeName] = useState('Jordan Taylor');
  const [employeeId, setEmployeeId] = useState('EMP-7402');
  const [requestCategory, setRequestCategory] = useState<'EQUIPMENT' | 'LEAVE' | 'ACCESS' | 'BENEFITS'>('EQUIPMENT');
  const [priority, setPriority] = useState<'URGENT' | 'HIGH' | 'MEDIUM'>('HIGH');
  const [requestDetails, setRequestDetails] = useState(
    'Requesting high-performance engineering workstation (M3 Max 64GB) and secondary 4K display for machine learning model development.'
  );

  const fetchEmployeeData = async () => {
    try {
      const [wfRes, apprRes] = await Promise.all([
        fetch('/api/workflows'),
        fetch('/api/approvals')
      ]);
      if (wfRes.ok) {
        const allWfs: Workflow[] = await wfRes.json();
        // Include employee onboarding and relevant employee request workflows
        setWorkflows(allWfs.filter(w => 
          w.type === 'EMPLOYEE_ONBOARDING' || 
          w.type === 'IT_INCIDENT_ACCESS_GOVERNANCE' ||
          w.title.toLowerCase().includes('employee') ||
          w.title.toLowerCase().includes('request')
        ));
      }
      if (apprRes.ok) {
        const allApprs: ApprovalRequest[] = await apprRes.json();
        setApprovals(allApprs);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
    const interval = setInterval(fetchEmployeeData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Employee Request - ${requestCategory} for ${employeeName} (${employeeId})`,
          type: requestCategory === 'ACCESS' ? 'IT_INCIDENT_ACCESS_GOVERNANCE' : 'EMPLOYEE_ONBOARDING',
          priority: priority,
          submittedBy: user?.name || 'Employee Manager',
          submittedByRole: 'EMPLOYEE_MANAGER',
          inputData: {
            employeeName,
            employeeId,
            requestCategory,
            priority,
            details: requestDetails,
            department: 'Engineering & Operations'
          }
        })
      });

      if (res.ok) {
        setShowSubmitModal(false);
        fetchEmployeeData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreset = (category: 'EQUIPMENT' | 'LEAVE' | 'ACCESS' | 'BENEFITS') => {
    setRequestCategory(category);
    if (category === 'EQUIPMENT') {
      setEmployeeName('Jordan Taylor');
      setEmployeeId('EMP-7402');
      setPriority('HIGH');
      setRequestDetails('Requesting high-performance engineering workstation (M3 Max 64GB) and dual 4K display monitors for ML training pipelines.');
    } else if (category === 'LEAVE') {
      setEmployeeName('Rachel Adams');
      setEmployeeId('EMP-5291');
      setPriority('MEDIUM');
      setRequestDetails('Submitting planned paternity/maternity sabbatical leave from Dec 1, 2026 to Jan 15, 2027 with coverage delegation planned.');
    } else if (category === 'ACCESS') {
      setEmployeeName('Vikram Malhotra');
      setEmployeeId('EMP-8830');
      setPriority('URGENT');
      setRequestDetails('Production Kubernetes cluster root provisioning request for critical financial reconciliation bugfix deployment.');
    } else {
      setEmployeeName('Claire Dupont');
      setEmployeeId('EMP-3104');
      setPriority('MEDIUM');
      setRequestDetails('International corporate health coverage tier upgrade and dependent enrollment verification for Q4.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Top Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
              Employee Operations
            </span>
            <span className="text-xs text-slate-400">Workflow: Employee Request Management</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
            Autonomous Employee Request Management Hub
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            AI-driven fulfillment for equipment, permissions, leave policies, and internal employee support requests.
          </p>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-2 transition cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>New Employee Request</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">42</div>
            <div className="text-xs font-semibold text-slate-500">Active Requests</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">98.4%</div>
            <div className="text-xs font-semibold text-slate-500">Resolution SLA</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">1.8h</div>
            <div className="text-xs font-semibold text-slate-500">Avg AI Turnaround</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">100%</div>
            <div className="text-xs font-semibold text-slate-500">Automated Audit Log</div>
          </div>
        </div>
      </div>

      {/* Preset Scenarios Strip */}
      <div className="bg-gradient-to-r from-indigo-50/80 via-blue-50/60 to-purple-50/80 border border-indigo-100 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-slate-800">1-Click Live Employee Request Demos</span>
          </div>
          <span className="text-[11px] text-slate-500">Instant AI dispatch across all agent nodes</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => { handlePreset('EQUIPMENT'); setShowSubmitModal(true); }}
            className="p-3 bg-white rounded-xl border border-indigo-100 hover:border-indigo-300 hover:shadow-sm text-left transition flex items-center gap-2.5 cursor-pointer"
          >
            <Laptop className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-800 truncate">Hardware / Equipment</div>
              <div className="text-[10px] text-slate-500 truncate">M3 Max & 4K Displays</div>
            </div>
          </button>

          <button
            onClick={() => { handlePreset('LEAVE'); setShowSubmitModal(true); }}
            className="p-3 bg-white rounded-xl border border-indigo-100 hover:border-indigo-300 hover:shadow-sm text-left transition flex items-center gap-2.5 cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-800 truncate">Leave & PTO Policy</div>
              <div className="text-[10px] text-slate-500 truncate">Sabbatical & Delegation</div>
            </div>
          </button>

          <button
            onClick={() => { handlePreset('ACCESS'); setShowSubmitModal(true); }}
            className="p-3 bg-white rounded-xl border border-indigo-100 hover:border-indigo-300 hover:shadow-sm text-left transition flex items-center gap-2.5 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-800 truncate">Security & System Access</div>
              <div className="text-[10px] text-slate-500 truncate">K8s Cluster Root Access</div>
            </div>
          </button>

          <button
            onClick={() => { handlePreset('BENEFITS'); setShowSubmitModal(true); }}
            className="p-3 bg-white rounded-xl border border-indigo-100 hover:border-indigo-300 hover:shadow-sm text-left transition flex items-center gap-2.5 cursor-pointer"
          >
            <FileQuestion className="w-4 h-4 text-purple-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-800 truncate">Benefits & Healthcare</div>
              <div className="text-[10px] text-slate-500 truncate">Tier Upgrade & Coverage</div>
            </div>
          </button>
        </div>
      </div>

      {/* Live Employee Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-800">Active Employee Requests & Workflows</h2>
          </div>
          <span className="text-xs text-slate-400">{workflows.length} total workflows</span>
        </div>

        <div className="divide-y divide-slate-100">
          {workflows.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No employee requests currently pending. Click "New Employee Request" or choose a demo above.
            </div>
          ) : (
            workflows.slice(0, 6).map((wf) => (
              <div
                key={wf.id}
                onClick={() => onNavigate(`/workflows/${wf.id}`)}
                className="p-4 hover:bg-slate-50/70 transition flex items-center justify-between gap-4 cursor-pointer"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 hover:text-indigo-600 transition truncate">
                      {wf.title}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      wf.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      wf.status === 'WAITING_FOR_APPROVAL' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    }`}>
                      {wf.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-3">
                    <span>ID: {wf.id}</span>
                    <span>•</span>
                    <span>Progress: {wf.progress}%</span>
                    <span>•</span>
                    <span>Created: {new Date(wf.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden hidden sm:block">
                    <div
                      className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${wf.progress}%` }}
                    />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Request Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Submit New Employee Request</h3>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Employee Name</label>
                  <input
                    type="text"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 font-medium focus:outline-indigo-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Employee ID</label>
                  <input
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 font-medium focus:outline-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Request Category</label>
                  <select
                    value={requestCategory}
                    onChange={(e: any) => setRequestCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 font-medium focus:outline-indigo-600"
                  >
                    <option value="EQUIPMENT">Hardware / Equipment</option>
                    <option value="LEAVE">Leave & Sabbatical</option>
                    <option value="ACCESS">IT & System Access</option>
                    <option value="BENEFITS">Benefits & Healthcare</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority SLA</label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 font-medium focus:outline-indigo-600"
                  >
                    <option value="URGENT">Urgent (4-Hour SLA)</option>
                    <option value="HIGH">High (24-Hour SLA)</option>
                    <option value="MEDIUM">Standard Medium</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Request Details & Specifications</label>
                <textarea
                  rows={3}
                  value={requestDetails}
                  onChange={(e) => setRequestDetails(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 font-medium focus:outline-indigo-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Dispatching Agents...' : 'Submit Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
