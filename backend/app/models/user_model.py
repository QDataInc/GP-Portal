# backend/app/models/user_model.py

from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.services.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    email_otp_code = Column(String, nullable=True)
    email_otp_expiry = Column(DateTime, nullable=True)
    mfa_secret = Column(String, nullable=True)
    mfa_enabled = Column(Boolean, default=False)

    # Reverse relationship to documents (uploaded)
    documents = relationship(
        "Document",
        back_populates="uploaded_by",
        foreign_keys="Document.uploaded_by_id"
    )

    # Documents assigned to this user (received)
    received_documents = relationship(
        "Document",
        foreign_keys="Document.recipient_user_id"
    )

    # NEW FIELD (Correct)
    role = Column(String(50), nullable=False, default="User")
