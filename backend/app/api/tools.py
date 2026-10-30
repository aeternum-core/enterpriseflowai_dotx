from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.tool import ToolRegistry, ToolExecutionLog

router = APIRouter(prefix="/tools", tags=["Tools"])

@router.get("")
def list_tools(db: Session = Depends(get_db)):
    tools = db.query(ToolRegistry).all()
    return [
        {
            "id": t.id,
            "key": t.key,
            "name": t.name,
            "category": t.category,
            "description": t.description,
            "risk_level": t.risk_level,
            "requires_approval": t.requires_approval,
            "is_simulated": t.is_simulated,
            "mock_service_name": t.mock_service_name,
            "idempotent": t.idempotent
        }
        for t in tools
    ]

@router.get("/logs")
def list_tool_logs(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    logs = db.query(ToolExecutionLog).order_by(ToolExecutionLog.created_at.desc()).offset(skip).limit(limit).all()
    return [
        {
            "id": l.id,
            "tool_key": l.tool_key,
            "agent_id": l.agent_id,
            "workflow_id": l.workflow_id,
            "task_id": l.task_id,
            "status": l.status,
            "execution_time_ms": l.execution_time_ms,
            "request_payload": l.request_payload,
            "response_payload": l.response_payload,
            "created_at": l.created_at.isoformat() if l.created_at else None
        }
        for l in logs
    ]

