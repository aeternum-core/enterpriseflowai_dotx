import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { db } from './db';
import { plannerAgent, subscribeSSE, broadcastEvent } from './planner';
import { UserRole, WorkflowType } from './types';

export const apiRouter = Router();

// ================= AUTH ROUTES =================
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const user = Array.from(db.users.values()).find(
    u => u.email.toLowerCase() === email.toLowerCase().trim()
  );

  if (!user || user.passwordHash !== password) {
    res.status(401).json({ error: 'Invalid email or password credentials.' });
    return;
  }

  const token = `tok_${crypto.randomUUID()}`;
  const session = {
    token,
    userId: user.id,
    role: user.role,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };
  db.sessions.set(token, session);

  user.lastLoginAt = new Date().toISOString();

  db.logInteraction(user.id, user.name, user.role, 'USER_LOGIN', {
    method: 'PASSWORD_LOGIN',
    email: user.email
  });

  db.logAudit(
    user.id,
    'USER',
    user.name,
    user.role,
    'USER_LOGIN',
    `User ${user.name} logged into ${user.role} workspace`,
    'SUCCESS',
    { role: user.role }
  );

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      avatarUrl: user.avatarUrl
    }
  });
});

apiRouter.post('/auth/quick-login', (req: Request, res: Response) => {
  const { role } = req.body;
  const user = Array.from(db.users.values()).find(u => u.role === role);
  if (!user) {
    res.status(404).json({ error: 'Role account not found.' });
    return;
  }

  const token = `tok_${crypto.randomUUID()}`;
  db.sessions.set(token, {
    token,
    userId: user.id,
    role: user.role,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  });

  user.lastLoginAt = new Date().toISOString();

  db.logInteraction(user.id, user.name, user.role, 'USER_LOGIN', {
    method: 'QUICK_ROLE_SWITCH',
    targetRole: role
  });

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      avatarUrl: user.avatarUrl
    }
  });
});

apiRouter.get('/auth/session', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: 'No authorization header provided.' });
    return;
  }
  const token = authHeader.replace('Bearer ', '');
  const session = db.sessions.get(token);
  if (!session) {
    res.status(401).json({ error: 'Invalid or expired session.' });
    return;
  }

  const user = db.users.get(session.userId);
  if (!user) {
    res.status(401).json({ error: 'User not found.' });
    return;
  }

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      avatarUrl: user.avatarUrl
    }
  });
});

apiRouter.post('/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    const session = db.sessions.get(token);
    if (session) {
      const user = db.users.get(session.userId);
      if (user) {
        db.logInteraction(user.id, user.name, user.role, 'USER_LOGOUT', {});
        db.logAudit(user.id, 'USER', user.name, user.role, 'USER_LOGOUT', `User ${user.name} logged out`, 'INFO', {});
      }
      db.sessions.delete(token);
    }
  }
  res.json({ success: true });
});

apiRouter.get('/auth/users', (_req: Request, res: Response) => {
  const users = Array.from(db.users.values()).map(u => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    department: u.department,
    avatarUrl: u.avatarUrl,
    lastLoginAt: u.lastLoginAt
  }));
  res.json(users);
});

// ================= WORKFLOW ROUTES =================
apiRouter.get('/workflows', (req: Request, res: Response) => {
  const { type, status, search, role } = req.query;
  let list = Array.from(db.workflows.values());

  if (type) {
    list = list.filter(w => w.type === type);
  }
  if (status) {
    list = list.filter(w => w.status === status);
  }
  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter(w => w.title.toLowerCase().includes(q) || w.id.toLowerCase().includes(q));
  }
  // Role scope filtering if requested
  if (role && role !== 'ADMIN') {
    if (role === 'HR_MANAGER') {
      list = list.filter(w => w.type === 'EMPLOYEE_ONBOARDING');
    } else if (role === 'FINANCE_MANAGER') {
      list = list.filter(w => w.type === 'INVOICE_PROCESSING');
    } else if (role === 'CLIENT_MANAGER') {
      list = list.filter(w => w.type === 'CUSTOMER_REQUEST_RESOLUTION');
    }
  }

  // Sort newest first
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(list);
});

apiRouter.post('/workflows', async (req: Request, res: Response) => {
  try {
    const { title, type, submittedByUserId, submittedByName, submittedByRole, priority, metadata, documentIds } = req.body;
    if (!title || !type) {
      res.status(400).json({ error: 'Title and workflow type are required.' });
      return;
    }

    const workflow = await plannerAgent.createAndPlanWorkflow({
      title,
      type: type as WorkflowType,
      submittedByUserId: submittedByUserId || 'usr-admin-01',
      submittedByName: submittedByName || 'Admin User',
      submittedByRole: (submittedByRole || 'ADMIN') as UserRole,
      priority: priority || 'MEDIUM',
      metadata: metadata || {},
      documentIds: documentIds || []
    });

    res.status(201).json(workflow);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to initialize workflow plan.' });
  }
});

apiRouter.get('/workflows/:id', (req: Request, res: Response) => {
  const workflow = db.workflows.get(req.params.id);
  if (!workflow) {
    res.status(404).json({ error: 'Workflow not found.' });
    return;
  }

  // Get associated agent messages
  const messages = Array.from(db.messages.values())
    .filter(m => m.workflowId === workflow.id)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Get associated approvals
  const approvals = Array.from(db.approvals.values())
    .filter(a => a.workflowId === workflow.id);

  // Get associated documents
  const docs = workflow.documentIds
    .map(id => db.documents.get(id))
    .filter(Boolean);

  res.json({
    workflow,
    tasks: workflow.tasks,
    messages,
    approvals,
    documents: docs
  });
});

apiRouter.post('/workflows/:id/start', async (req: Request, res: Response) => {
  const workflow = db.workflows.get(req.params.id);
  if (!workflow) {
    res.status(404).json({ error: 'Workflow not found.' });
    return;
  }
  plannerAgent.executeWorkflow(workflow.id);
  res.json({ success: true, message: 'Central Planner execution initiated.' });
});

apiRouter.post('/workflows/:id/simulate-failure', (req: Request, res: Response) => {
  const { taskId } = req.body;
  const workflow = db.workflows.get(req.params.id);
  if (!workflow) {
    res.status(404).json({ error: 'Workflow not found.' });
    return;
  }

  const targetTaskId = taskId || workflow.tasks[0]?.id;
  const result = plannerAgent.simulateAgentFailureAndReplan(workflow.id, targetTaskId);
  res.json(result);
});

// ================= APPROVAL ROUTES =================
apiRouter.get('/approvals', (req: Request, res: Response) => {
  const { state, role } = req.query;
  let list = Array.from(db.approvals.values());

  if (state) {
    list = list.filter(a => a.state === state);
  }
  if (role && role !== 'ADMIN') {
    list = list.filter(a => a.approverRoleRequired === role);
  }

  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(list);
});

apiRouter.post('/approvals/:id/decide', async (req: Request, res: Response) => {
  const { decision, decidedByUserId, decidedByName, decidedByRole, reason } = req.body;
  if (!decision || !['APPROVED', 'REJECTED', 'CHANGES_REQUESTED'].includes(decision)) {
    res.status(400).json({ error: 'Valid decision (APPROVED, REJECTED, CHANGES_REQUESTED) is required.' });
    return;
  }

  const result = await plannerAgent.processApprovalDecision({
    approvalId: req.params.id,
    decision,
    decidedByUserId: decidedByUserId || 'usr-admin-01',
    decidedByName: decidedByName || 'System Approver',
    decidedByRole: decidedByRole || 'ADMIN',
    reason
  });

  if (!result.success) {
    res.status(400).json(result);
    return;
  }

  res.json(result);
});

// ================= AGENTS & PLANNER STATS =================
apiRouter.get('/agents', (_req: Request, res: Response) => {
  const list = Array.from(db.agents.values());
  res.json(list);
});

apiRouter.get('/planner/stats', (_req: Request, res: Response) => {
  const workflows = Array.from(db.workflows.values());
  const approvals = Array.from(db.approvals.values());
  const agents = Array.from(db.agents.values());

  const activeWorkflows = workflows.filter(w => w.status === 'RUNNING' || w.status === 'PLANNING').length;
  const pendingApprovals = approvals.filter(a => a.state === 'PENDING').length;
  const completedWorkflows = workflows.filter(w => w.status === 'COMPLETED').length;
  const failedWorkflows = workflows.filter(w => w.status === 'FAILED' || w.status === 'REQUIRES_ATTENTION').length;

  res.json({
    totalWorkflows: workflows.length,
    activeWorkflows,
    pendingApprovals,
    completedWorkflows,
    failedWorkflows,
    totalAgents: agents.length,
    plannerHealth: 'OPTIMAL',
    avgTaskCompletionMs: 460
  });
});

// ================= AUDIT & INTERACTION LOGS =================
apiRouter.get('/audit-logs', (req: Request, res: Response) => {
  const { workflowId, actorType, status, search, eventType } = req.query;
  let list = [...db.auditLogs];

  if (workflowId) list = list.filter(l => l.workflowId === workflowId);
  if (actorType) list = list.filter(l => l.actorType === actorType);
  if (status) list = list.filter(l => l.status === status);
  if (eventType) list = list.filter(l => l.eventType === eventType);
  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter(l => l.description.toLowerCase().includes(q) || l.actorName.toLowerCase().includes(q));
  }

  res.json(list);
});

apiRouter.get('/interaction-logs', (req: Request, res: Response) => {
  const { userId, role, action, search } = req.query;
  let list = [...db.interactionLogs];

  if (userId) list = list.filter(l => l.userId === userId);
  if (role) list = list.filter(l => l.userRole === role);
  if (action) list = list.filter(l => l.action === action);
  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter(l => l.action.toLowerCase().includes(q) || (l.userName && l.userName.toLowerCase().includes(q)));
  }

  res.json(list);
});

// ================= DOCUMENTS =================
apiRouter.get('/documents', (_req: Request, res: Response) => {
  res.json(Array.from(db.documents.values()));
});

apiRouter.post('/documents/upload', (req: Request, res: Response) => {
  const { name, fileType, sizeBytes, uploadedByUserId, uploadedByName, extractedText } = req.body;
  const doc = {
    id: `doc-${crypto.randomUUID().slice(0, 8)}`,
    name: name || 'Uploaded_Document.pdf',
    fileType: fileType || 'application/pdf',
    sizeBytes: sizeBytes || 154000,
    uploadedByUserId: uploadedByUserId || 'usr-admin-01',
    uploadedByName: uploadedByName || 'Admin',
    url: `/assets/uploads/${name || 'doc.pdf'}`,
    uploadedAt: new Date().toISOString(),
    extractedText: extractedText || 'Document content ingested and verified by Document Ingestion Service.'
  };

  db.documents.set(doc.id, doc);
  db.logInteraction(uploadedByUserId, uploadedByName, 'ADMIN', 'DOCUMENT_UPLOADED', { documentId: doc.id, name: doc.name });
  res.status(201).json(doc);
});

// ================= NOTIFICATIONS =================
apiRouter.get('/notifications', (req: Request, res: Response) => {
  const { role } = req.query;
  let list = [...db.notifications];
  if (role && role !== 'ADMIN') {
    list = list.filter(n => !n.targetRole || n.targetRole === role);
  }
  res.json(list);
});

apiRouter.post('/notifications/:id/read', (req: Request, res: Response) => {
  const notif = db.notifications.find(n => n.id === req.params.id);
  if (notif) notif.read = true;
  res.json({ success: true });
});

// ================= LIVE SERVER-SENT EVENTS (SSE) =================
apiRouter.get('/events/live', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send initial connected ping
  res.write(`data: ${JSON.stringify({ event: 'connected', payload: { time: new Date().toISOString() } })}\n\n`);

  const unsubscribe = subscribeSSE((data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  });

  req.on('close', () => {
    unsubscribe();
  });
});

// ================= DEMO CONTROLS =================
apiRouter.post('/demo/reset', (_req: Request, res: Response) => {
  db.seedDatabase();
  broadcastEvent('database_reset', { message: 'Database reset to initial demo state.' });
  res.json({ success: true, message: 'Database reset to initial demo state.' });
});

apiRouter.post('/demo/trigger-scenario', async (req: Request, res: Response) => {
  const { scenarioId } = req.body;
  try {
    let createdWf;
    switch (scenarioId) {
      case 'onboarding_executive':
        createdWf = await plannerAgent.createAndPlanWorkflow({
          title: 'Employee Onboarding - Michael Chang (VP of Engineering)',
          type: 'EMPLOYEE_ONBOARDING',
          submittedByUserId: 'usr-hr-02',
          submittedByName: 'Elena Rostova',
          submittedByRole: 'HR_MANAGER',
          priority: 'CRITICAL',
          metadata: {
            candidateName: 'Michael Chang',
            roleTitle: 'VP of Engineering',
            department: 'Global Engineering',
            startDate: '2026-11-10',
            manager: 'Alexander Sterling'
          }
        });
        break;

      case 'large_invoice_approval':
        createdWf = await plannerAgent.createAndPlanWorkflow({
          title: 'Invoice Processing - Global Datacenter Transit ($48,200)',
          type: 'INVOICE_PROCESSING',
          submittedByUserId: 'usr-fin-03',
          submittedByName: 'Marcus Vance',
          submittedByRole: 'FINANCE_MANAGER',
          priority: 'HIGH',
          metadata: {
            vendorName: 'Equinix Global Fiber Network',
            invoiceNumber: 'EQX-2026-4912',
            amount: 48200.00,
            currency: 'USD',
            poNumber: 'PO-77192-DATA'
          }
        });
        break;

      case 'sev1_cloud_incident':
        createdWf = await plannerAgent.createAndPlanWorkflow({
          title: 'IT Incident Response - Production Postgres Lock Contention (Sev-1)',
          type: 'IT_INCIDENT_ACCESS_GOVERNANCE',
          submittedByUserId: 'usr-admin-01',
          submittedByName: 'Alexander Sterling',
          submittedByRole: 'ADMIN',
          priority: 'CRITICAL',
          metadata: {
            incidentId: 'INC-2026-9901',
            system: 'Primary CloudSQL Database Cluster',
            service: 'Order Processing & Checkout'
          }
        });
        break;

      case 'customer_sla_escalation':
        createdWf = await plannerAgent.createAndPlanWorkflow({
          title: 'Customer Resolution - Quantum Health Systems (Webhook Timeout)',
          type: 'CUSTOMER_REQUEST_RESOLUTION',
          submittedByUserId: 'usr-client-04',
          submittedByName: 'Sophia Chen',
          submittedByRole: 'CLIENT_MANAGER',
          priority: 'HIGH',
          metadata: {
            customerName: 'Quantum Health Systems (Enterprise Tier 1)',
            inquiryText: 'Our automated HL7 batch sync webhook is timing out with 504 Gateway error.',
            ticketNumber: 'TKT-99214'
          }
        });
        break;

      case 'server_cluster_procurement':
        createdWf = await plannerAgent.createAndPlanWorkflow({
          title: 'Enterprise Procurement - 16x NVidia H100 GPU Cluster',
          type: 'PROCUREMENT_VENDOR_ONBOARDING',
          submittedByUserId: 'usr-admin-01',
          submittedByName: 'Alexander Sterling',
          submittedByRole: 'ADMIN',
          priority: 'HIGH',
          metadata: {
            item: '16x NVidia H100 80GB SXM5 Server Nodes',
            budget: 450000,
            deliveryDeadline: '30 Business Days'
          }
        });
        break;

      default:
        res.status(400).json({ error: 'Unknown scenario ID' });
        return;
    }

    res.json({ success: true, workflow: createdWf });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
