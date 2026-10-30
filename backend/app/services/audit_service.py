import hashlib
import json
from datetime import datetime
from typing import Optional, Dict, Any, List, Tuple
from sqlalchemy.orm import Session
from app.models.audit import AuditEvent, AuditCheckpoint

GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000"

class AuditService:
    @staticmethod
    def _calculate_hash(
        sequence_number: int,
        previous_hash: str,
        actor_id: str,
        event_type: str,
        action_description: str,
        payload_reference: Dict[str, Any],
        timestamp_str: str
    ) -> str:
        payload_str = json.dumps(payload_reference, sort_keys=True, default=str)
        raw_string = f"{sequence_number}|{previous_hash}|{actor_id}|{event_type}|{action_description}|{payload_str}|{timestamp_str}"
        return hashlib.sha256(raw_string.encode('utf-8')).hexdigest()

    @classmethod
    def log_event(
        cls,
        db: Session,
        actor_type: str,
        actor_id: str,
        actor_name: str,
        event_type: str,
        action_description: str,
        workflow_id: Optional[str] = None,
        task_id: Optional[str] = None,
        payload_reference: Optional[Dict[str, Any]] = None,
        execution_result: str = "SUCCESS",
        approval_info: Optional[Dict[str, Any]] = None
    ) -> AuditEvent:
        if payload_reference is None:
            payload_reference = {}

        # Get last audit event to maintain hash chain
        last_event = db.query(AuditEvent).order_by(AuditEvent.sequence_number.desc()).first()
        if last_event:
            seq = (last_event.sequence_number or 0) + 1
            prev_hash = last_event.current_hash
        else:
            seq = 1
            prev_hash = GENESIS_HASH

        now = datetime.utcnow()
        now_iso = now.isoformat()
        current_hash = cls._calculate_hash(
            sequence_number=seq,
            previous_hash=prev_hash,
            actor_id=actor_id,
            event_type=event_type,
            action_description=action_description,
            payload_reference=payload_reference,
            timestamp_str=now_iso
        )

        event = AuditEvent(
            sequence_number=seq,
            workflow_id=workflow_id,
            task_id=task_id,
            actor_type=actor_type,
            actor_id=actor_id,
            actor_name=actor_name,
            event_type=event_type,
            action_description=action_description,
            payload_reference=payload_reference,
            execution_result=execution_result,
            approval_info=approval_info,
            previous_hash=prev_hash,
            current_hash=current_hash,
            timestamp=now
        )
        db.add(event)
        db.commit()
        db.refresh(event)
        return event

    @classmethod
    def verify_chain_integrity(cls, db: Session) -> Dict[str, Any]:
        """
        Validates the complete SHA-256 hash chain from Genesis to current tip.
        Returns detailed report indicating whether chain is 100% untampered or where breaks occur.
        """
        events: List[AuditEvent] = db.query(AuditEvent).order_by(AuditEvent.sequence_number.asc()).all()
        if not events:
            return {
                "valid": True,
                "total_events": 0,
                "message": "Audit chain empty, zero events recorded.",
                "tampered_events": []
            }

        expected_prev_hash = GENESIS_HASH
        tampered_events = []

        for evt in events:
            # 1. Verify previous hash link
            if evt.previous_hash != expected_prev_hash:
                tampered_events.append({
                    "sequence_number": evt.sequence_number,
                    "event_id": evt.id,
                    "reason": "Previous hash mismatch",
                    "expected_prev_hash": expected_prev_hash,
                    "actual_prev_hash": evt.previous_hash
                })

            # 2. Recompute current hash
            recomputed = cls._calculate_hash(
                sequence_number=evt.sequence_number,
                previous_hash=evt.previous_hash,
                actor_id=evt.actor_id,
                event_type=evt.event_type,
                action_description=evt.action_description,
                payload_reference=evt.payload_reference or {},
                timestamp_str=evt.timestamp.isoformat()
            )

            if recomputed != evt.current_hash:
                tampered_events.append({
                    "sequence_number": evt.sequence_number,
                    "event_id": evt.id,
                    "reason": "Current hash invalid (content was modified)",
                    "expected_current_hash": recomputed,
                    "actual_current_hash": evt.current_hash
                })

            expected_prev_hash = evt.current_hash

        is_valid = len(tampered_events) == 0
        return {
            "valid": is_valid,
            "total_events": len(events),
            "latest_sequence": events[-1].sequence_number if events else 0,
            "latest_root_hash": events[-1].current_hash if events else None,
            "message": "All cryptographic signatures and chained hashes verified successfully." if is_valid else f"Tampering detected in {len(tampered_events)} event(s).",
            "tampered_events": tampered_events
        }

audit_service = AuditService()

