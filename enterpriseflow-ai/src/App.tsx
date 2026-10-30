import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth, getDashboardPath } from './context/AuthContext';
import { LiveWorkflowProvider } from './context/LiveWorkflowContext';
import { LoginPage } from './pages/LoginPage';
import { EnterpriseLayout } from './components/layout/EnterpriseLayout';
import { AdminDashboard } from './pages/dashboards/AdminDashboard';
import { HRDashboard } from './pages/dashboards/HRDashboard';
import { EmployeeDashboard } from './pages/dashboards/EmployeeDashboard';
import { FinanceDashboard } from './pages/dashboards/FinanceDashboard';
import { ClientDashboard } from './pages/dashboards/ClientDashboard';
import { WorkflowsPage } from './pages/WorkflowsPage';
import { WorkflowDetailPage } from './pages/WorkflowDetailPage';
import { PlannerPage } from './pages/PlannerPage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { AgentsPage } from './pages/AgentsPage';
import { DemoPage } from './pages/DemoPage';

function MainRouter() {
  const { user, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#031338] flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-300 font-medium">Initializing EnterpriseFlow AI Workspace...</p>
      </div>
    );
  }

  // If user is not authenticated or explicitly on /login, show LoginPage
  if (!user || currentPath === '/login') {
    return <LoginPage onSuccessNavigate={navigate} />;
  }

  // If logged in and on root `/`, navigate to role dashboard
  const effectivePath = currentPath === '/' ? getDashboardPath(user.role) : currentPath;

  const renderContent = () => {
    // Workflow detail route: /workflows/:id
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

    if (effectivePath.startsWith('/workflows')) {
      const isCreateOpen = effectivePath.includes('create=true');
      return (
        <WorkflowsPage
          onNavigateWorkflow={(id) => navigate(`/workflows/${id}`)}
          initialCreateOpen={isCreateOpen}
        />
      );
    }

    if (effectivePath === '/planner') {
      return <PlannerPage onNavigateWorkflow={(id) => navigate(`/workflows/${id}`)} />;
    }

    if (effectivePath === '/approvals') {
      return <ApprovalsPage onNavigateWorkflow={(id) => navigate(`/workflows/${id}`)} />;
    }

    if (effectivePath === '/audit') {
      return <AuditLogsPage onNavigateWorkflow={(id) => navigate(`/workflows/${id}`)} />;
    }

    if (effectivePath === '/agents') {
      return <AgentsPage />;
    }

    if (effectivePath === '/demo') {
      return <DemoPage onNavigateWorkflow={(id) => navigate(`/workflows/${id}`)} />;
    }

    // Role-specific Dashboards
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

export default function App() {
  return (
    <AuthProvider>
      <LiveWorkflowProvider>
        <MainRouter />
      </LiveWorkflowProvider>
    </AuthProvider>
  );
}
