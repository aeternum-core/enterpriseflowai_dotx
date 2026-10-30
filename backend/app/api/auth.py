import uuid
import json
import asyncio
from datetime import datetime
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, Header, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.approval import ApprovalRequest

router = APIRouter(tags=["Authentication & Events"])

# In-memory sessions store
active_sessions: Dict[str, Dict[str, Any]] = {}
event_listeners: List[asyncio.Queue] = []
read_notifications: set = set()

class LoginRequest(BaseModel):
    email: str
    password: str

class QuickLoginRequest(BaseModel):
    role: str

class SwitchRoleRequest(BaseModel):
    role: str

ROLE_USER_DEFAULTS = {
    "ADMIN": {
        "id": "user_admin",
        "email": "admin@enterpriseflow.corp",
        "name": "Alex Vance (SuperAdmin)",
        "role": "ADMIN",
        "department": "Platform Engineering",
        "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
    },
    "HR_MANAGER": {
        "id": "user_elena_vance",
        "email": "elena.vance@enterpriseflow.corp",
        "name": "Elena Vance",
        "role": "HR_MANAGER",
        "department": "People Operations & HR",
        "avatarUrl": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150"
    },
    "FINANCE_MANAGER": {
        "id": "user_sarah_lin",
        "email": "sarah.lin@enterpriseflow.corp",
        "name": "Sarah Lin",
        "role": "FINANCE_MANAGER",
        "department": "Finance & Treasury",
        "avatarUrl": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"
    },
    "EMPLOYEE_MANAGER": {
        "id": "user_marcus_brody",
        "email": "marcus.brody@enterpriseflow.corp",
        "name": "Marcus Brody",
        "role": "EMPLOYEE_MANAGER",
        "department": "Global Procurement",
        "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
    },
    "SERVICE_MANAGER": {
        "id": "user_david_chen",
        "email": "david.chen@enterpriseflow.corp",
        "name": "David Chen",
        "role": "SERVICE_MANAGER",
        "department": "IT Operations & Cloud",
        "avatarUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
    },
    "CLIENT_MANAGER": {
        "id": "user_sophia_martinez",
        "email": "client.mgr@enterpriseflow.corp",
        "name": "Sophia Martinez",
        "role": "CLIENT_MANAGER",
        "department": "Strategic Enterprise Accounts",
        "avatarUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"
    }
}

def resolve_user_from_db_or_defaults(email: str, db: Session) -> Dict[str, Any]:
    db_user = db.query(User).filter(User.email.ilike(email)).first()
    if db_user:
        role_name = "ADMIN"
        if db_user.roles:
            r0 = db_user.roles[0].name.upper()
            if "FIN" in r0: role_name = "FINANCE_MANAGER"
            elif "HR" in r0: role_name = "HR_MANAGER"
            elif "PROC" in r0 or "EMP" in r0: role_name = "EMPLOYEE_MANAGER"
            elif "IT" in r0 or "SEC" in r0: role_name = "SERVICE_MANAGER"
        return {
            "id": db_user.id,
            "email": db_user.email,
            "name": db_user.full_name,
            "role": role_name,
            "department": db_user.department.name if db_user.department else "General Operations",
            "avatarUrl": db_user.avatar_url or "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"
        }

    # Match by email pattern
    low = email.lower()
    if "finance" in low: return ROLE_USER_DEFAULTS["FINANCE_MANAGER"]
    if "hr" in low: return ROLE_USER_DEFAULTS["HR_MANAGER"]
    if "employee" in low or "procure" in low: return ROLE_USER_DEFAULTS["EMPLOYEE_MANAGER"]
    if "service" in low or "it" in low: return ROLE_USER_DEFAULTS["SERVICE_MANAGER"]
    if "client" in low: return ROLE_USER_DEFAULTS["CLIENT_MANAGER"]
    return ROLE_USER_DEFAULTS["ADMIN"]


@router.post("/auth/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    if not payload.email:
        raise HTTPException(status_code=400, detail="Email is required")
    user_info = resolve_user_from_db_or_defaults(payload.email, db)
    token = f"tok_{uuid.uuid4().hex}"
    active_sessions[token] = user_info
    return {
        "token": token,
        "user": user_info
    }


@router.post("/auth/quick-login")
def quick_login(payload: QuickLoginRequest):
    role = payload.role.upper()
    user_info = ROLE_USER_DEFAULTS.get(role, ROLE_USER_DEFAULTS["ADMIN"])
    token = f"tok_{uuid.uuid4().hex}"
    active_sessions[token] = user_info
    return {
        "token": token,
        "user": user_info
    }


@router.get("/auth/session")
def get_session(authorization: Optional[str] = Header(None)):
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "").strip()
    elif authorization:
        token = authorization.strip()

    if token and token in active_sessions:
        return {"user": active_sessions[token]}
    
    # Return default admin user if session expired or demo mode
    default_user = ROLE_USER_DEFAULTS["ADMIN"]
    return {"user": default_user}


@router.post("/auth/switch-role")
def switch_role(payload: SwitchRoleRequest, authorization: Optional[str] = Header(None)):
    token = authorization.replace("Bearer ", "").strip() if authorization else None
    role = payload.role.upper()
    user_info = ROLE_USER_DEFAULTS.get(role, ROLE_USER_DEFAULTS["ADMIN"])
    if token:
        active_sessions[token] = user_info
    return {"user": user_info}


@router.post("/auth/logout")
def logout(authorization: Optional[str] = Header(None)):
    token = authorization.replace("Bearer ", "").strip() if authorization else None
    if token and token in active_sessions:
        del active_sessions[token]
    return {"success": True}


@router.get("/notifications")
def get_notifications(db: Session = Depends(get_db)):
    pending_approvals = db.query(ApprovalRequest).filter(ApprovalRequest.status == "PENDING").all()
    notifications = []
    for app in pending_approvals:
        notif_id = f"notif_{app.id}"
        notifications.append({
            "id": notif_id,
            "title": f"Approval Required: {app.title}",
            "message": f"Action requested by {app.requested_by_agent}: {app.risk_level} risk level.",
            "type": "APPROVAL",
            "read": notif_id in read_notifications,
            "createdAt": app.created_at.isoformat() if app.created_at else datetime.utcnow().isoformat(),
            "workflowId": app.workflow_id
        })
    # Milestone notification
    notifications.append({
        "id": "notif_system_ready",
        "title": "Autonomous Engine Ready",
        "message": "LangGraph multi-agent orchestrator with SHA-256 verifiable audit active.",
        "type": "INFO",
        "read": "notif_system_ready" in read_notifications,
        "createdAt": datetime.utcnow().isoformat(),
        "workflowId": None
    })
    return notifications


@router.post("/notifications/{notification_id}/read")
def mark_notification_read(notification_id: str):
    read_notifications.add(notification_id)
    return {"success": True}


async def broadcast_event(event_type: str, payload: Any):
    msg = json.dumps({"event": event_type, "payload": payload, "timestamp": datetime.utcnow().isoformat()})
    for queue in list(event_listeners):
        try:
            await queue.put(msg)
        except Exception:
            pass


@router.get("/events/live")
async def live_event_stream(request: Request):
    """Server-Sent Events (SSE) live stream for workflow orchestrator and layout alerts."""
    queue = asyncio.Queue()
    event_listeners.append(queue)

    async def event_generator():
        try:
            # Yield initial connection confirmation
            init_msg = json.dumps({
                "event": "connected",
                "payload": {"status": "LIVE_SSE_STREAMING_ACTIVE", "engine": "FastAPI + LangGraph"},
                "timestamp": datetime.utcnow().isoformat()
            })
            yield f"data: {init_msg}\n\n"

            while True:
                if await request.is_disconnected():
                    break
                try:
                    # Wait for next event with a 15-second heartbeat timeout
                    data = await asyncio.wait_for(queue.get(), timeout=15.0)
                    yield f"data: {data}\n\n"
                except asyncio.TimeoutError:
                    # Keep-alive heartbeat
                    heartbeat = json.dumps({
                        "event": "heartbeat",
                        "payload": {"status": "PULSE_NOMINAL"},
                        "timestamp": datetime.utcnow().isoformat()
                    })
                    yield f"data: {heartbeat}\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            if queue in event_listeners:
                event_listeners.remove(queue)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

