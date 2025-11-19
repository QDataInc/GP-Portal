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
    """

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
