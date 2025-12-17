# backend/app/models/document_model.py

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.services.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)
    label = Column(String, nullable=True)

    # legacy text fields (keep for UI compatibility)
    deal_name = Column(String, nullable=True)
    profile_name = Column(String, nullable=True)

    # ✅ new structured fields (match DB)
    deal_id = Column(Integer, ForeignKey("deals.id"), nullable=True)
    profile_id = Column(Integer, ForeignKey("profiles.id"), nullable=True)
    investment_id = Column(Integer, ForeignKey("investments.id"), nullable=True)

    document_type = Column(String(50), nullable=True)      # LLC / EIN / VOID_CHECK / TAX / OTHER
    uploaded_by_role = Column(String(20), nullable=True)   # Admin / User
    requirement_key = Column(String(50), nullable=True)    # LLC / EIN / VOID_CHECK

    file_path = Column(String, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    uploaded_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recipient_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # relationships
    uploaded_by = relationship("User", back_populates="documents", foreign_keys=[uploaded_by_id])
    recipient = relationship("User", foreign_keys=[recipient_user_id])

    # Optional relationships (only if you have these models defined)
    deal = relationship("Deal", foreign_keys=[deal_id])
    profile = relationship("Profile", foreign_keys=[profile_id])
    investment = relationship("Investment", foreign_keys=[investment_id])
