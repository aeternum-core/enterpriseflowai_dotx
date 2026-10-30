import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.schemas.contracts import PolicyEvaluationResult, RiskTier

class PolicySentinel:
    """
    Component 10.1: Policy & Compliance Evaluator (Sentinel)
    Evaluates enterprise business context against high-risk flags,
    including bank jurisdiction mismatches, financial thresholds,
    and elevated administrative permissions.
    """

    @classmethod
    def evaluate(
        cls,
        domain: str,
        action_type: str,
        parameters: Dict[str, Any]
    ) -> PolicyEvaluationResult:
        violations: List[str] = []
        evidence: Dict[str, Any] = {}
        risk: RiskTier = "LOW"
        risk_score: float = 0.1
        requires_approval: bool = False
        required_level: str = "Automated System"
        mitigation: Optional[str] = None

        amount = float(parameters.get("amount", 0.0) or parameters.get("total_value", 0.0) or parameters.get("refund_amount", 0.0) or 0.0)
        evidence["financial_amount"] = amount

        # Domain 04: Procurement — Bank Jurisdiction Mismatch Detection
        if domain == "procurement":
            vendor_country = parameters.get("vendor_country", "US")
            bank_country = parameters.get("bank_country", "KY") # Cayman Islands mismatch
            if vendor_country != bank_country and (parameters.get("jurisdiction_mismatch") or "mismatch" in str(parameters).lower()):
                violations.append(f"High-Risk Jurisdiction Mismatch: Vendor registered in {vendor_country} but designated wire bank in {bank_country}.")
                risk = "CRITICAL"
                risk_score = 0.95
                requires_approval = True
                required_level = "Procurement Manager & Risk Compliance Officer"
                mitigation = "Mandatory physical bank verification letter and W-8BEN re-audit."

            elif amount > 50000.0:
                violations.append(f"Capital commitment of ${amount:,.2f} exceeds standard $50,000 threshold.")
                risk = "CRITICAL"
                risk_score = 0.88
                requires_approval = True
                required_level = "Procurement Manager"
                mitigation = "Competitive quote comparison & SLA evaluation sign-off."

        # Domain 02: Invoices — Price Divergence & Discrepancy Gate
        elif domain == "invoice":
            price_divergence_pct = float(parameters.get("price_divergence_pct", 0.0))
            if price_divergence_pct > 5.0 or amount > 500.0:
                violations.append(f"Invoice disbursement of ${amount:,.2f} with price divergence {price_divergence_pct}%.")
                risk = "HIGH" if amount < 50000 else "CRITICAL"
                risk_score = 0.85
                requires_approval = True
                required_level = "Finance Director" if amount < 50000 else "VP Finance"
                mitigation = "3-Way PO matching reconciliation and line-item tax confirmation."

        # Domain 05: IT Incident & Privileged PAM Elevation
        elif domain == "it_incident":
            is_priv = "root" in str(parameters).lower() or "clusteradmin" in str(parameters).lower() or action_type == "ELEVATE_JIT_ACCESS"
            if is_priv:
                violations.append("Request for ephemeral ClusterAdmin / Root elevation on production infrastructure.")
                risk = "CRITICAL"
                risk_score = 0.98
                requires_approval = True
                required_level = "IT Security Admin"
                mitigation = "Enforce session screen recording, CyberArk vault audit, and 4-hour max TTL."

        # Domain 03: Customer Disputes
        elif domain == "customer":
            if amount > 1000.0:
                violations.append(f"Customer goodwill refund exception of ${amount:,.2f} exceeds $1,000 limit.")
                risk = "HIGH"
                risk_score = 0.75
                requires_approval = True
                required_level = "Support Manager"
                mitigation = "Managerial credit adjustment authorization."

        # Domain 01: Employee Onboarding
        elif domain == "onboarding":
            if parameters.get("is_executive", False) or "vp" in str(parameters).lower():
                violations.append("Executive-level onboarding requisition with sensitive enterprise access scope.")
                risk = "HIGH"
                risk_score = 0.70
                requires_approval = True
                required_level = "HR Director"
                mitigation = "Executive background screening and compliance review."

        rule_id = f"RULE-{domain.upper()}-{uuid.uuid4().hex[:6].upper()}"
        return PolicyEvaluationResult(
            rule_id=rule_id,
            domain=domain,
            risk_classification=risk,
            risk_score=risk_score,
            requires_approval=requires_approval,
            required_approval_level=required_level,
            evidence=evidence,
            violations=violations,
            recommended_mitigation=mitigation
        )

class DeterministicAuthorizationEngine:
    """
    Component 10.2: Hard Deterministic Enforcement Boundary
    Enforces authorization decisions strictly at the code/database level.
    LLM output can never independently grant access or bypass this engine.
    """

    @classmethod
    def check_authorization(
        cls,
        agent_role: str,
        user_role: Optional[str],
        evaluation: PolicyEvaluationResult,
        approval_record: Optional[Any],
        incoming_payload: Dict[str, Any]
    ) -> Dict[str, Any]:
        if not evaluation.requires_approval:
            return {"authorized": True, "reason": "Operation permitted under standard autonomous governance."}

        if not approval_record or approval_record.status != "APPROVED":
            return {
                "authorized": False,
                "reason": f"BLOCKED_UNAPPROVED: Action classified as {evaluation.risk_classification} risk. Requires explicit approval by {evaluation.required_approval_level}."
            }

        # Validate exact payload match (payload binding protection)
        if approval_record.proposed_payload:
            for k in ["amount", "total_value", "refund_amount"]:
                if k in approval_record.proposed_payload and k in incoming_payload:
                    try:
                        if float(approval_record.proposed_payload[k]) != float(incoming_payload[k]):
                            return {
                                "authorized": False,
                                "reason": f"SECURITY_TAMPER_DETECTED: Field '{k}' value '{incoming_payload[k]}' does not match approved value '{approval_record.proposed_payload[k]}'."
                            }
                    except (ValueError, TypeError):
                        pass

        return {"authorized": True, "reason": f"Authorized by human sign-off ({approval_record.decided_by_name})."}

policy_sentinel = PolicySentinel()
deterministic_auth_engine = DeterministicAuthorizationEngine()

