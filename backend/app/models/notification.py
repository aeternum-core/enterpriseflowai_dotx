import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, Text
from app.core.database import Base

class Notification(Base):
    __tablename__ = 'notifications'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=True) # None = broadcast to all approvers
    role_target = Column(String(50), nullable=True) # e.g. "Finance Director"
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="INFO") # APPROVAL_REQUIRED, WORKFLOW_COMPLETED, RECOVERY_ALERT, SYSTEM_WARNING
    link = Column(String(255), nullable=True) # e.g. "/approvals?id=..."
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

