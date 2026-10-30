# EnterpriseFlow AI — Autonomous Multi-Agent Operations Platform

> **"AI agents execute the work. Humans retain authority. Every action is accountable."**

EnterpriseFlow AI is a hierarchical multi-agent enterprise operations platform featuring Level 1 Natural Language Request Understanding, Level 2 Central Dynamic DAG Planning, Level 3 Specialized Domain Agents, and Level 4 Backend-Enforced Governance with a flagship **Human-in-the-Loop Approval Management Center**.

---

## 🌟 Key Highlights & Architecture

- **5 Mandatory Business Workflows**:
  1. **Intelligent Employee Onboarding**: Identity validation, I-9 verification, Workday HCM record creation, Okta SSO provisioning, orientation scheduling.
  2. **Intelligent Invoice Processing**: OCR intake, line-item extraction, 90-day duplicate detection, 3-way PO matching, SAP S/4HANA disbursement.
  3. **Autonomous Customer Request Resolution**: Classification, sentiment analysis, contractual SLA verification, Zendesk credit adjustment.
  4. **Enterprise Procurement & Vendor Onboarding**: Competing quote analysis, volume discount evaluation, Coupa vendor activation, Purchase Order issuance.
  5. **IT Incident Response & Access Governance**: Telemetry correlation, ServiceNow automated remediation, Okta/CyberArk ephemeral JIT ClusterAdmin PAM elevation.

- **Human-in-the-Loop Approval Management Center (Flagship Module)**:
  - High-density enterprise SaaS interface inspired by modern approval suites.
  - **4 Metric Overview Cards**: Pending Approvals, Approved This Month, Due Soon / Overdue, Total Pending Financial Value.
  - **Dynamic Table**: Search, multi-criteria filtering (domain, risk, status, overdue), sorting, pagination, bulk selection & bulk approval.
  - **Right-Side Slide-Over Drawer**: Business details, AI execution plan, tools invoked, risk assessment, reviewer comments thread, and audit history.
  - **3 Core Governance Actions**:
    - **Approve**: Verifies user role, matches payload, records decision, resumes workflow, executes protected tool.
    - **Reject**: Requires explicit mandatory reason (min 5 chars), stops protected execution, marks workflow rejected.
    - **Request Changes**: Requires feedback, returns task to agent, triggers dynamic Level 2 Central Planner re-planning.

- **Tamper-Evident SHA-256 Audit Logging**:
  - Every agent action, tool invocation, and human decision is cryptographically chained.
  - Real-time audit viewer with a live **"Verify Chain Integrity"** button and interactive **"Simulate Tamper Test"** to prove tamper detection in action.

- **Central Authorization & Tool Gateway**:
  - Zero Trust agent execution: agents never directly access databases or APIs.
  - All calls pass through the Tool Gateway, checking permissions, risk tier (LOW, MEDIUM, HIGH, CRITICAL), and approval status.
  - Realistic mock enterprise integrations: SAP S/4HANA, Okta PAM, Workday, Coupa, ServiceNow, Zendesk, SendGrid.

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js v18+ (tested on Node v24)
- npm 9+

### 1. Backend Setup
```bash
cd backend
python -m pip install fastapi uvicorn sqlalchemy pydantic pydantic-settings python-multipart pytest httpx requests

# Run tests
python -m pytest tests/test_enterpriseflow.py -v

# Start backend server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
Backend API will be running at `http://127.0.0.1:8000`. Interactive OpenAPI documentation available at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run build
npm run dev
```
Open your browser to `http://127.0.0.1:5173`.

---

## 🧪 Testing & Verification

EnterpriseFlow AI includes automated unit, integration, and security tests covering:
- Level 1 Request Understanding across all 5 domains.
- Level 2 Central Planner DAG decomposition and dependency sequencing.
- Level 3 Agent execution and shared context propagation.
- **Security Gates**:
  - Agent cannot approve its own request (`UNAUTHORIZED_AGENT_APPROVAL`).
  - Unauthorized role cannot approve restricted requests (`ROLE_MISMATCH`).
  - Unapproved tool call is blocked by Tool Gateway (`BLOCKED_UNAPPROVED`).
  - Payload modification invalidates earlier approval (`SECURITY_TAMPER_DETECTED`).
- Approval state transitions (Approve, Reject, Request Changes).
- Tamper-evident audit chain verification.

Run the test suite anytime:
```bash
cd backend
python -m pytest tests/test_enterpriseflow.py -v
```

---

## 📁 Repository Structure

```
mitdotx/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI application entrypoint & startup
│   │   ├── core/                    # Config, database engine, settings
│   │   ├── models/                  # Normalized relational schema (SQLAlchemy)
│   │   ├── services/
│   │   │   ├── planner_service.py   # Level 1 understanding & Level 2 dynamic DAG planner
│   │   │   ├── agent_registry.py    # 17 specialized Level 3 domain sub-agents
│   │   │   ├── workflow_engine.py   # Hierarchical workflow execution runner
│   │   │   ├── tool_gateway.py      # Authorized Tool & API Gateway
│   │   │   ├── policy_engine.py     # Central Authorization & Policy Engine
│   │   │   ├── approval_engine.py   # Human-in-the-Loop Approval Service
│   │   │   ├── audit_service.py     # Append-only SHA-256 hash-chaining service
│   │   │   ├── recovery_engine.py   # Exponential backoff & recovery
│   │   │   ├── mock_integrations.py # Realistic enterprise integrations
│   │   │   └── seed_data.py         # Synthetic seed data
│   │   └── api/                     # REST endpoints (approvals, workflows, audit, etc.)
│   └── tests/                       # Automated test suite
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.tsx          # Dark navy navigation sidebar
│   │   │   ├── Header.tsx           # Global search & Persona Switcher
│   │   │   ├── approvals/           # Metric cards, Approval table, Detail drawer, Modals
│   │   │   ├── workflows/           # Orchestrator & interactive DAG visualizer
│   │   │   ├── audit/               # Cryptographic audit viewer & integrity checker
│   │   │   ├── agents/              # Specialized agent registry viewer
│   │   │   ├── tools/               # Tool gateway & live logs
│   │   │   ├── policies/            # Policies & risk guardrails
│   │   │   └── analytics/           # Cycle times & SLA analytics
│   │   ├── services/api.ts          # Typed API client
│   │   └── App.tsx                  # Main SaaS application layout
├── docs/                            # Architectural documentation & diagrams
│   ├── system-architecture.md
│   ├── agent-architecture.md
│   ├── approval-engine.md
│   ├── workflow-documentation.md
│   ├── database-schema.md
│   ├── api-documentation.md
│   ├── security-model.md
│   ├── audit-logging.md
│   └── assumptions-and-limitations.md
└── README.md
```

---

## 🎯 Demo Scenarios & Reproducible Workflows

Use the built-in **Persona Switcher** in the top navigation to test role-based access:
- **Sarah Lin**: Finance Director (Authorized for high-value invoice wires)
- **Alex Rivera**: IT Security Admin (Authorized for JIT PAM elevation)
- **Marcus Brody**: Procurement Manager (Authorized for purchase orders)
- **Elena Vance**: HR Director (Authorized for executive hires)
- **David Chen**: Senior Software Engineer (Standard requester)

Click on the **Workflows & Orchestrator** tab to run any of the 5 reproducible one-click presets:
1. **Employee Onboarding**: "Onboard new hire Jordan Vance into Engineering..."
2. **Invoice Processing**: "Process annual enterprise infrastructure telemetry invoice from Datadog for $18,450.00"
3. **Customer Operations**: "Customer GlobalCorp demands $450 credit adjustment..."
4. **Procurement & Vendors**: "Procure 8x NVIDIA H100 DGX nodes under enterprise research agreement for $78,500.00"
5. **IT Incident & PAM**: "Request emergency JIT ClusterAdmin access to k8s-prod-us-east-1..."

---

## 📜 License
EnterpriseFlow AI is built under the Apache 2.0 License.

