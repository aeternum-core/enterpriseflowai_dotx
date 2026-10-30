from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.approval import ApprovalPolicy

router = APIRouter(prefix="/policies", tags=["Policies"])

class PolicyCreate(BaseModel):
    name: str
    domain: str
    operation_type: str
    risk_level: str
    min_financial_threshold: float
    required_role: str
    sla_hours: float

@router.get("")
def list_policies(db: Session = Depends(get_db)):
    policies = db.query(ApprovalPolicy).all()
    return [
        {
            "id": p.id,
            "name": p.name,
            "domain": p.domain,
            "operation_type": p.operation_type,
            "risk_level": p.risk_level,
            "min_financial_threshold": p.min_financial_threshold,
            "required_role": p.required_role,
            "requires_evidence": p.requires_evidence,
            "sla_hours": p.sla_hours,
            "is_active": p.is_active
        }
        for p in policies
    ]

@router.post("")
def create_policy(payload: PolicyCreate, db: Session = Depends(get_db)):
    p = ApprovalPolicy(
        name=payload.name,
        domain=payload.domain,
        operation_type=payload.operation_type,
        risk_level=payload.risk_level,
        min_financial_threshold=payload.min_financial_threshold,
        required_role=payload.required_role,
        sla_hours=payload.sla_hours,
        is_active=True
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return {"status": "CREATED", "policy_id": p.id}

@router.put("/{id}/toggle")
def toggle_policy(id: str, db: Session = Depends(get_db)):
    p = db.query(ApprovalPolicy).filter(ApprovalPolicy.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Policy not found")
    p.is_active = not p.is_active
    db.commit()
    return {"status": "UPDATED", "policy_id": p.id, "is_active": p.is_active}

