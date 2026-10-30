from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.audit import AuditEvent
from app.services.audit_service import audit_service

router = APIRouter(prefix="/audit", tags=["Audit Trail"])

@router.get("/events")
def list_audit_events(
    workflow_id: Optional[str] = None,
    event_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    q = db.query(AuditEvent)
    if workflow_id:
        q = q.filter(AuditEvent.workflow_id == workflow_id)
    if event_type:
        q = q.filter(AuditEvent.event_type == event_type)

    total = q.count()
    events = q.order_by(AuditEvent.sequence_number.desc()).offset(skip).limit(limit).all()

    return {
        "total": total,
        "events": [
            {
                "id": e.id,
                "sequence_number": e.sequence_number,
                "workflow_id": e.workflow_id,
                "task_id": e.task_id,
                "actor_type": e.actor_type,
                "actor_id": e.actor_id,
                "actor_name": e.actor_name,
                "event_type": e.event_type,
                "action_description": e.action_description,
                "payload_reference": e.payload_reference,
                "execution_result": e.execution_result,
                "previous_hash": e.previous_hash,
                "current_hash": e.current_hash,
                "timestamp": e.timestamp.isoformat() if e.timestamp else None
            }
            for e in events
        ]
    }

@router.get("/verify")
def verify_hash_chain(db: Session = Depends(get_db)):
    """Cryptographically verifies every link in the append-only SHA-256 audit chain"""
    return audit_service.verify_chain_integrity(db)

@router.post("/tamper-test")
def simulate_tamper_event(sequence_number: int = 1, db: Session = Depends(get_db)):
    """
    Simulates malicious tampering: Modifies event data in the database
    WITHOUT updating the cryptographic SHA-256 signature to demonstrate
    tamper detection!
    """
    event = db.query(AuditEvent).filter(AuditEvent.sequence_number == sequence_number).first()
    if not event:
        raise HTTPException(status_code=404, detail=f"Audit event with sequence {sequence_number} not found")

    event.action_description = event.action_description + " [TAMPERED_BY_UNAUTHORIZED_ACTOR]"
    db.commit()

    return {
        "status": "TAMPER_SIMULATED",
        "message": f"Event #{sequence_number} action_description was altered without updating SHA-256 hash. Run verification to observe detection.",
        "tampered_sequence": sequence_number
    }

