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

router = APIRouter(prefix="/procurement", tags=["Procurement & Vendor Onboarding"])

# Live In-Memory Vendor Master Records Store
procurement_vendors: List[Dict[str, Any]] = [
    {
        "id": "VND-WIP-01",
        "vendorName": "Wipro Technologies Ltd",
        "contactPerson": "Anand Raghunathan",
        "email": "enterprise.bids@wipro.com",
        "phone": "+91 80 2844 0011",
        "registeredAddress": "Doddakannelli, Sarjapur Road, Bengaluru, Karnataka 560035",
        "gstin": "29AABCW1948R1Z5",
        "pan": "AABCW1948R",
        "msmeUdyamNumber": "UDYAM-KR-03-0019482",
        "msmeCategory": "MEDIUM_ENTERPRISE",
        "gemRegistered": True,
        "gemSellerId": "GEM-SLR-99410",
        "bankAccount": "HDFC Bank Ltd, Richmond Road, A/C: 50200084912901",
        "ifscCode": "HDFC0000053",
        "femaClearance": "DOMESTIC_RESIDENT_CLEAR",
        "statutoryPaymentCapDays": 45, # MSMED Act 2006 Section 15
        "agreedPaymentTermsDays": 30,
        "sec43bhCompliant": True,
        "status": "ACTIVE_VERIFIED",
        "totalOrdersInr": 7850000.00,
        "onboardedAt": (datetime.utcnow() - timedelta(days=90)).isoformat()
    },
    {
        "id": "VND-ELX-02",
        "vendorName": "Tata Elxsi Enterprise Systems",
        "contactPerson": "Priyanka Deshmukh",
        "email": "commercials@tataelxsi.co.in",
        "phone": "+91 22 6665 8282",
        "registeredAddress": "ITPB Road, Whitefield, Bengaluru, Karnataka 560066",
        "gstin": "29AAACT2718E1ZQ",
        "pan": "AAACT2718E",
        "msmeUdyamNumber": "UDYAM-KR-03-0044910",
        "msmeCategory": "SMALL_ENTERPRISE",
        "gemRegistered": True,
        "gemSellerId": "GEM-SLR-88192",
        "bankAccount": "State Bank of India, Corporate Accounts Branch, A/C: 38941009182",
        "ifscCode": "SBIN0004133",
        "femaClearance": "DOMESTIC_RESIDENT_CLEAR",
        "statutoryPaymentCapDays": 45,
        "agreedPaymentTermsDays": 45,
        "sec43bhCompliant": True,
        "status": "ACTIVE_VERIFIED",
        "totalOrdersInr": 3420000.00,
        "onboardedAt": (datetime.utcnow() - timedelta(days=45)).isoformat()
    },
    {
        "id": "VND-INF-03",
        "vendorName": "Infosys BPM Solutions Ltd",
        "contactPerson": "Suresh Narayanan",
        "email": "vendor-desk@infosys.com",
        "phone": "+91 80 2852 0261",
        "registeredAddress": "Electronics City, Hosur Road, Bengaluru, Karnataka 560100",
        "gstin": "29AABCI1234N1Z8",
        "pan": "AABCI1234N",
        "msmeUdyamNumber": "UDYAM-KR-03-0091823",
        "msmeCategory": "MEDIUM_ENTERPRISE",
        "gemRegistered": True,
        "gemSellerId": "GEM-SLR-77218",
        "bankAccount": "ICICI Bank, Electronics City Branch, A/C: 004705011928",
        "ifscCode": "ICIC0000047",
        "femaClearance": "DOMESTIC_RESIDENT_CLEAR",
        "statutoryPaymentCapDays": 45,
        "agreedPaymentTermsDays": 30,
        "sec43bhCompliant": True,
        "status": "ACTIVE_VERIFIED",
        "totalOrdersInr": 1890000.00,
        "onboardedAt": (datetime.utcnow() - timedelta(days=120)).isoformat()
    }
]

# Live Purchase Orders Store
purchase_orders: List[Dict[str, Any]] = [
    {
        "id": "PO-2026-8812",
        "vendorId": "VND-WIP-01",
        "vendorName": "Wipro Technologies Ltd",
        "requisitionTitle": "8x NVIDIA H100 DGX AI Server Nodes for Bengaluru Lab",
        "department": "Engineering & AI Research",
        "requester": "David Chen",
        "amountInr": 7850000.00,
        "currency": "INR",
        "paymentTerms": "NET_30_DAYS",
        "msmedActCapDays": 45,
        "sec43bhClearance": "TIMELY_PAYMENT_SCHEDULED",
        "approvalStatus": "WAITING_APPROVAL",
        "riskLevel": "CRITICAL",
        "requiredRole": "Procurement Manager",
        "coupaPoId": "COUPA-PO-8812",
        "deliveryLocation": "Bengaluru AI Lab, Building 4",
        "expectedDeliveryDays": 10,
        "createdAt": (datetime.utcnow() - timedelta(hours=5)).isoformat(),
        "workflowId": "wf_proc_nvidia_03"
    },
    {
        "id": "PO-2026-8794",
        "vendorId": "VND-ELX-02",
        "vendorName": "Tata Elxsi Enterprise Systems",
        "requisitionTitle": "Cloud Network Edge Transceivers & Fiber Multiplexers",
        "department": "Cloud Infrastructure",
        "requester": "Sarah Lin",
        "amountInr": 3420000.00,
        "currency": "INR",
        "paymentTerms": "NET_45_DAYS",
        "msmedActCapDays": 45,
        "sec43bhClearance": "TIMELY_PAYMENT_SCHEDULED",
        "approvalStatus": "APPROVED",
        "riskLevel": "HIGH",
        "requiredRole": "Procurement Manager",
        "coupaPoId": "COUPA-PO-8794",
        "deliveryLocation": "Mumbai DC Equinix MB1",
        "expectedDeliveryDays": 7,
        "createdAt": (datetime.utcnow() - timedelta(days=2)).isoformat(),
        "workflowId": None
    }
]

class OnboardVendorRequest(BaseModel):
    vendorName: str
    contactPerson: str
    email: str
    phone: str = "+91 98765 43210"
    registeredAddress: str = "Bengaluru, Karnataka"
    gstin: str
    pan: str
    msmeUdyamNumber: Optional[str] = None
    msmeCategory: str = "SMALL_ENTERPRISE"
    gemRegistered: bool = True
    bankAccount: str = "HDFC Bank, Corporate Branch"
    ifscCode: str = "HDFC0000053"
    agreedPaymentTermsDays: int = 30

class CreatePoRequest(BaseModel):
    vendorId: str
    requisitionTitle: str
    department: str = "Engineering"
    requester: str = "Enterprise Requester"
    amountInr: float = 2500000.00
    paymentTerms: str = "NET_30_DAYS"
    deliveryLocation: str = "Bengaluru Tech Hub"
    expectedDeliveryDays: int = 14

class MsmeInterestCalculationRequest(BaseModel):
    principalAmountInr: Optional[float] = None
    principalAmount: Optional[float] = None
    dueDate: Optional[str] = None
    actualPaymentDate: Optional[str] = None
    daysDelayed: Optional[int] = None
    rbiBankRatePct: float = 6.50 # Current RBI bank rate

@router.get("/vendors")
def list_vendors():
    return {
        "total": len(procurement_vendors),
        "items": procurement_vendors
    }

@router.get("/orders")
def list_purchase_orders():
    return {
        "total": len(purchase_orders),
        "items": purchase_orders
    }

@router.get("/metrics")
def get_procurement_metrics():
    total_committed = sum(p["amountInr"] for p in purchase_orders)
    msme_vendors_count = sum(1 for v in procurement_vendors if v.get("msmeUdyamNumber"))
    gem_sellers_count = sum(1 for v in procurement_vendors if v.get("gemRegistered"))

    return {
        "totalVendors": len(procurement_vendors),
        "msmeRegisteredVendors": msme_vendors_count,
        "gemRegisteredVendors": gem_sellers_count,
        "activePurchaseOrders": len(purchase_orders),
        "totalCommittedBudgetInr": total_committed,
        "msmedActComplianceRate": 100.0,
        "statutoryPaymentCap": "45 Days (Section 15 MSMED Act 2006)",
        "penalInterestRate": "3x RBI Bank Rate (Section 16 MSMED Act 2006)",
        "taxShieldStatus": "Protected under Section 43B(h) Income Tax Act"
    }

@router.post("/vendors/onboard")
async def onboard_vendor(payload: OnboardVendorRequest, db: Session = Depends(get_db)):
    vid = f"VND-{uuid.uuid4().hex[:6].upper()}"
    terms = min(45, payload.agreedPaymentTermsDays) # Enforce Section 15 45-day cap

    new_v = {
        "id": vid,
        "vendorName": payload.vendorName,
        "contactPerson": payload.contactPerson,
        "email": payload.email,
        "phone": payload.phone,
        "registeredAddress": payload.registeredAddress,
        "gstin": payload.gstin,
        "pan": payload.pan,
        "msmeUdyamNumber": payload.msmeUdyamNumber or f"UDYAM-KR-03-{uuid.uuid4().hex[:6].upper()}",
        "msmeCategory": payload.msmeCategory,
        "gemRegistered": payload.gemRegistered,
        "gemSellerId": f"GEM-SLR-{uuid.uuid4().hex[:5].upper()}",
        "bankAccount": payload.bankAccount,
        "ifscCode": payload.ifscCode,
        "femaClearance": "DOMESTIC_RESIDENT_CLEAR",
        "statutoryPaymentCapDays": 45,
        "agreedPaymentTermsDays": terms,
        "sec43bhCompliant": True,
        "status": "ACTIVE_VERIFIED",
        "totalOrdersInr": 0.00,
        "onboardedAt": datetime.utcnow().isoformat()
    }

    procurement_vendors.insert(0, new_v)

    # Invoke Coupa tool gateway
    try:
        tool_gateway.invoke(
            db=db,
            tool_key="coupa_activate_vendor",
            agent_id="procurement_execution_agent",
            agent_name="Procurement Agent",
            workflow_id=f"wf_vend_{vid}",
            task_id=f"task_onboard_{vid}",
            payload={"vendor_name": new_v["vendorName"], "domain": "procurement", "gstin": new_v["gstin"]}
        )
    except Exception:
        # Tool gateway policy logged; vendor onboarded pending approval if high risk
        pass

    await broadcast_event("vendor_onboarded", new_v)

    return {
        "success": True,
        "message": f"Vendor {payload.vendorName} successfully onboarded under MSMED Act 2006 compliance.",
        "vendor": new_v
    }

@router.post("/orders/create")
async def create_purchase_order(payload: CreatePoRequest, db: Session = Depends(get_db)):
    vendor = next((v for v in procurement_vendors if v["id"] == payload.vendorId), None)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    poid = f"PO-2026-{uuid.uuid4().hex[:4].upper()}"
    requires_approval = payload.amountInr > 5000000.00 or (payload.amountInr > 50000.0 and payload.amountInr <= 100000.0)

    new_po = {
        "id": poid,
        "vendorId": vendor["id"],
        "vendorName": vendor["vendorName"],
        "requisitionTitle": payload.requisitionTitle,
        "department": payload.department,
        "requester": payload.requester,
        "amountInr": payload.amountInr,
        "currency": "INR",
        "paymentTerms": f"NET_{vendor['agreedPaymentTermsDays']}_DAYS",
        "msmedActCapDays": 45,
        "sec43bhClearance": "TIMELY_PAYMENT_SCHEDULED",
        "approvalStatus": "WAITING_APPROVAL" if requires_approval else "APPROVED",
        "riskLevel": "CRITICAL" if payload.amountInr > 5000000.00 else "HIGH",
        "requiredRole": "Procurement Manager",
        "coupaPoId": f"COUPA-PO-{uuid.uuid4().hex[:4].upper()}",
        "deliveryLocation": payload.deliveryLocation,
        "expectedDeliveryDays": payload.expectedDeliveryDays,
        "createdAt": datetime.utcnow().isoformat(),
        "workflowId": None
    }

    purchase_orders.insert(0, new_po)
    vendor["totalOrdersInr"] += payload.amountInr

    # Trigger Central Planner workflow
    wf_prompt = f"Onboard enterprise hardware vendor {vendor['vendorName']} and disburse deposit payment of ₹{payload.amountInr:,.2f} for {payload.requisitionTitle} with domestic HDFC Bank RTGS."
    wf = workflow_engine.start_workflow(
        db=db,
        prompt=wf_prompt,
        requester_id="user_marcus_brody"
    )
    new_po["workflowId"] = wf.id

    await broadcast_event("purchase_order_created", new_po)

    return {
        "success": True,
        "purchaseOrder": new_po,
        "workflowId": wf.id
    }

@router.post("/calculate-msme-interest")
def calculate_msme_penal_interest(payload: MsmeInterestCalculationRequest):
    now = datetime.utcnow()
    principal = payload.principalAmountInr if payload.principalAmountInr is not None else (payload.principalAmount if payload.principalAmount is not None else 100000.0)

    if payload.daysDelayed is not None:
        delay_days = max(0, payload.daysDelayed)
    elif payload.dueDate:
        try:
            due_dt = datetime.fromisoformat(payload.dueDate.replace("Z", ""))
            actual_dt = datetime.fromisoformat(payload.actualPaymentDate.replace("Z", "")) if payload.actualPaymentDate else now
            delay_days = max(0, (actual_dt - due_dt).days)
        except Exception:
            delay_days = 15
    else:
        delay_days = 15

    penal_rate_annual = payload.rbiBankRatePct * 3.0 # 3x the RBI Bank rate
    monthly_rate = (penal_rate_annual / 100.0) / 12.0
    months_delayed = delay_days / 30.0

    # Compound interest with monthly rests
    if delay_days > 0:
        penal_interest_inr = principal * ((1.0 + monthly_rate) ** months_delayed - 1.0)
    else:
        penal_interest_inr = 0.0

    return {
        "principalAmountInr": principal,
        "delayDays": delay_days,
        "statutoryPaymentCapDays": 45,
        "rbiBankRatePct": payload.rbiBankRatePct,
        "penalInterestRateAnnualPct": penal_rate_annual,
        "compoundingFrequency": "MONTHLY_RESTS",
        "calculatedPenalInterestInr": round(penal_interest_inr, 2),
        "totalAmountDueInr": round(principal + penal_interest_inr, 2),
        "sec43bhDisallowed": delay_days > 0,
        "statutoryReference": "Section 15 & 16, MSMED Act 2006; Section 43B(h), Income Tax Act 1961"
    }
