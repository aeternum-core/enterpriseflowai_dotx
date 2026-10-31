import time
import uuid
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.tool import ToolRegistry, ToolExecutionLog
from app.models.approval import ApprovalRequest
from app.services.mock_integrations import mock_integrations
from app.services.audit_service import audit_service
from app.services.policy_engine import policy_engine

class ToolGatewayError(Exception):
    def __init__(self, message: str, code: str = "TOOL_GATEWAY_DENIED"):
        super().__init__(message)
        self.code = code
        self.message = message

class ToolGateway:
    """
    Centralized Authorized Tool & API Gateway.
    Prevents unauthorized or unapproved execution of sensitive operations.
    Logs every execution to tool_execution_logs and audit_events.
    """

    @classmethod
    def invoke(
        cls,
        db: Session,
        tool_key: str,
        agent_id: str,
        agent_name: str,
        workflow_id: str,
        task_id: str,
        payload: Dict[str, Any],
        idempotency_key: Optional[str] = None
    ) -> Dict[str, Any]:
        start_time = time.time()

        # 1. Idempotency Check
        if idempotency_key:
            existing = db.query(ToolExecutionLog).filter(
                ToolExecutionLog.idempotency_key == idempotency_key,
                ToolExecutionLog.status == "SUCCESS"
            ).first()
            if existing:
                return {
                    "status": "CACHED_IDEMPOTENT_RESPONSE",
                    "response": existing.response_payload,
                    "idempotency_key": idempotency_key
                }

        # 2. Tool Registry Check
        tool = db.query(ToolRegistry).filter(ToolRegistry.key == tool_key).first()
        domain = payload.get("domain", "general")
        operation_type = tool_key

        # 3. Policy & Approval Evaluation
        policy_eval = policy_engine.evaluate_operation(
            db=db,
            domain=domain,
            operation_type=operation_type,
            parameters=payload
        )

        requires_approval = policy_eval["requires_approval"]
        risk_level = policy_eval["risk_level"]

        # If operation requires approval, verify that an approved ApprovalRequest exists
        # and that the approved payload matches the current payload!
        if requires_approval:
            approval = db.query(ApprovalRequest).filter(
                ApprovalRequest.workflow_id == workflow_id,
                ApprovalRequest.task_id == task_id,
                ApprovalRequest.status == "APPROVED"
            ).first()

            if not approval:
                # Log blocked execution attempt in tool execution log & audit
                log_entry = ToolExecutionLog(
                    tool_key=tool_key,
                    agent_id=agent_id,
                    workflow_id=workflow_id,
                    task_id=task_id,
                    idempotency_key=idempotency_key,
                    request_payload=payload,
                    response_payload={"error": "BLOCKED_UNAPPROVED: Operation requires explicit Human Approval."},
                    status="BLOCKED_UNAPPROVED",
                    execution_time_ms=int((time.time() - start_time) * 1000)
                )
                db.add(log_entry)
                db.commit()

                audit_service.log_event(
                    db=db,
                    actor_type="TOOL_GATEWAY",
                    actor_id="tool_gateway",
                    actor_name="Central Tool Gateway",
                    event_type="TOOL_EXECUTION_BLOCKED",
                    action_description=f"Blocked unapproved tool call '{tool_key}' for workflow {workflow_id}. Requires {policy_eval['required_role']}.",
                    workflow_id=workflow_id,
                    task_id=task_id,
                    payload_reference={"tool_key": tool_key, "risk_level": risk_level},
                    execution_result="BLOCKED"
                )

                raise ToolGatewayError(
                    f"BLOCKED_UNAPPROVED: Operation '{tool_key}' is classified as {risk_level} risk and requires explicit human approval by {policy_eval['required_role']}."
                )

            # Verification: Approved payload match check
            # (Ensures agent cannot modify payment amount or parameters after human review)
            if approval.proposed_payload:
                key_fields = ["amount", "total_value", "vendor", "vendor_name", "target_system", "refund_amount"]
                numeric_fields = ["amount", "total_value", "refund_amount"]
                for k in key_fields:
                    if k in approval.proposed_payload and k in payload:
                        val_appr = approval.proposed_payload[k]
                        val_pay = payload[k]
                        if k in numeric_fields:
                            try:
                                if float(val_appr) != float(val_pay):
                                    raise ToolGatewayError(
                                        f"SECURITY_TAMPER_DETECTED: Field '{k}' value '{payload[k]}' does not match approved value '{approval.proposed_payload[k]}'."
                                    )
                            except (ValueError, TypeError):
                                if str(val_appr) != str(val_pay):
                                    raise ToolGatewayError(
                                        f"SECURITY_TAMPER_DETECTED: Field '{k}' value '{payload[k]}' does not match approved value '{approval.proposed_payload[k]}'."
                                    )
                        else:
                            if str(val_appr).strip().lower() != str(val_pay).strip().lower():
                                raise ToolGatewayError(
                                    f"SECURITY_TAMPER_DETECTED: Field '{k}' value '{payload[k]}' does not match approved value '{approval.proposed_payload[k]}'."
                                )

        # 4. Route Execution to simulated enterprise services
        result = cls._dispatch_service(tool_key, payload)

        execution_time_ms = int((time.time() - start_time) * 1000)

        # 5. Persist Tool Execution Log
        log_entry = ToolExecutionLog(
            tool_key=tool_key,
            agent_id=agent_id,
            workflow_id=workflow_id,
            task_id=task_id,
            idempotency_key=idempotency_key,
            request_payload=payload,
            response_payload=result,
            status="SUCCESS",
            execution_time_ms=execution_time_ms
        )
        db.add(log_entry)
        db.commit()

        # 6. Append to Tamper-evident Audit Event log
        audit_service.log_event(
            db=db,
            actor_type="AGENT",
            actor_id=agent_id,
            actor_name=agent_name,
            event_type="TOOL_EXECUTED",
            action_description=f"Agent '{agent_name}' successfully executed tool '{tool_key}'.",
            workflow_id=workflow_id,
            task_id=task_id,
            payload_reference={"tool_key": tool_key, "duration_ms": execution_time_ms, "status": "SUCCESS"},
            execution_result="SUCCESS"
        )

        return result

    @classmethod
    def _dispatch_service(cls, tool_key: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Maps tool key to realistic mock enterprise integration handler"""
        if tool_key in ["sap_disburse_payment", "payment_disbursement"]:
            return mock_integrations.sap_disburse_payment(payload)
        elif tool_key in ["workday_create_employee", "employee_record_creation"]:
            return mock_integrations.workday_create_employee(payload)
        elif tool_key in ["okta_provision_accounts", "it_account_provisioning"]:
            return mock_integrations.okta_provision_accounts(payload)
        elif tool_key in ["okta_grant_privileged_access", "grant_privileged_access"]:
            return mock_integrations.okta_grant_privileged_access(payload)
        elif tool_key in ["zendesk_update_ticket", "customer_ticket_resolution"]:
            return mock_integrations.zendesk_update_ticket(payload)
        elif tool_key in ["coupa_create_po", "create_purchase_order"]:
            return mock_integrations.coupa_create_po(payload)
        elif tool_key in ["coupa_activate_vendor", "activate_vendor"]:
            return mock_integrations.coupa_activate_vendor(payload)
        elif tool_key in ["servicenow_remediate_incident", "remediate_incident"]:
            return mock_integrations.servicenow_remediate_incident(payload)
        elif tool_key in ["sendgrid_dispatch_email", "send_notification"]:
            return mock_integrations.sendgrid_dispatch_email(payload)
        elif tool_key in ["gst_einvoice_verify_irn", "gst_irn_verification"]:
            return mock_integrations.gst_einvoice_verify_irn(payload)
        elif tool_key in ["msme_samadhaan_compliance_check", "msme_compliance"]:
            return mock_integrations.msme_samadhaan_compliance_check(payload)
        elif tool_key in ["rbi_tat_refund_calculate", "rbi_refund_calculation"]:
            return mock_integrations.rbi_tat_refund_calculate(payload)
        elif tool_key in ["cert_in_incident_report", "certin_incident_dispatch"]:
            return mock_integrations.cert_in_incident_report(payload)
        else:
            # Generic simulated enterprise tool
            return {
                "status": "SUCCESS",
                "service": f"Enterprise Integration Gateway for '{tool_key}'",
                "is_simulated": True,
                "execution_ref": f"TX-{uuid.uuid4().hex[:8].upper()}",
                "input_data": payload
            }

tool_gateway = ToolGateway()
