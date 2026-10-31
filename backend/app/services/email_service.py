import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Dict, Any, Optional

class RealEmailService:
    """
    Real-world SMTP Email Dispatch Service.
    Dispatches production onboarding credentials and welcome packages
    from the company email directly to the employee's real personal mailbox.
    """

    @classmethod
    def get_smtp_config(cls) -> Dict[str, Any]:
        return {
            "smtp_host": os.getenv("SMTP_HOST", ""),
            "smtp_port": int(os.getenv("SMTP_PORT", "587")),
            "smtp_user": os.getenv("SMTP_USER", ""),
            "smtp_password": os.getenv("SMTP_PASSWORD", ""),
            "smtp_from_email": os.getenv("SMTP_FROM_EMAIL", os.getenv("SMTP_USER", "")),
            "smtp_from_name": os.getenv("SMTP_FROM_NAME", "EnterpriseFlow People Operations"),
            "is_configured": bool(os.getenv("SMTP_USER") and os.getenv("SMTP_PASSWORD"))
        }

    @classmethod
    def send_welcome_email(
        cls,
        recipient_email: str,
        employee_name: str,
        corporate_email: str,
        temporary_password: str,
        employee_id: str,
        joining_bonus_inr: float,
        laptop_model: str,
        courier_tracking_id: str,
        reporting_manager: str,
        date_of_joining: str,
        department: str,
        designation: str,
        work_location: str,
        sso_portal_url: str = "http://127.0.0.1:5173/login"
    ) -> Dict[str, Any]:
        config = cls.get_smtp_config()

        if not config["is_configured"]:
            return {
                "success": False,
                "status": "CREDENTIALS_REQUIRED",
                "message": (
                    "Real SMTP email credentials are not configured in backend environment. "
                    "Please provide SMTP_USER (Company Email) and SMTP_PASSWORD (App Password)."
                ),
                "required_credentials": [
                    {"key": "SMTP_HOST", "example": "smtp.gmail.com (for Gmail/Google Workspace) or smtp.office365.com (Outlook)"},
                    {"key": "SMTP_PORT", "example": "587 (TLS standard)"},
                    {"key": "SMTP_USER", "example": "careers@yourcompany.com or hr-onboarding@yourcompany.com"},
                    {"key": "SMTP_PASSWORD", "example": "16-character Google App Password (not your personal account password)"},
                    {"key": "SMTP_FROM_NAME", "example": "EnterpriseFlow People Operations"}
                ]
            }

        # Build Rich HTML Content
        subject = f"🎉 Welcome to EnterpriseFlow AI India, {employee_name}! — Your Official Credentials & Onboarding Package"

        html_content = f"""
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }}
  .container {{ max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }}
  .header {{ background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #06b6d4 100%); padding: 36px 32px; color: #ffffff; text-align: left; }}
  .badge {{ display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }}
  .title {{ font-size: 24px; font-weight: 800; margin: 12px 0 6px; line-height: 1.25; }}
  .subtitle {{ font-size: 13px; opacity: 0.9; margin: 0; }}
  .body {{ padding: 32px; }}
  .card {{ background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px 20px; margin-bottom: 20px; }}
  .cred-box {{ background: #0f172a; color: #f8fafc; border-radius: 14px; padding: 22px; margin: 24px 0; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }}
  .cred-row {{ display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 12px; }}
  .cred-label {{ color: #94a3b8; font-weight: 600; }}
  .cred-val {{ color: #38bdf8; font-weight: 700; }}
  .cta-btn {{ display: block; text-align: center; background: #2563eb; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 24px; border-radius: 12px; margin: 24px 0; box-shadow: 0 4px 12px rgba(37,99,235,0.3); }}
  .footer {{ padding: 24px 32px; background: #f1f5f9; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }}
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <span class="badge">Official Onboarding Package</span>
    <h1 class="title">Welcome to the Team, {employee_name}!</h1>
    <p class="subtitle">Your enterprise profile has been provisioned under Indian statutory regulations.</p>
  </div>
  
  <div class="body">
    <p style="font-size: 14px; line-height: 1.6; margin-top: 0;">
      Dear <strong>{employee_name}</strong>,<br><br>
      On behalf of EnterpriseFlow AI, we are thrilled to welcome you as <strong>{designation}</strong> in the <strong>{department}</strong> team. 
      Your first official day is scheduled for <strong>{date_of_joining}</strong>, reporting to <strong>{reporting_manager}</strong> at <strong>{work_location}</strong>.
    </p>

    <!-- Credentials Card -->
    <div class="cred-box">
      <div style="color: #38bdf8; font-weight: 800; font-size: 13px; margin-bottom: 14px; letter-spacing: 0.05em; text-transform: uppercase;">
        🔐 Your Official Single Sign-On (SSO) Credentials
      </div>
      <div class="cred-row">
        <span class="cred-label">Employee ID:</span>
        <span class="cred-val">{employee_id}</span>
      </div>
      <div class="cred-row">
        <span class="cred-label">Corporate Email:</span>
        <span class="cred-val">{corporate_email}</span>
      </div>
      <div class="cred-row">
        <span class="cred-label">Temporary Password:</span>
        <span class="cred-val" style="color: #facc15; letter-spacing: 1px;">{temporary_password}</span>
      </div>
      <div class="cred-row" style="margin-bottom: 0;">
        <span class="cred-label">Login Portal URL:</span>
        <span class="cred-val">{sso_portal_url}</span>
      </div>
    </div>

    <a href="{sso_portal_url}" class="cta-btn">Access Corporate SSO Portal & Set Password →</a>

    <!-- Hardware & Package Card -->
    <div class="card">
      <h3 style="margin: 0 0 10px; font-size: 13px; font-weight: 700; color: #1e293b;">
        📦 Hardware Allocation & Logistics
      </h3>
      <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Assigned Workstation:</td>
          <td style="padding: 6px 0; font-weight: 700; text-align: right;">{laptop_model}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Blue Dart Courier Tracking:</td>
          <td style="padding: 6px 0; font-weight: 700; text-align: right; color: #2563eb;">{courier_tracking_id}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Hardware Security Key:</td>
          <td style="padding: 6px 0; font-weight: 700; text-align: right;">YubiKey 5C NFC FIDO2</td>
        </tr>
      </table>
    </div>

    <!-- Compensation & Benefits -->
    <div class="card">
      <h3 style="margin: 0 0 10px; font-size: 13px; font-weight: 700; color: #1e293b;">
        💰 Joining Perks & Statutory Protection (₹ INR)
      </h3>
      <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Joining Sign-On Bonus:</td>
          <td style="padding: 6px 0; font-weight: 800; color: #059669; text-align: right;">₹{joining_bonus_inr:,.2f}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Annual Health Cover:</td>
          <td style="padding: 6px 0; font-weight: 700; text-align: right;">₹10,00,000.00</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">EPFO Form 11 & Gratuity:</td>
          <td style="padding: 6px 0; font-weight: 700; text-align: right;">Enrolled & Linked to UAN</td>
        </tr>
      </table>
    </div>

    <p style="font-size: 12px; color: #64748b; line-height: 1.5;">
      <em>Please note: For security, you will be prompted to reset your temporary password and configure Okta Multi-Factor Authentication (MFA) upon your first login.</em>
    </p>
  </div>

  <div class="footer">
    EnterpriseFlow AI India Pvt. Ltd. • Tech Corridor, Outer Ring Road, Bengaluru, Karnataka 560103<br>
    This automated communication was generated by the People Operations Agent Swarm.
  </div>
</div>
</body>
</html>
"""

        # Construct MIME Message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{config['smtp_from_name']} <{config['smtp_from_email']}>"
        msg["To"] = recipient_email

        # Attach Plain Text Fallback
        plain_text = (
            f"Welcome to EnterpriseFlow AI India, {employee_name}!\n\n"
            f"Your corporate credentials have been generated:\n"
            f"Employee ID: {employee_id}\n"
            f"Corporate Email: {corporate_email}\n"
            f"Temporary Password: {temporary_password}\n"
            f"Login URL: {sso_portal_url}\n\n"
            f"Hardware Assigned: {laptop_model}\n"
            f"Blue Dart Courier Tracking: {courier_tracking_id}\n"
            f"Joining Bonus: ₹{joining_bonus_inr:,.2f}\n"
            f"Date of Joining: {date_of_joining}\n"
            f"Reporting Manager: {reporting_manager}\n\n"
            f"Best regards,\nEnterpriseFlow People Operations"
        )
        msg.attach(MIMEText(plain_text, "plain"))
        msg.attach(MIMEText(html_content, "html"))

        # Transmit via SMTP
        try:
            if config["smtp_port"] == 465:
                # SSL
                with smtplib.SMTP_SSL(config["smtp_host"], config["smtp_port"], timeout=15) as server:
                    server.login(config["smtp_user"], config["smtp_password"])
                    server.sendmail(config["smtp_from_email"], [recipient_email], msg.as_string())
            else:
                # TLS (Port 587)
                with smtplib.SMTP(config["smtp_host"], config["smtp_port"], timeout=15) as server:
                    server.ehlo()
                    server.starttls()
                    server.ehlo()
                    server.login(config["smtp_user"], config["smtp_password"])
                    server.sendmail(config["smtp_from_email"], [recipient_email], msg.as_string())

            return {
                "success": True,
                "status": "DISPATCHED_TO_REAL_INBOX",
                "recipient": recipient_email,
                "sender": config["smtp_from_email"],
                "message": f"Real email successfully dispatched to {recipient_email} via {config['smtp_host']}!"
            }

        except Exception as e:
            return {
                "success": False,
                "status": "SMTP_ERROR",
                "error": str(e),
                "message": f"Failed to send email via SMTP: {str(e)}"
            }

email_service = RealEmailService()

