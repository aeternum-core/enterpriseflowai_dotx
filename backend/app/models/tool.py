import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, Boolean, Text, JSON, ForeignKey
from app.core.database import Base

class ToolRegistry(Base):
    __tablename__ = 'tool_registry'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    key = Column(String(100), unique=True, nullable=False) # e.g. "sap_execute_disbursement", "okta_grant_admin_access"
    name = Column(String(150), nullable=False)
    category = Column(String(50), nullable=False) # HR, Finance, IT_IAM, ITSM, Procurement, Support, Notification
    description = Column(Text, nullable=False)
    required_permissions = Column(JSON, default=list)
    risk_level = Column(String(20), default="LOW") # LOW, MEDIUM, HIGH, CRITICAL
    requires_approval = Column(Boolean, default=False)
    is_simulated = Column(Boolean, default=True) # Clearly identifies simulated integrations
    mock_service_name = Column(String(100), nullable=False) # e.g. "Mock SAP S/4HANA Finance API"
    idempotent = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ToolExecutionLog(Base):
    __tablename__ = 'tool_execution_logs'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tool_key = Column(String(100), nullable=False)
    agent_id = Column(String(36), nullable=False)
    workflow_id = Column(String(36), nullable=False)
    task_id = Column(String(36), nullable=False)
    idempotency_key = Column(String(100), nullable=True, index=True)
    request_payload = Column(JSON, default=dict)
    response_payload = Column(JSON, default=dict)
    status = Column(String(30), default="SUCCESS") # SUCCESS, FAILED, BLOCKED_UNAUTHORIZED, BLOCKED_UNAPPROVED
    execution_time_ms = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

