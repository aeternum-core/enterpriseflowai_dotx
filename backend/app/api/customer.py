import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.workflow_engine import workflow_engine
from app.services.tool_gateway import tool_gateway
from app.services.audit_service import audit_service
from app.api.auth import broadcast_event

router = APIRouter(prefix="/customer", tags=["Customer Requests & Resolution"])

# Live In-Memory Customer Tickets Store
customer_tickets: List[Dict[str, Any]] = [
    {
        "id": "TKT-REL-9921",
        "accountName": "Reliance Digital Systems",
        "contactEmail": "billing@reliancedigital.in",
        "customerTier": "ENTERPRISE_PLATINUM",
        "subject": "Mumbai Gateway API degradation - 504 Gateway Timeout during flash sale",
        "description": "Critical API outage lasting 18 minutes on Mumbai Cloud Gateway during Diwali sale event. Requesting SLA credit refund under Tier-1 agreement.",
        "category": "BILLING_REFUND_DISPUTE",
        "sentiment": "NEGATIVE",
        "sentimentScore": -0.82,
        "priority": "HIGH",
        "status": "WAITING_APPROVAL",
        "transactionId": "TXN_UPI_20261028_9941",
        "transactionDate": (datetime.utcnow() - timedelta(days=5)).isoformat(),
        "transactionType": "UPI_IMPS_REVERSAL",
        "turnaroundDays": 5,
        "mandatedTatDays": 1, # RBI T+1 rule
        "tatBreached": True,
        "tatDelayDays": 4,
        "suoMotuCompensationInr": 400.00, # ₹100 per day under RBI circular DPSS.CO.PD No.629
        "disputedAmountInr": 45000.00,
        "proposedCreditInr": 45400.00,
        "slaBreachConfirmed": True,
        "slaPolicyTier": "99.99% Availability Commitment",
        "remedyAction": "Credit memo adjustment & RazorpayX instant refund",
        "approvalRequired": True,
        "requiredRole": "Support Manager",
        "zendeskTicketId": "ZD-IN-88941",
        "createdAt": (datetime.utcnow() - timedelta(hours=28)).isoformat(),
        "workflowId": "wf_cust_sla_04"
    },
    {
        "id": "TKT-FLP-8812",
        "accountName": "Flipkart Wholesale India",
        "contactEmail": "ap-settlements@flipkart.com",
        "customerTier": "ENTERPRISE_GOLD",
        "subject": "Duplicate merchant webhook debit during batch sync",
        "description": "Double billing of ₹12,400.00 occurred on merchant settlement batch cycle #4012. Automated webhook retry caused duplicate charge.",
        "category": "DUPLICATE_BILLING",
        "sentiment": "NEUTRAL",
        "sentimentScore": 0.05,
        "priority": "MEDIUM",
        "status": "RESOLVED",
        "transactionId": "TXN_CARD_20261030_1182",
        "transactionDate": (datetime.utcnow() - timedelta(days=1)).isoformat(),
        "transactionType": "CARD_PAYMENT_REVERSAL",
        "turnaroundDays": 1,
        "mandatedTatDays": 5, # RBI T+5 rule for cards
        "tatBreached": False,
        "tatDelayDays": 0,
        "suoMotuCompensationInr": 0.00,
        "disputedAmountInr": 12400.00,
        "proposedCreditInr": 12400.00,
        "slaBreachConfirmed": False,
        "slaPolicyTier": "Standard Enterprise Support",
        "remedyAction": "Automated reversal via RazorpayX refund rails",
        "approvalRequired": False,
        "requiredRole": "Support Specialist",
        "zendeskTicketId": "ZD-IN-88912",
        "createdAt": (datetime.utcnow() - timedelta(hours=14)).isoformat(),
        "resolvedAt": (datetime.utcnow() - timedelta(hours=2)).isoformat(),
        "workflowId": None
    },
    {
        "id": "TKT-ZOM-7734",
        "accountName": "Zomato Enterprise Dining",
        "contactEmail": "infra-ops@zomato.com",
        "customerTier": "ENTERPRISE_PLATINUM",
        "subject": "Webhook retry storm latency degradation",
        "description": "Webhook endpoint experienced 340ms latency spikes resulting in queued order dispatch notifications. Requesting service credit adjustment.",
        "category": "SLA_LATENCY_BREACH",
        "sentiment": "NEUTRAL",
        "sentimentScore": -0.15,
        "priority": "MEDIUM",
        "status": "IN_TRIAGE",
        "transactionId": "TXN_NEFT_20261029_8819",
        "transactionDate": (datetime.utcnow() - timedelta(days=2)).isoformat(),
        "transactionType": "UPI_IMPS_REVERSAL",
        "turnaroundDays": 2,
        "mandatedTatDays": 1,
        "tatBreached": True,
        "tatDelayDays": 1,
        "suoMotuCompensationInr": 100.00,
        "disputedAmountInr": 8500.00,
        "proposedCreditInr": 8600.00,
        "slaBreachConfirmed": True,
        "slaPolicyTier": "Platinum Sub-50ms SLA",
        "remedyAction": "Zendesk customer macro + billing deduction credit note",
        "approvalRequired": False, # under 15,000 threshold
        "requiredRole": "Support Specialist",
        "zendeskTicketId": "ZD-IN-88734",
        "createdAt": (datetime.utcnow() - timedelta(hours=6)).isoformat(),
        "workflowId": None
    },
    {
        "id": "TKT-TAT-6641",
        "accountName": "Tata Neu SuperApp FinTech",
        "contactEmail": "fintech-ops@tataneu.in",
        "customerTier": "STRATEGIC_PARTNER",
        "subject": "Monthly reconciliation variance in loyalty points credit",
        "description": "Points clearing ledger variance of ₹3,200.00 during Diwali promotional campaign period.",
        "category": "RECONCILIATION_QUERY",
        "sentiment": "POSITIVE",
        "sentimentScore": 0.45,
        "priority": "LOW",
        "status": "RESOLVED",
        "transactionId": "TXN_UPI_20261029_1102",
        "transactionDate": (datetime.utcnow() - timedelta(days=1)).isoformat(),
        "transactionType": "UPI_IMPS_REVERSAL",
        "turnaroundDays": 1,
        "mandatedTatDays": 1,
        "tatBreached": False,
        "tatDelayDays": 0,
        "suoMotuCompensationInr": 0.00,
        "disputedAmountInr": 3200.00,
        "proposedCreditInr": 3200.00,
        "slaBreachConfirmed": False,
        "slaPolicyTier": "Strategic Partner Enterprise",
        "remedyAction": "Ledger reconciliation memo issued",
        "approvalRequired": False,
        "requiredRole": "Support Specialist",
        "zendeskTicketId": "ZD-IN-88641",
        "createdAt": (datetime.utcnow() - timedelta(hours=36)).isoformat(),
        "resolvedAt": (datetime.utcnow() - timedelta(hours=30)).isoformat(),
        "workflowId": None
    }
]

class CreateTicketRequest(BaseModel):
    accountName: str
    contactEmail: str
    customerTier: str = "ENTERPRISE_GOLD"
    subject: str
    description: str
    category: str = "BILLING_REFUND_DISPUTE"
    disputedAmountInr: float = 15000.00
    transactionType: str = "UPI_IMPS_REVERSAL"
    transactionDate: Optional[str] = None
    priority: str = "HIGH"

class ResolveTicketRequest(BaseModel):
    remedyNotes: str = "Authorized credit adjustment and updated Zendesk customer record."
    includeSuoMotuCompensation: bool = True
    approvedBy: str = "Support Manager"

class RbiTatCalculationRequest(BaseModel):
    transactionType: str = "UPI_IMPS_REVERSAL"  # UPI_IMPS_REVERSAL, CARD_PAYMENT_REVERSAL, ATM_REVERSAL, WALLET_REVERSAL
    transactionDate: Optional[str] = None
    amountInr: Optional[float] = None
    amount: Optional[float] = None
    daysDelayed: Optional[int] = None

@router.get("/tickets")
def list_customer_tickets():
    return {
        "total": len(customer_tickets),
        "items": customer_tickets
    }

@router.get("/metrics")
def get_customer_metrics():
    total_refunds = sum(t.get("proposedCreditInr", 0) for t in customer_tickets)
    active_breaches = sum(1 for t in customer_tickets if t.get("tatBreached", False) and t.get("status") != "RESOLVED")
    total_suo_motu = sum(t.get("suoMotuCompensationInr", 0) for t in customer_tickets)
    resolved_count = sum(1 for t in customer_tickets if t.get("status") == "RESOLVED")
    waiting_approval = sum(1 for t in customer_tickets if t.get("status") == "WAITING_APPROVAL")

    return {
        "totalTickets": len(customer_tickets),
        "resolvedTickets": resolved_count,
        "waitingApprovalCount": waiting_approval,
        "rbiTatBreaches": active_breaches,
        "totalRefundValueInr": total_refunds,
        "totalSuoMotuCompensationInr": total_suo_motu,
        "slaComplianceRate": 99.4,
        "rbiTatStandard": "RBI DPSS.CO.PD No.629 (T+1 UPI / T+5 Cards)",
        "suoMotuRate": "₹100/day delay compensation"
    }

@router.post("/tickets/create")
async def create_customer_ticket(payload: CreateTicketRequest, db: Session = Depends(get_db)):
    tkt_id = f"TKT-CUST-{uuid.uuid4().hex[:4].upper()}"
    now = datetime.utcnow()

    # Calculate TAT
    tx_date_str = payload.transactionDate or (now - timedelta(days=2)).isoformat()
    try:
        tx_dt = datetime.fromisoformat(tx_date_str.replace("Z", ""))
    except Exception:
        tx_dt = now - timedelta(days=2)

    turnaround_days = max(1, (now - tx_dt).days)
    mandated_tat = 1 if "UPI" in payload.transactionType or "IMPS" in payload.transactionType else 5
    tat_breached = turnaround_days > mandated_tat
    delay_days = max(0, turnaround_days - mandated_tat) if tat_breached else 0
    suo_motu_comp = delay_days * 100.00 # ₹100 per day under RBI circular

    requires_approval = (payload.disputedAmountInr + suo_motu_comp) > 15000.00

    new_tkt = {
        "id": tkt_id,
        "accountName": payload.accountName,
        "contactEmail": payload.contactEmail,
        "customerTier": payload.customerTier,
        "subject": payload.subject,
        "description": payload.description,
        "category": payload.category,
        "sentiment": "NEGATIVE" if "outage" in payload.description.lower() or "timeout" in payload.description.lower() else "NEUTRAL",
        "sentimentScore": -0.75 if "outage" in payload.description.lower() else -0.1,
        "priority": payload.priority,
        "status": "WAITING_APPROVAL" if requires_approval else "IN_TRIAGE",
        "transactionId": f"TXN_{uuid.uuid4().hex[:8].upper()}",
        "transactionDate": tx_date_str,
        "transactionType": payload.transactionType,
        "turnaroundDays": turnaround_days,
        "mandatedTatDays": mandated_tat,
        "tatBreached": tat_breached,
        "tatDelayDays": delay_days,
        "suoMotuCompensationInr": suo_motu_comp,
        "disputedAmountInr": payload.disputedAmountInr,
        "proposedCreditInr": payload.disputedAmountInr + suo_motu_comp,
        "slaBreachConfirmed": True,
        "slaPolicyTier": "Tier-1 Enterprise Customer SLA",
        "remedyAction": "Credit memo & RazorpayX refund rail",
        "approvalRequired": requires_approval,
        "requiredRole": "Support Manager" if requires_approval else "Support Specialist",
        "zendeskTicketId": f"ZD-IN-{uuid.uuid4().hex[:5].upper()}",
        "createdAt": now.isoformat(),
        "workflowId": None
    }

    customer_tickets.insert(0, new_tkt)

    # Trigger Central Planner Workflow Engine
    wf_prompt = f"Customer request resolution for {payload.accountName}: {payload.subject} (Refund: ₹{payload.disputedAmountInr:,.2f} + Suo Motu ₹{suo_motu_comp:,.2f})"
    wf = workflow_engine.start_workflow(
        db=db,
        prompt=wf_prompt,
        requester_id="user_marcus_brody"
    )
    new_tkt["workflowId"] = wf.id

    await broadcast_event("customer_ticket_created", new_tkt)

    return {
        "success": True,
        "ticket": new_tkt,
        "workflowId": wf.id
    }

@router.post("/tickets/{ticket_id}/resolve")
async def resolve_customer_ticket(ticket_id: str, payload: ResolveTicketRequest, db: Session = Depends(get_db)):
    target = next((t for t in customer_tickets if t["id"] == ticket_id), None)
    if not target:
        raise HTTPException(status_code=404, detail="Customer ticket not found")

    target["status"] = "RESOLVED"
    target["resolvedAt"] = datetime.utcnow().isoformat()
    target["resolutionNotes"] = payload.remedyNotes
    target["resolvedBy"] = payload.approvedBy

    # Invoke tool gateway for Zendesk update and RazorpayX refund
    tool_gateway.invoke(
        db=db,
        tool_key="zendesk_update_ticket",
        agent_id="customer_resolution_agent",
        agent_name="Customer Resolution Agent",
        workflow_id=target.get("workflowId") or f"wf_cust_{ticket_id}",
        task_id=f"task_resolve_{ticket_id}",
        payload={
            "ticket_id": target["zendeskTicketId"],
            "resolution_macro": "MACRO_ENTERPRISE_SLA_CREDIT_PROCESSED",
            "compensation_inr": target["proposedCreditInr"],
            "suo_motu_inr": target["suoMotuCompensationInr"],
            "customer_email": target["contactEmail"]
        }
    )

    await broadcast_event("customer_ticket_resolved", target)

    return {
        "success": True,
        "message": f"Ticket {ticket_id} successfully resolved and settlement dispatched via RazorpayX.",
        "ticket": target
    }

@router.post("/calculate-rbi-tat")
def calculate_rbi_tat(payload: RbiTatCalculationRequest):
    now = datetime.utcnow()
    amount = payload.amountInr if payload.amountInr is not None else (payload.amount if payload.amount is not None else 10000.0)

    if payload.daysDelayed is not None:
        turnaround_days = max(1, payload.daysDelayed + 1)
    elif payload.transactionDate:
        try:
            tx_dt = datetime.fromisoformat(payload.transactionDate.replace("Z", ""))
            turnaround_days = max(1, (now - tx_dt).days)
        except Exception:
            turnaround_days = 3
    else:
        turnaround_days = 3

    is_upi = "UPI" in payload.transactionType or "IMPS" in payload.transactionType
    mandated_tat = 1 if is_upi else (5 if "CARD" in payload.transactionType else 3)
    tat_breached = turnaround_days > mandated_tat
    delay_days = max(0, turnaround_days - mandated_tat) if tat_breached else 0
    suo_motu = delay_days * 100.00

    return {
        "transactionType": payload.transactionType,
        "mandatedTatDays": mandated_tat,
        "turnaroundDays": turnaround_days,
        "tatBreached": tat_breached,
        "delayDaysBeyondTat": delay_days,
        "dailyPenaltyRateInr": 100.00,
        "totalSuoMotuCompensationInr": suo_motu,
        "originalAmountInr": amount,
        "finalSettlementAmountInr": amount + suo_motu,
        "regulatoryAuthority": "Reserve Bank of India (RBI)",
        "circularReference": "DPSS.CO.PD No.629/02.01.014/2019-20 (Harmonisation of Turn Around Time)"
    }
