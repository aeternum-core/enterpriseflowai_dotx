import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Float, Boolean, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class ApprovalPolicy(Base):
    __tablename__ = 'approval_policies'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(150), nullable=False)
    domain = Column(String(50), nullable=False) # invoice, it_incident, procurement, customer, onboarding
    operation_type = Column(String(100), nullable=False) # e.g. "payment_disbursement", "grant_root_access", "purchase_order_approval"
    risk_level = Column(String(20), default="HIGH") # LOW, MEDIUM, HIGH, CRITICAL
    min_financial_threshold = Column(Float, default=0.0) # e.g. payments > $5000 require VP, <= $5000 require Manager
    required_role = Column(String(50), nullable=False) # "Finance Director", "IT Security Admin", "Procurement Manager", "HR Director"
    requires_evidence = Column(Boolean, default=True)
    sla_hours = Column(Float, default=24.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ApprovalRequest(Base):
    __tablename__ = 'approval_requests'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workflow_id = Column(String(36), ForeignKey('workflows.id'), nullable=False)
    task_id = Column(String(36), ForeignKey('workflow_tasks.id'), nullable=True)
    title = Column(String(255), nullable=False)
    domain = Column(String(50), nullable=False)
    risk_level = Column(String(20), default="HIGH") # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String(30), default="PENDING") # PENDING, APPROVED, REJECTED, CHANGES_REQUESTED, EXPIRED
    priority = Column(String(20), default="MEDIUM") # LOW, MEDIUM, HIGH, URGENT

    # Request entities & actors
    requested_by_agent = Column(String(100), nullable=False)
    requesting_employee = Column(String(150), nullable=True) # Human requester if applicable
    department = Column(String(100), nullable=False)
    financial_amount = Column(Float, nullable=True)
    currency = Column(String(10), default="USD")

    # Business Details
    business_justification = Column(Text, nullable=False)
    proposed_action = Column(Text, nullable=False)
    proposed_payload = Column(JSON, default=dict) # The exact payload agent intends to execute
    approved_payload = Column(JSON, nullable=True) # Must match proposed_payload upon execution

    # AI Execution Information
    ai_summary = Column(Text, nullable=True)
    tools_invoked = Column(JSON, default=list)
    validation_results = Column(JSON, default=dict)
    risk_assessment = Column(Text, nullable=True)
    supporting_evidence = Column(JSON, default=dict)

    # Policy and routing
    required_role = Column(String(50), nullable=False)
    assigned_to_user_id = Column(String(36), nullable=True)
    due_date = Column(DateTime, nullable=True)

    # Resolution
    decided_by_user_id = Column(String(36), nullable=True)
    decided_by_name = Column(String(150), nullable=True)
    decided_at = Column(DateTime, nullable=True)
    decision_reason = Column(Text, nullable=True)
    feedback_notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    workflow = relationship('Workflow', back_populates='approvals')
    comments = relationship('ApprovalComment', back_populates='approval', cascade="all, delete-orphan", order_by="ApprovalComment.created_at")
    history = relationship('ApprovalHistory', back_populates='approval', cascade="all, delete-orphan", order_by="ApprovalHistory.created_at")

class ApprovalComment(Base):
    __tablename__ = 'approval_comments'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    approval_id = Column(String(36), ForeignKey('approval_requests.id'), nullable=False)
    author_name = Column(String(150), nullable=False)
    author_role = Column(String(100), nullable=False)
    comment_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    approval = relationship('ApprovalRequest', back_populates='comments')

class ApprovalHistory(Base):
    __tablename__ = 'approval_history'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    approval_id = Column(String(36), ForeignKey('approval_requests.id'), nullable=False)
    action = Column(String(50), nullable=False) # CREATED, ASSIGNED, APPROVED, REJECTED, CHANGES_REQUESTED, RESUMED
    actor_name = Column(String(150), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    approval = relationship('ApprovalRequest', back_populates='history')

