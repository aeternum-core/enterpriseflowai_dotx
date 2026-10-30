# Assumptions and Limitations — EnterpriseFlow AI

## 1. Assumptions

1. **Synthetic Enterprise Integrations**: In accordance with the prompt and hackathon evaluation scope, external enterprise systems (SAP S/4HANA, Okta PAM, Workday, Coupa, ServiceNow, Zendesk) are simulated with mock clients that replicate actual enterprise responses, error handling, latencies, and transaction structures.
2. **Local Portability**: SQLite is used as the default lightweight database to ensure instant standalone portability without external daemon dependencies, while remaining 100% compliant with PostgreSQL/SQLAlchemy schemas.
3. **Deterministic Seed Data**: Initial synthetic data is seeded on startup so evaluators immediately experience active pending approvals, financial calculations, risk alerts, and audit records.

## 2. Limitations

1. **Simulated Payments**: Financial operations return synthetic ACH/SWIFT references (`ACH-WIRE-...`). No real money is moved.
2. **Single-Tenant Demo Context**: The platform currently operates in a single enterprise organization context with switchable role personas. Multi-tenancy isolation can be enabled in production configurations.
3. **Synchronous Polling / SSE**: While WebSocket and SSE hooks are architected, frontend components actively refresh state upon user mutations and background triggers.

