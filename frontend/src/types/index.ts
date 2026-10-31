export type UserRole = 'ADMIN' | 'HR_MANAGER' | 'EMPLOYEE_MANAGER' | 'FINANCE_MANAGER' | 'CLIENT_MANAGER' | 'SERVICE_MANAGER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  avatarUrl: string;
}

export type WorkflowType = 
  | 'EMPLOYEE_ONBOARDING'
  | 'INVOICE_PROCESSING'
  | 'CUSTOMER_REQUEST_RESOLUTION'
  | 'PROCUREMENT_VENDOR_ONBOARDING'
  | 'IT_INCIDENT_ACCESS_GOVERNANCE';

export type WorkflowStatus = 
  | 'SUBMITTED'
  | 'PLANNING'
  | 'RUNNING'
  | 'EXECUTING'
  | 'WAITING_FOR_APPROVAL'
  | 'WAITING_APPROVAL'
  | 'COMPLETED'
  | 'FAILED'
  | 'REQUIRES_ATTENTION'
  | 'REJECTED';

export type TaskStatus = 
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'WAITING_APPROVAL'
  | 'COMPLETED'
  | 'FAILED'
  | 'SKIPPED'
  | 'RETRYING';

export interface WorkflowTask {
  id: string;
  workflowId: string;
  name: string;
  description: string;
  assignedAgentId: string;
  assignedAgentName: string;
  dependencies: string[];
  status: TaskStatus;
  order: number;
  progress: number;
  output?: Record<string, any>;
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
  requiresApproval?: boolean;
  approvalId?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface Workflow {
  id: string;
  title: string;
  type: WorkflowType;
  domain?: string;
  rawInput?: string;
  submittedByUserId: string;
  submittedByName: string;
  submittedByRole: UserRole;
  status: WorkflowStatus;
  currentTaskId?: string;
  currentAgentName?: string;
  progress: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  metadata: Record<string, any>;
  documentIds: string[];
  tasks: WorkflowTask[];
  plannerNotes: string[];
  finalResult?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface Agent {
  id: string;
  name: string;
  workflowType: WorkflowType | 'GLOBAL';
  roleDescription: string;
  capabilities: string[];
  status: 'IDLE' | 'ACTIVE' | 'ERROR';
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTimeMs: number;
}

export interface AgentMessage {
  id: string;
  workflowId: string;
  fromAgent: string;
  toAgent: string;
  messageType: 'TASK_DISPATCH' | 'DATA_HANDOFF' | 'APPROVAL_REQUEST' | 'TASK_RESULT' | 'ALERT' | 'PLANNER_INSTRUCTION';
  content: string;
  payload?: Record<string, any>;
  timestamp: string;
}

export type ApprovalState = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';

export interface ApprovalRequest {
  id: string;
  workflowId: string;
  taskId: string;
  actionRequested: string;
  requestedByAgent: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  approverRoleRequired: UserRole;
  state: ApprovalState;
  approverUserId?: string;
  approverName?: string;
  decisionReason?: string;
  details: Record<string, any>;
  createdAt: string;
  decidedAt?: string;
}

export type EventType = 
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'PAGE_VIEW'
  | 'WORKFLOW_CREATED'
  | 'PLANNER_PLAN_GENERATED'
  | 'TASK_ASSIGNED'
  | 'TASK_STATUS_CHANGED'
  | 'AGENT_EXECUTION_START'
  | 'AGENT_EXECUTION_FINISH'
  | 'AGENT_MESSAGE_SENT'
  | 'APPROVAL_REQUESTED'
  | 'APPROVAL_DECIDED'
  | 'TOOL_CALL'
  | 'ERROR_OCCURRED'
  | 'RETRY_INITIATED'
  | 'WORKFLOW_COMPLETED'
  | 'WORKFLOW_FAILED'
  | 'DOCUMENT_UPLOADED';

export interface AuditLog {
  id: string;
  workflowId?: string;
  actorId: string;
  actorType: 'USER' | 'AGENT' | 'PLANNER';
  actorName: string;
  actorRoleOrType: string;
  eventType: EventType;
  description: string;
  status: 'SUCCESS' | 'FAILURE' | 'WARNING' | 'INFO';
  metadata: Record<string, any>;
  timestamp: string;
}

export interface InteractionLog {
  id: string;
  eventId: string;
  userId?: string;
  userName?: string;
  userRole?: UserRole;
  workflowId?: string;
  action: string;
  details: Record<string, any>;
  timestamp: string;
}

export interface Document {
  id: string;
  workflowId?: string;
  name: string;
  fileType: string;
  sizeBytes: number;
  uploadedByUserId: string;
  uploadedByName: string;
  url: string;
  extractedText?: string;
  uploadedAt: string;
}

export interface Notification {
  id: string;
  userId?: string;
  targetRole?: UserRole;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'APPROVAL';
  workflowId?: string;
  read: boolean;
  createdAt: string;
}
