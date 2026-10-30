# API Documentation — EnterpriseFlow AI

Base URL: `http://127.0.0.1:8000/api/v1` (with `/api` alias)

---

### Approvals Management API

#### `GET /approvals/metrics`
Retrieves summary metrics for the four flagship overview cards:
- `pending_count`: Total pending approvals.
- `approved_this_month`: Completed approvals count.
- `due_soon_count`: Approvals with SLA deadline within 24 hours or overdue.
- `total_financial_value`: Cumulative dollar amount pending human sign-off.

#### `GET /approvals`
Lists approval requests with filtering and pagination.
- Query parameters: `status`, `domain`, `risk_level`, `department`, `search`, `overdue_only`, `skip`, `limit`.

#### `GET /approvals/{id}`
Returns granular approval detail, business justification, proposed payload, AI execution plan, tools invoked, comments, and lifecycle history.

#### `POST /approvals/{id}/approve`
Authorizes the operation and resumes the workflow.
- Request Body: `{ "user_id": str, "user_name": str, "user_role": str, "notes": str }`

#### `POST /approvals/{id}/reject`
Rejects the proposed operation and prevents execution.
- Request Body: `{ "user_id": str, "user_name": str, "user_role": str, "reason": str }`

#### `POST /approvals/{id}/request-changes`
Returns the task to the agent with feedback notes for dynamic re-planning.
- Request Body: `{ "user_id": str, "user_name": str, "user_role": str, "feedback": str }`

#### `POST /approvals/{id}/comments`
Appends a reviewer comment to the discussion thread.

#### `POST /approvals/bulk-approve`
Bulk authorizes a list of approval requests, validating policy for each individually.

---

### Multi-Agent Workflow API

#### `POST /workflows/start`
Accepts a natural-language prompt, executes Level 1 understanding, decomposes a DAG plan with Level 2 Central Planner, and steps through tasks until an approval gate or completion.
- Request Body: `{ "prompt": str, "requester_id": str }`

#### `GET /workflows/{id}`
Returns complete workflow details, DAG tasks, execution statuses, outputs, and shared context key-values.

#### `POST /workflows/{id}/resume`
Resumes a paused workflow after approval.

---

### Tamper-Evident Audit API

#### `GET /audit/events`
Returns paginated cryptographic audit events with SHA-256 current and previous hashes.

#### `GET /audit/verify`
Performs live mathematical verification of all SHA-256 hash chains from Genesis to tip.

#### `POST /audit/tamper-test`
Simulates database record modification to demonstrate tamper detection in the UI.

---

### System, Tools & Policy APIs

- `GET /agents`: Specialized agent registry and permission scopes.
- `GET /tools`: Registered enterprise adapters and simulated services.
- `GET /tools/logs`: Tool execution gateway logs with execution latencies.
- `GET /policies`: Active policies and risk thresholds.
- `PUT /policies/{id}/toggle`: Enables or disables a policy rule.
- `GET /users`: Persona switcher user list.

