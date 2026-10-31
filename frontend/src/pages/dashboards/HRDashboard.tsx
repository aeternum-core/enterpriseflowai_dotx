import React, { useState, useEffect } from 'react';
import { Workflow, ApprovalRequest } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  UserPlus,
  FileCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  UploadCloud,
  ShieldAlert,
  Sparkles,
  Send,
  Building,
  Key
} from 'lucide-react';

interface HRDashboardProps {
  onNavigate: (path: string) => void;
}

export const HRDashboard: React.FC<HRDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [candidateName, setCandidateName] = useState('Sarah Marie Jenkins');
  const [roleTitle, setRoleTitle] = useState('Senior Staff Security Engineer');
  const [department, setDepartment] = useState('Information Security & Infrastructure');
  const [startDate, setStartDate] = useState('2026-11-03');
  const [manager, setManager] = useState('Alexander Sterling');
  const [requiresSensitiveAccess, setRequiresSensitiveAccess] = useState(true);
  const [uploadedDocName, setUploadedDocName] = useState('Sarah_Jenkins_Passport_Redacted.pdf');

  const fetchHRData = async () => {
    try {
      const [wfRes, apprRes] = await Promise.all([
        fetch('/api/workflows?type=EMPLOYEE_ONBOARDING'),
        fetch('/api/approvals')
      ]);
      if (wfRes.ok) {
        const d = await wfRes.json();
        setWorkflows(Array.isArray(d) ? d : d.items || []);
      }
      if (apprRes.ok) {
        const raw = await apprRes.json();
        const allApprs: any[] = Array.isArray(raw) ? raw : raw.items || [];
        setApprovals(allApprs.filter(a => {
          const act = (a.actionRequested || a.title || '').toLowerCase();
          return act.includes('access') || act.includes('hire') || act.includes('onboard') || a.domain === 'onboarding';
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchHRData();
    const interval = setInterval(fetchHRData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Employee Onboarding - ${candidateName} (${roleTitle})`,
          type: 'EMPLOYEE_ONBOARDING',
          submittedByUserId: user?.id || 'usr-hr-02',
          submittedByName: user?.name || 'Elena Rostova',
          submittedByRole: 'HR_MANAGER',
          priority: 'HIGH',
          metadata: {
            candidateName,
            roleTitle,
            department,
            startDate,
            manager,
            requiresSensitiveAccess,
            uploadedDocument: uploadedDocName
          }
        })
      });

      if (res.ok) {
        const createdWf = await res.json();
        setShowCreateModal(false);
        await fetchHRData();
        onNavigate(`/workflows/${createdWf.id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreset = (type: 'security_lead' | 'product_designer') => {
    if (type === 'security_lead') {
      setCandidateName('Sarah Marie Jenkins');
      setRoleTitle('Senior Staff Security Engineer');
      setDepartment('Information Security & Infrastructure');
      setManager('Alexander Sterling');
      setRequiresSensitiveAccess(true);
      setUploadedDocName('Sarah_Jenkins_Passport_Redacted.pdf');
    } else {
      setCandidateName('David Miller');
      setRoleTitle('Principal Product Designer');
      setDepartment('Product & Design');
      setManager('Elena Rostova');
      setRequiresSensitiveAccess(false);
      setUploadedDocName('David_Miller_ID_Credentials.pdf');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Title & Launch Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
              People Operations
            </span>
            <span className="text-xs text-slate-400">Workflow A: Employee Onboarding</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
            Autonomous Employee Onboarding Hub
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Orchestrating 6 specialized agents: Employee Info, Document Verification, HR Operations, Finance/Payroll, IT Provisioning, and Communications.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-2 transition cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>New Employee Onboarding</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Onboardings</div>
          <div className="text-2xl font-black text-slate-900">{workflows.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Full autonomous pipeline</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">In Progress</div>
          <div className="text-2xl font-black text-indigo-600">
            {workflows.filter(w => w.status === 'RUNNING' || w.status === 'WAITING_FOR_APPROVAL').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Agents actively collaborating</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Access Checkpoints</div>
          <div className="text-2xl font-black text-amber-600">{approvals.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Privileged IAM approvals</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Avg Provisioning Time</div>
          <div className="text-2xl font-black text-emerald-600">3.8 mins</div>
          <div className="text-[11px] text-slate-500 mt-1">Vs. 4 business days manual</div>
        </div>
      </div>

      {/* Active Onboarding Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              Onboarding Requests & Specialized Agent Progress
            </h2>
            <p className="text-xs text-slate-500">Live DAG execution states across HR, IT Provisioning, and Payroll</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 mt-2">
          {workflows.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No employee onboardings yet. Click "New Employee Onboarding" to start.
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
                      'bg-indigo-100 text-indigo-800 border-indigo-200 animate-pulse'
                    }`}>
                      {String(wf.status || 'PENDING').replace(/_/g, ' ')}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Start Date: {wf.metadata?.startDate || 'Upcoming'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {wf.title}
                  </h3>
                  <div className="text-xs text-slate-500 flex items-center gap-3">
                    <span>Department: <strong>{wf.metadata?.department || 'Engineering'}</strong></span>
                    <span>•</span>
                    <span>Active Agent: <strong className="text-indigo-600">{wf.currentAgentName || 'Central Planner'}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="w-32 text-right">
                    <div className="text-xs font-bold text-slate-700 mb-1">{wf.progress}% Complete</div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${wf.progress}%` }}
                      />
                    </div>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold flex items-center gap-1 transition">
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Specialized Agent Coordination Blueprint */}
      <div className="bg-gradient-to-br from-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-extrabold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Autonomous Onboarding Agent Swarm
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              How the 6 specialized agents hand off tasks under Central Planner supervision
            </p>
          </div>
          <span className="px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30">
            6 Active Agents
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs mt-4">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="font-bold text-cyan-300">1. Employee Info Agent</div>
            <p className="text-slate-300 text-[11px] mt-1">Validates identity, residency, and tax criteria.</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="font-bold text-cyan-300">2. Document Verification Agent</div>
            <p className="text-slate-300 text-[11px] mt-1">OCR inspection of passport, I-9 & certifications.</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="font-bold text-cyan-300">3. HR Operations Agent</div>
            <p className="text-slate-300 text-[11px] mt-1">Provisions Workday profile and org tree.</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="font-bold text-cyan-300">4. Finance/Payroll Agent</div>
            <p className="text-slate-300 text-[11px] mt-1">Configures direct deposit, withholdings, and benefits.</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="font-bold text-cyan-300">5. IT Provisioning Agent</div>
            <p className="text-slate-300 text-[11px] mt-1">Dispatches Okta, Slack, and hardware.</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="font-bold text-cyan-300">6. Employee Comm Agent</div>
            <p className="text-slate-300 text-[11px] mt-1">Prepares customized welcome packet & roadmap.</p>
          </div>
        </div>
      </div>

      {/* Modal: New Employee Onboarding */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Initiate Employee Onboarding</h3>
                <p className="text-xs text-slate-500">Autonomous workflow with specialized agent handoffs</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Quick Demo Preset Buttons */}
            <div className="mt-4 p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl">
              <span className="text-[11px] font-bold text-indigo-900 block mb-1.5">
                ⚡ Demo Presets (1-Click Fill):
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handlePreset('security_lead')}
                  className="px-2.5 py-1 bg-white border border-indigo-200 text-indigo-800 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition"
                >
                  Sarah Jenkins (Security Lead + AWS Admin Approval)
                </button>
                <button
                  type="button"
                  onClick={() => handlePreset('product_designer')}
                  className="px-2.5 py-1 bg-white border border-indigo-200 text-indigo-800 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition"
                >
                  David Miller (Designer)
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateOnboarding} className="space-y-4 mt-4 text-xs">
              
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Candidate Full Name</label>
                <input
                  type="text"
                  required
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Job Title / Grade</label>
                  <input
                    type="text"
                    required
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hiring Manager</label>
                  <input
                    type="text"
                    required
                    value={manager}
                    onChange={(e) => setManager(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              {/* Upload Document Field */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Employee Documents (Passport / Driver's License / I-9)
                </label>
                <div className="border-2 border-dashed border-indigo-200 rounded-xl p-4 text-center bg-indigo-50/30">
                  <UploadCloud className="w-6 h-6 text-indigo-500 mx-auto mb-1" />
                  <div className="font-semibold text-slate-800">{uploadedDocName}</div>
                  <div className="text-[10px] text-slate-500">Document ready for OCR & Verification Agent</div>
                </div>
              </div>

              {/* Sensitive Access Toggle */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-amber-900 block">Privileged Cloud Access Required</span>
                  <span className="text-[11px] text-amber-700">Will pause at Step #5 for Administrator human approval</span>
                </div>
                <input
                  type="checkbox"
                  checked={requiresSensitiveAccess}
                  onChange={(e) => setRequiresSensitiveAccess(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
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
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Dispatching Agents...' : 'Start Autonomous Onboarding'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
