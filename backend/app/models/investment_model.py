# backend/app/models/investment_model.py
from sqlalchemy import Column, Integer, String, Float, Date
from app.services.database import Base

class Investment(Base):
    __tablename__ = "investments"

    id = Column(Integer, primary_key=True, index=True)
    deal_name = Column(String, nullable=False)
    investment_total = Column(Float, nullable=False)
    distribution_total = Column(Float, nullable=False)
    status = Column(String, default="Active")
    close_date = Column(Date, nullable=True)
