import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, Float, Text, JSON, ForeignKey
from app.core.database import Base

class Agent(Base):
    __tablename__ = 'agents'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    key = Column(String(100), unique=True, nullable=False) # e.g. "finance_payment_agent", "doc_verification_agent"
    name = Column(String(150), nullable=False)
    domain = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)
    system_instructions = Column(Text, nullable=False)
    allowed_tools = Column(JSON, default=list) # List of tool keys
    input_schema = Column(JSON, default=dict)
    output_schema = Column(JSON, default=dict)
    permission_scope = Column(String(50), default="READ_ONLY") # READ_ONLY, EXECUTE_LOW_RISK, EXECUTE_HIGH_RISK_WITH_APPROVAL
    status = Column(String(30), default="ACTIVE") # ACTIVE, PAUSED, DEGRADED
    execution_count = Column(Integer, default=0)
    success_rate = Column(Float, default=100.0)
    created_at = Column(DateTime, default=datetime.utcnow)

class AgentExecution(Base):
    __tablename__ = 'agent_executions'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workflow_id = Column(String(36), ForeignKey('workflows.id'), nullable=False)
    task_id = Column(String(36), ForeignKey('workflow_tasks.id'), nullable=False)
    agent_id = Column(String(36), ForeignKey('agents.id'), nullable=False)
    agent_key = Column(String(100), nullable=False)
    input_data = Column(JSON, default=dict)
    output_data = Column(JSON, default=dict)
    tools_invoked = Column(JSON, default=list)
    execution_duration_ms = Column(Integer, default=0)
    status = Column(String(30), default="SUCCESS") # SUCCESS, FAILED, RETRIED, PAUSED_FOR_APPROVAL
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

