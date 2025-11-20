# backend/app/models/investment_model.py
from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from app.services.database import Base

class Investment(Base):
    __tablename__ = "investments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    deal_name = Column(String, nullable=False)
    investment_total = Column(Float, nullable=False)
    distribution_total = Column(Float, nullable=False)
    status = Column(String, default="Active", nullable=False)
    close_date = Column(Date, nullable=True)
    uploaded_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
