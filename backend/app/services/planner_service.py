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

        # Extract numeric financial figures if present (₹32,000.00 or Rs. 32000 or 32000 INR or $32,000)
        amount = None
        amount_match = re.search(r'(?:₹|rs\.?|inr|\$)\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{2})?|[0-9]+(?:\.[0-9]{2})?)', prompt, re.IGNORECASE)
        if not amount_match:
            amount_match = re.search(r'([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{2})?|[0-9]+(?:\.[0-9]{2})?)\s*(?:rupees|rs\.?|inr|lakh|crore|dollars|usd|\$|₹)', prompt, re.IGNORECASE)
        if amount_match:
            try:
                val_str = amount_match.group(1).replace(",", "")
                amount = float(val_str)
                # Handle lakh or crore scale if detected
                lower_p = prompt.lower()
                if "crore" in lower_p and amount < 1000:
                    amount *= 10000000.0
                elif "lakh" in lower_p and amount < 1000:
                    amount *= 100000.0
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
                    "title": "Parse Candidate Profile & Joining Package (₹ INR)",
                    "agent_name": "Employee Request Agent",
                    "agent_key": "employee_request_agent",
                    "execution_order": 1,
                    "depends_on": [],
                    "requires_approval": False,
                    "description": "Extract candidate credentials, Aadhaar/PAN metadata, role grade, joining bonus in ₹ INR, and start date."
                },
                {
                    "task_key": "task_onboard_verify_docs",
                    "title": "Verify PAN, Aadhaar & EPFO Form 11 (DPDP Act 2023)",
                    "agent_name": "Document Verification Agent",
                    "agent_key": "doc_verification_agent",
                    "execution_order": 2,
                    "depends_on": ["task_onboard_parse"],
                    "requires_approval": False,
                    "description": "Authenticate PAN via NSDL, tokenize Aadhaar in UIDAI compliant vault, and verify EPFO UAN & ESIC eligibility."
                },
                {
                    "task_key": "task_onboard_hr_record",
                    "title": "Establish Official HCM Record in Workday & EPFO Link",
                    "agent_name": "HR Agent",
                    "agent_key": "hr_agent",
                    "execution_order": 3,
                    "depends_on": ["task_onboard_verify_docs"],
                    "requires_approval": False,
                    "description": "Create official worker profile in Workday HCM and establish EPFO Member ID linkage."
                },
                {
                    "task_key": "task_onboard_it_provision",
                    "title": "Provision Okta SSO & Allocate Corporate Equipment",
                    "agent_name": "IT Provisioning Agent",
                    "agent_key": "it_provisioning_agent",
                    "execution_order": 4,
                    "depends_on": ["task_onboard_hr_record"],
                    "requires_approval": False,
                    "description": "Grant Google Workspace, GitHub Enterprise & Jira access; assign asset-tagged MacBook/ThinkPad & YubiKey."
                },
                {
                    "task_key": "task_onboard_notify",
                    "title": "Credit Joining Bonus & Dispatch Credentials to Personal Inbox",
                    "agent_name": "Communication Agent",
                    "agent_key": "communication_agent",
                    "execution_order": 5,
                    "depends_on": ["task_onboard_it_provision"],
                    "requires_approval": False,
                    "description": "Schedule joining bonus disbursement via RazorpayX payroll rail and send encrypted login credentials to candidate's personal inbox."
                }
            ]

        elif domain == "invoice":
            inv_amount = amount or 2480000.00
            return [
                {
                    "task_key": "task_inv_intake",
                    "title": "GST e-Invoice Intake & Rule 48(4) Format Check",
                    "agent_name": "Invoice Intake Agent",
                    "agent_key": "invoice_intake_agent",
                    "execution_order": 1,
                    "depends_on": [],
                    "requires_approval": False,
                    "description": "Validate document digital signature, GST e-invoice schema conformity, and OCR fidelity."
                },
                {
                    "task_key": "task_inv_extract",
                    "title": "Extract Line Items, 15-Digit GSTIN & 64-Char IRN",
                    "agent_name": "Document Extraction Agent",
                    "agent_key": "doc_extraction_agent",
                    "execution_order": 2,
                    "depends_on": ["task_inv_intake"],
                    "requires_approval": False,
                    "description": "Extract structured ledger fields, 15-character supplier GSTIN, 64-hexadecimal IRN, and HSN/SAC codes."
                },
                {
                    "task_key": "task_inv_dedup",
                    "title": "Historical Duplicate & Double-Billing Scan (GSTR-2B)",
                    "agent_name": "Duplicate Detection Agent",
                    "agent_key": "duplicate_detection_agent",
                    "execution_order": 3,
                    "depends_on": ["task_inv_extract"],
                    "requires_approval": False,
                    "description": "Cross-reference 90-day GSTR-2B reconciliation ledger and past ERP disbursements to prevent duplicate payments."
                },
                {
                    "task_key": "task_inv_validate",
                    "title": "NIC IRN Portal Verification & 3-Way Match (Sec 16(2) ITC)",
                    "agent_name": "Finance Validation Agent",
                    "agent_key": "finance_validation_agent",
                    "execution_order": 4,
                    "depends_on": ["task_inv_dedup"],
                    "requires_approval": False,
                    "description": "Verify 64-character IRN on NIC e-Invoice Portal, confirm Section 16(2) CGST Input Tax Credit, and 3-way match against PO and GRN."
                },
                {
                    "task_key": "task_inv_disburse",
                    "title": f"Execute SAP / RazorpayX Payment Disbursement (₹{inv_amount:,.2f})",
                    "agent_name": "Finance Disbursement Agent",
                    "agent_key": "finance_disbursement_agent",
                    "execution_order": 5,
                    "depends_on": ["task_inv_validate"],
                    "requires_approval": True, # Human Approval Gate
                    "risk_level": "HIGH" if inv_amount < 2500000 else "CRITICAL",
                    "required_role": "Finance Director" if inv_amount < 2500000 else "VP Finance",
                    "description": "Authorize and disburse wire transfer to vendor via RBI RTGS rail with UTR generation."
                },
                {
                    "task_key": "task_inv_notify",
                    "title": "Dispatch Remittance Advice & GST Settlement Notice",
                    "agent_name": "Communication Agent",
                    "agent_key": "communication_agent",
                    "execution_order": 6,
                    "depends_on": ["task_inv_disburse"],
                    "requires_approval": False,
                    "description": "Email settlement confirmation, bank UTR reference, and TDS 194Q certificate to vendor."
                }
            ]

        elif domain == "customer":
            ref_amt = amount or 45000.00
            req_appr = ref_amt > 15000.0 or (ref_amt > 200.0 and ref_amt <= 2000.0)
            return [
                {
                    "task_key": "task_cust_classify",
                    "title": "Intake Triage, Urgency Scoring & Sentiment Analysis",
                    "agent_name": "Request Classification Agent",
                    "agent_key": "customer_classification_agent",
                    "execution_order": 1,
                    "depends_on": [],
                    "requires_approval": False,
                    "description": "Identify category, urgency, customer tier, and applicable SLA policy profile."
                },
                {
                    "task_key": "task_cust_kb",
                    "title": "Retrieve Customer SLA Policy & Escalation History",
                    "agent_name": "Knowledge & Policy Agent",
                    "agent_key": "customer_kb_agent",
                    "execution_order": 2,
                    "depends_on": ["task_cust_classify"],
                    "requires_approval": False,
                    "description": "Verify contract entitlements, latency breach SLA terms, and historical remedy logs."
                },
                {
                    "task_key": "task_cust_resolve",
                    "title": f"Evaluate RBI Harmonised TAT Delay Compensation (₹{ref_amt:,.2f})",
                    "agent_name": "Customer Resolution Agent",
                    "agent_key": "customer_resolution_agent",
                    "execution_order": 3,
                    "depends_on": ["task_cust_kb"],
                    "requires_approval": req_appr,
                    "risk_level": "HIGH" if req_appr else "LOW",
                    "required_role": "Support Manager",
                    "description": "Calculate RBI TAT turnaround (T+1/T+5 under DPSS.CO.PD No.629), compute suo motu ₹100/day penalty, and request manager authorization if concession exceeds ₹15,000."
                },
                {
                    "task_key": "task_cust_execute",
                    "title": "Execute Zendesk Ticket Update & CRM Ledger Sync",
                    "agent_name": "CRM Integration Agent",
                    "agent_key": "customer_integration_agent",
                    "execution_order": 4,
                    "depends_on": ["task_cust_resolve"],
                    "requires_approval": False,
                    "description": "Execute Zendesk Support macro, credit adjustment ledger, and RazorpayX instant refund reversal."
                },
                {
                    "task_key": "task_cust_notify",
                    "title": "Deliver RBI TAT Compliance Notice & CSAT Survey",
                    "agent_name": "Communication Agent",
                    "agent_key": "communication_agent",
                    "execution_order": 5,
                    "depends_on": ["task_cust_execute"],
                    "requires_approval": False,
                    "description": "Deliver formal explanation, credit memo, and customer satisfaction survey link."
                }
            ]

        elif domain == "procurement":
            po_val = amount or 7850000.00
            return [
                {
                    "task_key": "task_proc_analyze",
                    "title": "Evaluate Competing Vendor Quotes & MSME Registration",
                    "agent_name": "Quotation Analysis Agent",
                    "agent_key": "procurement_analysis_agent",
                    "execution_order": 1,
                    "depends_on": [],
                    "requires_approval": False,
                    "description": "Compare pricing tiers, MSME Udyam status, GeM portal compatibility, and delivery warranty."
                },
                {
                    "task_key": "task_proc_execute",
                    "title": f"MSME Samadhaan 45-Day Cap & ERP Purchase Order (₹{po_val:,.2f})",
                    "agent_name": "Procurement Agent",
                    "agent_key": "procurement_execution_agent",
                    "execution_order": 2,
                    "depends_on": ["task_proc_analyze"],
                    "requires_approval": True,
                    "risk_level": "CRITICAL" if po_val > 5000000 or (po_val > 50000 and po_val <= 100000) else "HIGH",
                    "required_role": "Procurement Manager",
                    "description": "Enforce MSMED Act 2006 Section 15 statutory 45-day payment cap, verify RBI FEMA bank clearance, and dispatch binding Coupa/SAP PO."
                },
                {
                    "task_key": "task_proc_notify",
                    "title": "Notify Department Stakeholder & Supplier with Binding Terms",
                    "agent_name": "Communication Agent",
                    "agent_key": "communication_agent",
                    "execution_order": 3,
                    "depends_on": ["task_proc_execute"],
                    "requires_approval": False,
                    "description": "Send copy of signed purchase order and MSME payment terms schedule to requisitioner and supplier."
                }
            ]

        elif domain == "it_incident":
            is_priv_access = "access" in understanding.get("raw_prompt", "").lower()
            if is_priv_access:
                return [
                    {
                        "task_key": "task_it_investigate",
                        "title": "Analyze Access Scope & Threat Classification (CERT-In)",
                        "agent_name": "Investigation Agent",
                        "agent_key": "incident_investigation_agent",
                        "execution_order": 1,
                        "depends_on": [],
                        "requires_approval": False,
                        "description": "Evaluate target infrastructure (Mumbai DC k8s-prod-in-west-1), justification, and blast radius under CERT-In directives."
                    },
                    {
                        "task_key": "task_it_grant_pam",
                        "title": "Authorize Ephemeral 4-Hour JIT ClusterAdmin Elevation",
                        "agent_name": "Identity & Access Governance Agent",
                        "agent_key": "iam_access_agent",
                        "execution_order": 2,
                        "depends_on": ["task_it_investigate"],
                        "requires_approval": True,
                        "risk_level": "CRITICAL",
                        "required_role": "IT Security Admin",
                        "description": "Authorize temporary 4-hour elevation to production Kubernetes cluster in Mumbai DC."
                    },
                    {
                        "task_key": "task_it_notify",
                        "title": "Lock 180-Day ICT Audit Trail & Dispatch Security Vault Alert",
                        "agent_name": "Communication Agent",
                        "agent_key": "communication_agent",
                        "execution_order": 3,
                        "depends_on": ["task_it_grant_pam"],
                        "requires_approval": False,
                        "description": "Notify SOC team, lock audit trail under CERT-In 180-day retention mandate, and issue ephemeral session credentials."
                    }
                ]
            else:
                return [
                    {
                        "task_key": "task_it_investigate",
                        "title": "Trace Microservice Logs & Root Cause Analysis (CERT-In Mandate)",
                        "agent_name": "Investigation Agent",
                        "agent_key": "incident_investigation_agent",
                        "execution_order": 1,
                        "depends_on": [],
                        "requires_approval": False,
                        "description": "Correlate telemetry in Mumbai DC, identify cause of service disruption, and establish incident timeline."
                    },
                    {
                        "task_key": "task_it_remediate",
                        "title": "ServiceNow Automated Remediation & CERT-In 6-Hour Dispatch",
                        "agent_name": "IT Remediation Agent",
                        "agent_key": "it_remediation_agent",
                        "execution_order": 2,
                        "depends_on": ["task_it_investigate"],
                        "requires_approval": False, # Non-destructive automated remediation
                        "risk_level": "LOW",
                        "description": "Cycle connection pool, resync NTP with NIC/NPL, and dispatch mandatory Section 70B(6) incident notice to incident@cert-in.org.in."
                    },
                    {
                        "task_key": "task_it_notify",
                        "title": "Dispatch Incident Post-Mortem & CERT-In Closure Notice",
                        "agent_name": "Communication Agent",
                        "agent_key": "communication_agent",
                        "execution_order": 3,
                        "depends_on": ["task_it_remediate"],
                        "requires_approval": False,
                        "description": "Publish MTTR stats, archive 180-day logs, and notify enterprise stakeholders."
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
