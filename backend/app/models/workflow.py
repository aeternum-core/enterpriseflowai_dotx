import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class Workflow(Base):
    __tablename__ = 'workflows'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    domain = Column(String(50), nullable=False) # onboarding, invoice, customer, procurement, it_incident
    status = Column(String(50), default="PENDING") # PENDING, PLANNING, EXECUTING, WAITING_APPROVAL, COMPLETED, FAILED, REJECTED, CHANGES_REQUESTED
    priority = Column(String(20), default="MEDIUM") # LOW, MEDIUM, HIGH, URGENT
    risk_level = Column(String(20), default="LOW") # LOW, MEDIUM, HIGH, CRITICAL
    raw_input = Column(Text, nullable=False)
    extracted_entities = Column(JSON, default=dict) # Structured parameters from Level 1
    planner_plan = Column(JSON, default=dict) # Level 2 DAG plan
    requester_id = Column(String(36), nullable=True) # User ID or 'system'
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    tasks = relationship('WorkflowTask', back_populates='workflow', cascade="all, delete-orphan", order_by="WorkflowTask.execution_order")
    contexts = relationship('WorkflowContext', back_populates='workflow', cascade="all, delete-orphan")
    approvals = relationship('ApprovalRequest', back_populates='workflow')

class WorkflowTask(Base):
    __tablename__ = 'workflow_tasks'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workflow_id = Column(String(36), ForeignKey('workflows.id'), nullable=False)
    task_key = Column(String(50), nullable=False) # e.g. "task_extract_invoice", "task_duplicate_check"
    agent_name = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    execution_order = Column(Integer, default=0)
    status = Column(String(50), default="PENDING") # PENDING, IN_PROGRESS, WAITING_APPROVAL, COMPLETED, FAILED, SKIPPED
    input_payload = Column(JSON, default=dict)
    output_payload = Column(JSON, default=dict)
    error_details = Column(JSON, nullable=True)
    required_approval_id = Column(String(36), nullable=True)
    retry_count = Column(Integer, default=0)
    max_retries = Column(Integer, default=3)
    created_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    workflow = relationship('Workflow', back_populates='tasks')
    dependencies = relationship('WorkflowDependency', foreign_keys='WorkflowDependency.task_id', back_populates='task')

class WorkflowDependency(Base):
    __tablename__ = 'workflow_dependencies'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    task_id = Column(String(36), ForeignKey('workflow_tasks.id'), nullable=False)
    depends_on_task_id = Column(String(36), ForeignKey('workflow_tasks.id'), nullable=False)

    task = relationship('WorkflowTask', foreign_keys=[task_id], back_populates='dependencies')

class WorkflowContext(Base):
    __tablename__ = 'workflow_context'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workflow_id = Column(String(36), ForeignKey('workflows.id'), nullable=False)
    key = Column(String(100), nullable=False)
    value = Column(JSON, nullable=False)
    version = Column(Integer, default=1)
    written_by_agent = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    workflow = relationship('Workflow', back_populates='contexts')

