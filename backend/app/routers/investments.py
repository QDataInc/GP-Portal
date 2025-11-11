from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from sqlalchemy import func
from app.services.database import get_db
from app.models.investment_model import Investment
from app.routers.auth import get_current_user  # ✅ Require JWT

router = APIRouter(prefix="/api/investments", tags=["Investments"])

class InvestmentSchema(BaseModel):
    id: int
    deal_name: str
    investment_total: float
    distribution_total: float
    status: str

    class Config:
        from_attributes = True


# ---- GET all investments ----
@router.get("/", response_model=List[InvestmentSchema])
def get_investments(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return db.query(Investment).all()


# ---- POST add investment ----
@router.post("/", response_model=InvestmentSchema)
def add_investment(
    investment: InvestmentSchema,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    existing = db.query(Investment).filter(Investment.id == investment.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Investment ID already exists")

    db_investment = Investment(**investment.dict())
    db.add(db_investment)
    db.commit()
    db.refresh(db_investment)
    return db_investment


# ---- GET summary totals ----
@router.get("/summary")
def get_investment_summary(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    total_invested = db.query(func.sum(Investment.investment_total)).scalar() or 0
    total_distributed = db.query(func.sum(Investment.distribution_total)).scalar() or 0
    active_count = db.query(func.count(Investment.id)).filter(Investment.status == "Active").scalar() or 0
    closed_count = db.query(func.count(Investment.id)).filter(Investment.status == "Closed").scalar() or 0

    return {
        "total_invested": round(total_invested, 2),
        "total_distributed": round(total_distributed, 2),
        "active_count": active_count,
        "closed_count": closed_count,
    }
