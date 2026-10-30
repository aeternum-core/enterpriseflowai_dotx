import crypto from 'crypto';
import { db } from './db';
import { generateGeminiReasoning } from './gemini';
import {
  Workflow,
  WorkflowTask,
  WorkflowType,
  AgentMessage,
  ApprovalRequest,
  WorkflowEvent,
  UserRole
} from './types';

// SSE subscribers for live streaming of workflow execution
export type SSEListener = (data: { event: string; payload: any }) => void;
const sseListeners = new Set<SSEListener>();

export function subscribeSSE(listener: SSEListener) {
  sseListeners.add(listener);
  return () => {
    sseListeners.delete(listener);
  };
}

export function broadcastEvent(event: string, payload: any) {
  sseListeners.forEach(listener => {
    try {
      listener({ event, payload });
    } catch (e) {
      // Ignore dropped connections
    }
  });
}

export class CentralPlannerAgent {
  name = 'Central Planner Agent';

  /**
   * Initialize a new workflow execution plan from a business goal
   */
  async createAndPlanWorkflow(params: {
    title: string;
    type: WorkflowType;
    submittedByUserId: string;
    submittedByName: string;
    submittedByRole: UserRole;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    metadata: Record<string, any>;
    documentIds?: string[];
  }): Promise<Workflow> {
    const workflowId = `wf-${params.type.toLowerCase().slice(0, 4)}-${Date.now().toString().slice(-6)}`;
    
    // 1. Log Planner Inception
    db.logInteraction(
      params.submittedByUserId,
      params.submittedByName,
      params.submittedByRole,
      'WORKFLOW_CREATED',
      { title: params.title, type: params.type },
      workflowId
    );

    db.logAudit(
      'agent-planner',
      'PLANNER',
      this.name,
      'CENTRAL_ORCHESTRATOR',
      'WORKFLOW_CREATED',
      `Central Planner received goal: "${params.title}" and generated DAG execution blueprint`,
      'SUCCESS',
      { workflowType: params.type, priority: params.priority || 'MEDIUM' },
      workflowId
    );

    // 2. Generate specialized tasks for this workflow type
    const tasks = this.generateTasksForWorkflow(workflowId, params.type, params.metadata);

    const workflow: Workflow = {
      id: workflowId,
      title: params.title,
      type: params.type,
      submittedByUserId: params.submittedByUserId,
      submittedByName: params.submittedByName,
      submittedByRole: params.submittedByRole,
      status: 'PLANNING',
      priority: params.priority || 'MEDIUM',
      metadata: params.metadata,
      documentIds: params.documentIds || [],
      tasks,
      progress: 0,
      plannerNotes: [
        `Central Planner: Ingested business goal "${params.title}".`,
        `Central Planner: Classified intent as ${params.type}.`,
        `Central Planner: Built ${tasks.length}-stage DAG task dependency graph.`
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.workflows.set(workflow.id, workflow);
    tasks.forEach(t => db.tasks.set(t.id, t));

    broadcastEvent('workflow_created', workflow);

    // 3. Initiate execution asynchronously
    setTimeout(() => {
      this.executeWorkflow(workflow.id);
    }, 600);

    return workflow;
  }

  /**
   * Generates predefined, domain-specific DAG tasks for the 5 enterprise workflows
   */
  private generateTasksForWorkflow(workflowId: string, type: WorkflowType, metadata: Record<string, any>): WorkflowTask[] {
    switch (type) {
      case 'EMPLOYEE_ONBOARDING': {
        const t1 = `task-${workflowId}-1`;
        const t2 = `task-${workflowId}-2`;
        const t3 = `task-${workflowId}-3`;
        const t4 = `task-${workflowId}-4`;
        const t5 = `task-${workflowId}-5`;
        const t6 = `task-${workflowId}-6`;
        const t7 = `task-${workflowId}-7`;

        return [
          {
            id: t1,
            workflowId,
            name: 'Validate Personal & Tax Identity',
            description: 'Verify employee profile, residency, and tax jurisdiction',
            assignedAgentId: 'agent-emp-info',
            assignedAgentName: 'Employee Information Agent',
            dependencies: [],
            status: 'PENDING',
            order: 1,
            progress: 0,
            retryCount: 0,
            maxRetries: 3
          },
          {
            id: t2,
            workflowId,
            name: 'Document & Work Authorization Verification',
            description: 'Run OCR on passport/driver license and check against I-9 databases',
            assignedAgentId: 'agent-doc-verify',
            assignedAgentName: 'Document Verification Agent',
            dependencies: [t1],
            status: 'PENDING',
            order: 2,
            progress: 0,
            retryCount: 0,
            maxRetries: 3
          },
          {
            id: t3,
            workflowId,
            name: 'HRIS Employee Record Creation',
            description: 'Provision profile in Workday/BambooHR, assign manager, role, and department',
            assignedAgentId: 'agent-hr-ops',
            assignedAgentName: 'HR Operations Agent',
            dependencies: [t2],
            status: 'PENDING',
            order: 3,
            progress: 0,
            retryCount: 0,
            maxRetries: 3
          },
          {
            id: t4,
            workflowId,
            name: 'Payroll Enrollment & Benefits Tier Setup',
            description: 'Configure direct deposit, tax withholdings, and medical benefits plan',
            assignedAgentId: 'agent-payroll',
            assignedAgentName: 'Finance/Payroll Agent',
            dependencies: [t3],
            status: 'PENDING',
            order: 4,
            progress: 0,
            retryCount: 0,
            maxRetries: 3
          },
          {
            id: t5,
            workflowId,
            name: 'Privileged IT Security Access Gate',
            description: 'Human approval checkpoint for production cloud, repository, and sensitive keys',
            assignedAgentId: 'agent-it-prov',
            assignedAgentName: 'IT Provisioning Agent',
            dependencies: [t4],
            status: 'PENDING',
            order: 5,
            progress: 0,
            retryCount: 0,
            maxRetries: 2,
            requiresApproval: true
          },
          {
            id: t6,
            workflowId,
            name: 'IT Workspace & Identity Provisioning',
            description: 'Issue Okta SSO, Google Workspace, Slack, and corporate laptop dispatch',
            assignedAgentId: 'agent-it-prov',
            assignedAgentName: 'IT Provisioning Agent',
            dependencies: [t5],
            status: 'PENDING',
            order: 6,
            progress: 0,
            retryCount: 0,
            maxRetries: 3
          },
          {
            id: t7,
            workflowId,
            name: 'Welcome Package & Joining Instructions',
            description: 'Generate personalized day-one roadmap, mentor introductions, and schedule',
            assignedAgentId: 'agent-emp-comm',
            assignedAgentName: 'Employee Communication Agent',
            dependencies: [t6],
            status: 'PENDING',
            order: 7,
            progress: 0,
            retryCount: 0,
            maxRetries: 3
          }
        ];
      }

      case 'INVOICE_PROCESSING': {
        const t1 = `task-${workflowId}-1`;
        const t2 = `task-${workflowId}-2`;
        const t3 = `task-${workflowId}-3`;
        const t4 = `task-${workflowId}-4`;
        const t5 = `task-${workflowId}-5`;
        const t6 = `task-${workflowId}-6`;

        return [
          {
            id: t1,
            workflowId,
            name: 'Invoice Ingestion & Structure Check',
            description: 'Ingest raw document and validate digital integrity',
            assignedAgentId: 'agent-inv-intake',
            assignedAgentName: 'Invoice Intake Agent',
            dependencies: [],
            status: 'PENDING',
            order: 1,
            progress: 0,
            retryCount: 0,
            maxRetries: 3
          },
          {
            id: t2,
            workflowId,
            name: 'Multimodal Data Extraction (Gemini Vision)',
            description: 'Extract vendor details, invoice number, line items, taxes, and total amount',
            assignedAgentId: 'agent-data-extract',
            assignedAgentName: 'Data Extraction Agent',
            dependencies: [t1],
            status: 'PENDING',
            order: 2,
            progress: 0,
            retryCount: 0,
            maxRetries: 3
          },
          {
            id: t3,
            workflowId,
            name: 'Ledger Duplicate & Fraud Collision Check',
            description: 'Scan historical accounts payable database for duplicate hash signatures',
            assignedAgentId: 'agent-dup-detect',
            assignedAgentName: 'Duplicate Detection Agent',
            dependencies: [t2],
            status: 'PENDING',
            order: 3,
            progress: 0,
            retryCount: 0,
            maxRetries: 3
          },
          {
            id: t4,
            workflowId,
            name: '3-Way PO Reconciliation & Discrepancy Flagging',
            description: 'Cross-reference purchase order line items, quantity, and contract unit rates',
            assignedAgentId: 'agent-fin-recon',
            assignedAgentName: 'Financial Reconciliation Agent',
            dependencies: [t3],
            status: 'PENDING',
            order: 4,
            progress: 0,
            retryCount: 0,
            maxRetries: 3
          },
          {
            id: t5,
            workflowId,
            name: 'Finance Manager Payment Authorization Gate',
            description: 'Executive human sign-off before releasing corporate funds',
            assignedAgentId: 'agent-pay-proc',
            assignedAgentName: 'Payment Processing Agent',
            dependencies: [t4],
            status: 'PENDING',
            order: 5,
            progress: 0,
            retryCount: 0,
            maxRetries: 2,
            requiresApproval: true
          },
          {
            id: t6,
            workflowId,
            name: 'ERP Settlement & ACH Remittance Advice',
            description: 'Post payment voucher to SAP/NetSuite and archive immutable audit report',
            assignedAgentId: 'agent-pay-proc',
            assignedAgentName: 'Payment Processing Agent',
            dependencies: [t5],
            status: 'PENDING',
            order: 6,
            progress: 0,
            retryCount: 0,
            maxRetries: 3
          }
        ];
      }

      case 'CUSTOMER_REQUEST_RESOLUTION': {
        const t1 = `task-${workflowId}-1`;
        const t2 = `task-${workflowId}-2`;
        const t3 = `task-${workflowId}-3`;
        const t4 = `task-${workflowId}-4`;
        const t5 = `task-${workflowId}-5`;

        return [
          {
            id: t1,
            workflowId,
            name: 'Inquiry Intent & SLA Urgency Classification',
            description: 'Parse ticket intent, urgency, sentiment, and compute SLA target',
            assignedAgentId: 'agent-req-class',
            assignedAgentName: 'Request Classification Agent',
            dependencies: [],
            status: 'PENDING',
            order: 1,
            progress: 0,
            retryCount: 0,
            maxRetries: 3
          },
          {
            id: t2,
            workflowId,
            name: 'Customer Account & CRM Enrichment',
            description: 'Retrieve subscription tier, contract ARR, active SLA, and historical tickets',
            assignedAgentId: 'agent-cust-info',
            assignedAgentName: 'Customer Information Agent',
            dependencies: [t1],
            status: 'PENDING',
            order: 2,
            progress: 0,
            retryCount: 0,
            maxRetries: 3
          },
          {
            id: t3,
            workflowId,
            name: 'Enterprise Knowledge Base Vector Search',
            description: 'Search documentation, API runbooks, and verified resolution articles',
            assignedAgentId: 'agent-kb-retrieval',
            assignedAgentName: 'Knowledge Retrieval Agent',
            dependencies: [t2],
            status: 'PENDING',
            order: 3,
            progress: 0,
            retryCount: 0,
            maxRetries: 3
          },
          {
            id: t4,
            workflowId,
            name: 'Autonomous Resolution Synthesis (Gemini LLM)',
            description: 'Draft calibrated step-by-step resolution and calculate confidence score',
            assignedAgentId: 'agent-res-agent',
            assignedAgentName: 'Resolution Agent',
            dependencies: [t3],
            status: 'PENDING',
            order: 4,
            progress: 0,
            retryCount: 0,
            maxRetries: 3
          },
          {
            id: t5,
            workflowId,
            name: 'Omnichannel Response Delivery & CSAT Tracking',
            description: 'Format response according to brand voice, dispatch to user, and close ticket',
            assignedAgentId: 'agent-cust-comm',
            assignedAgentName: 'Customer Communication Agent',
            dependencies: [t4],
            status: 'PENDING',
            order: 5,
            progress: 0,
            retryCount: 0,
            maxRetries: 3
          }
        ];
      }

      case 'PROCUREMENT_VENDOR_ONBOARDING': {
        const t1 = `task-${workflowId}-1`;
        const t2 = `task-${workflowId}-2`;
        const t3 = `task-${workflowId}-3`;
        const t4 = `task-${workflowId}-4`;
        const t5 = `task-${workflowId}-5`;
        const t6 = `task-${workflowId}-6`;

        return [
          {
            id: t1,
            workflowId,
            name: 'Procurement Specification & Budget Validation',
            description: 'Validate hardware/service specifications and department budget ceiling',
            assignedAgentId: 'agent-proc-req',
            assignedAgentName: 'Procurement Request Agent',
            dependencies: [],
            status: 'PENDING',
            order: 1,
            progress: 0,
            retryCount: 0,
            maxRetries: 3
          },
          {
            id: t2,
            workflowId,
            name: 'Vendor Discovery & Catalog Sourcing',
            description: 'Query enterprise vendor network and evaluate product availability',
            assignedAgentId: 'agent-ven-disc',
            assignedAgentName: 'Vendor Discovery Agent',
            dependencies: [t1],
            status: 'PENDING',
            order: 2,
            progress: 0,
            retryCount: 0,
            maxRetries: 3
          },
          {
            id: t3,
            workflowId,
            name: 'Vendor Compliance & Sanctions Screening',
            description: 'Verify W-9 tax IDs, SOC2 certifications, and international sanctions',
            assignedAgentId: 'agent-ven-verif',
            assignedAgentName: 'Vendor Verification Agent',
            dependencies: [t2],
            status: 'PENDING',
            order: 3,
            progress: 0,
            retryCount: 0,
            maxRetries: 3
          },
          {
            id: t4,
            workflowId,
            name: 'Multi-Vendor Quotation Comparison Matrix',
            description: 'Construct comparative analysis: pricing, warranty, volume tier discounts',
            assignedAgentId: 'agent-quote-comp',
            assignedAgentName: 'Quotation Comparison Agent',
            dependencies: [t3],
            status: 'PENDING',
            order: 4,
            progress: 0,
            retryCount: 0,
            maxRetries: 3
          },
          {
            id: t5,
            workflowId,
            name: 'Purchase Order Approval Gate',
            description: 'Executive committee authorization required for expenditure commitments',
            assignedAgentId: 'agent-proc-appr',
            assignedAgentName: 'Procurement Approval Agent',
            dependencies: [t4],
            status: 'PENDING',
            order: 5,
            progress: 0,
            retryCount: 0,
            maxRetries: 2,
            requiresApproval: true
          },
          {
            id: t6,
            workflowId,
            name: 'Purchase Order Dispatch & ERP Ledger Sync',
            description: 'Generate legally binding PO PDF, transmit to vendor, and record in SAP',
            assignedAgentId: 'agent-po-agent',
            assignedAgentName: 'Purchase Order Agent',
            dependencies: [t5],
            status: 'PENDING',
            order: 6,
            progress: 0,
            retryCount: 0,
            maxRetries: 3
          }
        ];
      }

      case 'IT_INCIDENT_ACCESS_GOVERNANCE': {
        const t1 = `task-${workflowId}-1`;
        const t2 = `task-${workflowId}-2`;
        const t3 = `task-${workflowId}-3`;
        const t4 = `task-${workflowId}-4`;
        const t5 = `task-${workflowId}-5`;
        const t6 = `task-${workflowId}-6`;

        return [
          {
            id: t1,
            workflowId,
            name: 'Telemetry Ingestion & Anomaly Detection',
            description: 'Ingest SIEM telemetry, APM traces, and Kubernetes cluster health alerts',
            assignedAgentId: 'agent-inc-det',
            assignedAgentName: 'Incident Detection Agent',
            dependencies: [],
            status: 'PENDING',
            order: 1,
            progress: 0,
            retryCount: 0,
            maxRetries: 3
          },
          {
            id: t2,
            workflowId,
            name: 'Severity Rating & Blast Radius Assessment',
            description: 'Classify incident impact (Sev-1 Critical down to Sev-4) and affected subsystems',
            assignedAgentId: 'agent-inc-class',
            assignedAgentName: 'Incident Classification Agent',
            dependencies: [t1],
            status: 'PENDING',
            order: 2,
            progress: 0,
            retryCount: 0,
            maxRetries: 3
          },
          {
            id: t3,
            workflowId,
            name: 'AI Root Cause Analysis & Distributed Trace Diagnostics',
            description: 'Correlate distributed logs and isolate primary fault vector using Gemini',
            assignedAgentId: 'agent-rca',
            assignedAgentName: 'Root Cause Analysis Agent',
            dependencies: [t2],
            status: 'PENDING',
            order: 3,
            progress: 0,
            retryCount: 0,
            maxRetries: 3
          },
          {
            id: t4,
            workflowId,
            name: 'High-Impact Remediation & Privileged Change Gate',
            description: 'Approval required for production container restarts, firewall shifts, or JIT IAM grants',
            assignedAgentId: 'agent-acc-mgmt',
            assignedAgentName: 'Access Management Agent',
            dependencies: [t3],
            status: 'PENDING',
            order: 4,
            progress: 0,
            retryCount: 0,
            maxRetries: 2,
            requiresApproval: true
          },
          {
            id: t5,
            workflowId,
            name: 'Automated Runbook Remediation & Quarantine',
            description: 'Execute approved response actions: terminate compromised sessions, patch config',
            assignedAgentId: 'agent-inc-resp',
            assignedAgentName: 'Incident Response Agent',
            dependencies: [t4],
            status: 'PENDING',
            order: 5,
            progress: 0,
            retryCount: 0,
            maxRetries: 3
          },
          {
            id: t6,
            workflowId,
            name: 'Security Perimeter Verification & SOC2 Post-Mortem',
            description: 'Verify network health, TLS handshakes, and compile compliant incident report',
            assignedAgentId: 'agent-inc-rep',
            assignedAgentName: 'Incident Reporting Agent',
            dependencies: [t5],
            status: 'PENDING',
            order: 6,
            progress: 0,
            retryCount: 0,
            maxRetries: 3
          }
        ];
      }
    }
  }

  /**
   * Main Execution Loop: Checks DAG dependencies, dispatches runnable tasks to specialized agents,
   * handles human approval gates, and completes workflow.
   */
  async executeWorkflow(workflowId: string): Promise<void> {
    const workflow = db.workflows.get(workflowId);
    if (!workflow || workflow.status === 'COMPLETED' || workflow.status === 'FAILED' || workflow.status === 'REJECTED') {
      return;
    }

    workflow.status = 'RUNNING';
    workflow.updatedAt = new Date().toISOString();
    broadcastEvent('workflow_updated', workflow);

    const tasks = workflow.tasks;

    // Check runnable tasks (all dependencies must be COMPLETED)
    const runnableTasks = tasks.filter(t => {
      if (t.status !== 'PENDING' && t.status !== 'RETRYING') return false;
      const depsMet = t.dependencies.every(depId => {
        const depTask = tasks.find(x => x.id === depId);
        return depTask && depTask.status === 'COMPLETED';
      });
      return depsMet;
    });

    if (runnableTasks.length === 0) {
      // Check if any task is WAITING_APPROVAL
      const waitingApprovalTask = tasks.find(t => t.status === 'WAITING_APPROVAL');
      if (waitingApprovalTask) {
        workflow.status = 'WAITING_FOR_APPROVAL';
        workflow.currentTaskId = waitingApprovalTask.id;
        workflow.currentAgentName = waitingApprovalTask.assignedAgentName;
        broadcastEvent('workflow_updated', workflow);
        return;
      }

      // Check if all tasks are COMPLETED
      const allCompleted = tasks.every(t => t.status === 'COMPLETED');
      if (allCompleted) {
        workflow.status = 'COMPLETED';
        workflow.progress = 100;
        workflow.completedAt = new Date().toISOString();
        workflow.plannerNotes.push('Central Planner: All DAG tasks successfully executed. Synthesizing final operational report.');
        
        // Generate Final Result Summary
        workflow.finalResult = this.synthesizeFinalResult(workflow);

        db.logAudit(
          'agent-planner',
          'PLANNER',
          this.name,
          'CENTRAL_ORCHESTRATOR',
          'WORKFLOW_COMPLETED',
          `Workflow "${workflow.title}" completed successfully. Verified by Central Planner.`,
          'SUCCESS',
          { tasksCompleted: tasks.length },
          workflow.id
        );

        db.addNotification(
          `Workflow Completed: ${workflow.title}`,
          `All ${tasks.length} specialized tasks executed successfully.`,
          'SUCCESS',
          workflow.submittedByRole,
          workflow.id
        );

        broadcastEvent('workflow_completed', workflow);
        return;
      }

      // Check if any failed
      const hasFailed = tasks.some(t => t.status === 'FAILED');
      if (hasFailed) {
        workflow.status = 'FAILED';
        workflow.plannerNotes.push('Central Planner: Workflow halted due to non-recoverable task failure.');
        broadcastEvent('workflow_updated', workflow);
        return;
      }

      return;
    }

    // Execute runnable tasks in parallel
    for (const task of runnableTasks) {
      this.executeTask(workflow, task);
    }
  }

  /**
   * Executes a single task with its assigned specialized agent
   */
  private async executeTask(workflow: Workflow, task: WorkflowTask): Promise<void> {
    task.status = 'IN_PROGRESS';
    task.startedAt = new Date().toISOString();
    workflow.currentTaskId = task.id;
    workflow.currentAgentName = task.assignedAgentName;
    workflow.updatedAt = new Date().toISOString();

    // Calculate progress percentage
    const completedCount = workflow.tasks.filter(t => t.status === 'COMPLETED').length;
    workflow.progress = Math.round((completedCount / workflow.tasks.length) * 100);

    // Send Agent-to-Agent message from Planner
    const dispatchMsg: AgentMessage = {
      id: `msg-${crypto.randomUUID().slice(0, 8)}`,
      workflowId: workflow.id,
      fromAgent: this.name,
      toAgent: task.assignedAgentName,
      messageType: 'TASK_DISPATCH',
      content: `Dispatched stage #${task.order}: "${task.name}". Target: ${task.description}`,
      timestamp: new Date().toISOString()
    };
    db.messages.set(dispatchMsg.id, dispatchMsg);

    db.logAudit(
      task.assignedAgentId,
      'AGENT',
      task.assignedAgentName,
      workflow.type,
      'TASK_ASSIGNED',
      `Central Planner assigned task "${task.name}" to ${task.assignedAgentName}`,
      'INFO',
      { taskId: task.id, order: task.order },
      workflow.id
    );

    broadcastEvent('task_updated', { workflowId: workflow.id, task, message: dispatchMsg });

    // Handle Human Approval Checkpoint
    if (task.requiresApproval && !task.approvalId) {
      task.status = 'WAITING_APPROVAL';
      const approval = this.createApprovalRequest(workflow, task);
      task.approvalId = approval.id;
      workflow.status = 'WAITING_FOR_APPROVAL';
      
      const apprMsg: AgentMessage = {
        id: `msg-${crypto.randomUUID().slice(0, 8)}`,
        workflowId: workflow.id,
        fromAgent: task.assignedAgentName,
        toAgent: 'Central Planner Agent',
        messageType: 'APPROVAL_REQUEST',
        content: `Checkpoint reached: Sensitive action requires human approval before proceeding. Approval ID: ${approval.id}`,
        timestamp: new Date().toISOString()
      };
      db.messages.set(apprMsg.id, apprMsg);

      db.addNotification(
        `Approval Required: ${task.name}`,
        `Action "${approval.actionRequested}" requires sign-off from ${approval.approverRoleRequired}.`,
        'APPROVAL',
        approval.approverRoleRequired,
        workflow.id
      );

      broadcastEvent('approval_requested', { workflowId: workflow.id, task, approval, message: apprMsg });
      return;
    }

    // Simulate Agent execution with intelligent delay and real AI reasoning
    setTimeout(async () => {
      try {
        const agentOutput = await this.runAgentLogic(workflow, task);
        task.status = 'COMPLETED';
        task.progress = 100;
        task.output = agentOutput;
        task.completedAt = new Date().toISOString();

        // Agent completion message back to Planner
        const handoffMsg: AgentMessage = {
          id: `msg-${crypto.randomUUID().slice(0, 8)}`,
          workflowId: workflow.id,
          fromAgent: task.assignedAgentName,
          toAgent: this.name,
          messageType: 'TASK_RESULT',
          content: `Task "${task.name}" completed successfully. Handoff payload verified.`,
          payload: agentOutput,
          timestamp: new Date().toISOString()
        };
        db.messages.set(handoffMsg.id, handoffMsg);

        db.logAudit(
          task.assignedAgentId,
          'AGENT',
          task.assignedAgentName,
          workflow.type,
          'AGENT_EXECUTION_FINISH',
          `${task.assignedAgentName} finished task "${task.name}" with status SUCCESS`,
          'SUCCESS',
          { outputKeys: Object.keys(agentOutput) },
          workflow.id
        );

        broadcastEvent('task_completed', { workflowId: workflow.id, task, message: handoffMsg });

        // Trigger next DAG step
        this.executeWorkflow(workflow.id);
      } catch (err: any) {
        // Planner self-healing and retry logic
        this.handleTaskFailure(workflow, task, err?.message || 'Agent timeout or tool invocation error');
      }
    }, 1800);
  }

  /**
   * Run specialized agent execution logic (with Gemini AI reasoning where appropriate)
   */
  private async runAgentLogic(workflow: Workflow, task: WorkflowTask): Promise<Record<string, any>> {
    const meta = workflow.metadata || {};

    // 1. Data Extraction / OCR Agent
    if (task.assignedAgentId === 'agent-data-extract') {
      const prompt = `Extract structured enterprise invoice details for vendor "${meta.vendorName || 'Nexus Cloud'}" with invoice number "${meta.invoiceNumber || 'INV-2026-9481'}" and amount "${meta.amount || '$24,500.00'}". Return JSON object with vendor, invoiceNumber, date, subtotal, tax, totalAmount, currency, lineItems.`;
      const aiResponse = await generateGeminiReasoning(prompt, 'You are an autonomous Document Data Extraction Agent. Return structured JSON with line items and financial verification.');
      try {
        return JSON.parse(aiResponse);
      } catch {
        return {
          vendor: meta.vendorName || 'Nexus Cloud Technologies LLC',
          invoiceNumber: meta.invoiceNumber || 'INV-2026-9481',
          totalAmount: meta.amount || 24500.00,
          currency: 'USD',
          poNumber: meta.poNumber || 'PO-98421-CORP',
          extractedDate: new Date().toISOString().slice(0, 10),
          confidenceScore: 0.985
        };
      }
    }

    // 2. Root Cause Analysis Agent
    if (task.assignedAgentId === 'agent-rca') {
      const prompt = `Diagnose enterprise incident: "${workflow.title}". Context: ${JSON.stringify(meta)}. Identify suspected root cause, affected systems, and recommend safe automated runbook remediation actions.`;
      const aiResponse = await generateGeminiReasoning(prompt, 'You are an autonomous IT Incident Root Cause Analysis Agent.');
      try {
        return JSON.parse(aiResponse);
      } catch {
        return {
          severity: 'SEV_1_CRITICAL',
          rootCause: 'Connection pool starvation in auth-service container during token refresh spike',
          recommendedActions: ['Scale Redis read replicas', 'Drain idle connections', 'Apply worker throttling'],
          requiresPrivilegedApproval: true
        };
      }
    }

    // 3. Customer Resolution Agent
    if (task.assignedAgentId === 'agent-res-agent') {
      const prompt = `Compose a professional customer resolution for ticket "${workflow.title}". Customer: ${meta.customerName || 'Enterprise Client'}. Inquiry: ${meta.inquiryText || 'API integration question'}. Provide clear explanation, fix applied, and next steps.`;
      const resolutionText = await generateGeminiReasoning(prompt, 'You are an autonomous Enterprise Customer Resolution Agent. Provide high-quality technical answers.');
      return {
        resolutionText,
        confidenceScore: 0.97,
        slaMet: true,
        recommendedAction: 'DELIVER_AND_MONITOR'
      };
    }

    // 4. Quotation Comparison Agent
    if (task.assignedAgentId === 'agent-quote-comp') {
      return {
        comparisonMatrix: [
          { vendor: 'TechDirect Global', unitPrice: 2350, leadTimeDays: 7, warrantyYears: 3, score: 94 },
          { vendor: 'Enterprise Silicon Corp', unitPrice: 2420, leadTimeDays: 5, warrantyYears: 3, score: 91 },
          { vendor: 'Apex Hardware Solutions', unitPrice: 2280, leadTimeDays: 14, warrantyYears: 2, score: 86 }
        ],
        recommendedVendor: 'TechDirect Global',
        totalSavingsVsBudget: '$7,500.00 (6%)'
      };
    }

    // Generic realistic output based on task
    return {
      status: 'VERIFIED',
      executedBy: task.assignedAgentName,
      timestamp: new Date().toISOString(),
      details: `Processed task "${task.name}" with standard enterprise governance rules.`
    };
  }

  /**
   * Creates an Approval Request object for human-in-the-loop checkpoints
   */
  private createApprovalRequest(workflow: Workflow, task: WorkflowTask): ApprovalRequest {
    const meta = workflow.metadata || {};
    let actionRequested = `Authorize action for ${task.name}`;
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'HIGH';
    let roleRequired: UserRole = 'ADMIN';

    if (workflow.type === 'INVOICE_PROCESSING') {
      actionRequested = `Authorize Payment Settlement of $${meta.amount || '24,500.00'} to ${meta.vendorName || 'Nexus Cloud Technologies'}`;
      riskLevel = 'HIGH';
      roleRequired = 'FINANCE_MANAGER';
    } else if (workflow.type === 'EMPLOYEE_ONBOARDING') {
      actionRequested = `Grant Privileged Production AWS Root & Bastion IAM Access for ${meta.candidateName || 'New Hire'}`;
      riskLevel = 'CRITICAL';
      roleRequired = 'ADMIN';
    } else if (workflow.type === 'IT_INCIDENT_ACCESS_GOVERNANCE') {
      actionRequested = `Execute Production Service Quarantine & Hot-Swap Ingress Rerouting`;
      riskLevel = 'CRITICAL';
      roleRequired = 'ADMIN';
    } else if (workflow.type === 'PROCUREMENT_VENDOR_ONBOARDING') {
      actionRequested = `Approve Requisition Spend & Issue PO ($${meta.budget || '125,000'})`;
      riskLevel = 'HIGH';
      roleRequired = 'ADMIN';
    }

    const approval: ApprovalRequest = {
      id: `appr-${crypto.randomUUID().slice(0, 8)}`,
      workflowId: workflow.id,
      taskId: task.id,
      actionRequested,
      requestedByAgent: task.assignedAgentName,
      riskLevel,
      approverRoleRequired: roleRequired,
      state: 'PENDING',
      details: {
        workflowTitle: workflow.title,
        metadata: meta,
        taskName: task.name,
        initiatedAt: new Date().toISOString()
      },
      createdAt: new Date().toISOString()
    };

    db.approvals.set(approval.id, approval);

    db.logAudit(
      task.assignedAgentId,
      'AGENT',
      task.assignedAgentName,
      workflow.type,
      'APPROVAL_REQUESTED',
      `Approval requested: "${actionRequested}" (Risk: ${riskLevel})`,
      'WARNING',
      { approvalId: approval.id, roleRequired },
      workflow.id
    );

    return approval;
  }

  /**
   * Resumes workflow after human approval decision
   */
  async processApprovalDecision(params: {
    approvalId: string;
    decision: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';
    decidedByUserId: string;
    decidedByName: string;
    decidedByRole: UserRole;
    reason?: string;
  }): Promise<{ success: boolean; message: string }> {
    const approval = db.approvals.get(params.approvalId);
    if (!approval) {
      return { success: false, message: 'Approval request not found.' };
    }

    approval.state = params.decision;
    approval.approverUserId = params.decidedByUserId;
    approval.approverName = params.decidedByName;
    approval.decisionReason = params.reason || `Decision logged by ${params.decidedByName} (${params.decidedByRole})`;
    approval.decidedAt = new Date().toISOString();

    const workflow = db.workflows.get(approval.workflowId);
    if (!workflow) {
      return { success: false, message: 'Associated workflow not found.' };
    }

    const task = workflow.tasks.find(t => t.id === approval.taskId);

    db.logInteraction(
      params.decidedByUserId,
      params.decidedByName,
      params.decidedByRole,
      'APPROVAL_DECIDED',
      { approvalId: approval.id, decision: params.decision, reason: params.reason },
      workflow.id
    );

    db.logAudit(
      params.decidedByUserId,
      'USER',
      params.decidedByName,
      params.decidedByRole,
      'APPROVAL_DECIDED',
      `Human Decision: ${params.decision} for "${approval.actionRequested}". Reason: ${approval.decisionReason}`,
      params.decision === 'APPROVED' ? 'SUCCESS' : 'WARNING',
      { approvalId: approval.id, decision: params.decision },
      workflow.id
    );

    // Send decision message from Human to Planner
    const decMsg: AgentMessage = {
      id: `msg-${crypto.randomUUID().slice(0, 8)}`,
      workflowId: workflow.id,
      fromAgent: `Human Approver (${params.decidedByName})`,
      toAgent: this.name,
      messageType: 'APPROVAL_REQUEST',
      content: `Human Decision: ${params.decision}. Approver: ${params.decidedByName}. Note: ${approval.decisionReason}`,
      payload: { decision: params.decision, reason: params.reason },
      timestamp: new Date().toISOString()
    };
    db.messages.set(decMsg.id, decMsg);

    if (params.decision === 'APPROVED') {
      if (task) {
        task.status = 'COMPLETED';
        task.progress = 100;
        task.output = {
          approved: true,
          approver: params.decidedByName,
          timestamp: approval.decidedAt,
          notes: approval.decisionReason
        };
        task.completedAt = approval.decidedAt;
      }

      workflow.plannerNotes.push(`Central Planner: Approval granted by ${params.decidedByName}. Resuming DAG execution.`);
      workflow.status = 'RUNNING';
      broadcastEvent('approval_decided', { workflowId: workflow.id, approval, decision: params.decision });

      // Continue execution
      setTimeout(() => {
        this.executeWorkflow(workflow.id);
      }, 500);

      return { success: true, message: `Approved successfully. Central Planner has resumed execution.` };
    } else if (params.decision === 'REJECTED') {
      if (task) {
        task.status = 'FAILED';
        task.errorMessage = `Rejected by ${params.decidedByName}: ${params.reason || 'Unauthorized'}`;
      }
      workflow.status = 'REJECTED';
      workflow.plannerNotes.push(`Central Planner: Action rejected by ${params.decidedByName}. Workflow terminated according to governance policy.`);
      broadcastEvent('approval_decided', { workflowId: workflow.id, approval, decision: params.decision });
      return { success: true, message: `Action rejected. Workflow has been cleanly terminated.` };
    } else {
      // Changes Requested
      if (task) {
        task.status = 'RETRYING';
        task.errorMessage = `Changes requested: ${params.reason}`;
      }
      workflow.status = 'REQUIRES_ATTENTION';
      workflow.plannerNotes.push(`Central Planner: Approver requested revisions. Paused for human modification.`);
      broadcastEvent('approval_decided', { workflowId: workflow.id, approval, decision: params.decision });
      return { success: true, message: `Status updated to Changes Requested.` };
    }
  }

  /**
   * Handles task failure, replanning, and autonomous self-healing retry
   */
  handleTaskFailure(workflow: Workflow, task: WorkflowTask, errorReason: string): void {
    task.retryCount++;
    task.errorMessage = errorReason;

    db.logAudit(
      task.assignedAgentId,
      'AGENT',
      task.assignedAgentName,
      workflow.type,
      'ERROR_OCCURRED',
      `Task "${task.name}" failed: ${errorReason} (Attempt ${task.retryCount}/${task.maxRetries})`,
      'FAILURE',
      { retryCount: task.retryCount, maxRetries: task.maxRetries },
      workflow.id
    );

    if (task.retryCount <= task.maxRetries) {
      task.status = 'RETRYING';
      workflow.plannerNotes.push(`Central Planner: Task "${task.name}" failed. Initiating self-healing retry (${task.retryCount}/${task.maxRetries}).`);

      db.logAudit(
        'agent-planner',
        'PLANNER',
        this.name,
        'CENTRAL_ORCHESTRATOR',
        'RETRY_INITIATED',
        `Central Planner triggered autonomous retry for "${task.name}" with relaxed backoff`,
        'INFO',
        { taskId: task.id },
        workflow.id
      );

      broadcastEvent('task_retry', { workflowId: workflow.id, task });

      setTimeout(() => {
        this.executeTask(workflow, task);
      }, 2000);
    } else {
      task.status = 'FAILED';
      workflow.status = 'FAILED';
      workflow.plannerNotes.push(`Central Planner: Task "${task.name}" exceeded maximum retries. Escalated to human operator.`);
      broadcastEvent('workflow_failed', { workflowId: workflow.id, task, error: errorReason });
    }
  }

  /**
   * Hackathon Demo Feature: Manually trigger an agent failure and show the Central Planner's replanning & self-healing
   */
  simulateAgentFailureAndReplan(workflowId: string, taskId: string): { success: boolean; message: string } {
    const workflow = db.workflows.get(workflowId);
    if (!workflow) return { success: false, message: 'Workflow not found.' };

    const task = workflow.tasks.find(t => t.id === taskId);
    if (!task) return { success: false, message: 'Task not found.' };

    task.status = 'FAILED';
    task.errorMessage = 'Simulated Hardware Timeout / Third-party Vendor API Rate-Limit 429';
    workflow.status = 'REQUIRES_ATTENTION';
    workflow.plannerNotes.push(`[DEMO] Simulated failure injected on ${task.assignedAgentName}. Central Planner evaluating alternative routing.`);

    db.logAudit(
      'agent-planner',
      'PLANNER',
      this.name,
      'CENTRAL_ORCHESTRATOR',
      'ERROR_OCCURRED',
      `[DEMO SIMULATION] Injected fault on "${task.name}". Central Planner initiated diagnostic replan.`,
      'FAILURE',
      { taskId },
      workflow.id
    );

    broadcastEvent('demo_failure_simulated', { workflowId, taskId, task });

    // Auto recover after 3 seconds to demonstrate self-healing!
    setTimeout(() => {
      task.status = 'RETRYING';
      task.retryCount = 1;
      workflow.status = 'RUNNING';
      workflow.plannerNotes.push(`Central Planner: Self-healing protocol engaged. Rerouting traffic through secondary worker pool.`);
      
      broadcastEvent('planner_replan_engaged', { workflowId, taskId });

      setTimeout(() => {
        task.status = 'COMPLETED';
        task.progress = 100;
        task.output = {
          recovered: true,
          method: 'Secondary Failover Route',
          replanDurationSeconds: 3.2
        };
        workflow.plannerNotes.push(`Central Planner: Task "${task.name}" recovered and completed successfully.`);
        broadcastEvent('task_completed', { workflowId, task });
        this.executeWorkflow(workflow.id);
      }, 2000);
    }, 3000);

    return { success: true, message: 'Simulated failure triggered. Central Planner is now replanning and executing self-healing!' };
  }

  private synthesizeFinalResult(workflow: Workflow): Record<string, any> {
    const meta = workflow.metadata || {};
    switch (workflow.type) {
      case 'EMPLOYEE_ONBOARDING':
        return {
          employeeStatus: 'ACTIVE_PROVISIONED',
          employeeName: meta.candidateName || 'New Hire',
          role: meta.roleTitle || 'Engineer',
          emailIssued: `${(meta.candidateName || 'newhire').toLowerCase().replace(/\s+/g, '.')}@enterpriseflow.ai`,
          hardwareDispatched: 'MacBook Pro M3 Max - Expedited Overnight Delivery',
          completionTime: new Date().toISOString()
        };
      case 'INVOICE_PROCESSING':
        return {
          settlementStatus: 'PAYMENT_SETTLED_ACH',
          vendor: meta.vendorName || 'Vendor',
          invoiceNumber: meta.invoiceNumber || 'INV-2026',
          paidAmount: meta.amount || '$24,500.00',
          remittanceRef: `ACH-${Date.now().toString().slice(-8)}`,
          sapVoucherId: `VOUCH-${crypto.randomUUID().slice(0, 6).toUpperCase()}`
        };
      case 'CUSTOMER_REQUEST_RESOLUTION':
        return {
          ticketStatus: 'RESOLVED_DELIVERED',
          customer: meta.customerName || 'Enterprise Account',
          confidenceScore: '98%',
          resolutionSummary: 'Automated technical runbook applied. Quota adjusted and verified.',
          csatSurveyUrl: 'https://feedback.enterpriseflow.ai/csat'
        };
      case 'PROCUREMENT_VENDOR_ONBOARDING':
        return {
          procurementStatus: 'PURCHASE_ORDER_ISSUED',
          vendorSelected: 'TechDirect Global',
          poNumber: `PO-${Date.now().toString().slice(-6)}`,
          budgetUtilized: meta.budget || '$125,000.00',
          estimatedDelivery: '7 Business Days'
        };
      case 'IT_INCIDENT_ACCESS_GOVERNANCE':
        return {
          incidentStatus: 'RESOLVED_CLOSED',
          incidentId: meta.incidentId || 'INC-2026-AUTO',
          duration: '4 minutes 15 seconds',
          correctiveAction: 'Connection pool scaled, throttled, and patched',
          soc2CompliantPostMortem: 'Archived to Compliance Ledger'
        };
      default:
        return { status: 'COMPLETED_SUCCESSFULLY' };
    }
  }
}

export const plannerAgent = new CentralPlannerAgent();
