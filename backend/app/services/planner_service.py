import re
from typing import Dict, Any, List

class CentralPlannerService:
    """
    Level 1: Request Understanding
    Level 2: Central Planner & DAG Decomposition
    Dynamically maps natural language business requests across all 5 business domains into executable subtasks with dependencies and human approval gates.
    """

    @classmethod
    def understand_request(cls, prompt: str) -> Dict[str, Any]:
        """Level 1: Request Understanding"""
        p_lower = prompt.lower()

        # Domain classification
        if any(w in p_lower for w in ["vendor", "procurement", "purchase order", "quote", "rfp", "bid", "supplier"]):
            domain = "procurement"
            title = "Procurement & Vendor Onboarding"
        elif any(w in p_lower for w in ["invoice", "bill", "payment", "disbursement", "vendor payment", "po-"]):
            domain = "invoice"
            title = "Intelligent Invoice Processing"
        elif any(w in p_lower for w in ["onboard", "hire", "employee", "candidate", "new hire", "join", "staff"]):
            domain = "onboarding"
            title = "Employee Onboarding Workflow"
        elif any(w in p_lower for w in ["customer", "refund", "ticket", "dispute", "client complaint", "support"]):
            domain = "customer"
            title = "Customer Request Resolution"
        elif any(w in p_lower for w in ["incident", "outage", "access", "root", "kubernetes", "k8s", "iam", "privilege", "security alert"]):
            domain = "it_incident"
            title = "IT Incident Response & Access Governance"
        else:
            domain = "customer"
            title = "General Business Request Processing"

        # Extract numeric financial figures if present ($32,000.00 or 32000 USD or 450 dollars)
        amount = None
        amount_match = re.search(r'\$\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?|[0-9]+(?:\.[0-9]{2})?)', prompt)
        if not amount_match:
            amount_match = re.search(r'([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?|[0-9]+(?:\.[0-9]{2})?)\s*(?:dollars|usd|\$)', prompt, re.IGNORECASE)
        if amount_match:
            try:
                amount = float(amount_match.group(1).replace(",", ""))
            except ValueError:
                pass

        return {
            "domain": domain,
            "title": title,
            "extracted_amount": amount,
            "raw_prompt": prompt,
            "intent": f"Automated resolution of {domain} workflow"
        }

    @classmethod
    def decompose_plan(cls, domain: str, understanding: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Level 2: Structured Execution Plan with Task Dependencies & Gates"""
        amount = understanding.get("extracted_amount")

        if domain == "onboarding":
            return [
                {
                    "task_key": "task_onboard_parse",
                    "title": "Parse Candidate Profile & Requirements",
                    "agent_name": "Employee Request Agent",
                    "agent_key": "employee_request_agent",
                    "execution_order": 1,
                    "depends_on": [],
                    "requires_approval": False,
                    "description": "Extract personal details, department, title, and start date."
                },
                {
                    "task_key": "task_onboard_verify_docs",
                    "title": "Verify I-9 & Right-to-Work Documentation",
                    "agent_name": "Document Verification Agent",
                    "agent_key": "doc_verification_agent",
                    "execution_order": 2,
                    "depends_on": ["task_onboard_parse"],
                    "requires_approval": False,
                    "description": "Verify official identity records and background check clearance."
                },
                {
                    "task_key": "task_onboard_hr_record",
                    "title": "Establish Official HCM Record in Workday",
                    "agent_name": "HR Agent",
                    "agent_key": "hr_agent",
                    "execution_order": 3,
                    "depends_on": ["task_onboard_verify_docs"],
                    "requires_approval": False,
                    "description": "Create official employee profile in Workday HCM."
                },
                {
                    "task_key": "task_onboard_it_provision",
                    "title": "Provision Okta SSO Accounts & Security Keys",
                    "agent_name": "IT Provisioning Agent",
                    "agent_key": "it_provisioning_agent",
                    "execution_order": 4,
                    "depends_on": ["task_onboard_hr_record"],
                    "requires_approval": False,
                    "description": "Grant standard productivity suite accounts and dispatch workstation."
                },
                {
                    "task_key": "task_onboard_notify",
                    "title": "Notify Manager & Welcome Candidate",
                    "agent_name": "Communication Agent",
                    "agent_key": "communication_agent",
                    "execution_order": 5,
                    "depends_on": ["task_onboard_it_provision"],
                    "requires_approval": False,
                    "description": "Dispatch welcome briefing and calendar orientation."
                }
            ]

        elif domain == "invoice":
            inv_amount = amount or 18450.00
            return [
                {
                    "task_key": "task_inv_intake",
                    "title": "Invoice Ingestion & PDF Integrity Check",
                    "agent_name": "Invoice Intake Agent",
                    "agent_key": "invoice_intake_agent",
                    "execution_order": 1,
                    "depends_on": [],
                    "requires_approval": False,
                    "description": "Validate document digital signature and OCR fidelity."
                },
                {
                    "task_key": "task_inv_extract",
                    "title": "Extract Line Items, Vendor & Tax Details",
                    "agent_name": "Document Extraction Agent",
                    "agent_key": "doc_extraction_agent",
                    "execution_order": 2,
                    "depends_on": ["task_inv_intake"],
                    "requires_approval": False,
                    "description": "Extract structured ledger fields from invoice document."
                },
                {
                    "task_key": "task_inv_dedup",
                    "title": "Historical Duplicate & Double-Billing Scan",
                    "agent_name": "Duplicate Detection Agent",
                    "agent_key": "duplicate_detection_agent",
                    "execution_order": 3,
                    "depends_on": ["task_inv_extract"],
                    "requires_approval": False,
                    "description": "Scan 90-day ledger history to prevent duplicate disbursements."
                },
                {
                    "task_key": "task_inv_validate",
                    "title": "3-Way Match Verification (PO & Receipt)",
                    "agent_name": "Finance Validation Agent",
                    "agent_key": "finance_validation_agent",
                    "execution_order": 4,
                    "depends_on": ["task_inv_dedup"],
                    "requires_approval": False,
                    "description": "Validate purchase order matching and budget allocation."
                },
                {
                    "task_key": "task_inv_disburse",
                    "title": f"Execute SAP S/4HANA Payment Disbursement (${inv_amount:,.2f})",
                    "agent_name": "Finance Disbursement Agent",
                    "agent_key": "finance_disbursement_agent",
                    "execution_order": 5,
                    "depends_on": ["task_inv_validate"],
                    "requires_approval": True, # Human Approval Gate
                    "risk_level": "HIGH" if inv_amount < 50000 else "CRITICAL",
                    "required_role": "Finance Director" if inv_amount < 50000 else "VP Finance",
                    "description": "Authorize and disburse wire transfer to vendor."
                },
                {
                    "task_key": "task_inv_notify",
                    "title": "Dispatch Remittance Advice to Vendor",
                    "agent_name": "Communication Agent",
                    "agent_key": "communication_agent",
                    "execution_order": 6,
                    "depends_on": ["task_inv_disburse"],
                    "requires_approval": False,
                    "description": "Email settlement confirmation and transaction ID to vendor."
                }
            ]

        elif domain == "customer":
            ref_amt = amount or 450.00
            req_appr = ref_amt > 200.0
            return [
                {
                    "task_key": "task_cust_classify",
                    "title": "Classify Inquiry & Sentiment Analysis",
                    "agent_name": "Request Classification Agent",
                    "agent_key": "customer_classification_agent",
                    "execution_order": 1,
                    "depends_on": [],
                    "requires_approval": False,
                    "description": "Identify category, urgency, and customer SLA profile."
                },
                {
                    "task_key": "task_cust_resolve",
                    "title": f"Issue Resolution & Credit Adjustment (${ref_amt:,.2f})",
                    "agent_name": "Customer Resolution Agent",
                    "agent_key": "customer_resolution_agent",
                    "execution_order": 2,
                    "depends_on": ["task_cust_classify"],
                    "requires_approval": req_appr,
                    "risk_level": "HIGH" if req_appr else "LOW",
                    "required_role": "Support Manager",
                    "description": "Execute Zendesk resolution macro and credit adjustment."
                },
                {
                    "task_key": "task_cust_notify",
                    "title": "Send Resolution Email to Customer",
                    "agent_name": "Communication Agent",
                    "agent_key": "communication_agent",
                    "execution_order": 3,
                    "depends_on": ["task_cust_resolve"],
                    "requires_approval": False,
                    "description": "Send formal explanation and account credit notification."
                }
            ]

        elif domain == "procurement":
            po_val = amount or 78500.00
            return [
                {
                    "task_key": "task_proc_analyze",
                    "title": "Evaluate Competing Vendor Quotes & SLA",
                    "agent_name": "Quotation Analysis Agent",
                    "agent_key": "procurement_analysis_agent",
                    "execution_order": 1,
                    "depends_on": [],
                    "requires_approval": False,
                    "description": "Compare pricing tiers, warranty duration, and delivery timelines."
                },
                {
                    "task_key": "task_proc_execute",
                    "title": f"Activate Vendor & Issue Coupa PO (${po_val:,.2f})",
                    "agent_name": "Procurement Agent",
                    "agent_key": "procurement_execution_agent",
                    "execution_order": 2,
                    "depends_on": ["task_proc_analyze"],
                    "requires_approval": True,
                    "risk_level": "CRITICAL" if po_val > 50000 else "HIGH",
                    "required_role": "Procurement Manager",
                    "description": "Activate vendor master record and dispatch binding purchase order."
                },
                {
                    "task_key": "task_proc_notify",
                    "title": "Notify Department Stakeholder & Vendor",
                    "agent_name": "Communication Agent",
                    "agent_key": "communication_agent",
                    "execution_order": 3,
                    "depends_on": ["task_proc_execute"],
                    "requires_approval": False,
                    "description": "Send copy of signed purchase order to requisitioner and supplier."
                }
            ]

        elif domain == "it_incident":
            is_priv_access = "access" in understanding.get("raw_prompt", "").lower()
            if is_priv_access:
                return [
                    {
                        "task_key": "task_it_investigate",
                        "title": "Analyze Access Scope & Threat Classification",
                        "agent_name": "Investigation Agent",
                        "agent_key": "incident_investigation_agent",
                        "execution_order": 1,
                        "depends_on": [],
                        "requires_approval": False,
                        "description": "Evaluate target infrastructure, justification, and blast radius."
                    },
                    {
                        "task_key": "task_it_grant_pam",
                        "title": "Provision Ephemeral JIT ClusterAdmin Privileges",
                        "agent_name": "Identity & Access Governance Agent",
                        "agent_key": "iam_access_agent",
                        "execution_order": 2,
                        "depends_on": ["task_it_investigate"],
                        "requires_approval": True,
                        "risk_level": "CRITICAL",
                        "required_role": "IT Security Admin",
                        "description": "Authorize temporary 4-hour elevation to production Kubernetes cluster."
                    },
                    {
                        "task_key": "task_it_notify",
                        "title": "Dispatch Security Vault Audit Alert",
                        "agent_name": "Communication Agent",
                        "agent_key": "communication_agent",
                        "execution_order": 3,
                        "depends_on": ["task_it_grant_pam"],
                        "requires_approval": False,
                        "description": "Notify SOC team and requester with ephemeral session credentials."
                    }
                ]
            else:
                return [
                    {
                        "task_key": "task_it_investigate",
                        "title": "Trace Microservice Logs & Root Cause Analysis",
                        "agent_name": "Investigation Agent",
                        "agent_key": "incident_investigation_agent",
                        "execution_order": 1,
                        "depends_on": [],
                        "requires_approval": False,
                        "description": "Correlate telemetry and identify cause of service disruption."
                    },
                    {
                        "task_key": "task_it_remediate",
                        "title": "Execute Automated Service Restart in ServiceNow",
                        "agent_name": "IT Remediation Agent",
                        "agent_key": "it_remediation_agent",
                        "execution_order": 2,
                        "depends_on": ["task_it_investigate"],
                        "requires_approval": False, # Non-destructive automated remediation
                        "risk_level": "LOW",
                        "description": "Cycle connection pool and resolve ServiceNow incident."
                    },
                    {
                        "task_key": "task_it_notify",
                        "title": "Dispatch Incident Post-Mortem & Resolution Notice",
                        "agent_name": "Communication Agent",
                        "agent_key": "communication_agent",
                        "execution_order": 3,
                        "depends_on": ["task_it_remediate"],
                        "requires_approval": False,
                        "description": "Publish MTTR stats and close incident ticket."
                    }
                ]

        # Default plan
        return [
            {
                "task_key": "task_general_exec",
                "title": "Execute Requested Business Operation",
                "agent_name": "Communication Agent",
                "agent_key": "communication_agent",
                "execution_order": 1,
                "depends_on": [],
                "requires_approval": False,
                "description": "Process standard request."
            }
        ]

    @classmethod
    def replan_with_feedback(cls, current_plan: List[Dict[str, Any]], feedback: str) -> List[Dict[str, Any]]:
        """
        Dynamically adjusts the execution plan when a human reviewer Requests Changes.
        Injects a review/adjustment task or modifies parameters.
        """
        revised = []
        for task in current_plan:
            if task.get("requires_approval"):
                # Insert a revision task before the approval
                revised.append({
                    "task_key": f"{task['task_key']}_revised_feedback",
                    "title": f"Revise Parameters: {feedback[:40]}...",
                    "agent_name": task["agent_name"],
                    "agent_key": task["agent_key"],
                    "execution_order": task["execution_order"],
                    "depends_on": task.get("depends_on", []),
                    "requires_approval": False,
                    "description": f"Agent revised execution payload according to feedback: {feedback}"
                })
                # Re-queue approval with updated scope
                updated_appr_task = dict(task)
                updated_appr_task["execution_order"] = task["execution_order"] + 1
                updated_appr_task["depends_on"] = [f"{task['task_key']}_revised_feedback"]
                updated_appr_task["description"] = f"{task['description']} (Revised per feedback)"
                revised.append(updated_appr_task)
            else:
                revised.append(task)
        return revised

planner_service = CentralPlannerService()
