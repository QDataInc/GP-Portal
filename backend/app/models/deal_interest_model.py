from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship

from app.services.database import Base


class DealInterest(Base):
    __tablename__ = "deal_interests"

    id = Column(Integer, primary_key=True, index=True)

    deal_id = Column(Integer, ForeignKey("deals.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    status = Column(String(50), nullable=False, default="INTERESTED")  # INTERESTED | WITHDRAWN | FUNDED
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("deal_id", "user_id", name="uq_deal_interest_deal_user"),
    )

    deal = relationship("Deal")
    user = relationship("User")
