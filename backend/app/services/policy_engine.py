from typing import Dict, Any, Tuple, Optional
from sqlalchemy.orm import Session
from app.models.approval import ApprovalPolicy

class PolicyEngine:
    """
    Central Authorization & Policy Engine.
    Evaluates proposed actions against risk classifications, thresholds, and required roles.
    Backend enforced: agents cannot bypass or self-authorize.
    """

    @classmethod
    def evaluate_operation(
        cls,
        db: Session,
        domain: str,
        operation_type: str,
        parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Returns:
            {
                "allowed": bool,
                "requires_approval": bool,
                "risk_level": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
                "required_role": str,
                "sla_hours": float,
                "reason": str
            }
        """
        # Check active approval policy from database if configured
        policy = db.query(ApprovalPolicy).filter(
            ApprovalPolicy.domain == domain,
            ApprovalPolicy.operation_type == operation_type,
            ApprovalPolicy.is_active == True
        ).first()

        amount = float(parameters.get("amount", 0.0) or parameters.get("total_value", 0.0) or 0.0)

        # Domain & Operation Specific Hardened Rules
        if domain == "invoice":
            if operation_type in ["payment_disbursement", "sap_disburse_payment"]:
                if amount > 50000.0:
                    return {
                        "allowed": True,
                        "requires_approval": True,
                        "risk_level": "CRITICAL",
                        "required_role": "VP Finance",
                        "sla_hours": 12.0,
                        "reason": f"Disbursement of ${amount:,.2f} exceeds critical financial limit ($50,000)."
                    }
                elif amount > 500.0:
                    return {
                        "allowed": True,
                        "requires_approval": True,
                        "risk_level": "HIGH",
                        "required_role": "Finance Director",
                        "sla_hours": 24.0,
                        "reason": f"Disbursement of ${amount:,.2f} requires Finance Director sign-off."
                    }
                else:
                    return {
                        "allowed": True,
                        "requires_approval": False,
                        "risk_level": "LOW",
                        "required_role": "Finance Analyst",
                        "sla_hours": 48.0,
                        "reason": "Micro-expense under $500 eligible for automated ledger settlement."
                    }

        elif domain == "it_incident":
            if operation_type in ["grant_privileged_access", "k8s_cluster_admin_access", "database_root_access", "okta_grant_privileged_access"]:
                return {
                    "allowed": True,
                    "requires_approval": True,
                    "risk_level": "CRITICAL",
                    "required_role": "IT Security Admin",
                    "sla_hours": 4.0,
                    "reason": "Elevation to production root/cluster-admin privileges requires IT Security authorization."
                }
            elif operation_type in ["reboot_service", "restart_pod", "servicenow_remediate_incident"]:
                return {
                    "allowed": True,
                    "requires_approval": False,
                    "risk_level": "LOW",
                    "required_role": "IT Ops",
                    "sla_hours": 1.0,
                    "reason": "Non-destructive service restart within authorized bounds."
                }

        elif domain == "procurement":
            if operation_type in ["create_purchase_order", "activate_vendor", "coupa_create_po", "coupa_activate_vendor"]:
                risk = "CRITICAL" if amount > 50000 else "HIGH"
                return {
                    "allowed": True,
                    "requires_approval": True,
                    "risk_level": risk,
                    "required_role": "Procurement Manager",
                    "sla_hours": 24.0,
                    "reason": f"Vendor onboarding / PO commitment of ${amount:,.2f} requires procurement officer authorization."
                }

        elif domain == "customer":
            refund_amount = float(parameters.get("refund_amount", 0.0) or parameters.get("amount", 0.0) or 0.0)
            if refund_amount > 200.0 or operation_type in ["zendesk_update_ticket"]:
                req = refund_amount > 200.0
                return {
                    "allowed": True,
                    "requires_approval": req,
                    "risk_level": "HIGH" if req else "LOW",
                    "required_role": "Support Manager",
                    "sla_hours": 12.0,
                    "reason": f"Customer refund exception of ${refund_amount:,.2f} evaluated."
                }

        elif domain == "onboarding":
            if operation_type == "provision_executive_privileges" or parameters.get("is_executive", False):
                return {
                    "allowed": True,
                    "requires_approval": True,
                    "risk_level": "HIGH",
                    "required_role": "HR Director",
                    "sla_hours": 24.0,
                    "reason": "Executive onboarding with elevated confidential data access requires HR Director approval."
                }

        # Fallback to DB policy if configured
        if policy:
            req_appr = True if amount >= policy.min_financial_threshold else False
            return {
                "allowed": True,
                "requires_approval": req_appr,
                "risk_level": policy.risk_level,
                "required_role": policy.required_role,
                "sla_hours": policy.sla_hours,
                "reason": f"Governed by enterprise policy '{policy.name}'."
            }

        # Default standard safe behavior
        return {
            "allowed": True,
            "requires_approval": False,
            "risk_level": "LOW",
            "required_role": "Employee",
            "sla_hours": 48.0,
            "reason": "Routine operational task permitted under standard automated governance."
        }

policy_engine = PolicyEngine()
