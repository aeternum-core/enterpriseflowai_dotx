import time
import uuid
from typing import Dict, Any, Optional, Callable
from sqlalchemy.orm import Session
from app.models.recovery import RecoveryAttempt
from app.models.workflow import WorkflowTask
from app.services.audit_service import audit_service

class RecoveryEngine:
    """
    Dedicated Failure Recovery & Reliability Engine.
    Handles transient network glitches, timeouts, exponential backoff,
    and escalates unrecoverable failures to human intervention.
    """

    @classmethod
    def execute_with_recovery(
        cls,
        db: Session,
        workflow_id: str,
        task: WorkflowTask,
        agent_key: str,
        func: Callable[[], Dict[str, Any]],
        is_idempotent: bool = True
    ) -> Dict[str, Any]:
        attempt = 1
        max_attempts = task.max_retries or 3
        backoff_sec = 0.5

        while attempt <= max_attempts:
            try:
                # Execute task
                result = func()
                if attempt > 1:
                    # Log successful recovery after retry
                    recovery_record = RecoveryAttempt(
                        workflow_id=workflow_id,
                        task_id=task.id,
                        agent_id=agent_key,
                        error_type="TRANSIENT_FAILURE",
                        error_message="Recovered successfully via exponential backoff.",
                        attempt_number=attempt,
                        max_attempts=max_attempts,
                        strategy="EXPONENTIAL_BACKOFF",
                        status="RECOVERED"
                    )
                    db.add(recovery_record)
                    db.commit()

                    audit_service.log_event(
                        db=db,
                        actor_type="RECOVERY_ENGINE",
                        actor_id="recovery_engine",
                        actor_name="Automated Recovery Engine",
                        event_type="RECOVERY_SUCCESS",
                        action_description=f"Task '{task.title}' recovered successfully on attempt {attempt}.",
                        workflow_id=workflow_id,
                        task_id=task.id,
                        execution_result="SUCCESS"
                    )
                return result

            except Exception as e:
                err_str = str(e)
                # If non-idempotent operation and we are not sure if it already succeeded, DO NOT blind retry
                if not is_idempotent and attempt > 1:
                    status = "FAILED_ESCALATED"
                    msg = f"Non-idempotent operation failed. Blind retry aborted to avoid double execution: {err_str}"
                    cls._record_attempt(db, workflow_id, task.id, agent_key, "NON_IDEMPOTENT_ABORT", msg, attempt, max_attempts, status)
                    raise e

                if attempt >= max_attempts:
                    # All retries exhausted -> Escalate
                    cls._record_attempt(db, workflow_id, task.id, agent_key, "RETRIES_EXHAUSTED", err_str, attempt, max_attempts, "FAILED_ESCALATED")
                    audit_service.log_event(
                        db=db,
                        actor_type="RECOVERY_ENGINE",
                        actor_id="recovery_engine",
                        actor_name="Automated Recovery Engine",
                        event_type="RECOVERY_ESCALATED",
                        action_description=f"Task '{task.title}' exhausted {max_attempts} retries. Escalated for human intervention.",
                        workflow_id=workflow_id,
                        task_id=task.id,
                        payload_reference={"error": err_str},
                        execution_result="FAILURE"
                    )
                    raise e

                # Record retry attempt and backoff
                cls._record_attempt(db, workflow_id, task.id, agent_key, "RETRYING_ATTEMPT", err_str, attempt, max_attempts, "RETRYING")
                time.sleep(backoff_sec)
                backoff_sec *= 2 # Exponential backoff
                attempt += 1

    @classmethod
    def _record_attempt(
        cls,
        db: Session,
        workflow_id: str,
        task_id: str,
        agent_id: str,
        error_type: str,
        error_msg: str,
        attempt: int,
        max_attempts: int,
        status: str
    ):
        rec = RecoveryAttempt(
            workflow_id=workflow_id,
            task_id=task_id,
            agent_id=agent_id,
            error_type=error_type,
            error_message=error_msg,
            attempt_number=attempt,
            max_attempts=max_attempts,
            strategy="EXPONENTIAL_BACKOFF",
            status=status
        )
        db.add(rec)
        db.commit()

recovery_engine = RecoveryEngine()

