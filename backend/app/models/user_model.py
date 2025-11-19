from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.services.database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=True)
    last_name  = Column(String, nullable=True)
    username   = Column(String, unique=True, nullable=False)
    email      = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    email_otp_code = Column(String, nullable=True)
    email_otp_expiry = Column(DateTime, nullable=True)
    mfa_secret = Column(String, nullable=True)      # shared secret for TOTP
    mfa_enabled = Column(Boolean, default=False)   # whether MFA is turned on for this user
