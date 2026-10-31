import uuid
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.user import Department, Role, User, Permission
from app.models.tool import ToolRegistry
from app.models.approval import ApprovalPolicy, ApprovalRequest, ApprovalHistory, ApprovalComment
from app.models.workflow import Workflow, WorkflowTask, WorkflowContext
from app.models.agent import Agent
from app.services.agent_registry import agent_registry
from app.services.audit_service import audit_service

def seed_database(db: Session):
    # Only seed if users table is empty
    if db.query(User).first():
        return

    # 1. Departments
    depts = [
        Department(id="dept_fin", name="Finance & Treasury", code="FIN"),
        Department(id="dept_it", name="Information Technology & Security", code="IT_SEC"),
        Department(id="dept_hr", name="People Operations & HR", code="HR"),
        Department(id="dept_proc", name="Global Procurement", code="PROC"),
        Department(id="dept_cust", name="Customer Experience & Support", code="CX"),
    ]
    for d in depts:
        db.add(d)
    db.commit()

    # 2. Roles
    roles = [
        Role(id="role_fin_dir", name="Finance Director", description="Authorizes corporate payments & treasury wires"),
        Role(id="role_it_admin", name="IT Security Admin", description="Authorizes privileged access and IAM elevations"),
        Role(id="role_hr_dir", name="HR Director", description="Authorizes executive onboarding and sensitive HR actions"),
        Role(id="role_proc_mgr", name="Procurement Manager", description="Authorizes vendor activations and purchase orders"),
        Role(id="role_supp_mgr", name="Support Manager", description="Authorizes customer refund exceptions"),
        Role(id="role_vp", name="VP Finance", description="Authorizes critical transactions above ₹25 Lakhs"),
        Role(id="role_emp", name="Senior Software Engineer", description="Standard business user / requester"),
    ]
    for r in roles:
        db.add(r)
    db.commit()

    # 3. Users (Persona switchable in UI)
    users = [
        User(
            id="user_sarah_lin",
            email="sarah.lin@enterpriseflow.corp",
            full_name="Sarah Lin",
            department_id="dept_fin",
            avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"
        ),
        User(
            id="user_alex_rivera",
            email="alex.rivera@enterpriseflow.corp",
            full_name="Alex Rivera",
            department_id="dept_it",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
        ),
        User(
            id="user_elena_vance",
            email="elena.vance@enterpriseflow.corp",
            full_name="Elena Vance",
            department_id="dept_hr",
            avatar_url="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150"
        ),
        User(
            id="user_marcus_brody",
            email="marcus.brody@enterpriseflow.corp",
            full_name="Marcus Brody",
            department_id="dept_proc",
            avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
        ),
        User(
            id="user_david_chen",
            email="david.chen@enterpriseflow.corp",
            full_name="David Chen",
            department_id="dept_it",
            avatar_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
        )
    ]
    for u in users:
        db.add(u)
    db.commit()

    # Link roles to users
    user_map = {u.id: u for u in users}
    role_map = {r.id: r for r in roles}
    user_map["user_sarah_lin"].roles.extend([role_map["role_fin_dir"], role_map["role_vp"]])
    user_map["user_alex_rivera"].roles.append(role_map["role_it_admin"])
    user_map["user_elena_vance"].roles.append(role_map["role_hr_dir"])
    user_map["user_marcus_brody"].roles.append(role_map["role_proc_mgr"])
    user_map["user_david_chen"].roles.append(role_map["role_emp"])
    db.commit()

    # 4. Registered Tools
    tools = [
        ToolRegistry(
            key="sap_disburse_payment",
            name="SAP S/4HANA Disbursement Service",
            category="Finance",
            description="Executes automated ACH/SWIFT payment wires from corporate treasury.",
            risk_level="CRITICAL",
            requires_approval=True,
            is_simulated=True,
            mock_service_name="Mock SAP S/4HANA Finance API v2026",
            idempotent=False
        ),
        ToolRegistry(
            key="okta_grant_privileged_access",
            name="Okta / CyberArk PAM Elevation",
            category="IT_IAM",
            description="Grants temporary JIT root/cluster-admin tokens to production infrastructure.",
            risk_level="CRITICAL",
            requires_approval=True,
            is_simulated=True,
            mock_service_name="Mock Okta Privileged Access API",
            idempotent=True
        ),
        ToolRegistry(
            key="coupa_create_po",
            name="Coupa Enterprise Purchase Order Service",
            category="Procurement",
            description="Generates binding purchase order documents and commits department budget.",
            risk_level="HIGH",
            requires_approval=True,
            is_simulated=True,
            mock_service_name="Mock Coupa Cloud API",
            idempotent=False
        ),
        ToolRegistry(
            key="coupa_activate_vendor",
            name="Coupa Master Vendor Record Activation",
            category="Procurement",
            description="Activates supplier in enterprise master data with verified tax and OFAC check.",
            risk_level="HIGH",
            requires_approval=True,
            is_simulated=True,
            mock_service_name="Mock Coupa Master Vendor Record API",
            idempotent=True
        ),
        ToolRegistry(
            key="workday_create_employee",
            name="Workday HCM Worker Creation",
            category="HR",
            description="Provisions employee profile, cost center, and compensation band in Workday.",
            risk_level="LOW",
            requires_approval=False,
            is_simulated=True,
            mock_service_name="Mock Workday REST API v40.0",
            idempotent=True
        ),
        ToolRegistry(
            key="okta_provision_accounts",
            name="Okta Identity Standard Provisioning",
            category="IT_IAM",
            description="Provisions standard enterprise email, Slack, GitHub and productivity tools.",
            risk_level="LOW",
            requires_approval=False,
            is_simulated=True,
            mock_service_name="Mock Okta Core IAM API",
            idempotent=True
        ),
        ToolRegistry(
            key="servicenow_remediate_incident",
            name="ServiceNow ITSM Table Remediation",
            category="ITSM",
            description="Applies automated microservice restarts and logs incident resolution.",
            risk_level="LOW",
            requires_approval=False,
            is_simulated=True,
            mock_service_name="Mock ServiceNow Table API",
            idempotent=True
        ),
        ToolRegistry(
            key="zendesk_update_ticket",
            name="Zendesk Support Ticket Macro",
            category="Support",
            description="Applies customer remedy macro and updates resolution status.",
            risk_level="LOW",
            requires_approval=False,
            is_simulated=True,
            mock_service_name="Mock Zendesk Support REST API",
            idempotent=True
        ),
        ToolRegistry(
            key="sendgrid_dispatch_email",
            name="SendGrid Mail Gateway",
            category="Notification",
            description="Delivers transactional audit notifications and executive alerts.",
            risk_level="LOW",
            requires_approval=False,
            is_simulated=True,
            mock_service_name="Mock SendGrid Enterprise Mail API",
            idempotent=True
        )
    ]
    for t in tools:
        db.add(t)
    db.commit()

    # 5. Approval Policies
    policies = [
        ApprovalPolicy(
            name="Invoice Payment Threshold Policy",
            domain="invoice",
            operation_type="payment_disbursement",
            risk_level="HIGH",
            min_financial_threshold=5000.0,
            required_role="Finance Director",
            sla_hours=24.0
        ),
        ApprovalPolicy(
            name="Privileged JIT Production Elevation",
            domain="it_incident",
            operation_type="grant_privileged_access",
            risk_level="CRITICAL",
            min_financial_threshold=0.0,
            required_role="IT Security Admin",
            sla_hours=4.0
        ),
        ApprovalPolicy(
            name="Major Vendor PO Commitment Policy",
            domain="procurement",
            operation_type="create_purchase_order",
            risk_level="CRITICAL",
            min_financial_threshold=25000.0,
            required_role="Procurement Manager",
            sla_hours=24.0
        ),
        ApprovalPolicy(
            name="Customer Exceptional Refund Policy",
            domain="customer",
            operation_type="customer_ticket_resolution",
            risk_level="HIGH",
            min_financial_threshold=200.0,
            required_role="Support Manager",
            sla_hours=12.0
        )
    ]
    for p in policies:
        db.add(p)
    db.commit()

    # 6. Specialized Agents in DB
    for agent_meta in agent_registry.list_agents():
        ag = Agent(
            key=agent_meta["key"],
            name=agent_meta["name"],
            domain=agent_meta["domain"],
            description=agent_meta["description"],
            system_instructions=agent_meta["system_instructions"],
            allowed_tools=agent_meta["allowed_tools"],
            permission_scope=agent_meta["permission_scope"],
            status="ACTIVE",
            execution_count=142,
            success_rate=99.2
        )
        db.add(ag)
    db.commit()

    # 7. Seed Workflows & Rich Pending Approval Requests
    now = datetime.utcnow()

    # Seed Sample 1: Invoice Approval (Pending, High Value)
    wf_inv = Workflow(
        id="wf_inv_datadog_01",
        title="Intelligent Invoice Processing: Tata Communications Ltd",
        domain="invoice",
        status="WAITING_APPROVAL",
        priority="HIGH",
        risk_level="HIGH",
        raw_input="Process annual enterprise infrastructure telemetry invoice from Tata Communications Ltd for ₹24,80,000.00.",
        requester_id="user_david_chen",
        started_at=now - timedelta(hours=2)
    )
    db.add(wf_inv)
    db.commit()

    task_inv = WorkflowTask(
        id="task_inv_disburse_01",
        workflow_id=wf_inv.id,
        task_key="task_inv_disburse",
        agent_name="Finance Disbursement Agent",
        title="Execute SAP / RazorpayX Payment Disbursement (₹24,80,000.00)",
        status="WAITING_APPROVAL",
        execution_order=5,
        input_payload={"agent_key": "finance_disbursement_agent", "requires_approval": True}
    )
    db.add(task_inv)
    db.commit()

    appr1 = ApprovalRequest(
        id="appr_inv_001",
        workflow_id=wf_inv.id,
        task_id=task_inv.id,
        title="Approve Invoice Disbursement: Tata Communications Ltd",
        domain="invoice",
        risk_level="HIGH",
        status="PENDING",
        priority="HIGH",
        requested_by_agent="Finance Disbursement Agent",
        requesting_employee="David Chen",
        department="Finance & Treasury",
        financial_amount=2480000.00,
        currency="INR",
        business_justification="Annual fiber and cloud transit licensing for Mumbai and Bengaluru Kubernetes clusters. Within FY26 Q4 IT budget.",
        proposed_action="Disburse wire of ₹24,80,000.00 to Tata Communications Ltd via RBI RTGS rail.",
        proposed_payload={
            "amount": 2480000.00,
            "currency": "INR",
            "vendor": "Tata Communications Ltd",
            "invoice_number": "INV-2026-8941",
            "cost_center": "CC-ENG-INFRA-401"
        },
        ai_summary="Document Extraction Agent verified digital signature; 3-way match confirmed PO-2026-441 matching line items; zero duplicate submissions found in 90-day ledger history.",
        tools_invoked=["sap_disburse_payment"],
        validation_results={
            "ocr_confidence": 0.994,
            "po_match": True,
            "duplicate_scan": "CLEARED",
            "budget_status": "SUFFICIENT"
        },
        risk_assessment="High financial value wire transfer (> ₹5,00,000 threshold). Requires Finance Director verification.",
        required_role="Finance Director",
        due_date=now + timedelta(hours=6),
        created_at=now - timedelta(hours=2)
    )
    db.add(appr1)
    task_inv.required_approval_id = appr1.id
    db.commit()

    # Seed Sample 2: IT Privileged Access (Pending, Critical Risk)
    wf_it = Workflow(
        id="wf_it_k8s_02",
        title="Privileged Access Governance: Production K8s Emergency Hotfix",
        domain="it_incident",
        status="WAITING_APPROVAL",
        priority="URGENT",
        risk_level="CRITICAL",
        raw_input="Request emergency JIT ClusterAdmin access to k8s-prod-us-east-1 for memory leak patch.",
        requester_id="user_alex_rivera",
        started_at=now - timedelta(minutes=45)
    )
    db.add(wf_it)
    db.commit()

    task_it = WorkflowTask(
        id="task_it_pam_02",
        workflow_id=wf_it.id,
        task_key="task_it_grant_pam",
        agent_name="Identity & Access Governance Agent",
        title="Provision Ephemeral JIT ClusterAdmin Privileges",
        status="WAITING_APPROVAL",
        execution_order=2,
        input_payload={"agent_key": "iam_access_agent", "requires_approval": True}
    )
    db.add(task_it)
    db.commit()

    appr2 = ApprovalRequest(
        id="appr_it_002",
        workflow_id=wf_it.id,
        task_id=task_it.id,
        title="Production K8s JIT ClusterAdmin Access: Hotfix Patching",
        domain="it_incident",
        risk_level="CRITICAL",
        status="PENDING",
        priority="URGENT",
        requested_by_agent="Identity & Access Governance Agent",
        requesting_employee="Alex Rivera",
        department="Information Technology & Security",
        financial_amount=0.00,
        currency="INR",
        business_justification="P1 incident triage: auth-proxy pod undergoing crash loops. Requires direct cluster admin debug access.",
        proposed_action="Issue ephemeral 4-hour ClusterAdmin token on Mumbai cluster k8s-prod-in-west-1 via Okta PAM.",
        proposed_payload={
            "target_system": "Production Kubernetes Cluster (k8s-prod-in-west-1)",
            "access_tier": "ClusterAdmin_JIT",
            "duration_hours": 4,
            "session_recording": True
        },
        ai_summary="Investigation Agent confirmed 14 pod restarts in last 10 minutes. Zero suspicious anomalous IP logins detected.",
        tools_invoked=["okta_grant_privileged_access"],
        validation_results={
            "mfa_verified": True,
            "incident_ticket": "INC-2026-9021",
            "blast_radius": "Production Namespace"
        },
        risk_assessment="CRITICAL RISK: Unrestricted container root access. Requires IT Security Admin authorization.",
        required_role="IT Security Admin",
        due_date=now + timedelta(hours=1),
        created_at=now - timedelta(minutes=45)
    )
    db.add(appr2)
    task_it.required_approval_id = appr2.id
    db.commit()

    # Seed Sample 3: Procurement PO (Pending, Critical Financial Value)
    wf_proc = Workflow(
        id="wf_proc_nvidia_03",
        title="Enterprise Procurement: NVIDIA H100 AI Supercomputing Cluster via Wipro",
        domain="procurement",
        status="WAITING_APPROVAL",
        priority="HIGH",
        risk_level="CRITICAL",
        raw_input="Procure 8x NVIDIA H100 DGX nodes under enterprise research agreement from Wipro Technologies for ₹78,50,000.00.",
        requester_id="user_david_chen",
        started_at=now - timedelta(hours=5)
    )
    db.add(wf_proc)
    db.commit()

    task_proc = WorkflowTask(
        id="task_proc_po_03",
        workflow_id=wf_proc.id,
        task_key="task_proc_execute",
        agent_name="Procurement Agent",
        title="Activate Vendor & Issue ERP Purchase Order (₹78,50,000.00)",
        status="WAITING_APPROVAL",
        execution_order=2,
        input_payload={"agent_key": "procurement_execution_agent", "requires_approval": True}
    )
    db.add(task_proc)
    db.commit()

    appr3 = ApprovalRequest(
        id="appr_proc_003",
        workflow_id=wf_proc.id,
        task_id=task_proc.id,
        title="Vendor Onboarding & Hardware PO: Wipro Technologies Ltd",
        domain="procurement",
        risk_level="CRITICAL",
        status="PENDING",
        priority="HIGH",
        requested_by_agent="Procurement Agent",
        requesting_employee="Marcus Brody",
        department="Global Procurement",
        financial_amount=7850000.00,
        currency="INR",
        business_justification="Hardware commitment for Bengaluru AI Model Optimization lab approved under FY26 R&D grant.",
        proposed_action="Execute ERP vendor activation and dispatch Purchase Order PO-2026-8812 for ₹78,50,000.00 via HDFC Bank Corporate Rail.",
        proposed_payload={
            "vendor_name": "Wipro Technologies Ltd",
            "total_value": 7850000.00,
            "lead_time_days": 10
        },
        ai_summary="Quotation Analysis Agent confirmed 14.5% volume discount compared to standard catalog rate; 36-month OEM warranty confirmed.",
        tools_invoked=["coupa_activate_vendor", "coupa_create_po"],
        validation_results={
            "ofac_sanctions": "CLEARED",
            "gstin_verified": True,
            "pan_verified": True,
            "sole_source_justified": True
        },
        risk_assessment="CRITICAL RISK: Major capital commitment exceeding ₹50,00,000 threshold.",
        required_role="Procurement Manager",
        due_date=now + timedelta(hours=18),
        created_at=now - timedelta(hours=5)
    )
    db.add(appr3)
    task_proc.required_approval_id = appr3.id
    db.commit()

    # Seed Sample 4: Customer SLA Refund (Overdue!)
    wf_cust = Workflow(
        id="wf_cust_sla_04",
        title="Customer Request Resolution: Reliance Digital Systems SLA Credit Dispute",
        domain="customer",
        status="WAITING_APPROVAL",
        priority="MEDIUM",
        risk_level="MEDIUM",
        raw_input="Customer Reliance Digital Systems demands ₹45,000.00 credit adjustment for Mumbai Gateway API degradation.",
        requester_id="user_sarah_lin",
        started_at=now - timedelta(hours=28)
    )
    db.add(wf_cust)
    db.commit()

    task_cust_1 = WorkflowTask(
        id="task_cust_intake_01",
        workflow_id=wf_cust.id,
        task_key="task_cust_classify",
        agent_name="Request Classification Agent",
        title="Intake Triage & Sentiment Analysis",
        status="COMPLETED",
        execution_order=1,
        input_payload={"agent_key": "customer_classification_agent", "dependencies": []},
        output_payload={"category": "BILLING_REFUND_DISPUTE", "urgency": "HIGH", "sentiment": "NEGATIVE", "customer_tier": "ENTERPRISE_GOLD"},
        started_at=now - timedelta(hours=28),
        completed_at=now - timedelta(hours=28) + timedelta(seconds=14)
    )
    db.add(task_cust_1)

    task_cust_2 = WorkflowTask(
        id="task_cust_kb_02",
        workflow_id=wf_cust.id,
        task_key="task_cust_kb",
        agent_name="Knowledge & Policy Agent",
        title="Retrieve Customer History & Match SLA Policy",
        status="COMPLETED",
        execution_order=2,
        input_payload={"agent_key": "customer_kb_agent", "dependencies": ["task_cust_classify"]},
        output_payload={"sla_tier": "ENTERPRISE_PLATINUM_99_9", "contract_limit": 500000.00, "latency_sla_breached": True, "entitled_credit_percentage": 10.0},
        started_at=now - timedelta(hours=28) + timedelta(seconds=15),
        completed_at=now - timedelta(hours=28) + timedelta(seconds=32)
    )
    db.add(task_cust_2)

    task_cust = WorkflowTask(
        id="task_cust_ref_04",
        workflow_id=wf_cust.id,
        task_key="task_cust_resolve",
        agent_name="Customer Resolution Agent",
        title="Formulate Remedy & Credit Adjustment (₹45,000.00)",
        status="WAITING_APPROVAL",
        execution_order=3,
        input_payload={"agent_key": "customer_resolution_agent", "requires_approval": True, "dependencies": ["task_cust_kb"]},
        started_at=now - timedelta(hours=28) + timedelta(seconds=35)
    )
    db.add(task_cust)

    task_cust_4 = WorkflowTask(
        id="task_cust_exec_04",
        workflow_id=wf_cust.id,
        task_key="task_cust_execute",
        agent_name="CRM Integration Agent",
        title="Execute Zendesk Ticket Update & CRM Sync",
        status="PENDING",
        execution_order=4,
        input_payload={"agent_key": "customer_integration_agent", "dependencies": ["task_cust_resolve"]}
    )
    db.add(task_cust_4)

    task_cust_5 = WorkflowTask(
        id="task_cust_notif_05",
        workflow_id=wf_cust.id,
        task_key="task_cust_notify",
        agent_name="Communication Agent",
        title="Deliver Resolution Email & CSAT Survey",
        status="PENDING",
        execution_order=5,
        input_payload={"agent_key": "communication_agent", "dependencies": ["task_cust_execute"]}
    )
    db.add(task_cust_5)
    db.commit()

    appr4 = ApprovalRequest(
        id="appr_cust_004",
        workflow_id=wf_cust.id,
        task_id=task_cust.id,
        title="Enterprise Customer SLA Refund Adjustment: Reliance Digital Systems",
        domain="customer",
        risk_level="MEDIUM",
        status="PENDING",
        priority="MEDIUM",
        requested_by_agent="Customer Resolution Agent",
        requesting_employee="Elena Vance",
        department="Customer Experience & Support",
        financial_amount=45000.00,
        currency="INR",
        business_justification="Verified 18-minute API latency spike during Mumbai peak hours violating Tier-1 contractual SLA.",
        proposed_action="Apply credit memo of ₹45,000.00 to Reliance Digital Systems account via Customer Portal API.",
        proposed_payload={
            "refund_amount": 45000.00,
            "customer_email": "billing@reliancedigital.in",
            "tier": "ENTERPRISE_GOLD"
        },
        ai_summary="Classification agent tagged NEGATIVE sentiment and high churn risk. Credit calculation verified against SLA policy table.",
        tools_invoked=["zendesk_update_ticket"],
        validation_results={"sla_breach_verified": True, "limit_under_contract": True},
        risk_assessment="MEDIUM RISK: Goodwill credit adjustment exceeds Tier 1 auto-settlement limit (₹15,000).",
        required_role="Support Manager",
        due_date=now - timedelta(hours=4), # OVERDUE!
        created_at=now - timedelta(hours=28)
    )
    db.add(appr4)
    task_cust.required_approval_id = appr4.id
    db.commit()

    # Seed Sample 5: Historic Approved Request to give realistic metrics
    appr_past = ApprovalRequest(
        id="appr_past_005",
        workflow_id=wf_inv.id,
        task_id=task_inv.id,
        title="Approved: Infosys Cloud Infrastructure Q3 Settlement",
        domain="invoice",
        risk_level="HIGH",
        status="APPROVED",
        priority="HIGH",
        requested_by_agent="Finance Disbursement Agent",
        requesting_employee="David Chen",
        department="Finance & Treasury",
        financial_amount=1545000.00,
        currency="INR",
        business_justification="Quarterly analytics warehouse usage.",
        proposed_action="Disburse wire to Infosys Technologies Ltd.",
        proposed_payload={"amount": 1545000.00, "vendor": "Infosys Technologies Ltd"},
        approved_payload={"amount": 1545000.00, "vendor": "Infosys Technologies Ltd"},
        ai_summary="Full 3-way reconciliation completed.",
        tools_invoked=["sap_disburse_payment"],
        validation_results={"status": "ALL_CHECKS_PASSED"},
        risk_assessment="Standard verified enterprise billing.",
        required_role="Finance Director",
        decided_by_user_id="user_sarah_lin",
        decided_by_name="Sarah Lin",
        decided_at=now - timedelta(days=2),
        decision_reason="Reconciled with cloud consumption metrics.",
        created_at=now - timedelta(days=3)
    )
    db.add(appr_past)
    db.commit()

    # Initial Audit Trail Events (chained hashes)
    audit_service.log_event(
        db=db,
        actor_type="SYSTEM_ORCHESTRATOR",
        actor_id="system_init",
        actor_name="EnterpriseFlow Genesis Engine",
        event_type="SYSTEM_BOOTSTRAP",
        action_description="EnterpriseFlow AI platform initialized with tamper-evident cryptographic hash chaining.",
        payload_reference={"security_level": "FEDRAMP_MODERATE_COMPLIANT", "version": "2.4.0"},
        execution_result="SUCCESS"
    )

    audit_service.log_event(
        db=db,
        actor_type="AGENT",
        actor_id="finance_disbursement_agent",
        actor_name="Finance Disbursement Agent",
        event_type="APPROVAL_REQUESTED",
        action_description="Approval requested for Datadog invoice wire ($18,450.00).",
        workflow_id=wf_inv.id,
        task_id=task_inv.id,
        payload_reference={"approval_id": appr1.id, "amount": 18450.00},
        execution_result="PAUSED"
    )

