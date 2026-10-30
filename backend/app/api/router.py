from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.audit import AuditEvent
from app.api.approvals import router as approvals_router
from app.api.workflows import router as workflows_router
from app.api.audit import router as audit_router
from app.api.agents import router as agents_router
from app.api.tools import router as tools_router
from app.api.policies import router as policies_router
from app.api.users import router as users_router
from app.api.chaos import router as chaos_router
from app.api.observability import router as observability_router
from app.api.auth import router as auth_router
from app.api.demo import router as demo_router

api_router = APIRouter()
api_router.include_router(approvals_router)
api_router.include_router(workflows_router)
api_router.include_router(audit_router)
api_router.include_router(agents_router)
api_router.include_router(tools_router)
api_router.include_router(policies_router)
api_router.include_router(users_router)
api_router.include_router(chaos_router)
api_router.include_router(observability_router)
api_router.include_router(auth_router)
api_router.include_router(demo_router)

@api_router.get("/audit-logs")
def get_audit_logs(db: Session = Depends(get_db)):
    events = db.query(AuditEvent).order_by(AuditEvent.sequence_number.desc()).limit(100).all()
    return [
        {
            "id": e.id,
            "sequenceNumber": e.sequence_number,
            "workflowId": e.workflow_id,
            "actorId": e.actor_id,
            "actorType": e.actor_type,
            "actorName": e.actor_name,
            "actorRole": "System / Agent",
            "eventType": e.event_type,
            "description": e.action_description,
            "status": "SUCCESS" if e.execution_result == "SUCCESS" else "FAILURE",
            "currentHash": e.current_hash,
            "previousHash": e.previous_hash,
            "timestamp": e.timestamp.isoformat() if e.timestamp else None,
            "createdAt": e.timestamp.isoformat() if e.timestamp else None
        }
        for e in events
    ]

@api_router.get("/interaction-logs")
def get_interaction_logs(db: Session = Depends(get_db)):
    events = db.query(AuditEvent).filter(AuditEvent.actor_type.in_(["HUMAN", "USER", "APPROVER"])).order_by(AuditEvent.sequence_number.desc()).limit(100).all()
    return [
        {
            "id": e.id,
            "userId": e.actor_id,
            "userName": e.actor_name,
            "userRole": "Authorized Officer",
            "action": e.event_type,
            "workflowId": e.workflow_id,
            "details": {"description": e.action_description, "result": e.execution_result},
            "timestamp": e.timestamp.isoformat() if e.timestamp else None,
            "createdAt": e.timestamp.isoformat() if e.timestamp else None
        }
        for e in events
    ]


