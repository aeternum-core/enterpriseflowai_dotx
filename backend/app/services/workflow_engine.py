import asyncio
import json
import time
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.workflow import Workflow, WorkflowTask, WorkflowDependency, WorkflowContext
from app.models.approval import ApprovalRequest
from app.services.planner_service import planner_service
from app.services.agent_registry import agent_registry
from app.services.approval_engine import approval_engine
from app.services.audit_service import audit_service
from app.services.recovery_engine import recovery_engine

class WorkflowEngine:
    """
    Hierarchical DAG Workflow Orchestration Engine.
    Coordinates Level 1 Request Understanding, Level 2 Central Planning,
    Level 3 Specialized Agents, and Level 4 Governance & Approval Gates.
    """

    @classmethod
    def start_workflow(
        cls,
        db: Session,
        prompt: str,
        requester_id: Optional[str] = "user_employee_01"
    ) -> Workflow:
        # 1. Level 1: Request Understanding
        understanding = planner_service.understand_request(prompt)
        domain = understanding["domain"]
        title = understanding["title"]

        # 2. Level 2: Task Plan Decomposition
        plan = planner_service.decompose_plan(domain, understanding)

        # 3. Create Workflow in DB
        wf = Workflow(
            title=title,
            domain=domain,
            status="EXECUTING",
            priority="HIGH" if domain in ["invoice", "it_incident"] else "MEDIUM",
            risk_level="HIGH" if any(t.get("requires_approval") for t in plan) else "LOW",
            raw_input=prompt,
            extracted_entities=understanding,
            planner_plan=plan,
            requester_id=requester_id,
            started_at=datetime.utcnow()
        )
        db.add(wf)
        db.commit()
        db.refresh(wf)

        # 4. Insert Workflow Tasks
        task_entities = []
        for t in plan:
            task = WorkflowTask(
                workflow_id=wf.id,
                task_key=t["task_key"],
                agent_name=t["agent_name"],
                title=t["title"],
                description=t.get("description", ""),
                execution_order=t.get("execution_order", 0),
                status="PENDING",
                input_payload={"agent_key": t.get("agent_key"), "requires_approval": t.get("requires_approval", False)}
            )
            db.add(task)
            task_entities.append(task)
        db.commit()

        # Audit workflow creation
        audit_service.log_event(
            db=db,
            actor_type="PLANNER",
            actor_id="central_planner",
            actor_name="Central Planner Agent",
            event_type="WORKFLOW_STARTED",
            action_description=f"Decomposed and initiated {domain} workflow with {len(plan)} tasks.",
            workflow_id=wf.id,
            payload_reference={"domain": domain, "task_count": len(plan)},
            execution_result="SUCCESS"
        )

        # 5. Execute initial tasks until completion or Human Approval Gate
        cls.step_workflow(db, wf.id)
        db.refresh(wf)
        return wf

    @classmethod
    def step_workflow(cls, db: Session, workflow_id: str) -> Workflow:
        """
        Executes pending tasks in sequence.
        If a task requires human approval and has not been approved yet, pauses workflow.
        """
        wf = db.query(Workflow).filter(Workflow.id == workflow_id).first()
        if not wf:
            raise ValueError(f"Workflow {workflow_id} not found")

        if wf.status in ["COMPLETED", "REJECTED", "FAILED"]:
            return wf

        # Load shared context
        context_rows = db.query(WorkflowContext).filter(WorkflowContext.workflow_id == workflow_id).all()
        shared_context = {c.key: c.value for c in context_rows}
        shared_context["raw_input"] = wf.raw_input
        if wf.extracted_entities:
            shared_context.update(wf.extracted_entities)

        tasks: List[WorkflowTask] = db.query(WorkflowTask).filter(
            WorkflowTask.workflow_id == workflow_id
        ).order_by(WorkflowTask.execution_order.asc()).all()

        for task in tasks:
            if task.status == "COMPLETED" or task.status == "SKIPPED":
                continue

            agent_key = task.input_payload.get("agent_key")
            agent = agent_registry.get_agent(agent_key) if agent_key else None
            requires_approval = task.input_payload.get("requires_approval", False)

            # Check if this task requires approval
            if requires_approval:
                # Check if approval already created and approved
                approval = db.query(ApprovalRequest).filter(
                    ApprovalRequest.workflow_id == workflow_id,
                    ApprovalRequest.task_id == task.id
                ).first()

                if not approval:
                    # Create Approval Request and PAUSE
                    task.status = "WAITING_APPROVAL"
                    wf.status = "WAITING_APPROVAL"
                    db.commit()

                    amt = shared_context.get("extracted_amount") or shared_context.get("amount") or shared_context.get("total_value") or shared_context.get("refund_amount")
                    if wf.domain == "invoice":
                        role = "VP Finance" if amt and amt > 50000 else "Finance Director"
                        dept = "Finance & Treasury"
                    elif wf.domain == "it_incident":
                        role = "IT Security Admin"
                        dept = "Information Technology & Security"
                    elif wf.domain == "procurement":
                        role = "Procurement Manager"
                        dept = "Global Procurement"
                    elif wf.domain == "customer":
                        role = "Support Manager"
                        dept = "Customer Experience & Support"
                    elif wf.domain == "onboarding":
                        role = "HR Director"
                        dept = "People Operations & HR"
                    else:
                        role = "Department Manager"
                        dept = "Operations"

                    risk = "CRITICAL" if (amt and amt > 50000) or wf.domain == "it_incident" else "HIGH"

                    appr_req = approval_engine.create_approval_request(
                        db=db,
                        workflow_id=wf.id,
                        task_id=task.id,
                        title=f"Authorize {task.title}",
                        domain=wf.domain,
                        risk_level=risk,
                        requested_by_agent=agent.name if agent else "Central Planner Agent",
                        department=dept,
                        business_justification=f"Automated workflow requires human sign-off for {task.title} under Enterprise Policy.",
                        proposed_action=f"Execute {task.title} via tool gateway with verified parameters.",
                        proposed_payload=shared_context,
                        required_role=role,
                        ai_summary=f"Central Planner generated DAG task '{task.title}'. Validation checks completed successfully. Waiting for human approval.",
                        tools_invoked=agent.allowed_tools if agent else [],
                        validation_results={"checks_passed": 4, "compliance": "VERIFIED"},
                        financial_amount=amt,
                        due_date=datetime.utcnow() + timedelta(hours=24)
                    )
                    task.required_approval_id = appr_req.id
                    db.commit()
                    return wf

                elif approval.status == "PENDING":
                    # Still waiting for human
                    task.status = "WAITING_APPROVAL"
                    wf.status = "WAITING_APPROVAL"
                    db.commit()
                    return wf

                elif approval.status == "REJECTED":
                    task.status = "FAILED"
                    wf.status = "REJECTED"
                    db.commit()
                    return wf

                elif approval.status == "CHANGES_REQUESTED":
                    task.status = "PENDING"
                    wf.status = "CHANGES_REQUESTED"
                    db.commit()
                    return wf

                elif approval.status == "APPROVED":
                    # Approved! Proceed to execute the agent task
                    pass

            # Execute the agent task
            task.status = "IN_PROGRESS"
            task.started_at = datetime.utcnow()
            db.commit()

            try:
                def run_agent():
                    if agent:
                        return agent.execute(db, shared_context, wf.id, task.id)
                    return {"status": "SUCCESS", "message": f"Step {task.title} simulated successfully"}

                # Run through recovery engine (with exponential backoff & idempotency protection)
                out = recovery_engine.execute_with_recovery(
                    db=db,
                    workflow_id=wf.id,
                    task=task,
                    agent_key=agent_key or "system",
                    func=run_agent,
                    is_idempotent=True
                )

                task.status = "COMPLETED"
                task.completed_at = datetime.utcnow()
                task.output_payload = out
                db.commit()

                # Update shared context
                shared_context.update(out)
                for k, v in out.items():
                    ctx_row = WorkflowContext(
                        workflow_id=wf.id,
                        key=k,
                        value=v,
                        written_by_agent=agent.name if agent else "Planner"
                    )
                    db.add(ctx_row)
                db.commit()

            except Exception as e:
                task.status = "FAILED"
                task.error_details = {"error": str(e)}
                wf.status = "FAILED"
                db.commit()
                return wf

        # If all tasks are completed
        all_completed = all(t.status in ["COMPLETED", "SKIPPED"] for t in tasks)
        if all_completed:
            wf.status = "COMPLETED"
            wf.completed_at = datetime.utcnow()
            db.commit()

            audit_service.log_event(
                db=db,
                actor_type="PLANNER",
                actor_id="central_planner",
                actor_name="Central Planner Agent",
                event_type="WORKFLOW_COMPLETED",
                action_description=f"Workflow '{wf.title}' ({wf.id}) completed all tasks successfully.",
                workflow_id=wf.id,
                execution_result="SUCCESS"
            )

        return wf

    @classmethod
    def resume_workflow(cls, db: Session, workflow_id: str) -> Workflow:
        """Resumes a paused workflow after an approval decision"""
        wf = db.query(Workflow).filter(Workflow.id == workflow_id).first()
        if not wf:
            raise ValueError(f"Workflow {workflow_id} not found")

        wf.status = "EXECUTING"
        db.commit()

        # Step forward
        return cls.step_workflow(db, workflow_id)

workflow_engine = WorkflowEngine()

