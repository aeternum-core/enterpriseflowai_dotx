import uuid
import secrets
import string
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.workflow import Workflow, WorkflowTask
from app.services.workflow_engine import workflow_engine
from app.services.audit_service import audit_service
from app.services.email_service import email_service
from app.api.auth import broadcast_event

router = APIRouter(prefix="/onboarding", tags=["Employee Onboarding"])

# In-memory storage for active onboarding sessions and dispatched personal mailbox emails
onboarding_records: List[Dict[str, Any]] = []
personal_inbox_messages: List[Dict[str, Any]] = []

def generate_secure_password(length: int = 12) -> str:
    """Generate a high-entropy temporary corporate password meeting SOC2/ISO27001 requirements."""
    chars = string.ascii_letters + string.digits + "!@#$%^&*"
    return "EF#" + "".join(secrets.choice(chars) for _ in range(length - 3))

class PersonalInfo(BaseModel):
    fullName: str
    personalEmail: str
    phoneNumber: Optional[str] = "+91 98765 43210"
    dateOfJoining: str
    designation: str
    department: str
    reportingManager: str
    workLocation: str = "Bengaluru Tech Corridor"
    annualSalaryInr: float = 2400000.00
    panCardNumber: Optional[str] = "ABCDE1234F"
    aadhaarNumber: Optional[str] = "XXXX-XXXX-8912"

class EquipmentAllocation(BaseModel):
    laptopModel: str = "Apple MacBook Pro 16\" (M3 Max, 36GB RAM, 1TB SSD)"
    monitors: str = "Dual 27\" Dell UltraSharp 4K USB-C Displays"
    peripherals: str = "Logitech MX Master 3S Mouse + Mechanical Wireless Keyboard"
    securityKey: str = "YubiKey 5C NFC Multi-Protocol Security Key"
    accessCardId: Optional[str] = None
    welcomeSwagKit: str = "EnterpriseFlow Hoodie, Hydro Flask, Notebook & Tech Backpack"
    courierTrackingId: Optional[str] = None
    courierPartner: str = "Bluedart Express Priority Dispatch"

class PerksAndBenefits(BaseModel):
    joiningBonusInr: float = 250000.00
    learningBudgetInr: float = 120000.00
    healthInsuranceInr: float = 1500000.00
    homeOfficeAllowanceInr: float = 50000.00
    monthlyMealAllowanceInr: float = 4500.00
    paidTimeOffDays: int = 28

class ProvisionOnboardingRequest(BaseModel):
    personalInfo: PersonalInfo
    equipment: EquipmentAllocation
    perks: PerksAndBenefits
    submittedByUserId: Optional[str] = "usr-hr-02"
    submittedByName: Optional[str] = "Elena Rostova"
    submittedByRole: Optional[str] = "HR_MANAGER"

def create_sample_seed_records():
    """Seed initial realistic Indian corporate onboarding records and dispatched mailbox emails."""
    if onboarding_records:
        return

    now = datetime.now()
    sample_id = "onboard_in_001"
    emp_id = "EF-IN-8942"
    email = "rahul.verma@enterpriseflow.corp"
    personal_email = "rahul.verma@gmail.com"
    temp_pass = "EF#Welcome2026!k9Z"
    tracking = "BD-IN-98124501"

    sample_record = {
        "id": sample_id,
        "employeeId": emp_id,
        "status": "COMPLETED",
        "createdAt": (now - timedelta(days=1)).isoformat(),
        "dispatchedAt": (now - timedelta(days=1)).isoformat(),
        "personalInfo": {
            "fullName": "Rahul Verma",
            "personalEmail": personal_email,
            "phoneNumber": "+91 98450 12345",
            "dateOfJoining": "2026-11-15",
            "designation": "Staff Cloud Infrastructure Engineer",
            "department": "Platform Engineering & DevOps",
            "reportingManager": "Alexander Sterling",
            "workLocation": "Bengaluru Tech Corridor",
            "annualSalaryInr": 3200000.00,
            "panCardNumber": "AAAPL8912K",
            "aadhaarNumber": "5412-8891-4921"
        },
        "credentials": {
            "corporateEmail": email,
            "username": "rverma",
            "temporaryPassword": temp_pass,
            "ssoPortalUrl": "http://127.0.0.1:5173/login",
            "oktaMfaCode": "MFA-7729-AUTH",
            "provisionedSystems": [
                "Google Workspace Enterprise",
                "GitHub Enterprise (EnterpriseFlow Org)",
                "Slack Enterprise Grid",
                "Workday HCM Portal",
                "AWS Mumbai Staging Cluster"
            ]
        },
        "equipment": {
            "laptopModel": "Apple MacBook Pro 16\" (M3 Max, 36GB RAM, 1TB SSD)",
            "monitors": "Dual 27\" Dell UltraSharp 4K USB-C Displays",
            "peripherals": "Logitech MX Master 3S Mouse + Mechanical Wireless Keyboard",
            "securityKey": "YubiKey 5C NFC Multi-Protocol Security Key",
            "accessCardId": "CARD-EF-8942-BLR",
            "welcomeSwagKit": "EnterpriseFlow Hoodie, Hydro Flask, Notebook & Tech Backpack",
            "courierTrackingId": tracking,
            "courierPartner": "Bluedart Express Priority Dispatch"
        },
        "perks": {
            "joiningBonusInr": 250000.00,
            "learningBudgetInr": 120000.00,
            "healthInsuranceInr": 1500000.00,
            "homeOfficeAllowanceInr": 50000.00,
            "monthlyMealAllowanceInr": 4500.00,
            "paidTimeOffDays": 28
        }
    }
    onboarding_records.append(sample_record)

    # Seed the personal mailbox message for Rahul Verma
    personal_inbox_messages.append({
        "id": f"mail_{uuid.uuid4().hex[:8]}",
        "to": personal_email,
        "from": "EnterpriseFlow People Operations <hr-onboarding@enterpriseflow.corp>",
        "subject": "🎉 Welcome to EnterpriseFlow AI India — Your Official Credentials & Onboarding Package",
        "sentAt": (now - timedelta(days=1)).isoformat(),
        "read": False,
        "employeeId": emp_id,
        "employeeName": "Rahul Verma",
        "corporateEmail": email,
        "temporaryPassword": temp_pass,
        "ssoPortalUrl": "http://127.0.0.1:5173/login",
        "courierTrackingId": tracking,
        "joiningBonus": "₹2,50,000.00",
        "laptopModel": "Apple MacBook Pro 16\" (M3 Max, 36GB RAM, 1TB SSD)",
        "workLocation": "Bengaluru Tech Corridor",
        "dateOfJoining": "2026-11-15",
        "reportingManager": "Alexander Sterling",
        "summary": "Official onboarding offer, single sign-on credentials, hardware shipment tracking, and first-day orientation schedule."
    })

# Initialize sample data
create_sample_seed_records()

@router.get("/records")
def get_onboarding_records():
    """Retrieve all active and completed employee onboarding records."""
    return {
        "total": len(onboarding_records),
        "records": onboarding_records
    }

@router.get("/mailbox/{personal_email}")
def get_personal_mailbox(personal_email: str):
    """Retrieve all simulated welcome and onboarding emails sent to a candidate's personal inbox."""
    messages = [m for m in personal_inbox_messages if m["to"].lower() == personal_email.lower()]
    return {
        "recipient": personal_email,
        "unread_count": sum(1 for m in messages if not m.get("read", False)),
        "messages": messages
    }

@router.get("/mailbox")
def get_all_personal_mailbox_messages():
    """Retrieve all simulated personal emails across all onboarded employees."""
    return {
        "total": len(personal_inbox_messages),
        "messages": personal_inbox_messages
    }

@router.post("/provision")
async def provision_employee_onboarding(
    payload: ProvisionOnboardingRequest,
    db: Session = Depends(get_db)
):
    """
    Execute full employee onboarding:
    1. Generates corporate credentials (email, username, temporary SSO password).
    2. Allocates hardware, courier tracking, and security key.
    3. Confirms joining bonus and perks in INR.
    4. Automatically dispatches the comprehensive Dummy Welcome Email to employee's personal mailbox.
    5. Starts autonomous multi-agent workflow in the orchestrator.
    6. Logs an immutable cryptographic audit trail event.
    """
    now = datetime.now()
    p_info = payload.personalInfo
    equip = payload.equipment
    perks = payload.perks

    # Generate corporate email and identity
    name_parts = p_info.fullName.strip().split()
    first_name = name_parts[0].lower()
    last_name = name_parts[-1].lower() if len(name_parts) > 1 else "corp"
    corporate_email = f"{first_name}.{last_name}@enterpriseflow.corp"
    username = f"{first_name[0]}{last_name}"
    temporary_password = generate_secure_password()
    emp_id = f"EF-IN-{secrets.randbelow(9000) + 1000}"
    tracking_id = equip.courierTrackingId or f"BD-IN-{secrets.randbelow(90000000) + 10000000}"
    card_id = equip.accessCardId or f"CARD-EF-{secrets.randbelow(9000) + 1000}-IND"

    onboarding_id = f"onboard_{uuid.uuid4().hex[:8]}"

    credentials = {
        "corporateEmail": corporate_email,
        "username": username,
        "temporaryPassword": temporary_password,
        "ssoPortalUrl": "http://127.0.0.1:5173/login",
        "oktaMfaCode": f"MFA-{secrets.randbelow(9000) + 1000}-AUTH",
        "provisionedSystems": [
            "Google Workspace Enterprise",
            "GitHub Enterprise (EnterpriseFlow Org)",
            "Slack Enterprise Grid",
            "Workday HCM Portal",
            "AWS Mumbai Staging Cluster"
        ]
    }

    full_equipment = {
        "laptopModel": equip.laptopModel,
        "monitors": equip.monitors,
        "peripherals": equip.peripherals,
        "securityKey": equip.securityKey,
        "accessCardId": card_id,
        "welcomeSwagKit": equip.welcomeSwagKit,
        "courierTrackingId": tracking_id,
        "courierPartner": equip.courierPartner
    }

    full_perks = {
        "joiningBonusInr": perks.joiningBonusInr,
        "learningBudgetInr": perks.learningBudgetInr,
        "healthInsuranceInr": perks.healthInsuranceInr,
        "homeOfficeAllowanceInr": perks.homeOfficeAllowanceInr,
        "monthlyMealAllowanceInr": perks.monthlyMealAllowanceInr,
        "paidTimeOffDays": perks.paidTimeOffDays
    }

    record = {
        "id": onboarding_id,
        "employeeId": emp_id,
        "status": "COMPLETED",
        "createdAt": now.isoformat(),
        "dispatchedAt": now.isoformat(),
        "personalInfo": p_info.model_dump(),
        "credentials": credentials,
        "equipment": full_equipment,
        "perks": full_perks
    }
    onboarding_records.insert(0, record)

    # 4. Generate & Deliver the Dummy Welcome Email to employee's personal mailbox
    email_message = {
        "id": f"mail_{uuid.uuid4().hex[:8]}",
        "to": p_info.personalEmail,
        "from": "EnterpriseFlow People Operations <hr-onboarding@enterpriseflow.corp>",
        "subject": f"🎉 Welcome to EnterpriseFlow AI India, {p_info.fullName}! — Your Official Credentials & Onboarding Package",
        "sentAt": now.isoformat(),
        "read": False,
        "employeeId": emp_id,
        "employeeName": p_info.fullName,
        "corporateEmail": corporate_email,
        "temporaryPassword": temporary_password,
        "ssoPortalUrl": "http://127.0.0.1:5173/login",
        "courierTrackingId": tracking_id,
        "joiningBonus": f"₹{perks.joiningBonusInr:,.2f}",
        "laptopModel": equip.laptopModel,
        "workLocation": p_info.workLocation,
        "dateOfJoining": p_info.dateOfJoining,
        "reportingManager": p_info.reportingManager,
        "department": p_info.department,
        "designation": p_info.designation,
        "summary": "Official welcome package, corporate SSO credentials, hardware shipment tracking, and first-day orientation schedule."
    }

    # Attempt Real-World SMTP Email Delivery to Employee's Personal Inbox
    real_email_res = email_service.send_welcome_email(
        recipient_email=p_info.personalEmail,
        employee_name=p_info.fullName,
        corporate_email=corporate_email,
        temporary_password=temporary_password,
        employee_id=emp_id,
        joining_bonus_inr=perks.joiningBonusInr,
        laptop_model=equip.laptopModel,
        courier_tracking_id=tracking_id,
        reporting_manager=p_info.reportingManager,
        date_of_joining=p_info.dateOfJoining,
        department=p_info.department,
        designation=p_info.designation,
        work_location=p_info.workLocation
    )
    email_message["realDispatchStatus"] = real_email_res.get("status")
    email_message["realDispatchMessage"] = real_email_res.get("message")
    personal_inbox_messages.insert(0, email_message)

    # 5. Start Multi-Agent Autonomous Onboarding Workflow
    wf_prompt = (
        f"Onboard new hire {p_info.fullName} as {p_info.designation} in {p_info.department} "
        f"with joining bonus ₹{perks.joiningBonusInr:,.2f}, corporate email {corporate_email}, "
        f"and hardware allocation {equip.laptopModel}."
    )
    wf = workflow_engine.start_workflow(
        db=db,
        prompt=wf_prompt,
        requester_id=payload.submittedByUserId or "usr-hr-02"
    )

    # 6. Record Immutable Cryptographic Audit Log
    audit_service.log_event(
        db=db,
        workflow_id=wf.id,
        actor_type="HR_MANAGER",
        actor_id=payload.submittedByUserId or "usr-hr-02",
        actor_name=payload.submittedByName or "Elena Rostova",
        event_type="EMPLOYEE_ONBOARDING_CREDENTIALS_DISPATCHED",
        action_description=(
            f"Successfully provisioned corporate credentials and dispatched welcome package to "
            f"{p_info.fullName} ({p_info.personalEmail}). Joining bonus ₹{perks.joiningBonusInr:,.2f} recorded in Workday."
        ),
        payload_reference={
            "employee_id": emp_id,
            "corporate_email": corporate_email,
            "personal_email": p_info.personalEmail,
            "joining_bonus_inr": perks.joiningBonusInr,
            "courier_tracking": tracking_id,
            "workflow_id": wf.id,
            "real_email_status": real_email_res.get("status")
        },
        execution_result="SUCCESS"
    )

    # 7. Broadcast real-time SSE / WebSocket update
    await broadcast_event("employee_onboarded", {
        "onboardingId": onboarding_id,
        "employeeId": emp_id,
        "employeeName": p_info.fullName,
        "corporateEmail": corporate_email,
        "personalEmail": p_info.personalEmail,
        "workflowId": wf.id,
        "message": f"Welcome package & login credentials dispatched to {p_info.personalEmail}!"
    })

    return {
        "success": True,
        "message": f"Employee onboarding package generated and dispatched to {p_info.personalEmail}.",
        "onboardingId": onboarding_id,
        "employeeId": emp_id,
        "credentials": credentials,
        "equipment": full_equipment,
        "perks": full_perks,
        "workflowId": wf.id,
        "dispatchedEmail": email_message,
        "realEmailDelivery": real_email_res
    }

class SmtpConfigRequest(BaseModel):
    smtpHost: str = "smtp.gmail.com"
    smtpPort: int = 587
    smtpUser: str
    smtpPassword: str
    smtpFromEmail: Optional[str] = None
    smtpFromName: Optional[str] = "EnterpriseFlow People Operations"

@router.get("/smtp-status")
def get_smtp_status():
    config = email_service.get_smtp_config()
    return {
        "isConfigured": config["is_configured"],
        "smtpHost": config["smtp_host"] or "smtp.gmail.com",
        "smtpPort": config["smtp_port"],
        "smtpUser": config["smtp_user"] or "Not Configured",
        "smtpFromEmail": config["smtp_from_email"] or "Not Configured",
        "smtpFromName": config["smtp_from_name"],
        "requiredCredentials": [
            {
                "field": "SMTP_USER",
                "label": "Company Email Address",
                "example": "careers@yourcompany.com or hr-onboarding@yourcompany.com",
                "description": "The sender email address from which the welcome package is sent."
            },
            {
                "field": "SMTP_PASSWORD",
                "label": "App Password (16-characters)",
                "example": "abcd efgh ijkl mnop",
                "description": "For Gmail: Generated under myaccount.google.com -> Security -> 2-Step Verification -> App Passwords. For Outlook: Standard password or App Password."
            },
            {
                "field": "SMTP_HOST",
                "label": "SMTP Server Host",
                "example": "smtp.gmail.com (Gmail) or smtp.office365.com (Outlook/M365) or smtp.sendgrid.net",
                "description": "Hostname of your company mail provider."
            },
            {
                "field": "SMTP_PORT",
                "label": "SMTP Port",
                "example": "587 (TLS standard) or 465 (SSL)",
                "description": "Port used for secure SMTP transmission."
            }
        ]
    }

@router.post("/configure-smtp")
def configure_smtp(payload: SmtpConfigRequest):
    import os
    os.environ["SMTP_HOST"] = payload.smtpHost
    os.environ["SMTP_PORT"] = str(payload.smtpPort)
    os.environ["SMTP_USER"] = payload.smtpUser
    os.environ["SMTP_PASSWORD"] = payload.smtpPassword
    os.environ["SMTP_FROM_EMAIL"] = payload.smtpFromEmail or payload.smtpUser
    os.environ["SMTP_FROM_NAME"] = payload.smtpFromName or "EnterpriseFlow People Operations"
    return {
        "success": True,
        "message": f"SMTP credentials updated for {payload.smtpUser} on {payload.smtpHost}:{payload.smtpPort}!"
    }

class DirectSendEmailRequest(BaseModel):
    recipientEmail: str
    employeeName: str = "Rahul Verma"
    corporateEmail: str = "rahul.verma@enterpriseflow.corp"
    temporaryPassword: str = "TempPass#2026@EF"
    employeeId: str = "EF-IN-9812"
    joiningBonusInr: float = 250000.0
    laptopModel: str = 'Apple MacBook Pro 16" (M3 Max, 36GB RAM, 1TB SSD)'
    courierTrackingId: str = "BD-IN-98214412"
    reportingManager: str = "Alexander Sterling"
    dateOfJoining: str = "2026-11-15"
    department: str = "Cloud & Distributed Systems"
    designation: str = "Principal Cloud Infrastructure Architect"
    workLocation: str = "Bengaluru Tech Corridor"

@router.post("/send-real-email")
def send_real_email_direct(payload: DirectSendEmailRequest):
    res = email_service.send_welcome_email(
        recipient_email=payload.recipientEmail,
        employee_name=payload.employeeName,
        corporate_email=payload.corporateEmail,
        temporary_password=payload.temporaryPassword,
        employee_id=payload.employeeId,
        joining_bonus_inr=payload.joiningBonusInr,
        laptop_model=payload.laptopModel,
        courier_tracking_id=payload.courierTrackingId,
        reporting_manager=payload.reportingManager,
        date_of_joining=payload.dateOfJoining,
        department=payload.department,
        designation=payload.designation,
        work_location=payload.workLocation
    )
    return res

