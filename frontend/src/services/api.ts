// API client for EnterpriseFlow AI

const API_BASE = '/api/v1';

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  department?: string;
  roles: string[];
}

export interface ApprovalMetrics {
  pending_count: number;
  approved_this_month: number;
  due_soon_count: number;
  total_financial_value: number;
  currency: string;
}

export interface ApprovalItem {
  id: string;
  workflow_id: string;
  task_id?: string;
  title: string;
  domain: string;
  risk_level: string;
  status: string;
  priority: string;
  requested_by_agent: string;
  requesting_employee?: string;
  department: string;
  financial_amount?: number;
  currency: string;
  business_justification: string;
  proposed_action: string;
  required_role: string;
  due_date?: string;
  is_overdue: boolean;
  decided_by_name?: string;
  decided_at?: string;
  decision_reason?: string;
  created_at: string;
}

export interface ApprovalDetail extends ApprovalItem {
  proposed_payload?: any;
  approved_payload?: any;
  ai_summary?: string;
  tools_invoked?: string[];
  validation_results?: Record<string, any>;
  risk_assessment?: string;
  supporting_evidence?: Record<string, any>;
  feedback_notes?: string;
  comments: Array<{
    id: string;
    author_name: string;
    author_role: string;
    comment_text: string;
    created_at: string;
  }>;
  history: Array<{
    id: string;
    action: string;
    actor_name: string;
    notes?: string;
    created_at: string;
  }>;
}

export interface WorkflowTask {
  id: string;
  task_key: string;
  agent_name: string;
  title: string;
  description: string;
  execution_order: number;
  status: string;
  input_payload?: any;
  output_payload?: any;
  error_details?: any;
  required_approval_id?: string;
  started_at?: string;
  completed_at?: string;
}

export interface WorkflowDetail {
  id: string;
  title: string;
  domain: string;
  status: string;
  priority: string;
  risk_level: string;
  raw_input: string;
  extracted_entities?: any;
  planner_plan?: any[];
  started_at?: string;
  completed_at?: string;
  tasks: WorkflowTask[];
  contexts: Array<{
    key: string;
    value: any;
    written_by_agent: string;
    created_at: string;
  }>;
}

export interface AuditEvent {
  id: string;
  sequence_number: number;
  workflow_id?: string;
  task_id?: string;
  actor_type: string;
  actor_id: string;
  actor_name: string;
  event_type: string;
  action_description: string;
  payload_reference?: any;
  execution_result: string;
  previous_hash: string;
  current_hash: string;
  timestamp: string;
}

export interface AuditVerification {
  valid: boolean;
  total_events: number;
  latest_sequence: number;
  latest_root_hash?: string;
  message: string;
  tampered_events: any[];
}

export const api = {
  // Users & Personas
  async getUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/users`);
    return res.json();
  },

  // Approvals
  async getApprovalMetrics(): Promise<ApprovalMetrics> {
    const res = await fetch(`${API_BASE}/approvals/metrics`);
    return res.json();
  },

  async listApprovals(params: Record<string, string | boolean | number> = {}): Promise<{ total: number; items: ApprovalItem[] }> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    const res = await fetch(`${API_BASE}/approvals?${query.toString()}`);
    const data = await res.json();
    return {
      total: data.total ?? (Array.isArray(data) ? data.length : data.items?.length ?? 0),
      items: Array.isArray(data) ? data : data.items || []
    };
  },

  async getApprovalDetail(id: string): Promise<ApprovalDetail> {
    const res = await fetch(`${API_BASE}/approvals/${id}`);
    if (!res.ok) throw new Error('Failed to load approval detail');
    return res.json();
  },

  async approve(id: string, payload: { user_id: string; user_name: string; user_role: string; notes?: string }) {
    const res = await fetch(`${API_BASE}/approvals/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail?.message || data.detail || 'Approval failed');
    return data;
  },

  async reject(id: string, payload: { user_id: string; user_name: string; user_role: string; reason: string }) {
    const res = await fetch(`${API_BASE}/approvals/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail?.message || data.detail || 'Rejection failed');
    return data;
  },

  async requestChanges(id: string, payload: { user_id: string; user_name: string; user_role: string; feedback: string }) {
    const res = await fetch(`${API_BASE}/approvals/${id}/request-changes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail?.message || data.detail || 'Request changes failed');
    return data;
  },

  async addComment(id: string, payload: { author_name: string; author_role: string; comment_text: string }) {
    const res = await fetch(`${API_BASE}/approvals/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async bulkApprove(approvalIds: string[], user: { id: string; name: string; role: string }) {
    const res = await fetch(`${API_BASE}/approvals/bulk-approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        approval_ids: approvalIds,
        user_id: user.id,
        user_name: user.name,
        user_role: user.role
      })
    });
    return res.json();
  },

  // Workflows
  async startWorkflow(prompt: string, requesterId?: string): Promise<{ workflow_id: string; title: string; domain: string; status: string }> {
    const res = await fetch(`${API_BASE}/workflows/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, requester_id: requesterId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to start workflow');
    return data;
  },

  async listWorkflows(domain?: string, status?: string): Promise<{ total: number; items: any[] }> {
    const query = new URLSearchParams();
    if (domain && domain !== 'ALL') query.append('domain', domain);
    if (status && status !== 'ALL') query.append('status', status);
    const res = await fetch(`${API_BASE}/workflows?${query.toString()}`);
    const data = await res.json();
    return {
      total: data.total ?? (Array.isArray(data) ? data.length : data.items?.length ?? 0),
      items: Array.isArray(data) ? data : data.items || []
    };
  },

  async getWorkflowDetail(id: string): Promise<WorkflowDetail> {
    const res = await fetch(`${API_BASE}/workflows/${id}`);
    if (!res.ok) throw new Error('Failed to load workflow detail');
    return res.json();
  },

  async resumeWorkflow(id: string) {
    const res = await fetch(`${API_BASE}/workflows/${id}/resume`, {
      method: 'POST'
    });
    return res.json();
  },

  // Audit
  async listAuditEvents(workflowId?: string): Promise<{ total: number; events: AuditEvent[] }> {
    const url = workflowId ? `${API_BASE}/audit/events?workflow_id=${workflowId}` : `${API_BASE}/audit/events`;
    const res = await fetch(url);
    const data = await res.json();
    return {
      total: data.total ?? (Array.isArray(data) ? data.length : (data.events || data.items)?.length ?? 0),
      events: Array.isArray(data) ? data : (data.events || data.items || [])
    };
  },

  async verifyAuditChain(): Promise<AuditVerification> {
    const res = await fetch(`${API_BASE}/audit/verify`);
    return res.json();
  },

  async simulateTamperTest(sequenceNumber = 1) {
    const res = await fetch(`${API_BASE}/audit/tamper-test?sequence_number=${sequenceNumber}`, {
      method: 'POST'
    });
    return res.json();
  },

  // Agents
  async listAgents(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/agents`);
    return res.json();
  },

  // Tools
  async listTools(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/tools`);
    return res.json();
  },

  async listToolLogs(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/tools/logs`);
    return res.json();
  },

  // Policies
  async listPolicies(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/policies`);
    return res.json();
  },

  async togglePolicy(id: string) {
    const res = await fetch(`${API_BASE}/policies/${id}/toggle`, {
      method: 'PUT'
    });
    return res.json();
  },

  // Chaos Testing & Autonomous Recovery
  async getChaosConfig() {
    const res = await fetch(`${API_BASE}/chaos/config`);
    return res.json();
  },

  async injectChaosFault(faultType: string, targetService = 'all', targetWorker = 'all', retryAfter = 0.5) {
    const res = await fetch(`${API_BASE}/chaos/inject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fault_type: faultType,
        target_service: targetService,
        target_worker: targetWorker,
        retry_after: retryAfter
      })
    });
    return res.json();
  },

  async resetChaos() {
    const res = await fetch(`${API_BASE}/chaos/reset`, { method: 'POST' });
    return res.json();
  },

  async getChaosHistory() {
    const res = await fetch(`${API_BASE}/chaos/history`);
    return res.json();
  },

  // Observability & Telemetry
  async getObservabilityMetrics() {
    const res = await fetch(`${API_BASE}/observability/metrics`);
    return res.json();
  },

  async getObservabilityEvents() {
    const res = await fetch(`${API_BASE}/observability/events`);
    return res.json();
  }
};

