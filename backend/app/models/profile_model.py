from sqlalchemy import Column, Integer, String
from app.services.database import Base

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    entity_name = Column(String, nullable=False)          # e.g., QD Wealth Management LLC
    jurisdiction = Column(String, nullable=True)          # e.g., Texas
    tax_classification = Column(String, nullable=True)    # e.g., S Corporation
    profile_type = Column(String, nullable=True)          # e.g., LLC, Corp, Trust
    contact_email = Column(String, nullable=True)
    contact_phone = Column(String, nullable=True)
