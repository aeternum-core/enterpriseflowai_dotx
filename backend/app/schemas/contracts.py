from datetime import datetime
from typing import Dict, Any, List, Optional, Literal
from pydantic import BaseModel, Field

# Worker Roles
WorkerRole = Literal[
    "DOCUMENT_AND_DATA_WORKER",
    "BUSINESS_OPERATIONS_WORKER",
    "IT_AND_INTEGRATION_WORKER",
    "PLANNER",
    "POLICY_SENTINEL"
]

# Task Statuses
TaskStatus = Literal[
    "PENDING",
    "IN_PROGRESS",
    "WAITING_APPROVAL",
    "COMPLETED",
    "FAILED",
    "SKIPPED",
    "RETRYING",
    "ESCALATED"
]

# Risk Tiers
RiskTier = Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]

class TaskDependency(BaseModel):
    task_id: str
    depends_on_task_id: str

class WorkflowTask(BaseModel):
    task_id: str
    workflow_id: str
    title: str
    description: str
    worker_role: WorkerRole
    action_type: str
    execution_order: int
    dependencies: List[str] = Field(default_factory=list)
    requires_approval: bool = False
    risk_tier: RiskTier = "LOW"
    required_role: Optional[str] = None
    structured_parameters: Dict[str, Any] = Field(default_factory=dict)
    status: TaskStatus = "PENDING"
    retry_count: int = 0
    max_retries: int = 3
    is_idempotent: bool = True

class TaskDAG(BaseModel):
    workflow_id: str
    domain: str
    tasks: List[WorkflowTask]
    is_valid: bool = True
    validation_errors: List[str] = Field(default_factory=list)

class AgentTaskHandoff(BaseModel):
    task_id: str
    workflow_id: str
    run_id: str
    source_agent: WorkerRole
    target_agent: WorkerRole
    action_type: str
    structured_parameters: Dict[str, Any]
    context_references: Dict[str, Any] = Field(default_factory=dict)
    idempotency_key: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class AgentTaskResult(BaseModel):
    task_id: str
    workflow_id: str
    agent_role: WorkerRole
    action_type: str
    status: TaskStatus
    output_payload: Dict[str, Any] = Field(default_factory=dict)
    tools_invoked: List[str] = Field(default_factory=list)
    execution_duration_ms: int = 0
    error_message: Optional[str] = None
    recovery_attempted: bool = False
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ToolExecutionRequest(BaseModel):
    tool_key: str
    agent_role: WorkerRole
    workflow_id: str
    task_id: str
    idempotency_key: str
    payload: Dict[str, Any]
    user_context: Optional[Dict[str, Any]] = None

class ToolExecutionResult(BaseModel):
    tool_key: str
    status: Literal["SUCCESS", "FAILED", "BLOCKED_UNAUTHORIZED", "BLOCKED_UNAPPROVED", "RECOVERED"]
    response: Dict[str, Any]
    is_simulated: bool = True
    service_name: str
    execution_time_ms: int
    error_code: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class PolicyEvaluationResult(BaseModel):
    rule_id: str
    domain: str
    risk_classification: RiskTier
    risk_score: float = Field(ge=0.0, le=1.0)
    requires_approval: bool
    required_approval_level: str
    evidence: Dict[str, Any] = Field(default_factory=dict)
    violations: List[str] = Field(default_factory=list)
    recommended_mitigation: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class RecoveryResult(BaseModel):
    strategy: str
    fault_type: str
    attempt_number: int
    max_attempts: int
    recovered: bool
    remedy_description: str
    telemetry: Dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=datetime.utcnow)

