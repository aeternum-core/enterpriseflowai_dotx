from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.agent import Agent, AgentExecution
from app.services.agent_registry import agent_registry

router = APIRouter(prefix="/agents", tags=["Agents"])

DOMAIN_TO_WF_MAP = {
    "onboarding": "EMPLOYEE_ONBOARDING",
    "invoice": "INVOICE_PROCESSING",
    "customer": "CUSTOMER_REQUEST_RESOLUTION",
    "procurement": "PROCUREMENT_VENDOR_ONBOARDING",
    "it_incident": "IT_INCIDENT_ACCESS_GOVERNANCE",
    "general": "GLOBAL"
}

@router.get("")
def list_agents(db: Session = Depends(get_db)):
    agents = db.query(Agent).all()
    if not agents:
        agents_data = agent_registry.list_agents()
        return [
            {
                **a,
                "roleDescription": a.get("description", ""),
                "capabilities": a.get("allowed_tools", ["Execution", "Analysis"]),
                "workflowType": DOMAIN_TO_WF_MAP.get(a.get("domain", "general"), "GLOBAL")
            }
            for a in agents_data
        ]

    return [
        {
            "id": a.id,
            "key": a.key,
            "name": a.name,
            "domain": a.domain,
            "description": a.description,
            "roleDescription": a.description,
            "capabilities": a.allowed_tools if isinstance(a.allowed_tools, list) else ["Task Orchestration", "Policy Evaluation"],
            "workflowType": DOMAIN_TO_WF_MAP.get(a.domain, "GLOBAL"),
            "system_instructions": a.system_instructions,
            "allowed_tools": a.allowed_tools,
            "permission_scope": a.permission_scope,
            "status": a.status or "ACTIVE",
            "execution_count": a.execution_count or 0,
            "success_rate": a.success_rate or 99.4
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

