import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, Text, JSON
from app.core.database import Base

class AuditEvent(Base):
    __tablename__ = 'audit_events'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sequence_number = Column(Integer, unique=True, index=True)
    workflow_id = Column(String(36), nullable=True, index=True)
    task_id = Column(String(36), nullable=True)
    actor_type = Column(String(50), nullable=False) # AGENT, HUMAN_USER, SYSTEM_ORCHESTRATOR
    actor_id = Column(String(100), nullable=False)
    actor_name = Column(String(150), nullable=False)
    event_type = Column(String(100), nullable=False) # WORKFLOW_CREATED, TASK_DELEGATED, TOOL_EXECUTED, APPROVAL_REQUESTED, APPROVAL_DECIDED, RECOVERY_TRIGGERED, etc.
    action_description = Column(Text, nullable=False)
    payload_reference = Column(JSON, default=dict)
    execution_result = Column(String(50), default="SUCCESS") # SUCCESS, FAILURE, BLOCKED, PAUSED
    approval_info = Column(JSON, nullable=True)
    previous_hash = Column(String(64), nullable=False)
    current_hash = Column(String(64), nullable=False, unique=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

class AuditCheckpoint(Base):
    __tablename__ = 'audit_checkpoints'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    checkpoint_index = Column(Integer, unique=True)
    up_to_sequence_number = Column(Integer, nullable=False)
    root_hash = Column(String(64), nullable=False)
    signed_by = Column(String(100), default="EnterpriseFlow-Authority-Key-01")
    timestamp = Column(DateTime, default=datetime.utcnow)

