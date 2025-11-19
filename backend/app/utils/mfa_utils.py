# backend/app/utils/mfa_utils.py

import pyotp

def generate_mfa_secret() -> str:
    """Generate a new base32 secret for TOTP (Microsoft Authenticator compatible)."""
    return pyotp.random_base32()

def get_totp_uri(email: str, secret: str, issuer_name: str = "Victory GP Portal") -> str:
    """
    Create an otpauth URI that can be encoded into a QR code
    and scanned by Microsoft Authenticator / Google Authenticator.
    """
    totp = pyotp.TOTP(secret)
    return totp.provisioning_uri(name=email, issuer_name=issuer_name)

def verify_mfa_token(secret: str, token: str) -> bool:
    """Verify the 6-digit token entered by the user."""
    totp = pyotp.TOTP(secret)
    return totp.verify(token, valid_window=1)
