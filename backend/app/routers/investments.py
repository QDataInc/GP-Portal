from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from app.models.investment_model import Investment
from app.services.database import get_db

router = APIRouter(prefix="/api/investments", tags=["Investments"])

class InvestmentSchema(BaseModel):
    id: int
    deal_name: str
    investment_total: float
    distribution_total: float
    status: str

    class Config:
        from_attributes = True

@router.get("/", response_model=List[InvestmentSchema])
def get_investments(db: Session = Depends(get_db)):
    return db.query(Investment).all()

@router.post("/", response_model=InvestmentSchema)
def add_investment(investment: InvestmentSchema, db: Session = Depends(get_db)):
    existing = db.query(Investment).filter(Investment.id == investment.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Investment ID already exists")

    db_investment = Investment(**investment.dict())
    db.add(db_investment)
    db.commit()
    db.refresh(db_investment)
    return db_investment
