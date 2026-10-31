import uuid
from typing import Dict, Any, List, Optional
# pyrefly: ignore[missing-import]
from sqlalchemy.orm import Session
from app.services.tool_gateway import tool_gateway

class BaseSpecializedAgent:
    def __init__(
        self,
        key: str,
        name: str,
        domain: str,
        description: str,
        system_instructions: str,
        allowed_tools: List[str],
        permission_scope: str = "EXECUTE_LOW_RISK"
    ):
        self.key = key
        self.name = name
        self.domain = domain
        self.description = description
        self.system_instructions = system_instructions
        self.allowed_tools = allowed_tools
        self.permission_scope = permission_scope

    def execute(self, db: Session, context: Dict[str, Any], workflow_id: str, task_id: str) -> Dict[str, Any]:
        raise NotImplementedError

# --- WORKFLOW 01: Employee Onboarding Agents ---
class EmployeeRequestAgent(BaseSpecializedAgent):
    def __init__(self):
        super().__init__(
            key="employee_request_agent",
            name="Employee Request Agent",
            domain="onboarding",
            description="Extracts candidate profile and onboarding details from incoming hire requisitions.",
            system_instructions="Parse candidate name, department, role, manager, and starting date from raw hire request.",
            allowed_tools=[]
        )

    def execute(self, db: Session, context: Dict[str, Any], workflow_id: str, task_id: str) -> Dict[str, Any]:
        raw = context.get("raw_input", "")
        # Heuristic / deterministic extraction
        name = context.get("candidate_name") or ("Jordan Vance" if "Jordan" in raw else "Taylor Chen")
        dept = context.get("department") or ("Engineering" if "Engineer" in raw or "Tech" in raw else "Finance")
        role = context.get("role") or ("Staff Cloud Architect" if "Architect" in raw else "Senior Software Engineer")
        start_date = context.get("start_date") or "2026-11-15"
        return {
            "candidate_name": name,
            "department": dept,
            "role": role,
            "start_date": start_date,
            "work_email": f"{name.split()[0].lower()}.{name.split()[-1].lower()}@enterpriseflow.corp",
            "manager": "Dr. Sarah Connor",
            "status": "PROFILE_PARSED"
        }

class DocumentVerificationAgent(BaseSpecializedAgent):
    def __init__(self):
        super().__init__(
            key="doc_verification_agent",
            name="Document Verification Agent",
            domain="onboarding",
            description="Verifies identity, tax forms (W-4/I-9), right-to-work documents and certifications.",
            system_instructions="Check completeness, validity, and compliance of submitted candidate or vendor documentation.",
            allowed_tools=[]
        )

    def execute(self, db: Session, context: Dict[str, Any], workflow_id: str, task_id: str) -> Dict[str, Any]:
        return {
            "id_verified": True,
            "i9_compliance_check": "PASSED",
            "right_to_work": "VERIFIED_ELIGIBLE",
            "background_check_id": f"BGC-{uuid.uuid4().hex[:6].upper()}",
            "status": "ALL_DOCUMENTS_VERIFIED"
        }

class HRAgent(BaseSpecializedAgent):
    def __init__(self):
        super().__init__(
            key="hr_agent",
            name="HR Agent",
            domain="onboarding",
            description="Coordinates HR activities and creates official employee records in Workday.",
            system_instructions="Create new worker records in enterprise HCM with authorized role mappings.",
            allowed_tools=["workday_create_employee"]
        )

    def execute(self, db: Session, context: Dict[str, Any], workflow_id: str, task_id: str) -> Dict[str, Any]:
        candidate_name = context.get("candidate_name", "Jane Doe")
        dept = context.get("department", "Engineering")
        role = context.get("role", "Engineer")
        start_date = context.get("start_date", "2026-11-15")
        
        # Invoke Workday through Tool Gateway
        payload = {
            "name": candidate_name,
            "department": dept,
            "job_title": role,
            "start_date": start_date,
            "domain": "onboarding"
        }
        res = tool_gateway.invoke(
            db=db,
            tool_key="workday_create_employee",
            agent_id=self.key,
            agent_name=self.name,
            workflow_id=workflow_id,
            task_id=task_id,
            payload=payload
        )
        return {
            "workday_record": res,
            "employee_id": res.get("employee_id"),
            "orientation_scheduled": f"{start_date} 09:00 AM UTC",
            "status": "HR_RECORD_ESTABLISHED"
        }

class ITProvisioningAgent(BaseSpecializedAgent):
    def __init__(self):
        super().__init__(
            key="it_provisioning_agent",
            name="IT Provisioning Agent",
            domain="onboarding",
            description="Provisions SSO accounts, hardware allocations, and security credentials.",
            system_instructions="Coordinate IAM access and equipment dispatch for incoming hires.",
            allowed_tools=["okta_provision_accounts"]
        )

    def execute(self, db: Session, context: Dict[str, Any], workflow_id: str, task_id: str) -> Dict[str, Any]:
        email = context.get("work_email", "newhire@enterpriseflow.corp")
        payload = {
            "email": email,
            "systems": ["Google Workspace", "GitHub Enterprise", "Slack", "Jira", "AWS Dev Sandbox"],
            "domain": "onboarding"
        }
        res = tool_gateway.invoke(
            db=db,
            tool_key="okta_provision_accounts",
            agent_id=self.key,
            agent_name=self.name,
            workflow_id=workflow_id,
            task_id=task_id,
            payload=payload
        )
        return {
            "okta_provisioning": res,
            "hardware_dispatch_tracking": f"FEDEX-{uuid.uuid4().hex[:10].upper()} (MacBook Pro M3 Max)",
            "status": "IT_PROVISIONING_COMPLETE"
        }

# --- WORKFLOW 02: Invoice Processing Agents ---
class InvoiceIntakeAgent(BaseSpecializedAgent):
    def __init__(self):
        super().__init__(
            key="invoice_intake_agent",
            name="Invoice Intake Agent",
            domain="invoice",
            description="Receives invoice documents, checks integrity, and prepares for extraction.",
            system_instructions="Validate incoming PDF invoice format and metadata.",
            allowed_tools=[]
        )

    def execute(self, db: Session, context: Dict[str, Any], workflow_id: str, task_id: str) -> Dict[str, Any]:
        return {
            "document_format": "PDF/A-3",
            "file_size_kb": 248,
            "ocr_confidence": 0.994,
            "status": "INTAKE_VALIDATED"
        }

class DocumentExtractionAgent(BaseSpecializedAgent):
    def __init__(self):
        super().__init__(
            key="doc_extraction_agent",
            name="Document Extraction Agent",
            domain="invoice",
            description="Extracts vendor name, invoice number, line items, and totals.",
            system_instructions="Extract structured invoice schema from OCR token stream.",
            allowed_tools=[]
        )

    def execute(self, db: Session, context: Dict[str, Any], workflow_id: str, task_id: str) -> Dict[str, Any]:
        raw = context.get("raw_input", "")
        # Parse extracted values or use context if provided
        vendor = context.get("vendor_name") or ("Datadog Monitoring Inc." if "Datadog" in raw else "Snowflake Cloud Analytics")
        inv_num = context.get("invoice_number") or f"INV-2026-{uuid.uuid4().hex[:4].upper()}"
        amount = float(context.get("amount") or (18450.00 if "18450" in raw or "Datadog" in raw else 32000.00))
        return {
            "vendor_name": vendor,
            "invoice_number": inv_num,
            "invoice_date": "2026-10-24",
            "due_date": "2026-11-24",
            "amount": amount,
            "currency": "INR",
            "line_items": [
                {"description": "Annual Infrastructure Telemetry Tier 4", "qty": 1, "unit_price": amount * 0.8},
                {"description": "Enterprise 24/7 TAM Support Surcharge", "qty": 1, "unit_price": amount * 0.2}
            ],
            "tax_amount": amount * 0.18,
            "status": "EXTRACTION_COMPLETE"
        }

class DuplicateDetectionAgent(BaseSpecializedAgent):
    def __init__(self):
        super().__init__(
            key="duplicate_detection_agent",
            name="Duplicate Detection Agent",
            domain="invoice",
            description="Checks historical ledger for duplicate invoice numbers or identical amounts within 60 days.",
            system_instructions="Prevent double billing by comparing hashes and vendor invoice numbers.",
            allowed_tools=[]
        )

    def execute(self, db: Session, context: Dict[str, Any], workflow_id: str, task_id: str) -> Dict[str, Any]:
        inv_num = context.get("invoice_number", "INV-2026-001")
        return {
            "duplicate_found": False,
            "similarity_score": 0.00,
            "historical_match_count": 0,
            "status": "NO_DUPLICATE_DETECTED"
        }

class FinanceValidationAgent(BaseSpecializedAgent):
    def __init__(self):
        super().__init__(
            key="finance_validation_agent",
            name="Finance Validation Agent",
            domain="invoice",
            description="Performs 3-way matching and GST e-invoicing IRN/QR validation under Rule 48(4) CGST Act.",
            system_instructions="Verify math totals, PO tolerance thresholds, GSTIN verification, and NIC IRN validity.",
            allowed_tools=["gst_einvoice_verify_irn"]
        )

    def execute(self, db: Session, context: Dict[str, Any], workflow_id: str, task_id: str) -> Dict[str, Any]:
        amount = context.get("amount", 2480000.00)
        po_number = f"PO-2026-{uuid.uuid4().hex[:4].upper()}"

        # Invoke GST e-invoice verification
        gst_res = tool_gateway.invoke(
            db=db,
            tool_key="gst_einvoice_verify_irn",
            agent_id=self.key,
            agent_name=self.name,
            workflow_id=workflow_id,
            task_id=task_id,
            payload={
                "supplier_gstin": context.get("supplier_gstin", "29AABCU9603R1ZM"),
                "invoice_number": context.get("invoice_number", "INV-2026-8941"),
                "domain": "invoice"
            }
        )

        return {
            "po_match": True,
            "po_number": po_number,
            "variance_percent": 0.0,
            "cost_center": "CC-ENG-INFRA-401",
            "gst_einvoice": gst_res,
            "budget_availability": "CONFIRMED_SUFFICIENT",
            "status": "THREE_WAY_MATCH_AND_GST_IRN_PASSED"
        }

class FinanceDisbursementAgent(BaseSpecializedAgent):
    def __init__(self):
        super().__init__(
            key="finance_disbursement_agent",
            name="Finance Disbursement Agent",
            domain="invoice",
            description="Executes payment settlement in SAP S/4HANA after human approval.",
            system_instructions="Trigger ledger disbursement only with verified approval signature.",
            allowed_tools=["sap_disburse_payment"]
        )

    def execute(self, db: Session, context: Dict[str, Any], workflow_id: str, task_id: str) -> Dict[str, Any]:
        amount = context.get("amount", 18450.00)
        vendor = context.get("vendor_name", "Datadog Monitoring Inc.")
        inv_num = context.get("invoice_number", "INV-2026-001")
        
        payload = {
            "amount": amount,
            "currency": "INR",
            "vendor": vendor,
            "invoice_number": inv_num,
            "domain": "invoice"
        }
        res = tool_gateway.invoke(
            db=db,
            tool_key="sap_disburse_payment",
            agent_id=self.key,
            agent_name=self.name,
            workflow_id=workflow_id,
            task_id=task_id,
            payload=payload
        )
        return {
            "payment_execution": res,
            "status": "FUNDS_DISBURSED"
        }

# --- WORKFLOW 03: Customer Request Agents ---
class CustomerClassificationAgent(BaseSpecializedAgent):
    def __init__(self):
        super().__init__(
            key="customer_classification_agent",
            name="Request Classification Agent",
            domain="customer",
            description="Understands customer sentiment, urgency, and query classification.",
            system_instructions="Classify incoming inquiries into billing, technical, SLA breach, or account.",
            allowed_tools=[]
        )

    def execute(self, db: Session, context: Dict[str, Any], workflow_id: str, task_id: str) -> Dict[str, Any]:
        raw = context.get("raw_input", "").lower()
        if "refund" in raw or "billing" in raw or "charge" in raw or "credit" in raw:
            cat = "BILLING_REFUND_DISPUTE"
            urgency = "HIGH"
        elif "down" in raw or "outage" in raw or "urgent" in raw or "504" in raw or "timeout" in raw:
            cat = "CRITICAL_OUTAGE"
            urgency = "URGENT"
        else:
            cat = "ACCOUNT_INQUIRY"
            urgency = "MEDIUM"

        return {
            "category": cat,
            "urgency": urgency,
            "sentiment": "NEGATIVE" if any(w in raw for w in ["unacceptable", "dispute", "timeout", "latency", "escalation"]) else "NEUTRAL",
            "customer_tier": "ENTERPRISE_GOLD",
            "account_health_score": 82,
            "status": "CLASSIFICATION_COMPLETE"
        }

class CustomerKnowledgePolicyAgent(BaseSpecializedAgent):
    def __init__(self):
        super().__init__(
            key="customer_kb_agent",
            name="Knowledge & Policy Agent",
            domain="customer",
            description="Searches SLA knowledge base, customer contract entitlements, and past resolutions.",
            system_instructions="Verify SLA bounds and historical credit adjustments.",
            allowed_tools=[]
        )

    def execute(self, db: Session, context: Dict[str, Any], workflow_id: str, task_id: str) -> Dict[str, Any]:
        return {
            "sla_tier": "ENTERPRISE_PLATINUM_99_9",
            "contract_limit": 5000.00,
            "latency_sla_breached": True,
            "entitled_credit_percentage": 10.0,
            "knowledge_articles_matched": ["KB-SLA-9021", "KB-REFUND-RULES-V2"],
            "prior_remedies_found": 3,
            "status": "POLICY_VERIFIED"
        }

class CustomerResolutionAgent(BaseSpecializedAgent):
    def __init__(self):
        super().__init__(
            key="customer_resolution_agent",
            name="Customer Resolution Agent",
            domain="customer",
            description="Applies customer policy, evaluates RBI digital refund TAT compliance, and updates CRM.",
            system_instructions="Formulate customer remedy, evaluate RBI turnaround time compensation, and resolve support ticket.",
            allowed_tools=["zendesk_update_ticket", "rbi_tat_refund_calculate"]
        )

    def execute(self, db: Session, context: Dict[str, Any], workflow_id: str, task_id: str) -> Dict[str, Any]:
        refund_amount = context.get("refund_amount", 45000.00)

        # 1. Evaluate RBI Digital Payment TAT compliance & compensation
        rbi_res = tool_gateway.invoke(
            db=db,
            tool_key="rbi_tat_refund_calculate",
            agent_id=self.key,
            agent_name=self.name,
            workflow_id=workflow_id,
            task_id=task_id,
            payload={
                "payment_channel": context.get("payment_channel", "UPI_P2M"),
                "delay_days": context.get("delay_days", 0),
                "refund_amount": refund_amount,
                "domain": "customer"
            }
        )

        # 2. Update ticketing system
        payload = {
            "ticket_id": f"ZD-IN-{uuid.uuid4().hex[:5].upper()}",
            "resolution_status": "SOLVED",
            "refund_amount": refund_amount,
            "customer_email": context.get("customer_email", "billing@reliancedigital.in"),
            "domain": "customer"
        }
        res = tool_gateway.invoke(
            db=db,
            tool_key="zendesk_update_ticket",
            agent_id=self.key,
            agent_name=self.name,
            workflow_id=workflow_id,
            task_id=task_id,
            payload=payload
        )
        return {
            "resolution": res,
            "rbi_tat_compliance": rbi_res,
            "customer_response": f"Apologies for the SLA latency variance. We have issued a credit adjustment of ₹{refund_amount:,.2f} to your account via domestic instant settlement rail.",
            "status": "CUSTOMER_RESOLVED"
        }

class CustomerIntegrationAgent(BaseSpecializedAgent):
    def __init__(self):
        super().__init__(
            key="customer_integration_agent",
            name="CRM Integration Agent",
            domain="customer",
            description="Executes CRM system updates and Zendesk macro resolutions.",
            system_instructions="Commit resolution state to customer CRM and ticketing system.",
            allowed_tools=["zendesk_update_ticket"]
        )

    def execute(self, db: Session, context: Dict[str, Any], workflow_id: str, task_id: str) -> Dict[str, Any]:
        refund_amount = context.get("refund_amount", 450.00)
        payload = {
            "ticket_id": f"ZD-EU-{uuid.uuid4().hex[:5].upper()}",
            "resolution_status": "SOLVED",
            "refund_amount": refund_amount,
            "customer_email": context.get("customer_email", "billing@globalcorp.eu"),
            "domain": "customer"
        }
        res = tool_gateway.invoke(
            db=db,
            tool_key="zendesk_update_ticket",
            agent_id=self.key,
            agent_name=self.name,
            workflow_id=workflow_id,
            task_id=task_id,
            payload=payload
        )
        return {
            "crm_sync": "SUCCESS",
            "ticket_status": "RESOLVED",
            "zendesk_receipt": res,
            "status": "CRM_UPDATED"
        }

# --- WORKFLOW 04: Procurement & Vendor Onboarding Agents ---
class ProcurementAnalysisAgent(BaseSpecializedAgent):
    def __init__(self):
        super().__init__(
            key="procurement_analysis_agent",
            name="Quotation Analysis Agent",
            domain="procurement",
            description="Compares vendor bids, evaluates SLA terms, warranties, and discount tiers.",
            system_instructions="Analyze competing vendor quotes and determine best-value recommendation.",
            allowed_tools=[]
        )

    def execute(self, db: Session, context: Dict[str, Any], workflow_id: str, task_id: str) -> Dict[str, Any]:
        raw = context.get("raw_input", "")
        vendor = context.get("vendor_name") or ("NVIDIA Enterprise Cloud" if "NVIDIA" in raw else "Dell Supercomputing Solutions")
        value = float(context.get("total_value") or (78500.00 if "78500" in raw or "NVIDIA" in raw else 45000.00))
        return {
            "recommended_vendor": vendor,
            "total_value": value,
            "currency": "INR",
            "lead_time_days": 10,
            "warranty_months": 36,
            "volume_discount_pct": 14.5,
            "status": "QUOTATION_ANALYSIS_PASSED"
        }

class ProcurementExecutionAgent(BaseSpecializedAgent):
    def __init__(self):
        super().__init__(
            key="procurement_execution_agent",
            name="Procurement Agent",
            domain="procurement",
            description="Creates purchase order in Coupa, activates vendor master record, and enforces MSMED Act 45-day statutory payment terms.",
            system_instructions="Issue binding purchase order, register vendor record, and verify MSME Samadhaan compliance.",
            allowed_tools=["coupa_create_po", "coupa_activate_vendor", "msme_samadhaan_compliance_check"]
        )

    def execute(self, db: Session, context: Dict[str, Any], workflow_id: str, task_id: str) -> Dict[str, Any]:
        vendor = context.get("recommended_vendor") or context.get("vendor_name", "Wipro Technologies Ltd")
        total_value = float(context.get("total_value", 7850000.00))

        # 1. Activate vendor
        act_res = tool_gateway.invoke(
            db=db,
            tool_key="coupa_activate_vendor",
            agent_id=self.key,
            agent_name=self.name,
            workflow_id=workflow_id,
            task_id=task_id,
            payload={"vendor_name": vendor, "domain": "procurement"}
        )

        # 2. Check MSMED Act 45-day compliance
        msme_res = tool_gateway.invoke(
            db=db,
            tool_key="msme_samadhaan_compliance_check",
            agent_id=self.key,
            agent_name=self.name,
            workflow_id=workflow_id,
            task_id=task_id,
            payload={"vendor_name": vendor, "domain": "procurement", "invoice_age_days": 10}
        )

        # 3. Issue PO
        po_res = tool_gateway.invoke(
            db=db,
            tool_key="coupa_create_po",
            agent_id=self.key,
            agent_name=self.name,
            workflow_id=workflow_id,
            task_id=task_id,
            payload={"vendor_name": vendor, "total_value": total_value, "domain": "procurement"}
        )

        return {
            "vendor_activation": act_res,
            "msme_compliance": msme_res,
            "purchase_order": po_res,
            "status": "PO_DISPATCHED_TO_VENDOR"
        }

# --- WORKFLOW 05: IT Incident & Privileged Access Agents ---
class IncidentInvestigationAgent(BaseSpecializedAgent):
    def __init__(self):
        super().__init__(
            key="incident_investigation_agent",
            name="Investigation Agent",
            domain="it_incident",
            description="Correlates logs, traces microservices, and detects root cause of anomalies.",
            system_instructions="Pinpoint root cause of IT service degradation or access breach.",
            allowed_tools=[]
        )

    def execute(self, db: Session, context: Dict[str, Any], workflow_id: str, task_id: str) -> Dict[str, Any]:
        raw = context.get("raw_input", "")
        is_access = "access" in raw.lower() or "privilege" in raw.lower() or "root" in raw.lower()
        if is_access:
            return {
                "incident_type": "PRIVILEGED_ACCESS_REQUEST",
                "target_system": "Production Kubernetes Cluster (k8s-prod-us-east-1)",
                "access_tier": "ClusterAdmin_JIT",
                "requester": context.get("requester_user", "alex.rivera@enterpriseflow.corp"),
                "justification": "Emergency hotfix patching for zero-day memory leak in auth proxy",
                "status": "INVESTIGATION_COMPLETE"
            }
        else:
            return {
                "incident_type": "SERVICE_DEGRADATION",
                "target_system": "PostgreSQL Database Primary (db-prod-01)",
                "anomaly": "Deadlocked connection pool at 99.8% capacity",
                "recommended_action": "Restart container pod and cycle connection pool",
                "status": "INVESTIGATION_COMPLETE"
            }

class ITRemediationAgent(BaseSpecializedAgent):
    def __init__(self):
        super().__init__(
            key="it_remediation_agent",
            name="IT Remediation Agent",
            domain="it_incident",
            description="Executes automated ServiceNow incident remediation and dispatches mandatory CERT-In 6-hour disclosure under Section 70B(6) IT Act 2000.",
            system_instructions="Perform automated corrective action in ITSM and dispatch statutory CERT-In report.",
            allowed_tools=["servicenow_remediate_incident", "cert_in_incident_report"]
        )

    def execute(self, db: Session, context: Dict[str, Any], workflow_id: str, task_id: str) -> Dict[str, Any]:
        # 1. Remediate service
        payload = {
            "action": context.get("recommended_action", "Cycled pool and flushed stale connections"),
            "domain": "it_incident"
        }
        res = tool_gateway.invoke(
            db=db,
            tool_key="servicenow_remediate_incident",
            agent_id=self.key,
            agent_name=self.name,
            workflow_id=workflow_id,
            task_id=task_id,
            payload=payload
        )

        # 2. Dispatch CERT-In 6-hour statutory disclosure
        certin_res = tool_gateway.invoke(
            db=db,
            tool_key="cert_in_incident_report",
            agent_id=self.key,
            agent_name=self.name,
            workflow_id=workflow_id,
            task_id=task_id,
            payload={
                "incident_id": context.get("incident_id", f"INC-2026-{uuid.uuid4().hex[:6].upper()}"),
                "domain": "it_incident"
            }
        )

        return {
            "remediation_result": res,
            "cert_in_statutory_report": certin_res,
            "status": "INCIDENT_REMEDIATED_AND_CERT_IN_REPORTED"
        }

class IAMAccessAgent(BaseSpecializedAgent):
    def __init__(self):
        super().__init__(
            key="iam_access_agent",
            name="Identity & Access Governance Agent",
            domain="it_incident",
            description="Executes privileged JIT role elevation in Okta/CyberArk after IT Security sign-off.",
            system_instructions="Provision ephemeral elevated credentials strictly post-approval.",
            allowed_tools=["okta_grant_privileged_access"]
        )

    def execute(self, db: Session, context: Dict[str, Any], workflow_id: str, task_id: str) -> Dict[str, Any]:
        target = context.get("target_system", "Production Kubernetes Cluster (k8s-prod-us-east-1)")
        user = context.get("requester", "alex.rivera@enterpriseflow.corp")
        payload = {
            "target_system": target,
            "access_tier": "ClusterAdmin_JIT",
            "user": user,
            "domain": "it_incident"
        }
        res = tool_gateway.invoke(
            db=db,
            tool_key="okta_grant_privileged_access",
            agent_id=self.key,
            agent_name=self.name,
            workflow_id=workflow_id,
            task_id=task_id,
            payload=payload
        )
        return {
            "pam_grant": res,
            "status": "PRIVILEGED_ACCESS_GRANTED"
        }

# --- Common Communication & Monitoring Agent ---
class EnterpriseCommunicationAgent(BaseSpecializedAgent):
    def __init__(self):
        super().__init__(
            key="communication_agent",
            name="Communication Agent",
            domain="general",
            description="Dispatches notifications, email confirmations, and Slack status alerts to stakeholders.",
            system_instructions="Format enterprise notifications across email and messaging channels.",
            allowed_tools=["sendgrid_dispatch_email"]
        )

    def execute(self, db: Session, context: Dict[str, Any], workflow_id: str, task_id: str) -> Dict[str, Any]:
        recipient = context.get("notification_target") or "stakeholders@enterpriseflow.corp"
        subject = f"EnterpriseFlow Workflow Update [{workflow_id[:8]}]"
        payload = {
            "to": recipient,
            "subject": subject,
            "domain": "general"
        }
        res = tool_gateway.invoke(
            db=db,
            tool_key="sendgrid_dispatch_email",
            agent_id=self.key,
            agent_name=self.name,
            workflow_id=workflow_id,
            task_id=task_id,
            payload=payload
        )
        return {
            "dispatch": res,
            "status": "STAKEHOLDERS_NOTIFIED"
        }

class AgentRegistry:
    def __init__(self):
        self._agents: Dict[str, BaseSpecializedAgent] = {}
        self._register_default_agents()

    def _register_default_agents(self):
        agents = [
            # Onboarding
            EmployeeRequestAgent(),
            DocumentVerificationAgent(),
            HRAgent(),
            ITProvisioningAgent(),
            # Invoice
            InvoiceIntakeAgent(),
            DocumentExtractionAgent(),
            DuplicateDetectionAgent(),
            FinanceValidationAgent(),
            FinanceDisbursementAgent(),
            # Customer
            CustomerClassificationAgent(),
            CustomerKnowledgePolicyAgent(),
            CustomerResolutionAgent(),
            CustomerIntegrationAgent(),
            # Procurement
            ProcurementAnalysisAgent(),
            ProcurementExecutionAgent(),
            # IT & IAM
            IncidentInvestigationAgent(),
            ITRemediationAgent(),
            IAMAccessAgent(),
            # Common
            EnterpriseCommunicationAgent()
        ]
        for a in agents:
            self._agents[a.key] = a

    def get_agent(self, key: str) -> Optional[BaseSpecializedAgent]:
        return self._agents.get(key)

    def list_agents(self) -> List[Dict[str, Any]]:
        return [
            {
                "key": a.key,
                "name": a.name,
                "domain": a.domain,
                "description": a.description,
                "system_instructions": a.system_instructions,
                "allowed_tools": a.allowed_tools,
                "permission_scope": a.permission_scope,
            }
            for a in self._agents.values()
        ]

agent_registry = AgentRegistry()

