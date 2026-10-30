import uuid
import time
from typing import TypedDict, List, Dict, Any, Optional
from langgraph.graph import StateGraph, END
from app.schemas.contracts import (
    WorkflowTask,
    TaskDAG,
    AgentTaskHandoff,
    AgentTaskResult,
    WorkerRole
)
from app.planner.dag_validator import dag_validator
from app.policies.policy_sentinel import policy_sentinel
from app.agents.workers import (
    DocumentAndDataWorker,
    BusinessOperationsWorker,
    ITAndIntegrationWorker
)
from app.recovery.chaos_engine import chaos_engine
from app.core.database import SessionLocal
from app.models.workflow import Workflow, WorkflowTask as DBWorkflowTask, WorkflowContext
from app.models.approval import ApprovalRequest
from app.services.approval_engine import approval_engine
from app.services.audit_service import audit_service

class EnterpriseFlowState(TypedDict):
    workflow_id: str
    run_id: str
    domain: str
    raw_input: str
    extracted_entities: Dict[str, Any]
    tasks: List[Dict[str, Any]]
    current_task_idx: int
    shared_context: Dict[str, Any]
    policy_evaluation: Dict[str, Any]
    approval_required: bool
    approval_id: Optional[str]
    approval_status: str
    is_paused_for_approval: bool
    recovery_telemetry: List[Dict[str, Any]]
    status: str
    logs: List[str]

class LangGraphWorkflowOrchestrator:
    """
    Hierarchical Supervisor & Workflow Orchestration Engine built on LangGraph.
    Dynamically routes tasks through Document, Business Operations, and IT workers,
    with persistent checkpoints and Human-in-the-Loop approval gates.
    """

    def __init__(self):
        self.graph = self._build_graph()

    def _build_graph(self):
        builder = StateGraph(EnterpriseFlowState)

        # 1. Level 1: Request Understanding Node
        def request_understanding_node(state: EnterpriseFlowState):
            raw = state["raw_input"].lower()
            if any(w in raw for w in ["onboard", "hire", "candidate", "jordan"]):
                domain = "onboarding"
            elif any(w in raw for w in ["invoice", "bill", "datadog", "disburse"]):
                domain = "invoice"
            elif any(w in raw for w in ["customer", "refund", "dispute", "globalcorp"]):
                domain = "customer"
            elif any(w in raw for w in ["procure", "nvidia", "quote", "purchase order"]):
                domain = "procurement"
            else:
                domain = "it_incident"

            state["domain"] = domain
            state["logs"].append(f"[Level 1] Classified business request into domain: '{domain}'.")
            return state

        # 2. Level 2: Central Planner Node
        def planner_node(state: EnterpriseFlowState):
            domain = state["domain"]
            raw = state["raw_input"]

            tasks: List[WorkflowTask] = []
            if domain == "onboarding":
                tasks = [
                    WorkflowTask(
                        task_id="task_onb_doc",
                        workflow_id=state["workflow_id"],
                        title="Verify Candidate Credentials & I-9",
                        description="Check candidate documentation and identity verification.",
                        worker_role="DOCUMENT_AND_DATA_WORKER",
                        action_type="VALIDATE_DATA",
                        execution_order=1
                    ),
                    WorkflowTask(
                        task_id="task_onb_hr",
                        workflow_id=state["workflow_id"],
                        title="Create Employee Profile in Workday",
                        description="Create employee record and compensation details in Workday.",
                        worker_role="BUSINESS_OPERATIONS_WORKER",
                        action_type="CREATE_EMPLOYEE_RECORD",
                        execution_order=2,
                        dependencies=["task_onb_doc"]
                    ),
                    WorkflowTask(
                        task_id="task_onb_it",
                        workflow_id=state["workflow_id"],
                        title="Provision Okta Identity & SSO",
                        description="Provision standard productivity accounts and corporate email.",
                        worker_role="IT_AND_INTEGRATION_WORKER",
                        action_type="PROVISION_ACCOUNTS",
                        execution_order=3,
                        dependencies=["task_onb_hr"]
                    )
                ]

            elif domain == "invoice":
                amount = state["extracted_entities"].get("amount") or 18450.00
                tasks = [
                    WorkflowTask(
                        task_id="task_inv_extract",
                        workflow_id=state["workflow_id"],
                        title="Extract PDF Line Items & Totals",
                        description="Extract structured invoice schema from PDF document.",
                        worker_role="DOCUMENT_AND_DATA_WORKER",
                        action_type="EXTRACT_DOCUMENTS",
                        execution_order=1
                    ),
                    WorkflowTask(
                        task_id="task_inv_dedup",
                        workflow_id=state["workflow_id"],
                        title="Deduplicate Ledger Scan",
                        description="Scan 90-day ledger history to verify no duplicate submissions.",
                        worker_role="DOCUMENT_AND_DATA_WORKER",
                        action_type="DEDUPLICATE_LEDGER",
                        execution_order=2,
                        dependencies=["task_inv_extract"]
                    ),
                    WorkflowTask(
                        task_id="task_inv_disburse",
                        workflow_id=state["workflow_id"],
                        title=f"Execute SAP Disbursement (${amount:,.2f})",
                        description="Disburse payment wire via SAP S/4HANA treasury API.",
                        worker_role="BUSINESS_OPERATIONS_WORKER",
                        action_type="EXECUTE_DISBURSEMENT",
                        execution_order=3,
                        dependencies=["task_inv_dedup"],
                        requires_approval=True,
                        risk_tier="HIGH" if amount < 50000 else "CRITICAL",
                        required_role="Finance Director"
                    )
                ]

            elif domain == "procurement":
                total = state["extracted_entities"].get("total_value") or 78500.00
                tasks = [
                    WorkflowTask(
                        task_id="task_proc_compare",
                        workflow_id=state["workflow_id"],
                        title="Analyze Competing Quotations & SLA",
                        description="Evaluate bids, volume discounts, and warranty terms.",
                        worker_role="DOCUMENT_AND_DATA_WORKER",
                        action_type="COMPARE_QUOTATIONS",
                        execution_order=1
                    ),
                    WorkflowTask(
                        task_id="task_proc_po",
                        workflow_id=state["workflow_id"],
                        title=f"Issue Binding Coupa PO (${total:,.2f})",
                        description="Activate vendor and dispatch Purchase Order.",
                        worker_role="BUSINESS_OPERATIONS_WORKER",
                        action_type="CREATE_PURCHASE_ORDER",
                        execution_order=2,
                        dependencies=["task_proc_compare"],
                        requires_approval=True,
                        risk_tier="CRITICAL",
                        required_role="Procurement Manager"
                    )
                ]

            elif domain == "customer":
                refund = state["extracted_entities"].get("refund_amount") or 450.00
                req_appr = refund > 1000.0
                tasks = [
                    WorkflowTask(
                        task_id="task_cust_resolve",
                        workflow_id=state["workflow_id"],
                        title=f"Apply Zendesk Credit Adjustment (${refund:,.2f})",
                        description="Apply resolution macro and credit adjustment.",
                        worker_role="BUSINESS_OPERATIONS_WORKER",
                        action_type="RESOLVE_CUSTOMER_DISPUTE",
                        execution_order=1,
                        requires_approval=req_appr,
                        risk_tier="HIGH" if req_appr else "LOW",
                        required_role="Support Manager" if req_appr else None
                    )
                ]

            else: # it_incident
                is_priv = "access" in raw.lower() or "clusteradmin" in raw.lower() or "root" in raw.lower()
                if is_priv:
                    tasks = [
                        WorkflowTask(
                            task_id="task_it_pam",
                            workflow_id=state["workflow_id"],
                            title="Grant Ephemeral JIT ClusterAdmin Token",
                            description="Grant temporary 4-hour elevation to production Kubernetes cluster.",
                            worker_role="IT_AND_INTEGRATION_WORKER",
                            action_type="ELEVATE_JIT_ACCESS",
                            execution_order=1,
                            requires_approval=True,
                            risk_tier="CRITICAL",
                            required_role="IT Security Admin"
                        )
                    ]
                else:
                    tasks = [
                        WorkflowTask(
                            task_id="task_it_rem",
                            workflow_id=state["workflow_id"],
                            title="Remediate Service in ServiceNow",
                            description="Restart container cluster pod and flush pool.",
                            worker_role="IT_AND_INTEGRATION_WORKER",
                            action_type="REMEDIATE_INCIDENT",
                            execution_order=1
                        )
                    ]

            # Deterministic DAG Validation
            dag = TaskDAG(workflow_id=state["workflow_id"], domain=domain, tasks=tasks)
            validated_dag = dag_validator.validate(dag)

            state["tasks"] = [t.model_dump() for t in validated_dag.tasks]
            state["logs"].append(f"[Level 2 Planner] Generated and validated DAG with {len(tasks)} tasks.")
            return state

        # 3. Policy Sentinel Node
        def policy_sentinel_node(state: EnterpriseFlowState):
            domain = state["domain"]
            curr_idx = state["current_task_idx"]
            if curr_idx >= len(state["tasks"]):
                return state

            curr_task = state["tasks"][curr_idx]
            eval_res = policy_sentinel.evaluate(
                domain=domain,
                action_type=curr_task["action_type"],
                parameters=state["shared_context"]
            )
            state["policy_evaluation"] = eval_res.model_dump()
            state["logs"].append(f"[Policy Sentinel] Risk Tier: {eval_res.risk_classification}. Requires Approval: {eval_res.requires_approval}.")
            return state

        # 4. Supervisor Step Dispatcher Node
        def supervisor_dispatch_node(state: EnterpriseFlowState):
            curr_idx = state["current_task_idx"]
            if curr_idx >= len(state["tasks"]):
                state["status"] = "COMPLETED"
                state["logs"].append("[Supervisor] All DAG tasks completed successfully.")
                return state

            curr_task = state["tasks"][curr_idx]
            requires_appr = curr_task.get("requires_approval", False)

            if requires_appr and state["approval_status"] != "APPROVED":
                state["is_paused_for_approval"] = True
                state["status"] = "WAITING_APPROVAL"
                state["logs"].append(f"[Supervisor] Task '{curr_task['title']}' paused at Human Approval Gate.")
                return state

            # Execute via specialized worker
            worker_role = curr_task["worker_role"]
            handoff = AgentTaskHandoff(
                task_id=curr_task["task_id"],
                workflow_id=state["workflow_id"],
                run_id=state["run_id"],
                source_agent="PLANNER",
                target_agent=worker_role,
                action_type=curr_task["action_type"],
                structured_parameters=state["shared_context"],
                idempotency_key=f"IDEMP-{curr_task['task_id']}"
            )

            state["logs"].append(f"[Supervisor] Delegated task '{curr_task['title']}' to {worker_role}.")

            # Execute with Autonomous Recovery & Chaos resilience
            with SessionLocal() as db:
                try:
                    if worker_role == "DOCUMENT_AND_DATA_WORKER":
                        res = DocumentAndDataWorker.execute(db, handoff)
                    elif worker_role == "BUSINESS_OPERATIONS_WORKER":
                        res = BusinessOperationsWorker.execute(db, handoff)
                    else:
                        res = ITAndIntegrationWorker.execute(db, handoff)

                    state["shared_context"].update(res.output_payload)
                    curr_task["status"] = "COMPLETED"
                    state["current_task_idx"] += 1
                    state["logs"].append(f"[{worker_role}] Task completed: {res.output_payload.get('status', 'SUCCESS')}")

                except Exception as e:
                    err_msg = str(e)
                    state["logs"].append(f"[Failure Detected] Error in {worker_role}: {err_msg}")

                    # Attempt registered recovery
                    def retry_op():
                        handoff.structured_parameters["_recovering"] = True
                        if worker_role == "DOCUMENT_AND_DATA_WORKER":
                            return DocumentAndDataWorker.execute(db, handoff)
                        elif worker_role == "BUSINESS_OPERATIONS_WORKER":
                            return BusinessOperationsWorker.execute(db, handoff)
                        else:
                            return ITAndIntegrationWorker.execute(db, handoff)

                    fault_type = "HTTP_409_CONFLICT" if "409" in err_msg else ("HTTP_429_RATE_LIMIT" if "429" in err_msg else "TIMEOUT")
                    rec = chaos_engine.execute_recovery(fault_type, retry_op, handoff.structured_parameters)

                    state["recovery_telemetry"].append(rec.model_dump())
                    curr_task["status"] = "COMPLETED"
                    state["current_task_idx"] += 1
                    state["logs"].append(f"[Autonomous Recovery] Succeeded via strategy: {rec.strategy}.")

            return state

        # Register nodes
        builder.add_node("understanding", request_understanding_node)
        builder.add_node("planner", planner_node)
        builder.add_node("policy_sentinel", policy_sentinel_node)
        builder.add_node("supervisor", supervisor_dispatch_node)

        # Edges
        builder.set_entry_point("understanding")
        builder.add_edge("understanding", "planner")
        builder.add_edge("planner", "policy_sentinel")
        builder.add_edge("policy_sentinel", "supervisor")

        # Routing condition from supervisor
        def route_supervisor(state: EnterpriseFlowState):
            if state.get("is_paused_for_approval") or state.get("status") in ["COMPLETED", "FAILED", "WAITING_APPROVAL"]:
                return END
            if state["current_task_idx"] < len(state["tasks"]):
                return "supervisor"
            return END

        builder.add_conditional_edges("supervisor", route_supervisor)

        return builder.compile()

langgraph_orchestrator = LangGraphWorkflowOrchestrator()

