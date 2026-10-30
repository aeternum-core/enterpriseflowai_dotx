from datetime import datetime
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from app.models.approval import ApprovalRequest, ApprovalComment, ApprovalHistory
from app.models.workflow import Workflow, WorkflowTask
from app.models.user import User, Role
from app.services.audit_service import audit_service

class ApprovalEngineError(Exception):
    def __init__(self, message: str, code: str = "APPROVAL_ERROR"):
        super().__init__(message)
        self.message = message
        self.code = code

class ApprovalEngine:
    """
    Human-in-the-Loop Approval Management Service.
    Enforces that AI agents cannot approve their own operations,
    and all sensitive state transitions are cryptographically audited and validated.
    """

    @classmethod
    def create_approval_request(
        cls,
        db: Session,
        workflow_id: str,
        task_id: str,
        title: str,
        domain: str,
        risk_level: str,
        requested_by_agent: str,
        department: str,
        business_justification: str,
        proposed_action: str,
        proposed_payload: Dict[str, Any],
        required_role: str,
        ai_summary: str,
        tools_invoked: List[str],
        validation_results: Dict[str, Any],
        financial_amount: Optional[float] = None,
        requesting_employee: Optional[str] = None,
        due_date: Optional[datetime] = None,
        priority: str = "HIGH"
    ) -> ApprovalRequest:
        req = ApprovalRequest(
            workflow_id=workflow_id,
            task_id=task_id,
            title=title,
            domain=domain,
            risk_level=risk_level,
            status="PENDING",
            priority=priority,
            requested_by_agent=requested_by_agent,
            requesting_employee=requesting_employee,
            department=department,
            financial_amount=financial_amount,
            business_justification=business_justification,
            proposed_action=proposed_action,
            proposed_payload=proposed_payload,
            ai_summary=ai_summary,
            tools_invoked=tools_invoked,
            validation_results=validation_results,
            risk_assessment=f"Automated risk tier: {risk_level}. Requires human authorization from {required_role}.",
            required_role=required_role,
            due_date=due_date
        )
        db.add(req)
        db.commit()
        db.refresh(req)

        # Record in ApprovalHistory
        history = ApprovalHistory(
            approval_id=req.id,
            action="CREATED",
            actor_name=requested_by_agent,
            notes=f"AI Agent requested approval for '{proposed_action}'"
        )
        db.add(history)
        db.commit()

        # Audit Event
        audit_service.log_event(
            db=db,
            actor_type="AGENT",
            actor_id=requested_by_agent,
            actor_name=requested_by_agent,
            event_type="APPROVAL_REQUESTED",
            action_description=f"Agent '{requested_by_agent}' created approval request for {title} (Risk: {risk_level}, Amount: ${financial_amount or 0:,.2f})",
            workflow_id=workflow_id,
            task_id=task_id,
            payload_reference={"approval_id": req.id, "risk_level": risk_level, "required_role": required_role},
            execution_result="PAUSED"
        )

        return req

    @staticmethod
    def _is_role_authorized(user_role: str, required_role: Optional[str]) -> bool:
        if not required_role:
            return True
        u = (user_role or "").strip().lower()
        r = (required_role or "").strip().lower()
        # Admin or root supervisor has universal governance authority
        if "admin" in u:
            return True
        if u == r:
            return True
        # Normalize underscores vs spaces
        u_norm = u.replace("_", " ")
        r_norm = r.replace("_", " ")
        if u_norm == r_norm:
            return True
        # Department / domain role matching
        if ("fin" in u and "fin" in r) or ("hr" in u and "hr" in r) or \
           (("it" in u or "sec" in u) and ("it" in r or "sec" in r)) or \
           ("proc" in u and "proc" in r) or \
           (("cust" in u or "client" in u or "support" in u) and ("cust" in r or "client" in r or "support" in r)):
            return True
        return False

    @classmethod
    def approve(
        cls,
        db: Session,
        approval_id: str,
        user_id: str,
        user_name: str,
        user_role: str,
        notes: Optional[str] = None
    ) -> Dict[str, Any]:
        req = db.query(ApprovalRequest).filter(ApprovalRequest.id == approval_id).first()
        if not req:
            raise ApprovalEngineError(f"Approval request {approval_id} not found", "NOT_FOUND")

        if req.status != "PENDING":
            raise ApprovalEngineError(f"Cannot approve request in status '{req.status}'", "INVALID_STATUS")

        # Security check: Agent cannot approve itself
        if user_id.startswith("agent_") or (user_role and user_role.lower() == "agent"):
            raise ApprovalEngineError("Security violation: AI agents cannot approve operations.", "UNAUTHORIZED_AGENT_APPROVAL")

        # Role validation: Check if user has required role or is Admin
        if req.required_role and not cls._is_role_authorized(user_role, req.required_role):
            raise ApprovalEngineError(
                f"Unauthorized: This request requires role '{req.required_role}', but current user has role '{user_role}'.",
                "ROLE_MISMATCH"
            )

        now = datetime.utcnow()
        req.status = "APPROVED"
        req.decided_by_user_id = user_id
        req.decided_by_name = user_name
        req.decided_at = now
        req.decision_reason = notes or "Approved by authorized human operator."
        req.approved_payload = req.proposed_payload # Capture approved state

        history = ApprovalHistory(
            approval_id=req.id,
            action="APPROVED",
            actor_name=f"{user_name} ({user_role})",
            notes=notes or "Human authorized proposed action."
        )
        db.add(history)
        db.commit()

        # Audit Event
        audit_service.log_event(
            db=db,
            actor_type="HUMAN_USER",
            actor_id=user_id,
            actor_name=f"{user_name} ({user_role})",
            event_type="APPROVAL_DECIDED",
            action_description=f"Human reviewer '{user_name}' APPROVED request '{req.title}'. Workflow resumed.",
            workflow_id=req.workflow_id,
            task_id=req.task_id,
            payload_reference={"approval_id": req.id, "decision": "APPROVED", "notes": notes},
            execution_result="SUCCESS",
            approval_info={"decision": "APPROVED", "approver": user_name, "role": user_role}
        )

        return {"status": "APPROVED", "approval_id": req.id, "workflow_id": req.workflow_id}

    @classmethod
    def reject(
        cls,
        db: Session,
        approval_id: str,
        user_id: str,
        user_name: str,
        user_role: str,
        reason: str
    ) -> Dict[str, Any]:
        if not reason or len(reason.strip()) < 5:
            raise ApprovalEngineError("Rejection reason is required (minimum 5 characters).", "MISSING_REASON")

        req = db.query(ApprovalRequest).filter(ApprovalRequest.id == approval_id).first()
        if not req:
            raise ApprovalEngineError(f"Approval request {approval_id} not found", "NOT_FOUND")

        if req.status != "PENDING":
            raise ApprovalEngineError(f"Cannot reject request in status '{req.status}'", "INVALID_STATUS")

        now = datetime.utcnow()
        req.status = "REJECTED"
        req.decided_by_user_id = user_id
        req.decided_by_name = user_name
        req.decided_at = now
        req.decision_reason = reason

        history = ApprovalHistory(
            approval_id=req.id,
            action="REJECTED",
            actor_name=f"{user_name} ({user_role})",
            notes=f"Rejection Reason: {reason}"
        )
        db.add(history)

        # Also update associated Workflow & Task
        if req.task_id:
            task = db.query(WorkflowTask).filter(WorkflowTask.id == req.task_id).first()
            if task:
                task.status = "FAILED"
                task.error_details = {"rejection_reason": reason, "rejected_by": user_name}

        if req.workflow_id:
            wf = db.query(Workflow).filter(Workflow.id == req.workflow_id).first()
            if wf:
                wf.status = "REJECTED"

        db.commit()

        # Audit Event
        audit_service.log_event(
            db=db,
            actor_type="HUMAN_USER",
            actor_id=user_id,
            actor_name=f"{user_name} ({user_role})",
            event_type="APPROVAL_REJECTED",
            action_description=f"Human reviewer '{user_name}' REJECTED request '{req.title}'. Reason: {reason}",
            workflow_id=req.workflow_id,
            task_id=req.task_id,
            payload_reference={"approval_id": req.id, "decision": "REJECTED", "reason": reason},
            execution_result="REJECTED",
            approval_info={"decision": "REJECTED", "reason": reason, "approver": user_name}
        )

        return {"status": "REJECTED", "approval_id": req.id, "workflow_id": req.workflow_id}

    @classmethod
    def request_changes(
        cls,
        db: Session,
        approval_id: str,
        user_id: str,
        user_name: str,
        user_role: str,
        feedback: str
    ) -> Dict[str, Any]:
        if not feedback or len(feedback.strip()) < 5:
            raise ApprovalEngineError("Feedback details are required for requesting changes.", "MISSING_FEEDBACK")

        req = db.query(ApprovalRequest).filter(ApprovalRequest.id == approval_id).first()
        if not req:
            raise ApprovalEngineError(f"Approval request {approval_id} not found", "NOT_FOUND")

        if req.status != "PENDING":
            raise ApprovalEngineError(f"Cannot request changes for request in status '{req.status}'", "INVALID_STATUS")

        now = datetime.utcnow()
        req.status = "CHANGES_REQUESTED"
        req.decided_by_user_id = user_id
        req.decided_by_name = user_name
        req.decided_at = now
        req.feedback_notes = feedback

        history = ApprovalHistory(
            approval_id=req.id,
            action="CHANGES_REQUESTED",
            actor_name=f"{user_name} ({user_role})",
            notes=f"Feedback: {feedback}"
        )
        db.add(history)

        # Update Workflow status
        if req.workflow_id:
            wf = db.query(Workflow).filter(Workflow.id == req.workflow_id).first()
            if wf:
                wf.status = "CHANGES_REQUESTED"

        db.commit()

        # Audit Event
        audit_service.log_event(
            db=db,
            actor_type="HUMAN_USER",
            actor_id=user_id,
            actor_name=f"{user_name} ({user_role})",
            event_type="APPROVAL_CHANGES_REQUESTED",
            action_description=f"Human reviewer requested modifications on '{req.title}'. Feedback: {feedback}",
            workflow_id=req.workflow_id,
            task_id=req.task_id,
            payload_reference={"approval_id": req.id, "feedback": feedback},
            execution_result="CHANGES_REQUESTED"
        )

        return {"status": "CHANGES_REQUESTED", "approval_id": req.id, "feedback": feedback}

    @classmethod
    def add_comment(
        cls,
        db: Session,
        approval_id: str,
        author_name: str,
        author_role: str,
        comment_text: str
    ) -> ApprovalComment:
        comm = ApprovalComment(
            approval_id=approval_id,
            author_name=author_name,
            author_role=author_role,
            comment_text=comment_text
        )
        db.add(comm)
        db.commit()
        db.refresh(comm)
        return comm

approval_engine = ApprovalEngine()

