import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MetricCards } from './components/approvals/MetricCards';
import { ApprovalTable } from './components/approvals/ApprovalTable';
import { ApprovalDrawer } from './components/approvals/ApprovalDrawer';
import { WorkflowVisualizer } from './components/workflows/WorkflowVisualizer';
import { AuditViewer } from './components/audit/AuditViewer';
import { AgentManagement } from './components/agents/AgentManagement';
import { ToolGatewayViewer } from './components/tools/ToolGatewayViewer';
import { PolicyViewer } from './components/policies/PolicyViewer';
import { AnalyticsViewer } from './components/analytics/AnalyticsViewer';
import { OperationsCanvas } from './components/canvas/OperationsCanvas';
import { ChaosConsole } from './components/chaos/ChaosConsole';
import { api, User, ApprovalItem, ApprovalDetail, ApprovalMetrics, WorkflowDetail } from './services/api';
import { Shield, Sparkles, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('approvals');
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'user_sarah_lin',
    email: 'sarah.lin@enterpriseflow.corp',
    full_name: 'Sarah Lin',
    department: 'Finance & Treasury',
    roles: ['Finance Director']
  });

  // Approvals State
  const [metrics, setMetrics] = useState<ApprovalMetrics | null>(null);
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalDetail | null>(null);
  const [loadingApprovals, setLoadingApprovals] = useState<boolean>(false);
  const [latestWorkflow, setLatestWorkflow] = useState<WorkflowDetail | null>(null);

  // Load initial data
  const loadApprovalsData = async () => {
    try {
      setLoadingApprovals(true);
      const [m, a, w] = await Promise.all([
        api.getApprovalMetrics(),
        api.listApprovals(),
        api.listWorkflows()
      ]);
      setMetrics(m);
      setApprovals(a.items || []);
      if (w.items && w.items.length > 0) {
        const firstWf = await api.getWorkflowDetail(w.items[0].id);
        setLatestWorkflow(firstWf);
      }
    } catch (err) {
      console.error('Failed to load approvals:', err);
    } finally {
      setLoadingApprovals(false);
    }
  };

  const loadUsers = async () => {
    try {
      const u = await api.getUsers();
      if (u && u.length > 0) {
        setUsers(u);
        // Default to Finance Director
        const defaultUser = u.find((x) => x.id === 'user_sarah_lin') || u[0];
        setCurrentUser(defaultUser);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  useEffect(() => {
    loadUsers();
    loadApprovalsData();
  }, []);

  // Handle row selection -> fetch detail
  const handleSelectApproval = async (item: ApprovalItem) => {
    try {
      const detail = await api.getApprovalDetail(item.id);
      setSelectedApproval(detail);
    } catch (err) {
      console.error(err);
    }
  };

  // Re-fetch detail for drawer updates
  const refreshSelectedApproval = async () => {
    if (!selectedApproval) return;
    try {
      const detail = await api.getApprovalDetail(selectedApproval.id);
      setSelectedApproval(detail);
      loadApprovalsData();
    } catch (err) {
      console.error(err);
    }
  };

  // Bulk Approve handler
  const handleBulkApprove = async (selectedIds: string[]) => {
    try {
      await api.bulkApprove(selectedIds, {
        id: currentUser.id,
        name: currentUser.full_name,
        role: currentUser.roles[0] || 'Approver'
      });
      loadApprovalsData();
      if (selectedApproval && selectedIds.includes(selectedApproval.id)) {
        refreshSelectedApproval();
      }
    } catch (err: any) {
      alert('Bulk approve failed: ' + err.message);
    }
  };

  const navigateToApproval = async (approvalId: string) => {
    setActiveTab('approvals');
    try {
      const detail = await api.getApprovalDetail(approvalId);
      setSelectedApproval(detail);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 overflow-hidden font-sans">
      {/* Dark Navy Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={metrics?.pending_count || 0}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          currentUser={currentUser}
          allUsers={users}
          onSelectUser={setCurrentUser}
          pendingCount={metrics?.pending_count || 0}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* APPROVALS MANAGEMENT CENTER (Flagship Module) */}
            {activeTab === 'approvals' && (
              <div>
                {/* Module Title Banner */}
                <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                  <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                      <span>Approval Management Center</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
                        Human-in-the-Loop Gateway
                      </span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                      Central enterprise governance portal. Review, authorize, or return operations proposed by autonomous multi-agent systems.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('workflows')}
                      className="px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center gap-1.5 transition-colors border border-blue-200"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Launch New Multi-Agent Workflow</span>
                    </button>
                  </div>
                </div>

                {/* 4 Summary Cards */}
                <MetricCards metrics={metrics} loading={loadingApprovals} />

                {/* Approval Table */}
                <ApprovalTable
                  items={approvals}
                  selectedItem={selectedApproval}
                  onSelectItem={handleSelectApproval}
                  onBulkApprove={handleBulkApprove}
                  loading={loadingApprovals}
                />
              </div>
            )}

            {/* WORKFLOWS & ORCHESTRATOR */}
            {(activeTab === 'workflows' ||
              activeTab === 'wf-onboarding' ||
              activeTab === 'wf-invoice' ||
              activeTab === 'wf-customer' ||
              activeTab === 'wf-procurement' ||
              activeTab === 'wf-it-incident') && (
              <div>
                <div className="mb-6">
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                    Multi-Agent Orchestrator & Workflows
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Autonomous DAG decomposition across 5 enterprise domains with Level 1 understanding and Level 4 governance gates.
                  </p>
                </div>

                <WorkflowVisualizer
                  onWorkflowCreated={async (wfId) => {
                    loadApprovalsData();
                    try {
                      const detail = await api.getWorkflowDetail(wfId);
                      setLatestWorkflow(detail);
                    } catch (e) {}
                  }}
                  onNavigateToApproval={navigateToApproval}
                />
              </div>
            )}

            {/* OPERATIONS CANVAS */}
            {activeTab === 'canvas' && (
              <div>
                <OperationsCanvas
                  workflow={latestWorkflow}
                  onRefresh={async () => {
                    if (latestWorkflow) {
                      const d = await api.getWorkflowDetail(latestWorkflow.id);
                      setLatestWorkflow(d);
                    }
                  }}
                />
              </div>
            )}

            {/* CHAOS TESTING CONSOLE */}
            {activeTab === 'chaos' && <ChaosConsole />}

            {/* AUDIT TRAIL */}
            {activeTab === 'audit-trail' && <AuditViewer />}

            {/* AGENT MANAGEMENT */}
            {activeTab === 'agents' && <AgentManagement />}

            {/* TOOL GATEWAY */}
            {activeTab === 'tool-gateway' && <ToolGatewayViewer />}

            {/* POLICIES & GUARDRAILS */}
            {activeTab === 'policies' && <PolicyViewer />}

            {/* ANALYTICS & CYCLE TIMES */}
            {(activeTab === 'cycle-times' || activeTab === 'analytics') && <AnalyticsViewer />}

            {/* OVERVIEW / DASHBOARD / MY TASKS */}
            {(activeTab === 'dashboard' || activeTab === 'my-tasks') && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                    Operations Executive Dashboard
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Real-time operational health, pending approvals, and active agent threads.
                  </p>
                </div>

                <MetricCards metrics={metrics} loading={loadingApprovals} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Urgent Approvals Section */}
                  <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>Action Required: Urgent Approvals</span>
                      </h3>
                      <button
                        onClick={() => setActiveTab('approvals')}
                        className="text-xs text-blue-600 font-semibold hover:underline"
                      >
                        View All
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {approvals.slice(0, 4).map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setActiveTab('approvals');
                            handleSelectApproval(item);
                          }}
                          className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-semibold text-slate-900 truncate max-w-sm">{item.title}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {item.department} &bull; {item.requested_by_agent}
                            </div>
                          </div>
                          <div className="text-right">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                item.risk_level === 'CRITICAL'
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {item.risk_level}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick System Launch */}
                  <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-600" />
                        <span>Platform Philosophy & Integrity</span>
                      </h3>
                      <blockquote className="p-3 bg-blue-50/70 border-l-4 border-blue-600 text-xs text-blue-900 italic my-2 rounded-r-lg">
                        "AI agents execute the work. Humans retain authority. Every action is accountable."
                      </blockquote>
                      <p className="text-xs text-slate-600 leading-relaxed mt-3">
                        EnterpriseFlow AI orchestrates five enterprise business workflows with Level 1 natural-language request understanding, Level 2 Central dynamic DAG planning, Level 3 specialized agents, and Level 4 cryptographic audit logging.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => setActiveTab('workflows')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
                      >
                        Launch Multi-Agent Workflows
                      </button>
                      <button
                        onClick={() => setActiveTab('audit-trail')}
                        className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                      >
                        Inspect Hash Chain
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Flagship Right-Side Approval Detail Drawer */}
      <ApprovalDrawer
        approval={selectedApproval}
        currentUser={currentUser}
        onClose={() => setSelectedApproval(null)}
        onApproved={() => {
          refreshSelectedApproval();
          loadApprovalsData();
        }}
        onRejected={() => {
          refreshSelectedApproval();
          loadApprovalsData();
        }}
        onChangesRequested={() => {
          refreshSelectedApproval();
          loadApprovalsData();
        }}
        onCommentAdded={refreshSelectedApproval}
      />
    </div>
  );
}

export default App;
