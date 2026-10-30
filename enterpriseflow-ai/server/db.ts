import crypto from 'crypto';
import {
  User,
  UserRole,
  UserSession,
  Workflow,
  WorkflowTask,
  WorkflowType,
  Agent,
  AgentExecution,
  AgentMessage,
  ApprovalRequest,
  AuditLog,
  InteractionLog,
  Document,
  Notification,
  WorkflowEvent,
  EventType
} from './types';

// In-Memory Database store with enterprise seed data
export class Database {
  users: Map<string, User> = new Map();
  sessions: Map<string, UserSession> = new Map();
  workflows: Map<string, Workflow> = new Map();
  tasks: Map<string, WorkflowTask> = new Map();
  agents: Map<string, Agent> = new Map();
  executions: Map<string, AgentExecution> = new Map();
  messages: Map<string, AgentMessage> = new Map();
  approvals: Map<string, ApprovalRequest> = new Map();
  auditLogs: AuditLog[] = [];
  interactionLogs: InteractionLog[] = [];
  documents: Map<string, Document> = new Map();
  notifications: Notification[] = [];
  events: WorkflowEvent[] = [];

  constructor() {
    this.seedDatabase();
  }

  seedDatabase() {
    // 1. Seed Users
    const seedUsers: User[] = [
      {
        id: 'usr-admin-01',
        email: 'admin@enterpriseflow.ai',
        passwordHash: 'Admin@Enterprise2026!',
        name: 'Alexander Sterling',
        role: 'ADMIN',
        department: 'Enterprise Operations & IT',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        createdAt: '2026-01-10T08:00:00Z',
        lastLoginAt: new Date().toISOString()
      },
      {
        id: 'usr-hr-02',
        email: 'hr.manager@enterpriseflow.ai',
        passwordHash: 'Enterprise2026!',
        name: 'Elena Rostova',
        role: 'HR_MANAGER',
        department: 'People Operations & HR',
        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
        createdAt: '2026-01-15T09:30:00Z',
        lastLoginAt: new Date().toISOString()
      },
      {
        id: 'usr-emp-03',
        email: 'employee.manager@enterpriseflow.ai',
        passwordHash: 'Enterprise2026!',
        name: 'David Miller',
        role: 'EMPLOYEE_MANAGER',
        department: 'Employee Request Management',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        createdAt: '2026-01-16T09:30:00Z',
        lastLoginAt: new Date().toISOString()
      },
      {
        id: 'usr-fin-04',
        email: 'finance.manager@enterpriseflow.ai',
        passwordHash: 'Enterprise2026!',
        name: 'Marcus Vance',
        role: 'FINANCE_MANAGER',
        department: 'Global Corporate Finance',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        createdAt: '2026-01-18T10:15:00Z',
        lastLoginAt: new Date().toISOString()
      },
      {
        id: 'usr-svc-05',
        email: 'service.manager@enterpriseflow.ai',
        passwordHash: 'Enterprise2026!',
        name: 'Sophia Chen',
        role: 'SERVICE_MANAGER',
        department: 'Customer Experience & Service Operations',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        createdAt: '2026-01-20T11:00:00Z',
        lastLoginAt: new Date().toISOString()
      },
      {
        id: 'usr-client-06',
        email: 'client.manager@enterpriseflow.ai',
        passwordHash: 'Enterprise2026!',
        name: 'Sophia Chen',
        role: 'CLIENT_MANAGER',
        department: 'Customer Success & Accounts',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        createdAt: '2026-01-20T11:00:00Z',
        lastLoginAt: new Date().toISOString()
      }
    ];

    seedUsers.forEach(u => this.users.set(u.id, u));

    // 2. Seed Agents (All 31 specialized agents + Central Planner)
    const seedAgents: Agent[] = [
      {
        id: 'agent-planner',
        name: 'Central Planner Agent',
        workflowType: 'GLOBAL',
        roleDescription: 'Master Orchestrator: Decomposes enterprise goals, maps DAG task dependencies, dispatches agents, handles replanning & recovery.',
        capabilities: ['Goal Parsing', 'DAG Scheduling', 'State Synchronization', 'Failure Recovery', 'Approval Checkpoint Gates'],
        status: 'ACTIVE',
        totalExecutions: 248,
        successfulExecutions: 244,
        failedExecutions: 4,
        averageExecutionTimeMs: 420
      },
      // Employee Onboarding
      {
        id: 'agent-emp-info',
        name: 'Employee Information Agent',
        workflowType: 'EMPLOYEE_ONBOARDING',
        roleDescription: 'Validates personal identifiers, contact records, background data, and compliance criteria.',
        capabilities: ['SSN/Tax Validation', 'Resume Extraction', 'Compliance Verification'],
        status: 'IDLE',
        totalExecutions: 65,
        successfulExecutions: 65,
        failedExecutions: 0,
        averageExecutionTimeMs: 310
      },
      {
        id: 'agent-doc-verify',
        name: 'Document Verification Agent',
        workflowType: 'EMPLOYEE_ONBOARDING',
        roleDescription: 'Inspects passports, driver licenses, I-9 documents, and certifications using OCR.',
        capabilities: ['OCR Verification', 'Tamper Detection', 'Expiration Check'],
        status: 'IDLE',
        totalExecutions: 65,
        successfulExecutions: 63,
        failedExecutions: 2,
        averageExecutionTimeMs: 580
      },
      {
        id: 'agent-hr-ops',
        name: 'HR Operations Agent',
        workflowType: 'EMPLOYEE_ONBOARDING',
        roleDescription: 'Provisions employee record in HRIS (Workday/BambooHR), assigns department and reporting line.',
        capabilities: ['HRIS Sync', 'Org Chart Assignment', 'Benefits Provisioning'],
        status: 'IDLE',
        totalExecutions: 62,
        successfulExecutions: 62,
        failedExecutions: 0,
        averageExecutionTimeMs: 290
      },
      {
        id: 'agent-payroll',
        name: 'Finance/Payroll Agent',
        workflowType: 'EMPLOYEE_ONBOARDING',
        roleDescription: 'Configures direct deposit, tax withholdings (W-4), compensation tier, and equity grants.',
        capabilities: ['Direct Deposit Setup', 'Tax Jurisdiction Calculation', 'Payroll Ledger Enrollment'],
        status: 'IDLE',
        totalExecutions: 60,
        successfulExecutions: 60,
        failedExecutions: 0,
        averageExecutionTimeMs: 340
      },
      {
        id: 'agent-it-prov',
        name: 'IT Provisioning Agent',
        workflowType: 'EMPLOYEE_ONBOARDING',
        roleDescription: 'Creates Google Workspace, Okta, Slack, GitHub, and cloud IAM credentials.',
        capabilities: ['Okta Provisioning', 'Hardware Dispatch', 'Privileged IAM Setup'],
        status: 'ACTIVE',
        totalExecutions: 61,
        successfulExecutions: 58,
        failedExecutions: 3,
        averageExecutionTimeMs: 640
      },
      {
        id: 'agent-emp-comm',
        name: 'Employee Communication Agent',
        workflowType: 'EMPLOYEE_ONBOARDING',
        roleDescription: 'Prepares welcome package, personalized joining instructions, mentor introduction, and orientation schedule.',
        capabilities: ['Welcome Email Generation', 'Calendar Invite Dispatch', 'Orientation Packet'],
        status: 'IDLE',
        totalExecutions: 59,
        successfulExecutions: 59,
        failedExecutions: 0,
        averageExecutionTimeMs: 220
      },
      // Invoice Processing
      {
        id: 'agent-inv-intake',
        name: 'Invoice Intake Agent',
        workflowType: 'INVOICE_PROCESSING',
        roleDescription: 'Ingests digital PDF, scanned receipts, EDI feeds, and accounts payable emails.',
        capabilities: ['File Parsing', 'MIME Validation', 'Queue Ingestion'],
        status: 'IDLE',
        totalExecutions: 89,
        successfulExecutions: 89,
        failedExecutions: 0,
        averageExecutionTimeMs: 180
      },
      {
        id: 'agent-data-extract',
        name: 'Data Extraction Agent',
        workflowType: 'INVOICE_PROCESSING',
        roleDescription: 'Leverages Gemini multimodal vision & LLM to extract invoice number, vendor, PO, line items, and totals.',
        capabilities: ['Multimodal LLM Parsing', 'Table Extraction', 'Currency Normalization'],
        status: 'ACTIVE',
        totalExecutions: 89,
        successfulExecutions: 87,
        failedExecutions: 2,
        averageExecutionTimeMs: 710
      },
      {
        id: 'agent-inv-val',
        name: 'Invoice Validation Agent',
        workflowType: 'INVOICE_PROCESSING',
        roleDescription: 'Performs mathematical verification, tax checks, vendor active registry check, and date window validation.',
        capabilities: ['Tax Arithmetic Check', 'Vendor Master Lookup', 'Terms Validation'],
        status: 'IDLE',
        totalExecutions: 86,
        successfulExecutions: 85,
        failedExecutions: 1,
        averageExecutionTimeMs: 290
      },
      {
        id: 'agent-dup-detect',
        name: 'Duplicate Detection Agent',
        workflowType: 'INVOICE_PROCESSING',
        roleDescription: 'Scans historical ledger using fuzzy hash matching on vendor + amount + date to prevent double payment.',
        capabilities: ['Fuzzy Hashing', 'Ledger Collision Check', 'Fraud Heuristics'],
        status: 'IDLE',
        totalExecutions: 85,
        successfulExecutions: 85,
        failedExecutions: 0,
        averageExecutionTimeMs: 320
      },
      {
        id: 'agent-fin-recon',
        name: 'Financial Reconciliation Agent',
        workflowType: 'INVOICE_PROCESSING',
        roleDescription: 'Performs 3-way matching between Invoice, Purchase Order, and Goods Receipt Note (GRN).',
        capabilities: ['3-Way Matching', 'Variance Detection', 'General Ledger Coding'],
        status: 'ACTIVE',
        totalExecutions: 84,
        successfulExecutions: 82,
        failedExecutions: 2,
        averageExecutionTimeMs: 440
      },
      {
        id: 'agent-pay-proc',
        name: 'Payment Processing Agent',
        workflowType: 'INVOICE_PROCESSING',
        roleDescription: 'Prepares ACH/Wire batch files for ERP (SAP/NetSuite) post-approval and updates payment ledger.',
        capabilities: ['ACH Dispatch', 'ERP Settlement', 'Remittance Generation'],
        status: 'IDLE',
        totalExecutions: 79,
        successfulExecutions: 79,
        failedExecutions: 0,
        averageExecutionTimeMs: 390
      },
      // Customer Request Resolution
      {
        id: 'agent-req-class',
        name: 'Request Classification Agent',
        workflowType: 'CUSTOMER_REQUEST_RESOLUTION',
        roleDescription: 'Analyzes intent, customer tier, urgency, sentiment, and assigns initial SLA priority.',
        capabilities: ['Intent Classification', 'Sentiment Analysis', 'SLA Tier Assignment'],
        status: 'IDLE',
        totalExecutions: 112,
        successfulExecutions: 112,
        failedExecutions: 0,
        averageExecutionTimeMs: 240
      },
      {
        id: 'agent-kb-retrieval',
        name: 'Knowledge Retrieval Agent',
        workflowType: 'CUSTOMER_REQUEST_RESOLUTION',
        roleDescription: 'Searches enterprise vector store, technical documentation, API specs, and resolved runbooks.',
        capabilities: ['Semantic Vector Search', 'Doc Chunking', 'Runbook Mapping'],
        status: 'IDLE',
        totalExecutions: 112,
        successfulExecutions: 110,
        failedExecutions: 2,
        averageExecutionTimeMs: 410
      },
      {
        id: 'agent-cust-info',
        name: 'Customer Information Agent',
        workflowType: 'CUSTOMER_REQUEST_RESOLUTION',
        roleDescription: 'Enriches request with CRM records (Salesforce/HubSpot), contract ARR, subscription tier, and active incidents.',
        capabilities: ['CRM Data Enrichment', 'ARR Tier Lookup', 'Account Health Score'],
        status: 'IDLE',
        totalExecutions: 110,
        successfulExecutions: 110,
        failedExecutions: 0,
        averageExecutionTimeMs: 260
      },
      {
        id: 'agent-res-agent',
        name: 'Resolution Agent',
        workflowType: 'CUSTOMER_REQUEST_RESOLUTION',
        roleDescription: 'Synthesizes enterprise-grade technical resolution, step-by-step troubleshooting, or policy response using Gemini.',
        capabilities: ['GenAI Synthesis', 'Confidence Scoring', 'Action Step Generation'],
        status: 'IDLE',
        totalExecutions: 108,
        successfulExecutions: 107,
        failedExecutions: 1,
        averageExecutionTimeMs: 650
      },
      {
        id: 'agent-cust-comm',
        name: 'Customer Communication Agent',
        workflowType: 'CUSTOMER_REQUEST_RESOLUTION',
        roleDescription: 'Formats communication according to brand voice, sends response via Zendesk/Email, and solicits CSAT feedback.',
        capabilities: ['Tone Formatting', 'Multi-channel Dispatch', 'Ticket State Sync'],
        status: 'IDLE',
        totalExecutions: 104,
        successfulExecutions: 104,
        failedExecutions: 0,
        averageExecutionTimeMs: 210
      },
      {
        id: 'agent-escalation',
        name: 'Escalation Agent',
        workflowType: 'CUSTOMER_REQUEST_RESOLUTION',
        roleDescription: 'Flags low-confidence, high-risk churn, or sensitive compliance complaints directly to tier-3 specialists.',
        capabilities: ['Churn Risk Detection', 'Tier-3 PagerDuty Alert', 'Executive Briefing'],
        status: 'IDLE',
        totalExecutions: 23,
        successfulExecutions: 23,
        failedExecutions: 0,
        averageExecutionTimeMs: 300
      },
      // Procurement & Vendor Onboarding
      {
        id: 'agent-proc-req',
        name: 'Procurement Request Agent',
        workflowType: 'PROCUREMENT_VENDOR_ONBOARDING',
        roleDescription: 'Validates procurement requisition, budget allocation, delivery timeline, and technical specifications.',
        capabilities: ['Requisition Parsing', 'Cost Center Check', 'Spec Validation'],
        status: 'IDLE',
        totalExecutions: 48,
        successfulExecutions: 48,
        failedExecutions: 0,
        averageExecutionTimeMs: 270
      },
      {
        id: 'agent-ven-disc',
        name: 'Vendor Discovery Agent',
        workflowType: 'PROCUREMENT_VENDOR_ONBOARDING',
        roleDescription: 'Identifies qualified suppliers from approved enterprise vendor database and marketplace catalogs.',
        capabilities: ['Vendor Catalog Search', 'Availability Check', 'Lead Time Scoring'],
        status: 'IDLE',
        totalExecutions: 48,
        successfulExecutions: 48,
        failedExecutions: 0,
        averageExecutionTimeMs: 380
      },
      {
        id: 'agent-ven-verif',
        name: 'Vendor Verification Agent',
        workflowType: 'PROCUREMENT_VENDOR_ONBOARDING',
        roleDescription: 'Performs compliance screening (W-9, SOC2, ISO27001, credit rating, OFAC sanctions).',
        capabilities: ['Sanctions Screening', 'Security Compliance Check', 'Tax ID Verification'],
        status: 'IDLE',
        totalExecutions: 46,
        successfulExecutions: 45,
        failedExecutions: 1,
        averageExecutionTimeMs: 510
      },
      {
        id: 'agent-quote-comp',
        name: 'Quotation Comparison Agent',
        workflowType: 'PROCUREMENT_VENDOR_ONBOARDING',
        roleDescription: 'Builds side-by-side comparative matrices analyzing unit pricing, volume discounts, warranties, and SLAs.',
        capabilities: ['Multi-Quote Matrix', 'TCO Calculation', 'SLA Comparison'],
        status: 'ACTIVE',
        totalExecutions: 45,
        successfulExecutions: 45,
        failedExecutions: 0,
        averageExecutionTimeMs: 460
      },
      {
        id: 'agent-po-agent',
        name: 'Purchase Order Agent',
        workflowType: 'PROCUREMENT_VENDOR_ONBOARDING',
        roleDescription: 'Drafts legally binding purchase orders, terms & conditions, and links payment milestones in ERP.',
        capabilities: ['PO Document Drafting', 'ERP Ledger Sync', 'Terms Attachment'],
        status: 'IDLE',
        totalExecutions: 42,
        successfulExecutions: 42,
        failedExecutions: 0,
        averageExecutionTimeMs: 330
      },
      {
        id: 'agent-proc-appr',
        name: 'Procurement Approval Agent',
        workflowType: 'PROCUREMENT_VENDOR_ONBOARDING',
        roleDescription: 'Calculates authorization thresholds and routes approval to department head or executive committee.',
        capabilities: ['Delegation of Authority Routing', 'Spend Threshold Audit', 'Approval Package Build'],
        status: 'IDLE',
        totalExecutions: 42,
        successfulExecutions: 42,
        failedExecutions: 0,
        averageExecutionTimeMs: 230
      },
      // IT Incident Response & Access Governance
      {
        id: 'agent-inc-det',
        name: 'Incident Detection Agent',
        workflowType: 'IT_INCIDENT_ACCESS_GOVERNANCE',
        roleDescription: 'Monitors Datadog, AWS CloudWatch, PagerDuty, and SIEM security alerts for anomalous events.',
        capabilities: ['Telemetry Ingestion', 'Anomaly Detection', 'Threshold Evaluation'],
        status: 'IDLE',
        totalExecutions: 74,
        successfulExecutions: 74,
        failedExecutions: 0,
        averageExecutionTimeMs: 190
      },
      {
        id: 'agent-inc-class',
        name: 'Incident Classification Agent',
        workflowType: 'IT_INCIDENT_ACCESS_GOVERNANCE',
        roleDescription: 'Assesses blast radius, data sensitivity, and assigns severity rating (Sev-1 Critical down to Sev-4).',
        capabilities: ['Severity Matrix', 'Blast Radius Analysis', 'Compliance Exposure'],
        status: 'IDLE',
        totalExecutions: 74,
        successfulExecutions: 74,
        failedExecutions: 0,
        averageExecutionTimeMs: 250
      },
      {
        id: 'agent-rca',
        name: 'Root Cause Analysis Agent',
        workflowType: 'IT_INCIDENT_ACCESS_GOVERNANCE',
        roleDescription: 'Correlates distributed traces, stack traces, Kubernetes logs, and git commits to isolate root cause.',
        capabilities: ['Trace Correlation', 'Git Commit Diffing', 'Gemini Log Diagnosis'],
        status: 'IDLE',
        totalExecutions: 72,
        successfulExecutions: 71,
        failedExecutions: 1,
        averageExecutionTimeMs: 820
      },
      {
        id: 'agent-inc-resp',
        name: 'Incident Response Agent',
        workflowType: 'IT_INCIDENT_ACCESS_GOVERNANCE',
        roleDescription: 'Executes approved automated runbooks (pod restart, traffic draining, rate limiter activation).',
        capabilities: ['Runbook Automation', 'Traffic Shaping', 'Service Restoration'],
        status: 'IDLE',
        totalExecutions: 70,
        successfulExecutions: 69,
        failedExecutions: 1,
        averageExecutionTimeMs: 540
      },
      {
        id: 'agent-acc-mgmt',
        name: 'Access Management Agent',
        workflowType: 'IT_INCIDENT_ACCESS_GOVERNANCE',
        roleDescription: 'Evaluates just-in-time privileged access requests, rotates compromised API credentials, revokes sessions.',
        capabilities: ['JIT Access Grant', 'Session Termination', 'Credential Rotation'],
        status: 'IDLE',
        totalExecutions: 68,
        successfulExecutions: 68,
        failedExecutions: 0,
        averageExecutionTimeMs: 380
      },
      {
        id: 'agent-sec-verif',
        name: 'Security Verification Agent',
        workflowType: 'IT_INCIDENT_ACCESS_GOVERNANCE',
        roleDescription: 'Verifies network perimeter, checks TLS handshake integrity, scans for residual vulnerabilities post-patch.',
        capabilities: ['Port & TLS Validation', 'Vulnerability Scan', 'Integrity Check'],
        status: 'IDLE',
        totalExecutions: 67,
        successfulExecutions: 67,
        failedExecutions: 0,
        averageExecutionTimeMs: 490
      },
      {
        id: 'agent-inc-rep',
        name: 'Incident Reporting Agent',
        workflowType: 'IT_INCIDENT_ACCESS_GOVERNANCE',
        roleDescription: 'Generates ISO27001/SOC2 compliant post-mortem report with complete timeline, root cause, and remediation.',
        capabilities: ['Post-Mortem Generation', 'Audit Log Archival', 'Executive Summary'],
        status: 'IDLE',
        totalExecutions: 66,
        successfulExecutions: 66,
        failedExecutions: 0,
        averageExecutionTimeMs: 350
      }
    ];

    seedAgents.forEach(a => this.agents.set(a.id, a));

    // 3. Seed Sample Documents
    const seedDocs: Document[] = [
      {
        id: 'doc-inv-9481',
        name: 'Nexus_Cloud_Invoice_9481.pdf',
        fileType: 'application/pdf',
        sizeBytes: 248500,
        uploadedByUserId: 'usr-fin-03',
        uploadedByName: 'Marcus Vance',
        url: '/assets/sample-invoices/nexus_cloud_inv.pdf',
        uploadedAt: '2026-10-24T14:20:00Z',
        extractedText: 'INVOICE #INV-2026-9481\nNexus Cloud Technologies LLC\nPO Ref: PO-98421-CORP\nTotal: $24,500.00 USD\nTerms: Net 30\nLine 1: 2x Dedicated Enterprise GPU Clusters - $16,000\nLine 2: High Throughput Storage Tier - $8,500'
      },
      {
        id: 'doc-id-sarah',
        name: 'Sarah_Jenkins_Passport_Redacted.pdf',
        fileType: 'application/pdf',
        sizeBytes: 184200,
        uploadedByUserId: 'usr-hr-02',
        uploadedByName: 'Elena Rostova',
        url: '/assets/sample-hr/sarah_passport.pdf',
        uploadedAt: '2026-10-25T09:15:00Z',
        extractedText: 'UNITED STATES PASSPORT\nSurname: JENKINS\nGiven Names: SARAH MARIE\nNationality: USA\nDate of Birth: 14 JUN 1991\nStatus: VALID'
      },
      {
        id: 'doc-rfp-workstations',
        name: 'Enterprise_Workstations_RFP_Specifications.pdf',
        fileType: 'application/pdf',
        sizeBytes: 312000,
        uploadedByUserId: 'usr-admin-01',
        uploadedByName: 'Alexander Sterling',
        url: '/assets/sample-proc/workstations_rfp.pdf',
        uploadedAt: '2026-10-26T16:00:00Z',
        extractedText: 'RFP-2026-HW-50\nRequisition: 50x Developer Workstations\nSpecs: 64GB Unified RAM, 1TB SSD, 14-core CPU\nDelivery Window: 14 business days\nBudget Allocation: $125,000 USD'
      }
    ];
    seedDocs.forEach(d => this.documents.set(d.id, d));

    // 4. Seed Pre-Built Workflows (Covering all 5 workflows with deep demonstration states)
    this.createSeededWorkflows();
  }

  createSeededWorkflows() {
    // Workflow 1: Invoice Processing - WAITING_FOR_APPROVAL ($24,500 high-value invoice requiring Finance Manager approval)
    const wf1Id = 'wf-inv-2026-001';
    const wf1Tasks: WorkflowTask[] = [
      {
        id: 'task-wf1-1',
        workflowId: wf1Id,
        name: 'Invoice Ingestion & Format Check',
        description: 'Ingest raw PDF invoice and validate metadata structure',
        assignedAgentId: 'agent-inv-intake',
        assignedAgentName: 'Invoice Intake Agent',
        dependencies: [],
        status: 'COMPLETED',
        order: 1,
        progress: 100,
        retryCount: 0,
        maxRetries: 3,
        output: { fileValid: true, pageCount: 2, sizeKb: 248 },
        completedAt: '2026-10-24T14:21:00Z'
      },
      {
        id: 'task-wf1-2',
        workflowId: wf1Id,
        name: 'Multimodal Data & Line Item Extraction',
        description: 'Extract vendor, PO number, line items, taxes, and total using Gemini',
        assignedAgentId: 'agent-data-extract',
        assignedAgentName: 'Data Extraction Agent',
        dependencies: ['task-wf1-1'],
        status: 'COMPLETED',
        order: 2,
        progress: 100,
        retryCount: 0,
        maxRetries: 3,
        output: {
          vendor: 'Nexus Cloud Technologies LLC',
          invoiceNumber: 'INV-2026-9481',
          totalAmount: 24500.00,
          currency: 'USD',
          poNumber: 'PO-98421-CORP'
        },
        completedAt: '2026-10-24T14:21:40Z'
      },
      {
        id: 'task-wf1-3',
        workflowId: wf1Id,
        name: 'Ledger Duplicate Collision Check',
        description: 'Scan historical payment database for matching vendor/amount combinations',
        assignedAgentId: 'agent-dup-detect',
        assignedAgentName: 'Duplicate Detection Agent',
        dependencies: ['task-wf1-2'],
        status: 'COMPLETED',
        order: 3,
        progress: 100,
        retryCount: 0,
        maxRetries: 3,
        output: { duplicateFound: false, historicalMatchScore: 0.02 },
        completedAt: '2026-10-24T14:22:10Z'
      },
      {
        id: 'task-wf1-4',
        workflowId: wf1Id,
        name: '3-Way Financial Reconciliation',
        description: 'Cross-reference PO-98421-CORP and cloud provisioning receipt',
        assignedAgentId: 'agent-fin-recon',
        assignedAgentName: 'Financial Reconciliation Agent',
        dependencies: ['task-wf1-3'],
        status: 'COMPLETED',
        order: 4,
        progress: 100,
        retryCount: 0,
        maxRetries: 3,
        output: {
          poMatch: true,
          poTotal: 24500.00,
          variance: 0.00,
          requiresExecutiveApproval: true,
          reason: 'Invoice amount ($24,500.00) exceeds standard autonomous threshold ($10,000.00)'
        },
        completedAt: '2026-10-24T14:22:45Z'
      },
      {
        id: 'task-wf1-5',
        workflowId: wf1Id,
        name: 'Executive Payment Authorization Gate',
        description: 'Human-in-the-loop sign-off before ERP settlement batch submission',
        assignedAgentId: 'agent-pay-proc',
        assignedAgentName: 'Payment Processing Agent',
        dependencies: ['task-wf1-4'],
        status: 'WAITING_APPROVAL',
        order: 5,
        progress: 40,
        retryCount: 0,
        maxRetries: 2,
        requiresApproval: true,
        approvalId: 'appr-inv-001'
      },
      {
        id: 'task-wf1-6',
        workflowId: wf1Id,
        name: 'ERP Settlement & Audit Record Archival',
        description: 'Post ACH remittance advice and update Accounts Payable ledger in SAP',
        assignedAgentId: 'agent-pay-proc',
        assignedAgentName: 'Payment Processing Agent',
        dependencies: ['task-wf1-5'],
        status: 'PENDING',
        order: 6,
        progress: 0,
        retryCount: 0,
        maxRetries: 3
      }
    ];

    const wf1: Workflow = {
      id: wf1Id,
      title: 'Invoice Processing - Nexus Cloud Infrastructure ($24,500)',
      type: 'INVOICE_PROCESSING',
      submittedByUserId: 'usr-fin-03',
      submittedByName: 'Marcus Vance',
      submittedByRole: 'FINANCE_MANAGER',
      status: 'WAITING_FOR_APPROVAL',
      currentTaskId: 'task-wf1-5',
      currentAgentName: 'Payment Processing Agent',
      progress: 68,
      priority: 'HIGH',
      metadata: {
        vendorName: 'Nexus Cloud Technologies LLC',
        invoiceNumber: 'INV-2026-9481',
        amount: 24500.00,
        currency: 'USD',
        poNumber: 'PO-98421-CORP',
        dueDate: '2026-11-23'
      },
      documentIds: ['doc-inv-9481'],
      tasks: wf1Tasks,
      plannerNotes: [
        'Central Planner: Goal initialized for Accounts Payable workflow.',
        'Central Planner: Dispatched Intake and Extraction in pipeline.',
        'Central Planner: Reconciliation matched PO-98421-CORP without variance.',
        'Central Planner: Detected high-value spend > $10,000 policy gate. Triggered human approval request appr-inv-001.'
      ],
      createdAt: '2026-10-24T14:20:00Z',
      updatedAt: '2026-10-24T14:23:00Z'
    };

    this.workflows.set(wf1.id, wf1);
    wf1Tasks.forEach(t => this.tasks.set(t.id, t));

    // Approval for WF1
    const appr1: ApprovalRequest = {
      id: 'appr-inv-001',
      workflowId: wf1Id,
      taskId: 'task-wf1-5',
      actionRequested: 'Authorize Wire Payment of $24,500.00 to Nexus Cloud Technologies LLC',
      requestedByAgent: 'Financial Reconciliation Agent',
      riskLevel: 'HIGH',
      approverRoleRequired: 'FINANCE_MANAGER',
      state: 'PENDING',
      details: {
        vendor: 'Nexus Cloud Technologies LLC',
        invoiceNumber: 'INV-2026-9481',
        amount: '$24,500.00 USD',
        poNumber: 'PO-98421-CORP',
        lineItems: [
          '2x Dedicated Enterprise GPU Clusters ($16,000)',
          'High Throughput Storage Tier ($8,500)'
        ],
        reconciliationScore: '100% Match with PO',
        reason: 'Spend policy requires Finance Manager signature for all invoices >= $10,000 USD'
      },
      createdAt: '2026-10-24T14:22:45Z'
    };
    this.approvals.set(appr1.id, appr1);

    // Workflow 2: Employee Onboarding - WAITING_FOR_APPROVAL (Privileged AWS production access for Staff Security Engineer)
    const wf2Id = 'wf-onboard-2026-002';
    const wf2Tasks: WorkflowTask[] = [
      {
        id: 'task-wf2-1',
        workflowId: wf2Id,
        name: 'Validate Personal & Tax Identity',
        description: 'Verify employee profile, residency, and tax declaration',
        assignedAgentId: 'agent-emp-info',
        assignedAgentName: 'Employee Information Agent',
        dependencies: [],
        status: 'COMPLETED',
        order: 1,
        progress: 100,
        retryCount: 0,
        maxRetries: 3,
        output: { valid: true, jurisdiction: 'US-CA', verifiedIdentity: true },
        completedAt: '2026-10-25T09:16:00Z'
      },
      {
        id: 'task-wf2-2',
        workflowId: wf2Id,
        name: 'Document Verification & I-9 Verification',
        description: 'Verify passport validity and work authorization status',
        assignedAgentId: 'agent-doc-verify',
        assignedAgentName: 'Document Verification Agent',
        dependencies: ['task-wf2-1'],
        status: 'COMPLETED',
        order: 2,
        progress: 100,
        retryCount: 0,
        maxRetries: 3,
        output: { documentStatus: 'AUTHENTIC', expiryDate: '2031-08-19' },
        completedAt: '2026-10-25T09:17:15Z'
      },
      {
        id: 'task-wf2-3',
        workflowId: wf2Id,
        name: 'HRIS Employee Profile Creation',
        description: 'Create Workday record, department assignment, and reporting structure',
        assignedAgentId: 'agent-hr-ops',
        assignedAgentName: 'HR Operations Agent',
        dependencies: ['task-wf2-2'],
        status: 'COMPLETED',
        order: 3,
        progress: 100,
        retryCount: 0,
        maxRetries: 3,
        output: { employeeId: 'EMP-98214', title: 'Senior Staff Security Engineer', grade: 'L7' },
        completedAt: '2026-10-25T09:18:00Z'
      },
      {
        id: 'task-wf2-4',
        workflowId: wf2Id,
        name: 'Payroll Enrollment & Benefits Setup',
        description: 'Configure direct deposit, tax withholdings, and 401(k) election',
        assignedAgentId: 'agent-payroll',
        assignedAgentName: 'Finance/Payroll Agent',
        dependencies: ['task-wf2-3'],
        status: 'COMPLETED',
        order: 4,
        progress: 100,
        retryCount: 0,
        maxRetries: 3,
        output: { payrollStatus: 'ACTIVE', payCycle: 'BI-WEEKLY', tier: 'EXECUTIVE_TECH' },
        completedAt: '2026-10-25T09:18:45Z'
      },
      {
        id: 'task-wf2-5',
        workflowId: wf2Id,
        name: 'Privileged Security Access Authorization Gate',
        description: 'Approval required for AWS Production Root IAM Role & Bastion Admin',
        assignedAgentId: 'agent-it-prov',
        assignedAgentName: 'IT Provisioning Agent',
        dependencies: ['task-wf2-4'],
        status: 'WAITING_APPROVAL',
        order: 5,
        progress: 50,
        retryCount: 0,
        maxRetries: 2,
        requiresApproval: true,
        approvalId: 'appr-onboard-002'
      },
      {
        id: 'task-wf2-6',
        workflowId: wf2Id,
        name: 'IT Workspace & Hardware Provisioning',
        description: 'Issue Okta SSO, Slack, GitHub Enterprise, and provision MacBook Pro M3',
        assignedAgentId: 'agent-it-prov',
        assignedAgentName: 'IT Provisioning Agent',
        dependencies: ['task-wf2-5'],
        status: 'PENDING',
        order: 6,
        progress: 0,
        retryCount: 0,
        maxRetries: 3
      },
      {
        id: 'task-wf2-7',
        workflowId: wf2Id,
        name: 'Welcome Package & Joining Instructions Generation',
        description: 'Generate personalized day-one roadmap, mentor intro, and orientation schedule',
        assignedAgentId: 'agent-emp-comm',
        assignedAgentName: 'Employee Communication Agent',
        dependencies: ['task-wf2-6'],
        status: 'PENDING',
        order: 7,
        progress: 0,
        retryCount: 0,
        maxRetries: 3
      }
    ];

    const wf2: Workflow = {
      id: wf2Id,
      title: 'Employee Onboarding - Sarah Jenkins (Senior Staff Security Engineer)',
      type: 'EMPLOYEE_ONBOARDING',
      submittedByUserId: 'usr-hr-02',
      submittedByName: 'Elena Rostova',
      submittedByRole: 'HR_MANAGER',
      status: 'WAITING_FOR_APPROVAL',
      currentTaskId: 'task-wf2-5',
      currentAgentName: 'IT Provisioning Agent',
      progress: 60,
      priority: 'HIGH',
      metadata: {
        candidateName: 'Sarah Marie Jenkins',
        roleTitle: 'Senior Staff Security Engineer',
        department: 'Information Security & Infrastructure',
        startDate: '2026-11-03',
        manager: 'Alexander Sterling',
        location: 'San Francisco, CA (Hybrid)'
      },
      documentIds: ['doc-id-sarah'],
      tasks: wf2Tasks,
      plannerNotes: [
        'Central Planner: Received onboarding packet for Sarah Jenkins.',
        'Central Planner: Successfully verified identity and passport documents.',
        'Central Planner: Enrolled in HRIS and Payroll.',
        'Central Planner: IT Provisioning detected sensitive request: "AWS Production Infrastructure Admin". Pausing workflow for Admin approval.'
      ],
      createdAt: '2026-10-25T09:15:00Z',
      updatedAt: '2026-10-25T09:19:00Z'
    };

    this.workflows.set(wf2.id, wf2);
    wf2Tasks.forEach(t => this.tasks.set(t.id, t));

    const appr2: ApprovalRequest = {
      id: 'appr-onboard-002',
      workflowId: wf2Id,
      taskId: 'task-wf2-5',
      actionRequested: 'Grant Privileged AWS Security Admin & Production Bastion Access',
      requestedByAgent: 'IT Provisioning Agent',
      riskLevel: 'CRITICAL',
      approverRoleRequired: 'ADMIN',
      state: 'PENDING',
      details: {
        employeeName: 'Sarah Marie Jenkins',
        jobTitle: 'Senior Staff Security Engineer',
        requestedPrivileges: [
          'AWS IAM Policy: SecurityAdminAccess (Prod-Global)',
          'SSH Bastion Key: bastion.prod.enterpriseflow.ai',
          'GitHub Org: enterpriseflow-ai/core-infra (Write Access)'
        ],
        complianceNote: 'Requires ISO27001 Annex A.9 access control sign-off by IT Administrator'
      },
      createdAt: '2026-10-25T09:18:45Z'
    };
    this.approvals.set(appr2.id, appr2);

    // Workflow 3: Automated IT Incident Response - COMPLETED (With self-healing and RCA)
    const wf3Id = 'wf-inc-2026-003';
    const wf3Tasks: WorkflowTask[] = [
      {
        id: 'task-wf3-1',
        workflowId: wf3Id,
        name: 'Telemetry Ingestion & Alert Triage',
        description: 'Ingest Datadog alert: 400% connection surge on Auth Redis cluster',
        assignedAgentId: 'agent-inc-det',
        assignedAgentName: 'Incident Detection Agent',
        dependencies: [],
        status: 'COMPLETED',
        order: 1,
        progress: 100,
        retryCount: 0,
        maxRetries: 3,
        output: { anomalyDetected: true, metric: 'redis_client_connections', threshold: 10000, value: 42100 },
        completedAt: '2026-10-25T11:00:15Z'
      },
      {
        id: 'task-wf3-2',
        workflowId: wf3Id,
        name: 'Incident Severity & Impact Classification',
        description: 'Determine system criticality and potential customer authentication degradation',
        assignedAgentId: 'agent-inc-class',
        assignedAgentName: 'Incident Classification Agent',
        dependencies: ['task-wf3-1'],
        status: 'COMPLETED',
        order: 2,
        progress: 100,
        retryCount: 0,
        maxRetries: 3,
        output: { severity: 'SEV_1_CRITICAL', blastRadius: 'Global Customer SSO Auth', estimatedUsersImpacted: 840 },
        completedAt: '2026-10-25T11:00:45Z'
      },
      {
        id: 'task-wf3-3',
        workflowId: wf3Id,
        name: 'AI Root Cause Analysis & Trace Correlation',
        description: 'Correlate distributed logs and isolate connection leak in session cache pool',
        assignedAgentId: 'agent-rca',
        assignedAgentName: 'Root Cause Analysis Agent',
        dependencies: ['task-wf3-2'],
        status: 'COMPLETED',
        order: 3,
        progress: 100,
        retryCount: 0,
        maxRetries: 3,
        output: {
          rootCause: 'Connection pool starvation in auth-service-v3 container during token refresh spike',
          remedy: 'Dynamic scaling of Redis read replicas and connection drain cycle'
        },
        completedAt: '2026-10-25T11:01:30Z'
      },
      {
        id: 'task-wf3-4',
        workflowId: wf3Id,
        name: 'Automated Remediation Execution',
        description: 'Apply replica auto-scaling and hot-swap connection throttle rules',
        assignedAgentId: 'agent-inc-resp',
        assignedAgentName: 'Incident Response Agent',
        dependencies: ['task-wf3-3'],
        status: 'COMPLETED',
        order: 4,
        progress: 100,
        retryCount: 0,
        maxRetries: 3,
        output: { replicasScaled: 4, connectionDropPct: 78, serviceLatencyMs: 18 },
        completedAt: '2026-10-25T11:02:15Z'
      },
      {
        id: 'task-wf3-5',
        workflowId: wf3Id,
        name: 'Security Perimeter Verification & Post-Mortem',
        description: 'Verify TLS health, generate incident audit trail and SOC2 compliance post-mortem',
        assignedAgentId: 'agent-inc-rep',
        assignedAgentName: 'Incident Reporting Agent',
        dependencies: ['task-wf3-4'],
        status: 'COMPLETED',
        order: 5,
        progress: 100,
        retryCount: 0,
        maxRetries: 3,
        output: { postMortemId: 'PM-2026-891', resolvedDurationMin: 4.2, status: 'RESTORED' },
        completedAt: '2026-10-25T11:03:00Z'
      }
    ];

    const wf3: Workflow = {
      id: wf3Id,
      title: 'IT Incident Response - Auth Redis Connection Pool Leak (Sev-1)',
      type: 'IT_INCIDENT_ACCESS_GOVERNANCE',
      submittedByUserId: 'usr-admin-01',
      submittedByName: 'Alexander Sterling',
      submittedByRole: 'ADMIN',
      status: 'COMPLETED',
      progress: 100,
      priority: 'CRITICAL',
      metadata: {
        incidentId: 'INC-2026-8921',
        system: 'Authentication & Session Service',
        durationSeconds: 255,
        slaBreached: false
      },
      documentIds: [],
      tasks: wf3Tasks,
      plannerNotes: [
        'Central Planner: Telemetry ingested from production monitoring.',
        'Central Planner: Classified as SEV-1. Triggered parallel diagnosis.',
        'Central Planner: RCA Agent pinpointed connection leak within 45s.',
        'Central Planner: Executed hot-patch and restored cluster health.',
        'Central Planner: Generated post-mortem report.'
      ],
      finalResult: {
        resolutionStatus: 'RESOLVED_HEALTHY',
        outageDuration: '4 minutes 15 seconds',
        rootCause: 'Connection pool starvation in auth-service container',
        correctiveAction: 'Read replicas scaled 2x -> 4x and connection limits patched'
      },
      createdAt: '2026-10-25T11:00:00Z',
      updatedAt: '2026-10-25T11:03:00Z',
      completedAt: '2026-10-25T11:03:00Z'
    };

    this.workflows.set(wf3.id, wf3);
    wf3Tasks.forEach(t => this.tasks.set(t.id, t));

    // Workflow 4: Customer Request Resolution - COMPLETED
    const wf4Id = 'wf-cust-2026-004';
    const wf4Tasks: WorkflowTask[] = [
      {
        id: 'task-wf4-1',
        workflowId: wf4Id,
        name: 'Inquiry Ingestion & SLA Classification',
        description: 'Parse customer ticket regarding recurring API rate-limit errors',
        assignedAgentId: 'agent-req-class',
        assignedAgentName: 'Request Classification Agent',
        dependencies: [],
        status: 'COMPLETED',
        order: 1,
        progress: 100,
        retryCount: 0,
        maxRetries: 3,
        output: { category: 'API_INTEGRATION', priority: 'HIGH', customerTier: 'ENTERPRISE_GOLD' },
        completedAt: '2026-10-26T08:30:10Z'
      },
      {
        id: 'task-wf4-2',
        workflowId: wf4Id,
        name: 'Account Enrichment & SLA History',
        description: 'Fetch CRM subscription level, account executive notes, and contract ARR',
        assignedAgentId: 'agent-cust-info',
        assignedAgentName: 'Customer Information Agent',
        dependencies: ['task-wf4-1'],
        status: 'COMPLETED',
        order: 2,
        progress: 100,
        retryCount: 0,
        maxRetries: 3,
        output: { accountName: 'Apex Financial Technologies', arr: '$240,000', dedicatedSlaMinutes: 30 },
        completedAt: '2026-10-26T08:30:40Z'
      },
      {
        id: 'task-wf4-3',
        workflowId: wf4Id,
        name: 'Knowledge Base Vector Retrieval',
        description: 'Retrieve burst rate limiting policies, Redis token bucket docs, and webhook headers',
        assignedAgentId: 'agent-kb-retrieval',
        assignedAgentName: 'Knowledge Retrieval Agent',
        dependencies: ['task-wf4-2'],
        status: 'COMPLETED',
        order: 3,
        progress: 100,
        retryCount: 0,
        maxRetries: 3,
        output: { matchedArticles: ['KB-9041-BURST-ALLOCATION', 'KB-1029-EXPONENTIAL-BACKOFF'] },
        completedAt: '2026-10-26T08:31:10Z'
      },
      {
        id: 'task-wf4-4',
        workflowId: wf4Id,
        name: 'Autonomous Solution Synthesis',
        description: 'Generate calibrated technical explanation and burst quota adjustment',
        assignedAgentId: 'agent-res-agent',
        assignedAgentName: 'Resolution Agent',
        dependencies: ['task-wf4-3'],
        status: 'COMPLETED',
        order: 4,
        progress: 100,
        retryCount: 0,
        maxRetries: 3,
        output: {
          confidenceScore: 0.96,
          actionTaken: 'Burst allowance upgraded to 5,000 req/min for end-of-month settlement window'
        },
        completedAt: '2026-10-26T08:31:50Z'
      },
      {
        id: 'task-wf4-5',
        workflowId: wf4Id,
        name: 'Response Delivery & CSAT Dispatch',
        description: 'Send white-glove response to customer engineering lead and close ticket',
        assignedAgentId: 'agent-cust-comm',
        assignedAgentName: 'Customer Communication Agent',
        dependencies: ['task-wf4-4'],
        status: 'COMPLETED',
        order: 5,
        progress: 100,
        retryCount: 0,
        maxRetries: 3,
        output: { dispatchedVia: 'Zendesk Ticket #84910', csatSent: true },
        completedAt: '2026-10-26T08:32:15Z'
      }
    ];

    const wf4: Workflow = {
      id: wf4Id,
      title: 'Customer Resolution - Apex Financial (API Rate Limit Adjustment)',
      type: 'CUSTOMER_REQUEST_RESOLUTION',
      submittedByUserId: 'usr-client-04',
      submittedByName: 'Sophia Chen',
      submittedByRole: 'CLIENT_MANAGER',
      status: 'COMPLETED',
      progress: 100,
      priority: 'HIGH',
      metadata: {
        customerName: 'Apex Financial Technologies',
        ticketNumber: 'TKT-84910',
        satisfactionScore: '5/5',
        resolutionMinutes: 2.5
      },
      documentIds: [],
      tasks: wf4Tasks,
      plannerNotes: [
        'Central Planner: Ingested priority ticket from Apex Financial.',
        'Central Planner: Customer ARR $240k identified. High SLA activated.',
        'Central Planner: Resolution Agent synthesized response with 96% confidence.',
        'Central Planner: Autonomous delivery executed without human intervention.'
      ],
      finalResult: {
        status: 'DELIVERED',
        customerFeedback: 'Outstanding response time and immediate quota adjustment. Thank you!',
        deliveredAt: '2026-10-26T08:32:15Z'
      },
      createdAt: '2026-10-26T08:30:00Z',
      updatedAt: '2026-10-26T08:32:15Z',
      completedAt: '2026-10-26T08:32:15Z'
    };

    this.workflows.set(wf4.id, wf4);
    wf4Tasks.forEach(t => this.tasks.set(t.id, t));

    // Workflow 5: Enterprise Procurement & Vendor Onboarding - RUNNING
    const wf5Id = 'wf-proc-2026-005';
    const wf5Tasks: WorkflowTask[] = [
      {
        id: 'task-wf5-1',
        workflowId: wf5Id,
        name: 'Procurement Specification Validation',
        description: 'Verify 50x Developer Workstations requirements and budget ceiling ($125,000)',
        assignedAgentId: 'agent-proc-req',
        assignedAgentName: 'Procurement Request Agent',
        dependencies: [],
        status: 'COMPLETED',
        order: 1,
        progress: 100,
        retryCount: 0,
        maxRetries: 3,
        output: { budgetCeiling: 125000, authorizedCostCenter: 'CC-ENG-HARDWARE' },
        completedAt: '2026-10-26T16:01:00Z'
      },
      {
        id: 'task-wf5-2',
        workflowId: wf5Id,
        name: 'Vendor Discovery & Catalog Matching',
        description: 'Search enterprise vendor network for certified OEM suppliers',
        assignedAgentId: 'agent-ven-disc',
        assignedAgentName: 'Vendor Discovery Agent',
        dependencies: ['task-wf5-1'],
        status: 'COMPLETED',
        order: 2,
        progress: 100,
        retryCount: 0,
        maxRetries: 3,
        output: { candidatesFound: 3, vendors: ['TechDirect Global', 'Enterprise Silicon Corp', 'Apex Hardware Solutions'] },
        completedAt: '2026-10-26T16:02:10Z'
      },
      {
        id: 'task-wf5-3',
        workflowId: wf5Id,
        name: 'Vendor Compliance & Security Screening',
        description: 'Audit W-9 tax IDs, SOC2 compliance certs, and OFAC sanctions list',
        assignedAgentId: 'agent-ven-verif',
        assignedAgentName: 'Vendor Verification Agent',
        dependencies: ['task-wf5-2'],
        status: 'COMPLETED',
        order: 3,
        progress: 100,
        retryCount: 0,
        maxRetries: 3,
        output: { allVendorsCleared: true, auditRef: 'SEC-COMP-4912' },
        completedAt: '2026-10-26T16:03:00Z'
      },
      {
        id: 'task-wf5-4',
        workflowId: wf5Id,
        name: 'Multi-Vendor Quotation Comparative Analysis',
        description: 'Evaluate unit cost, delivery SLAs, bulk discounting, and 3-year warranty terms',
        assignedAgentId: 'agent-quote-comp',
        assignedAgentName: 'Quotation Comparison Agent',
        dependencies: ['task-wf5-3'],
        status: 'IN_PROGRESS',
        order: 4,
        progress: 75,
        retryCount: 0,
        maxRetries: 3
      },
      {
        id: 'task-wf5-5',
        workflowId: wf5Id,
        name: 'Purchase Order Generation & Approval Gate',
        description: 'Draft binding PO contract and route for Executive Committee sign-off',
        assignedAgentId: 'agent-po-agent',
        assignedAgentName: 'Purchase Order Agent',
        dependencies: ['task-wf5-4'],
        status: 'PENDING',
        order: 5,
        progress: 0,
        retryCount: 0,
        maxRetries: 3,
        requiresApproval: true
      }
    ];

    const wf5: Workflow = {
      id: wf5Id,
      title: 'Enterprise Procurement - 50x Developer Workstations Requisition',
      type: 'PROCUREMENT_VENDOR_ONBOARDING',
      submittedByUserId: 'usr-admin-01',
      submittedByName: 'Alexander Sterling',
      submittedByRole: 'ADMIN',
      status: 'RUNNING',
      currentTaskId: 'task-wf5-4',
      currentAgentName: 'Quotation Comparison Agent',
      progress: 65,
      priority: 'HIGH',
      metadata: {
        requisitionId: 'REQ-2026-50HW',
        item: '50x Developer Workstations (64GB RAM)',
        budget: '$125,000 USD',
        requiredBy: '2026-11-15'
      },
      documentIds: ['doc-rfp-workstations'],
      tasks: wf5Tasks,
      plannerNotes: [
        'Central Planner: Requisition validated against Engineering Q4 budget.',
        'Central Planner: Discovered 3 certified suppliers in enterprise catalog.',
        'Central Planner: Compliance and sanctions checks completed successfully.',
        'Central Planner: Currently comparing multi-vendor quotes.'
      ],
      createdAt: '2026-10-26T16:00:00Z',
      updatedAt: '2026-10-26T16:03:30Z'
    };

    this.workflows.set(wf5.id, wf5);
    wf5Tasks.forEach(t => this.tasks.set(t.id, t));

    // 5. Seed Initial Audit Logs
    this.auditLogs = [
      {
        id: 'aud-001',
        workflowId: wf1Id,
        actorId: 'usr-fin-03',
        actorType: 'USER',
        actorName: 'Marcus Vance',
        actorRoleOrType: 'FINANCE_MANAGER',
        eventType: 'DOCUMENT_UPLOADED',
        description: 'Uploaded Nexus_Cloud_Invoice_9481.pdf for Accounts Payable processing',
        status: 'SUCCESS',
        metadata: { fileSize: 248500, mime: 'application/pdf' },
        timestamp: '2026-10-24T14:20:00Z'
      },
      {
        id: 'aud-002',
        workflowId: wf1Id,
        actorId: 'agent-planner',
        actorType: 'PLANNER',
        actorName: 'Central Planner Agent',
        actorRoleOrType: 'CENTRAL_ORCHESTRATOR',
        eventType: 'PLANNER_PLAN_GENERATED',
        description: 'Decomposed invoice goal into 6 sequential DAG tasks with approval checkpoint',
        status: 'SUCCESS',
        metadata: { taskCount: 6, estimatedDurationSec: 90 },
        timestamp: '2026-10-24T14:20:05Z'
      },
      {
        id: 'aud-003',
        workflowId: wf1Id,
        actorId: 'agent-fin-recon',
        actorType: 'AGENT',
        actorName: 'Financial Reconciliation Agent',
        actorRoleOrType: 'INVOICE_PROCESSING',
        eventType: 'APPROVAL_REQUESTED',
        description: 'Requested executive wire payment sign-off for $24,500.00 (Exceeds $10k policy)',
        status: 'WARNING',
        metadata: { approvalId: 'appr-inv-001', riskLevel: 'HIGH' },
        timestamp: '2026-10-24T14:22:45Z'
      },
      {
        id: 'aud-004',
        workflowId: wf2Id,
        actorId: 'agent-it-prov',
        actorType: 'AGENT',
        actorName: 'IT Provisioning Agent',
        actorRoleOrType: 'EMPLOYEE_ONBOARDING',
        eventType: 'APPROVAL_REQUESTED',
        description: 'Requested Admin authorization for AWS Production Root IAM Role & Bastion Admin for Sarah Jenkins',
        status: 'WARNING',
        metadata: { approvalId: 'appr-onboard-002', riskLevel: 'CRITICAL' },
        timestamp: '2026-10-25T09:18:45Z'
      },
      {
        id: 'aud-005',
        workflowId: wf3Id,
        actorId: 'agent-rca',
        actorType: 'AGENT',
        actorName: 'Root Cause Analysis Agent',
        actorRoleOrType: 'IT_INCIDENT_ACCESS_GOVERNANCE',
        eventType: 'AGENT_EXECUTION_FINISH',
        description: 'Gemini model diagnosed connection pool starvation in auth-service-v3 within 45 seconds',
        status: 'SUCCESS',
        metadata: { incidentId: 'INC-2026-8921', severity: 'SEV_1_CRITICAL' },
        timestamp: '2026-10-25T11:01:30Z'
      }
    ];

    // 6. Seed Initial Interaction Logs
    this.interactionLogs = [
      {
        id: 'int-001',
        eventId: 'evt-log-01',
        userId: 'usr-admin-01',
        userName: 'Alexander Sterling',
        userRole: 'ADMIN',
        action: 'USER_LOGIN',
        details: { method: 'PASSWORD_AUTHENTICATION', ip: '192.168.1.104' },
        timestamp: '2026-10-26T07:45:00Z'
      },
      {
        id: 'int-002',
        eventId: 'evt-wf-02',
        userId: 'usr-fin-03',
        userName: 'Marcus Vance',
        userRole: 'FINANCE_MANAGER',
        workflowId: wf1Id,
        action: 'WORKFLOW_CREATED',
        details: { workflowType: 'INVOICE_PROCESSING', vendor: 'Nexus Cloud Technologies LLC' },
        timestamp: '2026-10-24T14:20:00Z'
      },
      {
        id: 'int-003',
        eventId: 'evt-view-03',
        userId: 'usr-hr-02',
        userName: 'Elena Rostova',
        userRole: 'HR_MANAGER',
        workflowId: wf2Id,
        action: 'PAGE_VIEW',
        details: { path: '/hr/onboarding/sarah-jenkins', durationMs: 14200 },
        timestamp: '2026-10-25T09:25:00Z'
      }
    ];

    // 7. Seed Initial Notifications
    this.notifications = [
      {
        id: 'notif-001',
        targetRole: 'FINANCE_MANAGER',
        title: 'Pending Invoice Approval ($24,500.00)',
        message: 'Nexus Cloud Technologies invoice #INV-2026-9481 requires your payment sign-off.',
        type: 'APPROVAL',
        workflowId: wf1Id,
        read: false,
        createdAt: '2026-10-24T14:23:00Z'
      },
      {
        id: 'notif-002',
        targetRole: 'ADMIN',
        title: 'Critical IAM Access Request',
        message: 'Sarah Jenkins requires AWS Production SecurityAdmin privileges.',
        type: 'APPROVAL',
        workflowId: wf2Id,
        read: false,
        createdAt: '2026-10-25T09:19:00Z'
      },
      {
        id: 'notif-003',
        title: 'Sev-1 Incident Auto-Resolved',
        message: 'Auth Redis Connection pool anomaly successfully restored in 4m 15s.',
        type: 'SUCCESS',
        workflowId: wf3Id,
        read: true,
        createdAt: '2026-10-25T11:03:00Z'
      }
    ];
  }

  // Helper Methods for Logging
  logInteraction(userId: string | undefined, userName: string | undefined, userRole: UserRole | undefined, action: string, details: Record<string, any>, workflowId?: string) {
    const entry: InteractionLog = {
      id: `int-${crypto.randomUUID().slice(0, 8)}`,
      eventId: `evt-${crypto.randomUUID().slice(0, 8)}`,
      userId,
      userName,
      userRole,
      workflowId,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    this.interactionLogs.unshift(entry);
    if (this.interactionLogs.length > 500) {
      this.interactionLogs.pop();
    }
    return entry;
  }

  logAudit(actorId: string, actorType: 'USER' | 'AGENT' | 'PLANNER', actorName: string, actorRoleOrType: string, eventType: EventType, description: string, status: 'SUCCESS' | 'FAILURE' | 'WARNING' | 'INFO', metadata: Record<string, any>, workflowId?: string) {
    const entry: AuditLog = {
      id: `aud-${crypto.randomUUID().slice(0, 8)}`,
      workflowId,
      actorId,
      actorType,
      actorName,
      actorRoleOrType,
      eventType,
      description,
      status,
      metadata,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(entry);
    if (this.auditLogs.length > 1000) {
      this.auditLogs.pop();
    }
    return entry;
  }

  addNotification(title: string, message: string, type: 'INFO' | 'SUCCESS' | 'WARNING' | 'APPROVAL', targetRole?: UserRole, workflowId?: string) {
    const notif: Notification = {
      id: `notif-${crypto.randomUUID().slice(0, 8)}`,
      targetRole,
      title,
      message,
      type,
      workflowId,
      read: false,
      createdAt: new Date().toISOString()
    };
    this.notifications.unshift(notif);
    return notif;
  }
}

export const db = new Database();
