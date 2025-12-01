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
    uploaded_by_id: int  # 🔹 added so you can see who created it

    class Config:
        from_attributes = True


class InvestmentCreateSchema(BaseModel):
    # schema used for POST – no id, uploaded_by_id comes from current_user
    deal_name: str
    investment_total: float
    distribution_total: float
    status: str = "Active"


# ---- GET all investments ----
@router.get("/", response_model=List[InvestmentSchema])
def get_investments(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # 🔹 Only this user's investments; remove filter if you want global view
    return (
        db.query(Investment)
        .filter(Investment.uploaded_by_id == current_user.id)
        .all()
    )


# ---- POST add investment ----
@router.post("/", response_model=InvestmentSchema)
def add_investment(
    investment: InvestmentCreateSchema,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # 🔹 Create row and stamp with current_user.id
    db_investment = Investment(
        deal_name=investment.deal_name,
        investment_total=investment.investment_total,
        distribution_total=investment.distribution_total,
        status=investment.status,
        uploaded_by_id=current_user.id,
    )
    db.add(db_investment)
    db.commit()
    db.refresh(db_investment)
    return db_investment


# ---- GET summary totals ----
@router.get("/summary")
def get_investment_summary(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # 🔹 Summary only for this user's investments
    total_invested = (
        db.query(func.sum(Investment.investment_total))
        .filter(Investment.uploaded_by_id == current_user.id)
        .scalar()
        or 0
    )
    total_distributed = (
        db.query(func.sum(Investment.distribution_total))
        .filter(Investment.uploaded_by_id == current_user.id)
        .scalar()
        or 0
    )
    active_count = (
        db.query(func.count(Investment.id))
        .filter(
            Investment.uploaded_by_id == current_user.id,
            Investment.status == "Active",
        )
        .scalar()
        or 0
    )
    closed_count = (
        db.query(func.count(Investment.id))
        .filter(
            Investment.uploaded_by_id == current_user.id,
            Investment.status == "Closed",
        )
        .scalar()
        or 0
    )

    return {
        "total_invested": round(total_invested, 2),
        "total_distributed": round(total_distributed, 2),
        "active_count": active_count,
        "closed_count": closed_count,
    }