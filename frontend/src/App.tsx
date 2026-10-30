import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth, getDashboardPath } from './context/AuthContext';
import { LiveWorkflowProvider } from './context/LiveWorkflowContext';
import { LoginPage } from './pages/LoginPage';
import { EnterpriseLayout } from './components/layout/EnterpriseLayout';

// Role Dashboards from Project B
import { AdminDashboard } from './pages/dashboards/AdminDashboard';
import { HRDashboard } from './pages/dashboards/HRDashboard';
import { EmployeeDashboard } from './pages/dashboards/EmployeeDashboard';
import { FinanceDashboard } from './pages/dashboards/FinanceDashboard';
import { ClientDashboard } from './pages/dashboards/ClientDashboard';

// Workflow & Planning Pages
import { WorkflowsPage } from './pages/WorkflowsPage';
import { WorkflowDetailPage } from './pages/WorkflowDetailPage';
import { PlannerPage } from './pages/PlannerPage';
import { DemoPage } from './pages/DemoPage';

// Flagship Engineering & Governance Modules
import { OperationsCanvas } from './components/canvas/OperationsCanvas';
import { ChaosConsole } from './components/chaos/ChaosConsole';
import { AuditViewer } from './components/audit/AuditViewer';
import { AgentManagement } from './components/agents/AgentManagement';
import { ToolGatewayViewer } from './components/tools/ToolGatewayViewer';
import { PolicyViewer } from './components/policies/PolicyViewer';
import { AnalyticsViewer } from './components/analytics/AnalyticsViewer';
import { MetricCards } from './components/approvals/MetricCards';
import { ApprovalTable } from './components/approvals/ApprovalTable';
import { ApprovalDrawer } from './components/approvals/ApprovalDrawer';

import { api, User, ApprovalItem, ApprovalDetail, ApprovalMetrics, WorkflowDetail } from './services/api';
import { Shield, Sparkles, CheckCircle2, Clock, AlertTriangle, Settings as SettingsIcon, ClipboardList } from 'lucide-react';

function MainRouter() {
  const { user, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');

  // Live state for Approvals and Canvas
  const [metrics, setMetrics] = useState<ApprovalMetrics | null>(null);
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalDetail | null>(null);
  const [loadingApprovals, setLoadingApprovals] = useState<boolean>(false);
  const [latestWorkflow, setLatestWorkflow] = useState<WorkflowDetail | null>(null);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  useEffect(() => {
    if (user) {
      loadApprovalsData();
      const interval = setInterval(loadApprovalsData, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleSelectApproval = async (item: ApprovalItem) => {
    try {
      const detail = await api.getApprovalDetail(item.id);
      setSelectedApproval(detail);
    } catch (err) {
      console.error(err);
    }
  };

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

  const handleBulkApprove = async (selectedIds: string[]) => {
    try {
      await api.bulkApprove(selectedIds, {
        id: user?.id || 'usr_admin_01',
        name: user?.name || 'Administrator',
        role: user?.role || 'ADMIN'
      });
      loadApprovalsData();
      if (selectedApproval && selectedIds.includes(selectedApproval.id)) {
        refreshSelectedApproval();
      }
    } catch (err: any) {
      alert('Bulk approve failed: ' + err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#031B46] flex flex-col items-center justify-center text-white font-sans">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-300 font-semibold tracking-wide">
          Initializing EnterpriseFlow AI Autonomous Environment...
        </p>
      </div>
    );
  }

  // Not authenticated -> show Project B's Login Page
  if (!user || currentPath === '/login') {
    return <LoginPage onSuccessNavigate={navigate} />;
  }

  // Authenticated on root -> redirect to role dashboard
  const effectivePath = currentPath === '/' ? getDashboardPath(user.role) : currentPath;

  const renderContent = () => {
    // 1. Workflow Detail
    if (effectivePath.startsWith('/workflows/')) {
      const workflowId = effectivePath.replace('/workflows/', '');
      return (
        <WorkflowDetailPage
          workflowId={workflowId}
          onBack={() => navigate('/workflows')}
          onNavigateApprovals={() => navigate('/approvals')}
        />
      );
    }

    // 2. Workflows & Pipeline (and domain-specific subroutes)
    if (effectivePath.startsWith('/workflows')) {
      const isCreateOpen = effectivePath.includes('create=true');
      return (
        <WorkflowsPage
          onNavigateWorkflow={(id) => navigate(`/workflows/${id}`)}
          initialCreateOpen={isCreateOpen}
        />
      );
    }

    // 3. Operations Canvas (Revka-inspired with React Flow DAG & Inspector)
    if (effectivePath === '/canvas') {
      return (
        <div className="space-y-6">
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
      );
    }

    // 4. Central Planner Agent
    if (effectivePath === '/planner') {
      return <PlannerPage onNavigateWorkflow={(id) => navigate(`/workflows/${id}`)} />;
    }

    // 5. Human Approvals Management Center (Flagship UI Bakery Table + Detail Drawer)
    if (effectivePath === '/approvals') {
      const currentUserObj: User = {
        id: user.id,
        email: user.email,
        full_name: user.name,
        department: user.department,
        roles: [user.role]
      };
      return (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Approval Management Center</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold border border-blue-200">
                  Human-in-the-Loop Gateway
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Central enterprise governance portal. Review, authorize, or return operations proposed by autonomous multi-agent workers.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/workflows')}
                className="px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl flex items-center gap-1.5 transition-colors border border-blue-200"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Launch Multi-Agent Workflow</span>
              </button>
            </div>
          </div>

          <MetricCards metrics={metrics} loading={loadingApprovals} />

          <ApprovalTable
            items={approvals}
            selectedItem={selectedApproval}
            onSelectItem={handleSelectApproval}
            onBulkApprove={handleBulkApprove}
            loading={loadingApprovals}
          />

          <ApprovalDrawer
            approval={selectedApproval}
            currentUser={currentUserObj}
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

    // 6. Chaos Testing Console
    if (effectivePath === '/chaos') {
      return <ChaosConsole />;
    }

    // 7. Audit Trail & Cryptographic Verifiability
    if (effectivePath === '/audit') {
      return <AuditViewer />;
    }

    // 8. Agent Management (Compact 5 Core Roles)
    if (effectivePath === '/agents') {
      return <AgentManagement />;
    }

    // 9. Analytics & Telemetry
    if (effectivePath === '/analytics') {
      return <AnalyticsViewer />;
    }

    // 10. Policies & Guardrails
    if (effectivePath === '/policies') {
      return <PolicyViewer />;
    }

    // 11. Tool Gateway & APIs
    if (effectivePath === '/tools') {
      return <ToolGatewayViewer />;
    }

    // 12. Demo Scenarios & Test Suite
    if (effectivePath === '/demo') {
      return <DemoPage onNavigateWorkflow={(id) => navigate(`/workflows/${id}`)} />;
    }

    // 13. My Tasks
    if (effectivePath === '/my-tasks') {
      return (
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <ClipboardList className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">My Assigned Tasks</h1>
                <p className="text-xs text-slate-500">
                  Operations assigned to {user.name} ({user.department}) requiring review or authorization.
                </p>
              </div>
            </div>
          </div>
          <MetricCards metrics={metrics} loading={loadingApprovals} />
          <ApprovalTable
            items={approvals}
            selectedItem={selectedApproval}
            onSelectItem={handleSelectApproval}
            onBulkApprove={handleBulkApprove}
            loading={loadingApprovals}
          />
        </div>
      );
    }

    // 14. Settings
    if (effectivePath === '/settings') {
      return (
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                <SettingsIcon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Workspace & Governance Settings</h1>
                <p className="text-xs text-slate-500">
                  Enterprise security guardrails, LangGraph checkpoint interval, and backend connectivity.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="text-xs font-bold text-slate-800 mb-1">Backend Engine</div>
                <div className="text-xs text-slate-500 font-mono">FastAPI 2.4.0 (Python 3.12 + LangGraph)</div>
                <div className="mt-2 text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Connected: http://127.0.0.1:8000</span>
                </div>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="text-xs font-bold text-slate-800 mb-1">Cryptographic Audit Chain</div>
                <div className="text-xs text-slate-500 font-mono">SHA-256 Merkle-linked ledger active</div>
                <div className="mt-2 text-[11px] text-blue-600 font-semibold flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Append-only immutable record</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 15. Role Dashboards
    if (effectivePath === '/hr/dashboard') {
      return <HRDashboard onNavigate={navigate} />;
    }
    if (effectivePath === '/employee/dashboard') {
      return <EmployeeDashboard onNavigate={navigate} />;
    }
    if (effectivePath === '/finance/dashboard') {
      return <FinanceDashboard onNavigate={navigate} />;
    }
    if (effectivePath === '/client/dashboard' || effectivePath === '/service/dashboard') {
      return <ClientDashboard onNavigate={navigate} />;
    }

    // Default to Admin Dashboard
    return <AdminDashboard onNavigate={navigate} />;
  };

  return (
    <EnterpriseLayout currentPath={effectivePath} onNavigate={navigate}>
      {renderContent()}
    </EnterpriseLayout>
  );
}

export function App() {
  return (
    <AuthProvider>
      <LiveWorkflowProvider>
        <MainRouter />
      </LiveWorkflowProvider>
    </AuthProvider>
  );
}

export default App;
