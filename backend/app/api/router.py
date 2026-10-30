from fastapi import APIRouter
from app.api.approvals import router as approvals_router
from app.api.workflows import router as workflows_router
from app.api.audit import router as audit_router
from app.api.agents import router as agents_router
from app.api.tools import router as tools_router
from app.api.policies import router as policies_router
from app.api.users import router as users_router
from app.api.chaos import router as chaos_router
from app.api.observability import router as observability_router

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

