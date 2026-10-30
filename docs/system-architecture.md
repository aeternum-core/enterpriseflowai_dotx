# System Architecture — EnterpriseFlow AI

## 1. High-Level Architecture Overview

EnterpriseFlow AI is an autonomous, hierarchical multi-agent enterprise operations platform with backend-enforced Human-in-the-Loop governance.

```mermaid
flowchart TD
    User([Business User / Operator]) -->|Natural-Language Request| UI[EnterpriseFlow Web Frontend]
    UI -->|REST / Real-time API| Gateway[FastAPI Enterprise Application Core]

    subgraph "Level 1: Request Understanding"
        Gateway --> L1[Request Understanding Agent]
        L1 -->|Entity & Domain Extraction| L2
    end

    subgraph "Level 2: Central Planner / Orchestrator"
        L2[Central Planner Service]
        L2 -->|Dynamic DAG Decomposition| DAG[Task Graph & Dependency Engine]
    end

    subgraph "Level 3: Specialized Domain Sub-Agents"
        DAG -->|Delegates| A1[HR & Onboarding Agents]
        DAG -->|Delegates| A2[Finance & Invoice Agents]
        DAG -->|Delegates| A3[Customer Ops Agents]
        DAG -->|Delegates| A4[Procurement Agents]
        DAG -->|Delegates| A5[IT Incident & PAM Agents]
    end

    subgraph "Level 4: Governance & Reliability Infrastructure"
        A1 & A2 & A3 & A4 & A5 -->|Invocations| TG[Authorized Tool & API Gateway]
        TG --> PE[Policy Engine & Risk Classifier]
        PE -->|LOW Risk: Auto-Execute| Mock[Mock Enterprise Integrations]
        PE -->|HIGH / CRITICAL Risk| AG[Human-in-the-Loop Approval Gate]
        AG -->|Waiting Approval| DB[(PostgreSQL / SQLite Source of Truth)]
        AG -->|Human Decision: Approve/Reject/Revise| PE
        TG -->|Execution Audit| ChainedAudit[SHA-256 Tamper-Evident Hash Chain]
        A1 & A2 & A3 & A4 & A5 --> RE[Automated Recovery Engine: Backoff & Checkpoints]
    end

    Mock --> OutSAP[SAP S/4HANA Finance API]
    Mock --> OutOkta[Okta PAM & Identity Cloud]
    Mock --> OutCoupa[Coupa Cloud Procurement]
    Mock --> OutWorkday[Workday HCM API]
    Mock --> OutSNOW[ServiceNow ITSM]
    Mock --> OutZendesk[Zendesk Support API]
```

## 2. Architectural Layers

### Level 1: Request Understanding
- Interprets freeform business text.
- Extracts entities (currency figures, vendor names, dates, systems, candidate details).
- Routes to corresponding workflow domain.
- Detects constraints and incompleteness.

### Level 2: Central Planner & Dynamic Orchestrator
- Understands overall business objectives.
- Decomposes requests into executable task DAGs.
- Computes dependencies and execution orders.
- Evaluates execution results and supports re-planning upon human feedback.

### Level 3: Specialized Sub-Agents
- 17 specialized agents with distinct system instructions, schemas, and tool allowances.
- Communicates via structured shared workflow context.
- Adheres to least-privilege permission boundaries.

### Level 4: Governance, Authorization & Audit
- **Policy Engine**: Decoupled risk classification (LOW, MEDIUM, HIGH, CRITICAL).
- **Authorized Tool Gateway**: Inspects every call; strictly prevents unapproved high-risk operations.
- **Human-in-the-Loop Approval Center**: Empowers human operators to approve, reject (with reason), or request revisions.
- **Recovery Engine**: Idempotency checks, exponential backoff, checkpointing, and escalation.
- **Tamper-Evident Audit Service**: Append-only SHA-256 hash chaining.

