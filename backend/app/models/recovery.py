import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, Text, JSON
from app.core.database import Base

class RecoveryAttempt(Base):
    __tablename__ = 'recovery_attempts'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workflow_id = Column(String(36), nullable=False)
    task_id = Column(String(36), nullable=False)
    agent_id = Column(String(100), nullable=False)
    error_type = Column(String(100), nullable=False) # TIMEOUT, NETWORK_ERROR, VALIDATION_ERROR, PERMISSION_ERROR
    error_message = Column(Text, nullable=False)
    attempt_number = Column(Integer, default=1)
    max_attempts = Column(Integer, default=3)
    strategy = Column(String(100), nullable=False) # EXPONENTIAL_BACKOFF, IDEMPOTENT_RESUMPTION, FALLBACK_AGENT, ESCALATE_HUMAN
    status = Column(String(50), default="IN_PROGRESS") # RECOVERED, FAILED_ESCALATED, RETRYING
    checkpoint_state = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=datetime.utcnow)

