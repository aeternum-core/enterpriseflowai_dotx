import time
import uuid
from typing import Dict, Any, Optional
from app.recovery.chaos_engine import chaos_engine

class MockEnterpriseIntegrations:
    """
    Realistic simulated enterprise API clients with active Chaos Injection hooks.
    All calls explicitly state 'SIMULATED / MOCK' in their response payloads,
    tracking synthetic IDs, timestamps, and realistic enterprise data.
    """

    # --- HR Integration (Workday / BambooHR) ---
    @staticmethod
    def workday_create_employee(data: Dict[str, Any], worker_role: str = "BUSINESS_OPERATIONS_WORKER") -> Dict[str, Any]:
        # Check active chaos fault injection
        fault = chaos_engine.check_and_inject("workday", worker_role)
        if fault and not data.get("_recovering"):
            raise RuntimeError(f"CHAOS_INJECTED: {fault['error']} - {fault['message']}")

        return {
            "status": "SUCCESS",
            "service": "Mock Workday Human Capital Management API v40.0",
            "is_simulated": True,
            "employee_id": f"EMP-{uuid.uuid4().hex[:6].upper()}",
            "full_name": data.get("name", "Jane Doe"),
            "work_email": f"{data.get('first_name', 'user').lower()}.{data.get('last_name', 'doe').lower()}@enterpriseflow.corp",
            "department": data.get("department", "Engineering"),
            "job_title": data.get("job_title", "Senior Software Engineer"),
            "start_date": data.get("start_date", "2026-11-15"),
            "workday_record_url": f"https://impl.workday.com/enterpriseflow/worker/{uuid.uuid4().hex[:8]}"
        }

    # --- IAM Integration (Okta / Active Directory) ---
    @staticmethod
    def okta_provision_accounts(data: Dict[str, Any], worker_role: str = "IT_AND_INTEGRATION_WORKER") -> Dict[str, Any]:
        # Check active chaos fault injection (e.g. 409 username collision)
        fault = chaos_engine.check_and_inject("okta", worker_role)
        if fault and not data.get("_recovering"):
            raise RuntimeError(f"CHAOS_INJECTED: {fault['error']} - {fault['message']}")

        systems = data.get("systems", ["Google Workspace", "GitHub Enterprise", "Slack", "Jira"])
        accounts = []
        for sys in systems:
            accounts.append({
                "system": sys,
                "provisioned": True,
                "provisioning_id": f"OKTA-PROV-{uuid.uuid4().hex[:8].upper()}",
                "role_assigned": "Standard User"
            })
        return {
            "status": "SUCCESS",
            "service": "Mock Okta Identity Cloud API v2",
            "is_simulated": True,
            "user_sso_id": f"00u{uuid.uuid4().hex[:12]}",
            "accounts": accounts,
            "mfa_enforced": True
        }

    @staticmethod
    def okta_grant_privileged_access(data: Dict[str, Any], worker_role: str = "IT_AND_INTEGRATION_WORKER") -> Dict[str, Any]:
        """HIGH RISK OPERATION: Requires prior Human Authorization"""
        fault = chaos_engine.check_and_inject("okta", worker_role)
        if fault and not data.get("_recovering"):
            raise RuntimeError(f"CHAOS_INJECTED: {fault['error']} - {fault['message']}")

        return {
            "status": "SUCCESS",
            "service": "Mock Okta Privileged Access (PAM) API",
            "is_simulated": True,
            "grant_id": f"PAM-GRANT-{uuid.uuid4().hex[:8].upper()}",
            "target_system": data.get("target_system", "Production Kubernetes Cluster (k8s-prod-us-east-1)"),
            "access_tier": data.get("access_tier", "ClusterAdmin_JIT"),
            "granted_to": data.get("user", "ops_admin@enterpriseflow.corp"),
            "valid_until": "4 Hours (Ephemeral JIT Access)",
            "audit_vault_id": f"CYBERARK-VAULT-{uuid.uuid4().hex[:6].upper()}"
        }

    # --- Finance Integration (SAP S/4HANA / Stripe) ---
    @staticmethod
    def sap_disburse_payment(data: Dict[str, Any], worker_role: str = "BUSINESS_OPERATIONS_WORKER") -> Dict[str, Any]:
        """CRITICAL RISK OPERATION: Requires Finance Director Authorization"""
        fault = chaos_engine.check_and_inject("sap", worker_role)
        if fault and not data.get("_recovering"):
            raise RuntimeError(f"CHAOS_INJECTED: {fault['error']} - {fault['message']}")

        amount = data.get("amount", 0.0)
        currency = data.get("currency", "INR")
        vendor = data.get("vendor", "Tata Communications Ltd")
        invoice_num = data.get("invoice_number", "INV-2026-001")
        return {
            "status": "EXECUTED",
            "service": "Mock SAP S/4HANA & RazorpayX Corporate Payouts (Simulated)",
            "is_simulated": True,
            "disbursement_id": f"SAP-PAY-{uuid.uuid4().hex[:10].upper()}",
            "transaction_reference": f"RTGS-IN-{uuid.uuid4().hex[:8].upper()}",
            "cleared_amount": amount,
            "currency": currency,
            "vendor_name": vendor,
            "invoice_number": invoice_num,
            "ledger_account": "21000-Accounts-Payable-INR",
            "settlement_date": "Instant Settlement (RBI RTGS / NEFT Commercial Rail)"
        }

    # --- Customer Support Integration (Zendesk / Salesforce) ---
    @staticmethod
    def zendesk_update_ticket(data: Dict[str, Any], worker_role: str = "BUSINESS_OPERATIONS_WORKER") -> Dict[str, Any]:
        fault = chaos_engine.check_and_inject("zendesk", worker_role)
        if fault and not data.get("_recovering"):
            raise RuntimeError(f"CHAOS_INJECTED: {fault['error']} - {fault['message']}")

        return {
            "status": "SUCCESS",
            "service": "Mock Zendesk Support REST API v2",
            "is_simulated": True,
            "ticket_id": data.get("ticket_id", f"ZD-{uuid.uuid4().hex[:5].upper()}"),
            "resolution_status": data.get("resolution_status", "SOLVED"),
            "macro_applied": "Autonomous_Agent_Refund_And_Notification",
            "customer_email": data.get("customer_email", "customer@client.com")
        }

    # --- Procurement Integration (Coupa / NetSuite) ---
    @staticmethod
    def coupa_create_po(data: Dict[str, Any], worker_role: str = "BUSINESS_OPERATIONS_WORKER") -> Dict[str, Any]:
        """HIGH RISK OPERATION: Requires Procurement Manager Authorization"""
        fault = chaos_engine.check_and_inject("coupa", worker_role)
        if fault and not data.get("_recovering"):
            raise RuntimeError(f"CHAOS_INJECTED: {fault['error']} - {fault['message']}")

        return {
            "status": "ISSUED",
            "service": "Mock Coupa Enterprise Procurement Cloud API (Simulated)",
            "is_simulated": True,
            "po_number": f"PO-2026-{uuid.uuid4().hex[:6].upper()}",
            "vendor_name": data.get("vendor_name", "Datacenter Corp"),
            "items_count": len(data.get("line_items", [1])),
            "total_contract_value": data.get("total_value", 45000.00),
            "approval_hash_attached": True
        }

    @staticmethod
    def coupa_activate_vendor(data: Dict[str, Any], worker_role: str = "BUSINESS_OPERATIONS_WORKER") -> Dict[str, Any]:
        fault = chaos_engine.check_and_inject("coupa", worker_role)
        if fault and not data.get("_recovering"):
            raise RuntimeError(f"CHAOS_INJECTED: {fault['error']} - {fault['message']}")

        return {
            "status": "ACTIVE",
            "service": "Mock Coupa Master Vendor Record API",
            "is_simulated": True,
            "vendor_id": f"VND-{uuid.uuid4().hex[:6].upper()}",
            "vendor_name": data.get("vendor_name", "New Vendor Inc"),
            "tax_id_verified": True,
            "sanctions_check": "CLEARED (OFAC / WorldCheck Compliant)"
        }

    # --- ITSM Integration (ServiceNow) ---
    @staticmethod
    def servicenow_remediate_incident(data: Dict[str, Any], worker_role: str = "IT_AND_INTEGRATION_WORKER") -> Dict[str, Any]:
        fault = chaos_engine.check_and_inject("servicenow", worker_role)
        if fault and not data.get("_recovering"):
            raise RuntimeError(f"CHAOS_INJECTED: {fault['error']} - {fault['message']}")

        return {
            "status": "RESOLVED",
            "service": "Mock ServiceNow IT Service Management Table API",
            "is_simulated": True,
            "incident_number": data.get("incident_number", f"INC{uuid.uuid4().hex[:7].upper()}"),
            "remediation_action": data.get("action", "Restarted pod cluster and purged deadlocked connection pool"),
            "mttr_minutes": 14.2,
            "postmortem_ticket": f"PRB{uuid.uuid4().hex[:6].upper()}"
        }

    # --- Notification Gateway (SendGrid / Slack) ---
    @staticmethod
    def sendgrid_dispatch_email(data: Dict[str, Any], worker_role: str = "IT_AND_INTEGRATION_WORKER") -> Dict[str, Any]:
        fault = chaos_engine.check_and_inject("sendgrid", worker_role)
        if fault and not data.get("_recovering"):
            raise RuntimeError(f"CHAOS_INJECTED: {fault['error']} - {fault['message']}")

        return {
            "status": "DELIVERED",
            "service": "Mock SendGrid Enterprise Mail Gateway",
            "is_simulated": True,
            "message_id": f"SG.{uuid.uuid4().hex[:16]}",
            "to": data.get("to", "user@enterpriseflow.corp"),
            "subject": data.get("subject", "EnterpriseFlow Notification")
        }

    # --- INDIAN REGULATORY COMPLIANCE TOOLS (Five Enterprise Domains) ---

    # Domain 02: GST E-Invoice & IRN Portal Verification
    @staticmethod
    def gst_einvoice_verify_irn(data: Dict[str, Any], worker_role: str = "BUSINESS_OPERATIONS_WORKER") -> Dict[str, Any]:
        """Validates 64-character IRN and QR code digest under Rule 48(4) CGST Act via National Informatics Centre (NIC)"""
        fault = chaos_engine.check_and_inject("gst", worker_role)
        if fault and not data.get("_recovering"):
            raise RuntimeError(f"CHAOS_INJECTED: {fault['error']} - {fault['message']}")

        gstin = data.get("supplier_gstin", "29AABCU9603R1ZM")
        inv_num = data.get("invoice_number", "INV-2026-8941")
        irn = data.get("irn") or f"{uuid.uuid4().hex}{uuid.uuid4().hex}" # 64-char hash
        return {
            "status": "VERIFIED_ACTIVE",
            "service": "Mock GST e-Invoice System (NIC / GSTN Portal)",
            "is_simulated": True,
            "irn": irn,
            "supplier_gstin": gstin,
            "recipient_gstin": data.get("recipient_gstin", "29AAACE2233R1Z7"),
            "invoice_number": inv_num,
            "signed_qr_verified": True,
            "itc_eligible": True,
            "hsn_sac_code": data.get("hsn_code", "998313"),
            "digital_signature": "Valid (NIC E-Invoice Sub-CA 2026)",
            "statutory_compliance": "CGST Rule 48(4) Fully Compliant"
        }

    # Domain 04: MSME Samadhaan 45-Day Payment Statutory Rule
    @staticmethod
    def msme_samadhaan_compliance_check(data: Dict[str, Any], worker_role: str = "BUSINESS_OPERATIONS_WORKER") -> Dict[str, Any]:
        """Enforces Section 15 (45-Day Cap) & Section 16 (3x RBI Bank Rate Compound Interest) under MSMED Act 2006"""
        fault = chaos_engine.check_and_inject("msme", worker_role)
        if fault and not data.get("_recovering"):
            raise RuntimeError(f"CHAOS_INJECTED: {fault['error']} - {fault['message']}")

        vendor_name = data.get("vendor_name", "Wipro Technologies Ltd")
        udyam_reg = data.get("udyam_reg", f"UDYAM-KR-03-00{uuid.uuid4().hex[:5].upper()}")
        invoice_age_days = int(data.get("invoice_age_days", 14))
        is_delayed = invoice_age_days > 45

        return {
            "status": "COMPLIANCE_EVALUATED",
            "service": "Mock MSME Samadhaan Statutory Monitor (MSMED Act 2006)",
            "is_simulated": True,
            "vendor_name": vendor_name,
            "udyam_registration": udyam_reg,
            "enterprise_category": "Medium Enterprise",
            "statutory_payment_limit_days": 45,
            "current_invoice_age_days": invoice_age_days,
            "is_within_section_15_cap": not is_delayed,
            "section_16_interest_penalty_due": 0.0 if not is_delayed else 14500.0,
            "income_tax_43b_h_status": "DEDUCTION_ALLOWED" if not is_delayed else "DISALLOWED_FOR_CURRENT_FY"
        }

    # Domain 03: RBI Digital Payment Turnaround Time (TAT) & Suo Motu Refund Compensation
    @staticmethod
    def rbi_tat_refund_calculate(data: Dict[str, Any], worker_role: str = "BUSINESS_OPERATIONS_WORKER") -> Dict[str, Any]:
        """Calculates T+1 / T+5 refund turnaround and automatic ₹100/day compensation under RBI Harmonisation Circular"""
        fault = chaos_engine.check_and_inject("rbi", worker_role)
        if fault and not data.get("_recovering"):
            raise RuntimeError(f"CHAOS_INJECTED: {fault['error']} - {fault['message']}")

        channel = data.get("payment_channel", "UPI_P2M")
        delay_days = int(data.get("delay_days", 0))
        principal_refund = float(data.get("refund_amount", 45000.0))
        rbi_mandated_tat = "T+1 Day" if channel in ["UPI_P2P", "IMPS"] else "T+5 Days"
        penalty_compensation = max(0, delay_days) * 100.0 # ₹100/day delay compensation

        return {
            "status": "TAT_CALCULATED",
            "service": "Mock RBI Harmonisation of TAT Engine (DPSS.CO.PD No.629)",
            "is_simulated": True,
            "payment_channel": channel,
            "mandated_tat": rbi_mandated_tat,
            "principal_refund_amount_inr": principal_refund,
            "delay_beyond_tat_days": delay_days,
            "suo_motu_compensation_inr": penalty_compensation,
            "total_payout_inr": principal_refund + penalty_compensation,
            "regulatory_basis": "RBI Circular DPSS.CO.PD No.629/02.01.014/2019-20"
        }

    # Domain 05: CERT-In Mandatory 6-Hour Cyber Incident Report
    @staticmethod
    def cert_in_incident_report(data: Dict[str, Any], worker_role: str = "IT_AND_INTEGRATION_WORKER") -> Dict[str, Any]:
        """Dispatches mandatory 6-hour cybersecurity incident report under Section 70B(6) IT Act 2000 to CERT-In"""
        fault = chaos_engine.check_and_inject("certin", worker_role)
        if fault and not data.get("_recovering"):
            raise RuntimeError(f"CHAOS_INJECTED: {fault['error']} - {fault['message']}")

        inc_id = data.get("incident_id", f"INC-2026-{uuid.uuid4().hex[:6].upper()}")
        return {
            "status": "DISPATCHED_TO_CERT_IN",
            "service": "Mock Indian Computer Emergency Response Team (CERT-In) Reporting Bridge",
            "is_simulated": True,
            "incident_id": inc_id,
            "cert_in_ticket": f"CERTIN-IND-{uuid.uuid4().hex[:8].upper()}",
            "submission_window": "Reported within mandatory 6-hour window",
            "designated_poc": "Chief Information Security Officer (CISO India)",
            "ict_log_retention_status": "180-Day Rolling Logs Stored in Indian DC Jurisdiction (Compliant)",
            "ntp_clock_sync": "Synchronized to NIC/NPL Time Server (Compliant)",
            "statutory_mandate": "Directions under Section 70B(6) Information Technology Act, 2000"
        }

mock_integrations = MockEnterpriseIntegrations()


