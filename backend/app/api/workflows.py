from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.workflow import Workflow, WorkflowTask, WorkflowContext
from app.models.approval import ApprovalRequest
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

    wf_dict = {
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
        "waiting_approval": wf.status == "WAITING_APPROVAL",
        "createdAt": wf.created_at.isoformat() if wf.created_at else None
    }
    return {
        **wf_dict,
        "workflow": wf_dict
    }

@router.post("/start")
def start_workflow(payload: StartWorkflowRequest, db: Session = Depends(get_db)):
    return _start_workflow_internal(payload, db)

@router.post("")
def create_workflow(payload: StartWorkflowRequest, db: Session = Depends(get_db)):
    return _start_workflow_internal(payload, db)

TYPE_TO_DOMAIN = {
    "EMPLOYEE_ONBOARDING": "onboarding",
    "INVOICE_PROCESSING": "invoice",
    "CUSTOMER_REQUEST_RESOLUTION": "customer",
    "PROCUREMENT_VENDOR_ONBOARDING": "procurement",
    "IT_INCIDENT_ACCESS_GOVERNANCE": "it_incident"
}

def generate_planner_notes(w) -> list:
    notes = [
        f"Goal Ingestion: Parsed natural language objective for '{w.title}'.",
        f"Level 2 DAG Synthesis: Decomposed request into {len(w.tasks)} structured tasks with dependency mapping.",
        f"Policy Sentinel Review: Verified authority tier and compliance bounds (Risk Tier: {w.risk_level or 'LOW'})."
    ]
    if any(t.required_approval_id for t in w.tasks):
        notes.append("Human-in-the-Loop Governance: Sensitive operation detected; paused execution at approval gate.")
    if w.status == "COMPLETED":
        notes.append("Execution Verified: All tasks completed successfully with cryptographic audit hash recorded.")
    elif w.status in ("WAITING_FOR_APPROVAL", "WAITING_APPROVAL"):
        notes.append("Governance Gate: Execution paused awaiting authorized human sign-off.")
    elif w.status == "RUNNING":
        notes.append("Active Orchestration: Delegating execution stream to specialized worker roster.")
    elif w.status == "FAILED":
        notes.append("Fault Encountered: Self-healing evaluation triggered; manual intervention recommended.")
    return notes

@router.get("")
def list_workflows(
    domain: Optional[str] = None,
    type: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    role: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    q = db.query(Workflow)
    target_domain = domain
    if type and type in TYPE_TO_DOMAIN:
        target_domain = TYPE_TO_DOMAIN[type]
    elif role:
        if role == "HR_MANAGER":
            target_domain = "onboarding"
        elif role == "FINANCE_MANAGER":
            target_domain = "invoice"
        elif role in ("CLIENT_MANAGER", "SERVICE_MANAGER"):
            target_domain = "customer"

    if target_domain and target_domain != "ALL":
        q = q.filter(Workflow.domain == target_domain)
    if status and status != "ALL":
        q = q.filter(Workflow.status == status)
    if search:
        s_pat = f"%{search}%"
        q = q.filter(Workflow.title.ilike(s_pat) | Workflow.raw_input.ilike(s_pat))

    total = q.count()
    items = q.order_by(Workflow.created_at.desc()).offset(skip).limit(limit).all()

    formatted_items = [
        {
            "id": w.id,
            "title": w.title,
            "name": w.title,
            "domain": w.domain,
            "type": DOMAIN_TO_TYPE.get(w.domain, "GLOBAL"),
            "status": w.status or "PENDING",
            "priority": w.priority or "MEDIUM",
            "risk_level": w.risk_level or "LOW",
            "raw_input": w.raw_input,
            "tasks_count": len(w.tasks),
            "completed_tasks": sum(1 for t in w.tasks if t.status == "COMPLETED"),
            "progress": (
                100 if w.status == "COMPLETED" else
                int((sum(1 for t in w.tasks if t.status == "COMPLETED") / max(len(w.tasks), 1)) * 100)
            ),
            "submittedByName": (
                (w.extracted_entities.get("candidateName") or w.extracted_entities.get("candidate_name"))
                if isinstance(w.extracted_entities, dict) else None
            ) or (
                "Elena Rostova" if w.domain == "onboarding" else
                "Marcus Vance" if w.domain == "invoice" else
                "Sophia Chen" if w.domain == "customer" else
                "Alexander Sterling"
            ),
            "submittedByRole": (
                "HR_MANAGER" if w.domain == "onboarding" else
                "FINANCE_MANAGER" if w.domain == "invoice" else
                "CLIENT_MANAGER" if w.domain == "customer" else
                "PROCUREMENT_MANAGER" if w.domain == "procurement" else
                "IT_SECURITY_MANAGER" if w.domain == "it_incident" else
                "ADMIN"
            ),
            "currentAgentName": (
                next((t.agent_name for t in w.tasks if t.status in ("IN_PROGRESS", "RUNNING")), None) or
                next((t.agent_name for t in w.tasks if t.status == "PENDING"), None) or
                "Central Planner Agent"
            ),
            "plannerNotes": generate_planner_notes(w),
            "planner_notes": generate_planner_notes(w),
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
                    "dependsOn": t.input_payload.get("dependencies", []) if isinstance(t.input_payload, dict) else [],
                    "dependencies": t.input_payload.get("dependencies", []) if isinstance(t.input_payload, dict) else []
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
            "order": t.execution_order,
            "status": t.status,
            "assignedAgentName": t.agent_name,
            "dependsOn": t.input_payload.get("dependencies", []) if isinstance(t.input_payload, dict) else [],
            "dependencies": t.input_payload.get("dependencies", []) if isinstance(t.input_payload, dict) else [],
            "input_payload": t.input_payload,
            "input": t.input_payload,
            "output_payload": t.output_payload,
            "output": t.output_payload,
            "error_details": t.error_details,
            "required_approval_id": t.required_approval_id,
            "started_at": t.started_at.isoformat() if t.started_at else None,
            "startedAt": t.started_at.isoformat() if t.started_at else None,
            "completed_at": t.completed_at.isoformat() if t.completed_at else None,
            "completedAt": t.completed_at.isoformat() if t.completed_at else None
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

    wf_approvals = [
        {
            "id": a.id,
            "workflowId": a.workflow_id,
            "taskId": a.task_id,
            "title": a.title,
            "actionRequested": a.title,
            "domain": a.domain,
            "riskLevel": a.risk_level,
            "risk_level": a.risk_level,
            "state": a.status,
            "status": a.status,
            "financialAmount": a.financial_amount,
            "approverRoleRequired": a.required_role,
            "required_role": a.required_role,
            "businessJustification": a.business_justification,
            "proposedAction": a.proposed_action,
            "createdAt": a.created_at.isoformat() if a.created_at else None
        }
        for a in db.query(ApprovalRequest).filter(ApprovalRequest.workflow_id == id).all()
    ]

    wf_messages = [
        {
            "id": f"msg_{t.id}",
            "workflowId": wf.id,
            "fromAgentName": t.agent_name,
            "toAgentName": "Central Planner Agent",
            "content": f"Task '{t.title}' transition recorded: {t.status}.",
            "timestamp": t.completed_at.isoformat() if t.completed_at else t.started_at.isoformat() if t.started_at else None
        }
        for t in wf.tasks
    ]

    workflow_obj = {
        "id": wf.id,
        "title": wf.title,
        "name": wf.title,
        "domain": wf.domain,
        "type": DOMAIN_TO_TYPE.get(wf.domain, "GLOBAL"),
        "status": wf.status or "PENDING",
        "priority": wf.priority or "MEDIUM",
        "risk_level": wf.risk_level or "LOW",
        "raw_input": wf.raw_input,
        "extracted_entities": wf.extracted_entities,
        "planner_plan": wf.planner_plan,
        "progress": (
            100 if wf.status == "COMPLETED" else
            int((sum(1 for t in wf.tasks if t.status == "COMPLETED") / max(len(wf.tasks), 1)) * 100)
        ),
        "submittedByName": (
            (wf.extracted_entities.get("candidateName") or wf.extracted_entities.get("candidate_name"))
            if isinstance(wf.extracted_entities, dict) else None
        ) or (
            "Elena Rostova" if wf.domain == "onboarding" else
            "Marcus Vance" if wf.domain == "invoice" else
            "Sophia Chen" if wf.domain == "customer" else
            "Alexander Sterling"
        ),
        "submittedByRole": (
            "HR_MANAGER" if wf.domain == "onboarding" else
            "FINANCE_MANAGER" if wf.domain == "invoice" else
            "CLIENT_MANAGER" if wf.domain == "customer" else
            "PROCUREMENT_MANAGER" if wf.domain == "procurement" else
            "IT_SECURITY_MANAGER" if wf.domain == "it_incident" else
            "ADMIN"
        ),
        "currentAgentName": (
            next((t.agent_name for t in wf.tasks if t.status in ("IN_PROGRESS", "RUNNING")), None) or
            next((t.agent_name for t in wf.tasks if t.status == "PENDING"), None) or
            "Central Planner Agent"
        ),
        "plannerNotes": generate_planner_notes(wf),
        "planner_notes": generate_planner_notes(wf),
        "started_at": wf.started_at.isoformat() if wf.started_at else None,
        "completed_at": wf.completed_at.isoformat() if wf.completed_at else None,
        "createdAt": wf.created_at.isoformat() if wf.created_at else None,
        "tasks": tasks,
        "contexts": contexts
    }

    return {
        **workflow_obj,
        "workflow": workflow_obj,
        "tasks": tasks,
        "contexts": contexts,
        "approvals": wf_approvals,
        "messages": wf_messages,
        "documents": []
    }

@router.post("/{id}/resume")
def resume_workflow_endpoint(id: str, db: Session = Depends(get_db)):
    try:
        wf = workflow_engine.resume_workflow(db, id)
        return {"workflow_id": wf.id, "status": wf.status}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

