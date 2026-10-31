import uuid
import json
from datetime import datetime
from typing import Dict, Any, Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.workflow import Workflow, WorkflowTask
from app.models.approval import ApprovalRequest
from app.models.agent import Agent
from app.services.workflow_engine import workflow_engine
from app.services.seed_data import seed_database
from app.services.audit_service import audit_service
from app.recovery.chaos_engine import chaos_engine
from app.api.auth import broadcast_event

router = APIRouter(tags=["Demo & Simulation"])

class TriggerScenarioRequest(BaseModel):
    scenarioId: str

class SimulateFailureRequest(BaseModel):
    taskId: Optional[str] = None

# In-memory document storage for demo
uploaded_documents: List[Dict[str, Any]] = [
    {
        "id": "doc_sample_passport",
        "name": "Sarah_Jenkins_Passport_Redacted.pdf",
        "fileType": "application/pdf",
        "sizeBytes": 248920,
        "uploadedAt": datetime.utcnow().isoformat(),
        "status": "VERIFIED_VALID"
    },
    {
        "id": "doc_sample_invoice",
        "name": "Datadog_Q4_Telemetry_INV8941.pdf",
        "fileType": "application/pdf",
        "sizeBytes": 182400,
        "uploadedAt": datetime.utcnow().isoformat(),
        "status": "PO_MATCH_CONFIRMED"
    }
]

@router.get("/planner/stats")
def get_planner_stats(db: Session = Depends(get_db)):
    total_wf = db.query(Workflow).count()
    active_wf = db.query(Workflow).filter(
        Workflow.status.in_(["RUNNING", "PLANNING", "IN_PROGRESS", "WAITING_APPROVAL"])
    ).count()
    pending_appr = db.query(ApprovalRequest).filter(ApprovalRequest.status == "PENDING").count()
    completed_wf = db.query(Workflow).filter(Workflow.status == "COMPLETED").count()
    failed_wf = db.query(Workflow).filter(Workflow.status.in_(["FAILED", "REQUIRES_ATTENTION"])).count()
    total_agents = db.query(Agent).count() or 5

    return {
        "totalWorkflows": total_wf,
        "activeWorkflows": active_wf,
        "pendingApprovals": pending_appr,
        "completedWorkflows": completed_wf,
        "failedWorkflows": failed_wf,
        "totalAgents": total_agents,
        "plannerHealth": "OPTIMAL",
        "avgTaskCompletionMs": 340
    }

@router.post("/workflows/{workflow_id}/simulate-failure")
async def simulate_workflow_failure(
    workflow_id: str,
    payload: SimulateFailureRequest,
    db: Session = Depends(get_db)
):
    wf = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")

    target_task = None
    if payload.taskId:
        target_task = db.query(WorkflowTask).filter(WorkflowTask.id == payload.taskId).first()
    if not target_task and wf.tasks:
        target_task = wf.tasks[0]

    if target_task:
        target_task.status = "FAILED"
        target_task.error_details = {
            "error": "Simulated Hardware Timeout / Third-party Vendor API Rate-Limit 429",
            "injected_at": datetime.utcnow().isoformat(),
            "recovery_strategy": "EXPONENTIAL_BACKOFF_WITH_JITTER"
        }
    
    wf.status = "REQUIRES_ATTENTION"
    db.commit()

    # Log audit event
    audit_service.log_event(
        db=db,
        workflow_id=wf.id,
        task_id=target_task.id if target_task else None,
        actor_type="CHAOS_ENGINE",
        actor_id="chaos_injector",
        actor_name="Chaos Testing Engine",
        event_type="CHAOS_FAULT_INJECTED",
        action_description=f"Injected 429 Rate-Limit fault on task '{target_task.title if target_task else 'Unknown'}'. Engaging self-healing recovery.",
        payload_reference={"fault_type": "HTTP_429", "task_id": target_task.id if target_task else None},
        execution_result="RECOVERABLE_FAULT"
    )

    await broadcast_event("demo_failure_simulated", {
        "workflowId": wf.id,
        "taskId": target_task.id if target_task else None,
        "message": "Fault Injected: Central Planner engaged self-healing protocol!"
    })

    return {
        "success": True,
        "message": "Simulated failure injected on agent. Central Planner evaluating alternative routing.",
        "workflowId": wf.id,
        "taskId": target_task.id if target_task else None
    }

@router.post("/demo/trigger-scenario")
async def trigger_demo_scenario(payload: TriggerScenarioRequest, db: Session = Depends(get_db)):
    sc_id = payload.scenarioId

    if sc_id == "onboarding_executive":
        prompt = "Onboard executive hire Michael Chang as VP of Engineering in Global Engineering with sensitive AWS Production Root Access."
        req_id = "user_elena_vance"
    elif sc_id == "large_invoice_approval":
        prompt = "Process high-value invoice INV-2026-4912 from Equinix Global Fiber Network for $48,200.00 datacenter transit with PO-77192-DATA."
        req_id = "user_sarah_lin"
    elif sc_id == "sev1_cloud_incident":
        prompt = "Resolve Sev-1 Primary CloudSQL Database Lock Contention Outage INC-2026-9901 with privileged ClusterAdmin elevation."
        req_id = "user_alex_rivera"
    elif sc_id in ("customer_sla_escalation", "customer_sla_refund", "customer", "customer_resolution"):
        prompt = "Resolve customer escalation for Quantum Health Systems with webhook 504 gateway timeout and approve exception credit refund of $1,250.00."
        req_id = "user_marcus_brody"
    elif sc_id in ("server_cluster_procurement", "procurement_hardware_cluster"):
        prompt = "Onboard enterprise hardware vendor Quantum Photonics Corp and disburse deposit payment of $78,500.00 for optical switch components with bank jurisdiction KY Cayman Islands."
        req_id = "user_marcus_brody"
    else:
        prompt = f"Run standard enterprise workflow scenario {sc_id}."
        req_id = "user_david_chen"

    wf = workflow_engine.start_workflow(
        db=db,
        prompt=prompt,
        requester_id=req_id
    )

    tasks_formatted = [
        {
            "id": t.id,
            "name": t.title,
            "title": t.title,
            "status": t.status,
            "agent_name": t.agent_name,
            "assignedAgentName": t.agent_name,
            "order": t.execution_order
        }
        for t in wf.tasks
    ]

    wf_dict = {
        "id": wf.id,
        "workflow_id": wf.id,
        "title": wf.title,
        "name": wf.title,
        "domain": wf.domain,
        "status": wf.status,
        "priority": wf.priority,
        "risk_level": wf.risk_level,
        "tasks": tasks_formatted,
        "createdAt": wf.created_at.isoformat() if wf.created_at else datetime.utcnow().isoformat()
    }

    await broadcast_event("workflow_created", wf_dict)

    return {
        "success": True,
        "workflow": wf_dict
    }

@router.post("/demo/reset")
async def reset_demo_database(db: Session = Depends(get_db)):
    # Clear and re-seed
    seed_database(db)
    await broadcast_event("database_reset", {"message": "Database reset to initial demo state."})
    return {
        "success": True,
        "message": "Database reset to initial demo state with verified enterprise data."
    }

@router.get("/documents")
def list_documents():
    return uploaded_documents

@router.post("/documents/upload")
async def upload_document(file: UploadFile = File(...)):
    doc_id = f"doc_{uuid.uuid4().hex[:8]}"
    content = await file.read()
    new_doc = {
        "id": doc_id,
        "name": file.filename or "uploaded_document.pdf",
        "fileType": file.content_type or "application/pdf",
        "sizeBytes": len(content),
        "uploadedAt": datetime.utcnow().isoformat(),
        "status": "PARSED_READY"
    }
    uploaded_documents.append(new_doc)
    return new_doc

