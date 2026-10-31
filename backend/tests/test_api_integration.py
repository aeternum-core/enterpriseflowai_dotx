import pytest
from fastapi.testclient import TestClient
from app.main import app as fastapi_app
from app.core.database import SessionLocal, Base, engine
from app.services.seed_data import seed_database

@pytest.fixture(scope="module")
def client():
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_database(db)
    return TestClient(fastapi_app)

def test_auth_login_and_quick_login(client):
    """Verify password login and role-based quick login"""
    # 1. Quick login
    r = client.post("/api/auth/quick-login", json={"role": "FINANCE_MANAGER"})
    assert r.status_code == 200
    data = r.json()
    assert "token" in data
    assert data["user"]["role"] == "FINANCE_MANAGER"
    assert data["user"]["name"] == "Sarah Lin"

    # 2. Session verification
    token = data["token"]
    r_sess = client.get("/api/auth/session", headers={"Authorization": f"Bearer {token}"})
    assert r_sess.status_code == 200
    assert r_sess.json()["user"]["role"] == "FINANCE_MANAGER"

    # 3. Role switch
    r_switch = client.post("/api/auth/switch-role", json={"role": "HR_MANAGER"}, headers={"Authorization": f"Bearer {token}"})
    assert r_switch.status_code == 200
    assert r_switch.json()["user"]["role"] == "HR_MANAGER"

def test_planner_stats_endpoint(client):
    """Verify planner telemetry stats endpoint for AdminDashboard"""
    r = client.get("/api/planner/stats")
    assert r.status_code == 200
    data = r.json()
    assert "totalWorkflows" in data
    assert "pendingApprovals" in data
    assert "plannerHealth" in data
    assert data["plannerHealth"] == "OPTIMAL"

def test_audit_logs_and_interaction_logs(client):
    """Verify flat audit and interaction logs endpoints"""
    r_audit = client.get("/api/audit-logs")
    assert r_audit.status_code == 200
    audit_data = r_audit.json()
    assert isinstance(audit_data, list)
    assert len(audit_data) > 0
    assert "sequenceNumber" in audit_data[0]
    assert "currentHash" in audit_data[0]

    r_int = client.get("/api/interaction-logs")
    assert r_int.status_code == 200
    assert isinstance(r_int.json(), list)

def test_demo_scenario_trigger_and_workflow_detail(client):
    """Verify triggering demo scenario and inspecting enriched workflow detail"""
    r_sc = client.post("/api/demo/trigger-scenario", json={"scenarioId": "onboarding_executive"})
    assert r_sc.status_code == 200
    sc_data = r_sc.json()
    assert sc_data["success"] is True
    wf_id = sc_data["workflow"]["id"]

    # Fetch enriched workflow detail
    r_detail = client.get(f"/api/workflows/{wf_id}")
    assert r_detail.status_code == 200
    detail = r_detail.json()
    assert "workflow" in detail
    assert "tasks" in detail
    assert "approvals" in detail
    assert "messages" in detail
    assert isinstance(detail["tasks"], list)
    assert len(detail["tasks"]) >= 2

def test_simulate_failure_endpoint(client):
    """Verify self-healing failure simulation endpoint"""
    # 1. Trigger a workflow
    r_sc = client.post("/api/demo/trigger-scenario", json={"scenarioId": "sev1_cloud_incident"})
    wf_id = r_sc.json()["workflow"]["id"]

    # 2. Inject failure
    r_fail = client.post(f"/api/workflows/{wf_id}/simulate-failure", json={})
    assert r_fail.status_code == 200
    fail_data = r_fail.json()
    assert fail_data["success"] is True

    # 3. Check workflow status
    r_detail = client.get(f"/api/workflows/{wf_id}")
    assert r_detail.json()["workflow"]["status"] == "REQUIRES_ATTENTION"

def test_universal_decide_endpoint(client):
    """Verify /api/approvals/{id}/decide endpoint works for human authorization"""
    # Create workflow that requires approval
    r_sc = client.post("/api/demo/trigger-scenario", json={"scenarioId": "large_invoice_approval"})
    wf_id = r_sc.json()["workflow"]["id"]

    # Get approval ID from detail
    r_detail = client.get(f"/api/workflows/{wf_id}")
    approvals = r_detail.json()["approvals"]
    assert len(approvals) > 0
    appr_id = approvals[0]["id"]

    # Decide approve
    r_decide = client.post(f"/api/approvals/{appr_id}/decide", json={
        "decision": "APPROVED",
        "decidedByUserId": "user_sarah_lin",
        "decidedByName": "Sarah Lin",
        "decidedByRole": "Finance Director",
        "reason": "Authorized via automated test."
    })
    assert r_decide.status_code == 200
    assert r_decide.json()["status"] == "APPROVED"
    assert r_decide.json()["workflow_status"] == "COMPLETED"

def test_central_planner_interactive_endpoints(client):
    """Verify Central Planner decompose, telemetry, and self-heal endpoints"""
    # 1. Telemetry
    r_tel = client.get("/api/planner/telemetry")
    assert r_tel.status_code == 200
    tel = r_tel.json()
    assert tel["plannerState"] == "ACTIVE_SUPERVISOR"
    assert len(tel["swarms"]) == 5

    # 2. Decompose
    r_dec = client.post("/api/planner/decompose", json={
        "prompt": "Onboard Principal Site Reliability Engineer with ₹28,50,000 CTC in Bengaluru office",
        "strictMode": True
    })
    assert r_dec.status_code == 200
    dec = r_dec.json()
    assert dec["success"] is True
    assert dec["dagSummary"]["isValidDAG"] is True
    assert len(dec["nodes"]) >= 3
    assert len(dec["reasoningSteps"]) == 5

    # 3. Self-healing simulation
    r_heal = client.post("/api/planner/self-heal", json={
        "failureType": "HTTP_409_USERNAME_COLLISION",
        "prompt": "Onboard Principal Site Reliability Engineer with ₹28,50,000 CTC in Bengaluru office"
    })
    assert r_heal.status_code == 200
    heal = r_heal.json()
    assert heal["success"] is True
    assert heal["replanStatus"] == "RECOVERY_COMPLETE_100_PERCENT"
    assert heal["healedTaskCount"] > heal["originalTaskCount"]
