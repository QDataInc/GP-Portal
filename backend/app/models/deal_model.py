from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Integer, String, Text

from app.services.database import Base


class Deal(Base):
    __tablename__ = "deals"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(255), nullable=False)
    deal_type = Column(String(50), nullable=False)        # REAL_ESTATE | PRE_IPO
    deal_subtype = Column(String(50), nullable=True)      # LAND | COMMERCIAL | MULTI_FAMILY
    deal_stage = Column(String(100), nullable=True)
    sponsors = Column(String(255), nullable=True)

    close_date = Column(DateTime, nullable=True)

    offering_size = Column(Float, nullable=True)
    unit_price = Column(Float, nullable=True)

    status = Column(String(50), nullable=False, default="PUBLISHED")  # PUBLISHED | DRAFT

    # safe to store for later phases
    funding_instructions = Column(Text, nullable=True)
    details_json = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
