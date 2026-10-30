from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.workflow import Workflow, WorkflowTask, WorkflowContext
from app.services.workflow_engine import workflow_engine
from app.api.auth import broadcast_event

router = APIRouter(prefix="/workflows", tags=["Workflows"])

DOMAIN_TO_TYPE = {
    "onboarding": "EMPLOYEE_ONBOARDING",
    "invoice": "INVOICE_PROCESSING",
    "customer": "CUSTOMER_REQUEST_RESOLUTION",
    "procurement": "PROCUREMENT_VENDOR_ONBOARDING",
    "it_incident": "IT_INCIDENT_ACCESS_GOVERNANCE",
}

class StartWorkflowRequest(BaseModel):
    prompt: Optional[str] = None
    title: Optional[str] = None
    type: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    requester_id: Optional[str] = "user_david_chen"
    submittedByUserId: Optional[str] = None
    submittedByName: Optional[str] = None
    submittedByRole: Optional[str] = None

def _start_workflow_internal(payload: StartWorkflowRequest, db: Session):
    raw_prompt = payload.prompt or ""
    if not raw_prompt:
        if payload.title:
            raw_prompt = payload.title
            if payload.metadata:
                raw_prompt += f" Details: {payload.metadata}"
        elif payload.type:
            raw_prompt = f"Run standard enterprise workflow for {payload.type}."
        else:
            raw_prompt = "Onboard new hire Daniel Craig as Senior Infrastructure Engineer in Cloud Infra."

    req_id = payload.requester_id or payload.submittedByUserId or "user_david_chen"

    wf = workflow_engine.start_workflow(
        db=db,
        prompt=raw_prompt,
        requester_id=req_id
    )

    return {
        "id": wf.id,
        "workflow_id": wf.id,
        "title": wf.title,
        "name": wf.title,
        "domain": wf.domain,
        "type": DOMAIN_TO_TYPE.get(wf.domain, "GLOBAL"),
        "status": wf.status,
        "priority": wf.priority,
        "risk_level": wf.risk_level,
        "task_count": len(wf.tasks),
        "waiting_approval": wf.status == "WAITING_APPROVAL"
    }

@router.post("/start")
def start_workflow(payload: StartWorkflowRequest, db: Session = Depends(get_db)):
    return _start_workflow_internal(payload, db)

@router.post("")
def create_workflow(payload: StartWorkflowRequest, db: Session = Depends(get_db)):
    return _start_workflow_internal(payload, db)

@router.get("")
def list_workflows(
    domain: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    q = db.query(Workflow)
    if domain and domain != "ALL":
        q = q.filter(Workflow.domain == domain)
    if status and status != "ALL":
        q = q.filter(Workflow.status == status)

    total = q.count()
    items = q.order_by(Workflow.created_at.desc()).offset(skip).limit(limit).all()

    formatted_items = [
        {
            "id": w.id,
            "title": w.title,
            "name": w.title,
            "domain": w.domain,
            "type": DOMAIN_TO_TYPE.get(w.domain, "GLOBAL"),
            "status": w.status,
            "priority": w.priority,
            "risk_level": w.risk_level,
            "raw_input": w.raw_input,
            "tasks_count": len(w.tasks),
            "completed_tasks": sum(1 for t in w.tasks if t.status == "COMPLETED"),
            "tasks": [
                {
                    "id": t.id,
                    "task_key": t.task_key,
                    "name": t.title,
                    "title": t.title,
                    "status": t.status,
                    "agent_name": t.agent_name,
                    "assignedAgentName": t.agent_name,
                    "execution_order": t.execution_order,
                    "order": t.execution_order,
                    "dependsOn": t.input_payload.get("dependencies", []) if isinstance(t.input_payload, dict) else []
                }
                for t in w.tasks
            ],
            "started_at": w.started_at.isoformat() if w.started_at else None,
            "completed_at": w.completed_at.isoformat() if w.completed_at else None,
            "created_at": w.created_at.isoformat() if w.created_at else None,
            "createdAt": w.created_at.isoformat() if w.created_at else None
        }
        for w in items
    ]

    return {
        "total": total,
        "items": formatted_items
    }

@router.get("/{id}")
def get_workflow_detail(id: str, db: Session = Depends(get_db)):
    wf = db.query(Workflow).filter(Workflow.id == id).first()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")

    tasks = [
        {
            "id": t.id,
            "task_key": t.task_key,
            "agent_name": t.agent_name,
            "title": t.title,
            "description": t.description,
            "execution_order": t.execution_order,
            "status": t.status,
            "input_payload": t.input_payload,
            "output_payload": t.output_payload,
            "error_details": t.error_details,
            "required_approval_id": t.required_approval_id,
            "started_at": t.started_at.isoformat() if t.started_at else None,
            "completed_at": t.completed_at.isoformat() if t.completed_at else None
        }
        for t in wf.tasks
    ]

    contexts = [
        {
            "key": c.key,
            "value": c.value,
            "written_by_agent": c.written_by_agent,
            "created_at": c.created_at.isoformat()
        }
        for c in wf.contexts
    ]

    return {
        "id": wf.id,
        "title": wf.title,
        "domain": wf.domain,
        "status": wf.status,
        "priority": wf.priority,
        "risk_level": wf.risk_level,
        "raw_input": wf.raw_input,
        "extracted_entities": wf.extracted_entities,
        "planner_plan": wf.planner_plan,
        "started_at": wf.started_at.isoformat() if wf.started_at else None,
        "completed_at": wf.completed_at.isoformat() if wf.completed_at else None,
        "tasks": tasks,
        "contexts": contexts
    }

@router.post("/{id}/resume")
def resume_workflow_endpoint(id: str, db: Session = Depends(get_db)):
    try:
        wf = workflow_engine.resume_workflow(db, id)
        return {"workflow_id": wf.id, "status": wf.status}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

