from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.recovery.chaos_engine import chaos_engine

router = APIRouter(prefix="/chaos", tags=["Chaos Testing"])

class ChaosInjectRequest(BaseModel):
    fault_type: str
    target_service: Optional[str] = "all"
    target_worker: Optional[str] = "all"
    retry_after: Optional[float] = 0.5

@router.get("/config")
def get_chaos_config():
    return chaos_engine.get_config()

@router.post("/inject")
def inject_fault(req: ChaosInjectRequest):
    return chaos_engine.set_fault(
        fault_type=req.fault_type,
        target_service=req.target_service or "all",
        target_worker=req.target_worker or "all",
        retry_after=req.retry_after or 0.5
    )

@router.post("/reset")
def reset_faults():
    return chaos_engine.reset_faults()

@router.get("/history")
def get_chaos_history():
    return [
        {
            "id": h.id,
            "timestamp": h.timestamp.isoformat(),
            "fault_type": h.fault_type,
            "target_service": h.target_service,
            "target_worker": h.target_worker,
            "outcome": h.outcome,
            "remedy": h.remedy
        }
        for h in chaos_engine.history
    ]
