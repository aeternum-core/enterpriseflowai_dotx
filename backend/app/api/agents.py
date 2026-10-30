from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.agent import Agent, AgentExecution
from app.services.agent_registry import agent_registry

router = APIRouter(prefix="/agents", tags=["Agents"])

@router.get("")
def list_agents(db: Session = Depends(get_db)):
    agents = db.query(Agent).all()
    if not agents:
        # Fallback to in-memory registry
        return agent_registry.list_agents()

    return [
        {
            "id": a.id,
            "key": a.key,
            "name": a.name,
            "domain": a.domain,
            "description": a.description,
            "system_instructions": a.system_instructions,
            "allowed_tools": a.allowed_tools,
            "permission_scope": a.permission_scope,
            "status": a.status,
            "execution_count": a.execution_count,
            "success_rate": a.success_rate
        }
        for a in agents
    ]

@router.get("/executions")
def list_executions(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    execs = db.query(AgentExecution).order_by(AgentExecution.created_at.desc()).offset(skip).limit(limit).all()
    return [
        {
            "id": e.id,
            "workflow_id": e.workflow_id,
            "task_id": e.task_id,
            "agent_key": e.agent_key,
            "status": e.status,
            "duration_ms": e.execution_duration_ms,
            "tools_invoked": e.tools_invoked,
            "created_at": e.created_at.isoformat() if e.created_at else None
        }
        for e in execs
    ]

