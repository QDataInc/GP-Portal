# backend/app/utils/email_utils.py

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

EMAIL_HOST = os.getenv("EMAIL_HOST")
EMAIL_PORT = int(os.getenv("EMAIL_PORT"))
EMAIL_USERNAME = os.getenv("EMAIL_USERNAME")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")


def send_email_otp(to_email: str, otp_code: str):
    """
    Sends a 6-digit OTP to the user's email using Gmail SMTP.
    Adds detailed logging for debugging.
    """
    print(f"[OTP EMAIL] Called send_email_otp with to_email={to_email}, otp_code={otp_code}")
    subject = "Your GP Portal Verification Code"
    message = f"""
    <h3>Your Verification Code</h3>
    <p>Your GP Portal verification code is:</p>
    <h2>{otp_code}</h2>
    <p>This code expires in 5 minutes.</p>
    """

    msg = MIMEMultipart()
    msg["From"] = EMAIL_USERNAME
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(message, "html"))

    try:
        print(f"[OTP EMAIL] Attempting SMTP send to {to_email} via {EMAIL_HOST}:{EMAIL_PORT}")
        server = smtplib.SMTP(EMAIL_HOST, EMAIL_PORT)
        server.starttls()
        server.login(EMAIL_USERNAME, EMAIL_PASSWORD)
        server.sendmail(EMAIL_USERNAME, to_email, msg.as_string())
        server.quit()
        print(f"[OTP EMAIL] Email sent successfully to {to_email}")
        return True
    except Exception as e:
        print(f"[OTP EMAIL] Email sending failed for {to_email}: {e}")
        return False
def send_document_notification(to_email: str, doc_name: str, frontend_url: str):
    """
    Sends a notification email to the user when a document is added to their portal.
    """
    subject = "New document added to your GP Portal"
    message = f"""
    <p>Hello,</p>
    <p>Your document <strong>{doc_name}</strong> has been added to your GP Portal account.</p>
    <p>Please <a href='{frontend_url}/auth/start'>log in</a> to view and download it.</p>
    <p>Thanks,<br/>GP Portal Team</p>
    """

    msg = MIMEMultipart()
    msg["From"] = EMAIL_USERNAME
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(message, "html"))

    try:
        server = smtplib.SMTP(EMAIL_HOST, EMAIL_PORT)
        server.starttls()
        server.login(EMAIL_USERNAME, EMAIL_PASSWORD)
        server.sendmail(EMAIL_USERNAME, to_email, msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print("Document notification email failed:", e)
        return False

    subject = "Your GP Portal Verification Code"
    message = f"""
    <h3>Your Verification Code</h3>
    <p>Your GP Portal verification code is:</p>
    <h2>{otp_code}</h2>
    <p>This code expires in 5 minutes.</p>
    """

    msg = MIMEMultipart()
    msg["From"] = EMAIL_USERNAME
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(message, "html"))

    try:
        server = smtplib.SMTP(EMAIL_HOST, EMAIL_PORT)
        server.starttls()
        server.login(EMAIL_USERNAME, EMAIL_PASSWORD)
        server.sendmail(EMAIL_USERNAME, to_email, msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print("Email sending failed:", e)
        return False
