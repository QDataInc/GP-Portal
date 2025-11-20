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
    deal_name = Column(String, nullable=True)
    profile_name = Column(String, nullable=True)
    file_path = Column(String, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    # NEW: who uploaded this document (FK to users.id)
    uploaded_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Optional relationship back to User
    uploaded_by = relationship("User", back_populates="documents")
