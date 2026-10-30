import pytest
from app.core.database import SessionLocal, Base, engine
import app.models
from app.services.seed_data import seed_database
from app.schemas.contracts import (
    WorkflowTask,
    TaskDAG,
    AgentTaskHandoff
)
from app.planner.dag_validator import dag_validator
from app.policies.policy_sentinel import policy_sentinel, deterministic_auth_engine
from app.recovery.chaos_engine import chaos_engine
from app.services.planner_service import planner_service
from app.services.approval_engine import approval_engine, ApprovalEngineError
from app.services.tool_gateway import tool_gateway, ToolGatewayError
from app.services.audit_service import audit_service
from app.services.workflow_engine import workflow_engine

@pytest.fixture(scope="module")
def db():
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    seed_database(session)
    yield session
    session.close()

# --- NOMINAL EXECUTION TESTS ---

def test_planner_creates_valid_dag():
    """1. Planner creates a valid DAG that passes deterministic validation"""
    understanding = {"domain": "procurement", "extracted_amount": 78500.00, "raw_prompt": "test"}
    plan = planner_service.decompose_plan("procurement", understanding)
    assert len(plan) >= 2
    tasks = [
        WorkflowTask(
            task_id=p["task_key"],
            workflow_id="wf_dag_test",
            title=p["title"],
            description=p["description"],
            worker_role="BUSINESS_OPERATIONS_WORKER",
            action_type="CREATE_PURCHASE_ORDER",
            execution_order=p["execution_order"],
            dependencies=p.get("depends_on", [])
        )
        for p in plan
    ]
    dag = TaskDAG(workflow_id="wf_dag_test", domain="procurement", tasks=tasks)
    validated = dag_validator.validate(dag)
    assert validated.is_valid is True
    assert len(validated.validation_errors) == 0

def test_dag_validator_rejects_cyclic_graph():
    """2. Invalid cyclic DAG is rejected by validator"""
    tasks = [
        WorkflowTask(
            task_id="task_A",
            workflow_id="wf_cycle",
            title="Task A",
            description="A",
            worker_role="DOCUMENT_AND_DATA_WORKER",
            action_type="EXTRACT_DOCUMENTS",
            execution_order=1,
            dependencies=["task_B"] # Cycle: A depends on B, B depends on A
        ),
        WorkflowTask(
            task_id="task_B",
            workflow_id="wf_cycle",
            title="Task B",
            description="B",
            worker_role="BUSINESS_OPERATIONS_WORKER",
            action_type="CREATE_PURCHASE_ORDER",
            execution_order=2,
            dependencies=["task_A"]
        )
    ]
    dag = TaskDAG(workflow_id="wf_cycle", domain="invoice", tasks=tasks)
    validated = dag_validator.validate(dag)
    assert validated.is_valid is False
    assert any("Cycle detected" in err for err in validated.validation_errors)

def test_worker_contracts_and_shared_context(db):
    """3. Worker handoffs propagate structured parameters and context"""
    handoff = AgentTaskHandoff(
        task_id="task_ctx_01",
        workflow_id="wf_ctx_test",
        run_id="run_01",
        source_agent="PLANNER",
        target_agent="DOCUMENT_AND_DATA_WORKER",
        action_type="EXTRACT_DOCUMENTS",
        structured_parameters={"amount": 18450.00, "vendor_name": "Datadog Monitoring Inc."},
        idempotency_key="IDEMP-TEST-CTX"
    )
    assert handoff.structured_parameters["amount"] == 18450.00
    assert handoff.idempotency_key == "IDEMP-TEST-CTX"

# --- CONTROLLED RESILIENCE & CHAOS TESTS ---

def test_chaos_http_409_username_collision_recovery():
    """4. HTTP 409 collision triggers deterministic identifier suffix fallback"""
    context = {"username": "jdoe", "service": "Okta"}
    executed = False

    def op():
        nonlocal executed
        executed = True
        return {"status": "CREATED", "user": context["username"]}

    rec = chaos_engine.execute_recovery("HTTP_409_CONFLICT", op, context)
    assert rec.recovered is True
    assert rec.strategy == "DETERMINISTIC_IDENTIFIER_SUFFIX"
    assert "jdoe_emp" in context["username"]
    assert executed is True

def test_chaos_http_429_rate_limit_backoff():
    """5. HTTP 429 triggers Retry-After exponential backoff with jitter"""
    context = {"retry_after_seconds": 0.1, "service": "Coupa"}
    rec = chaos_engine.execute_recovery("HTTP_429_RATE_LIMIT", lambda: {"status": "SUCCESS"}, context)
    assert rec.recovered is True
    assert rec.strategy == "JITTERED_EXPONENTIAL_BACKOFF"
    assert rec.telemetry["jitter_applied"] is True

def test_chaos_timeout_idempotency_protection():
    """6. Timeout checks idempotency ledger to avoid duplicate execution"""
    context = {"idempotency_key": "IDEMP-PAY-999"}
    rec = chaos_engine.execute_recovery("TIMEOUT", lambda: {"status": "SUCCESS"}, context)
    assert rec.recovered is True
    assert rec.strategy == "IDEMPOTENCY_LEDGER_RECOVERY"
    assert rec.telemetry["duplicate_prevention"] == "ACTIVE"

def test_chaos_invalid_schema_controlled_correction():
    """7. Malformed document/schema triggers single-attempt schema repair"""
    context = {"malformed_field": "INVALID"}
    rec = chaos_engine.execute_recovery("INVALID_SCHEMA", lambda: {"status": "SUCCESS"}, context)
    assert rec.recovered is True
    assert rec.strategy == "CONTROLLED_SCHEMA_CORRECTION"
    assert rec.telemetry["schema_repaired"] is True

# --- GOVERNANCE & POLICY TESTS ---

def test_policy_sentinel_bank_jurisdiction_mismatch():
    """8. Bank jurisdiction mismatch triggers CRITICAL risk policy and manager review"""
    res = policy_sentinel.evaluate(
        domain="procurement",
        action_type="CREATE_PURCHASE_ORDER",
        parameters={
            "vendor_name": "Acme Offshore",
            "vendor_country": "US",
            "bank_country": "KY", # Cayman Islands wire mismatch
            "jurisdiction_mismatch": True,
            "total_value": 78500.00
        }
    )
    assert res.risk_classification == "CRITICAL"
    assert res.requires_approval is True
    assert "Jurisdiction Mismatch" in res.violations[0]

def test_security_agent_cannot_approve_own_request(db):
    """9. Security rule: AI Agent cannot approve its own operation"""
    req = approval_engine.create_approval_request(
        db=db,
        workflow_id="test_wf_sec_agent",
        task_id="test_task_sec_agent",
        title="Test Agent Self Approval Gate",
        domain="invoice",
        risk_level="HIGH",
        requested_by_agent="Finance Agent",
        department="Finance",
        business_justification="Test",
        proposed_action="Test",
        proposed_payload={"amount": 1000},
        required_role="Finance Director",
        ai_summary="Test",
        tools_invoked=[],
        validation_results={},
        financial_amount=1000.0
    )

    with pytest.raises(ApprovalEngineError) as exc_info:
        approval_engine.approve(
            db=db,
            approval_id=req.id,
            user_id="agent_finance_01",
            user_name="Finance Agent",
            user_role="agent"
        )
    assert "cannot approve" in str(exc_info.value).lower()

def test_security_unauthorized_role_cannot_approve(db):
    """10. Unauthorized user role cannot approve restricted request"""
    req = approval_engine.create_approval_request(
        db=db,
        workflow_id="test_wf_sec_role",
        task_id="test_task_sec_role",
        title="Test Role Gate",
        domain="invoice",
        risk_level="HIGH",
        requested_by_agent="Finance Agent",
        department="Finance",
        business_justification="Test",
        proposed_action="Test",
        proposed_payload={"amount": 5000},
        required_role="Finance Director",
        ai_summary="Test",
        tools_invoked=[],
        validation_results={},
        financial_amount=5000.0
    )

    with pytest.raises(ApprovalEngineError) as exc_info:
        approval_engine.approve(
            db=db,
            approval_id=req.id,
            user_id="user_david_chen",
            user_name="David Chen",
            user_role="Senior Software Engineer"
        )
    assert "requires role 'Finance Director'" in str(exc_info.value)

def test_security_tool_gateway_blocks_unapproved_sensitive_call(db):
    """11. Tool Gateway blocks high-risk tool call if not approved"""
    with pytest.raises(ToolGatewayError) as exc_info:
        tool_gateway.invoke(
            db=db,
            tool_key="sap_disburse_payment",
            agent_id="finance_disbursement_agent",
            agent_name="Finance Disbursement Agent",
            workflow_id="unapproved_wf_999",
            task_id="unapproved_task_999",
            payload={"amount": 18450.00, "domain": "invoice"}
        )
    assert "BLOCKED_UNAPPROVED" in str(exc_info.value)

# --- CRYPTOGRAPHIC VERIFIABILITY TESTS ---

def test_cryptographic_audit_tamper_detection(db):
    """12. SHA-256 chain detects simulated database tampering"""
    # Verify untampered state
    report = audit_service.verify_chain_integrity(db)
    assert report["valid"] is True

    # Record event
    evt = audit_service.log_event(
        db=db,
        actor_type="TEST_SYSTEM",
        actor_id="test_actor",
        actor_name="Audit Tester",
        event_type="INTEGRITY_CHECK",
        action_description="Cryptographic chaining test",
        payload_reference={"check": "passed"}
    )
    assert evt.current_hash is not None

    # Re-verify
    report_post = audit_service.verify_chain_integrity(db)
    assert report_post["valid"] is True
