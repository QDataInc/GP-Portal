from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.deal_model import Deal
from app.models.user_model import User
from app.models.deal_interest_model import DealInterest

from app.routers.auth import get_current_admin, get_current_user
from app.services.database import get_db


# -----------------------------
# Schemas
# -----------------------------
class DealCreate(BaseModel):
    name: str
    deal_type: str = Field(..., description="REAL_ESTATE or PRE_IPO")
    deal_subtype: Optional[str] = Field(None, description="LAND/COMMERCIAL/MULTI_FAMILY (REAL_ESTATE only)")
    deal_stage: Optional[str] = None
    sponsors: Optional[str] = None
    close_date: Optional[datetime] = None

    offering_size: Optional[float] = None
    unit_price: Optional[float] = None

    status: str = "PUBLISHED"

    funding_instructions: Optional[str] = None
    details_json: Optional[str] = None


class DealOut(BaseModel):
    id: int
    name: str
    deal_type: str
    deal_subtype: Optional[str] = None
    deal_stage: Optional[str] = None
    sponsors: Optional[str] = None
    close_date: Optional[datetime] = None
    offering_size: Optional[float] = None
    unit_price: Optional[float] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class InterestOut(BaseModel):
    id: int
    deal_id: int
    user_id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class DealInterestAdminOut(BaseModel):
    id: int
    deal_id: int
    user_id: int
    status: str
    created_at: datetime
    user_email: str
    user_name: str

    class Config:
        from_attributes = True


# -----------------------------
# Routers
# -----------------------------
router = APIRouter(prefix="/api/deals", tags=["Deals"])
admin_router = APIRouter(prefix="/api/admin/deals", tags=["Admin - Deals"])


# -----------------------------
# USER: list deals (all published)
# -----------------------------
@router.get("/", response_model=List[DealOut])
def list_deals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Deal)
        .filter(Deal.status == "PUBLISHED")
        .order_by(Deal.created_at.desc())
        .all()
    )


# -----------------------------
# USER: get one deal
# -----------------------------
@router.get("/{deal_id}", response_model=DealOut)
def get_deal(
    deal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deal = db.query(Deal).filter(Deal.id == deal_id, Deal.status == "PUBLISHED").first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    return deal


# -----------------------------
# USER: show interest in deal
# -----------------------------
@router.post("/{deal_id}/interest", response_model=InterestOut)
def show_interest(
    deal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deal = db.query(Deal).filter(Deal.id == deal_id, Deal.status == "PUBLISHED").first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    existing = (
        db.query(DealInterest)
        .filter(DealInterest.deal_id == deal_id, DealInterest.user_id == current_user.id)
        .first()
    )
    if existing:
        return existing

    interest = DealInterest(
        deal_id=deal_id,
        user_id=current_user.id,
        status="INTERESTED",
    )

    db.add(interest)

    # In case two requests hit at once and unique constraint triggers
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        existing = (
            db.query(DealInterest)
            .filter(DealInterest.deal_id == deal_id, DealInterest.user_id == current_user.id)
            .first()
        )
        if existing:
            return existing
        raise

    db.refresh(interest)
    return interest


# -----------------------------
# ADMIN: create deal
# -----------------------------
@admin_router.post("/", response_model=DealOut)
def create_deal(
    payload: DealCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    if payload.deal_type not in {"REAL_ESTATE", "PRE_IPO"}:
        raise HTTPException(status_code=400, detail="deal_type must be REAL_ESTATE or PRE_IPO")

    if payload.deal_type == "PRE_IPO" and payload.deal_subtype:
        raise HTTPException(status_code=400, detail="deal_subtype is only allowed for REAL_ESTATE")

    deal = Deal(
        name=payload.name,
        deal_type=payload.deal_type,
        deal_subtype=payload.deal_subtype,
        deal_stage=payload.deal_stage,
        sponsors=payload.sponsors,
        close_date=payload.close_date,
        offering_size=payload.offering_size,
        unit_price=payload.unit_price,
        status=payload.status or "PUBLISHED",
        funding_instructions=payload.funding_instructions,
        details_json=payload.details_json,
    )

    db.add(deal)
    db.commit()
    db.refresh(deal)
    return deal


# -----------------------------
# ADMIN: list interested users for a deal
# -----------------------------
@admin_router.get("/{deal_id}/interests", response_model=List[DealInterestAdminOut])
def list_deal_interests_admin(
    deal_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    rows = (
        db.query(DealInterest, User)
        .join(User, User.id == DealInterest.user_id)
        .filter(DealInterest.deal_id == deal_id)
        .order_by(DealInterest.created_at.desc())
        .all()
    )

    response: List[DealInterestAdminOut] = []
    for interest, user in rows:
        response.append(
            DealInterestAdminOut(
                id=interest.id,
                deal_id=interest.deal_id,
                user_id=interest.user_id,
                status=interest.status,
                created_at=interest.created_at,
                user_email=user.email,
                user_name=user.username,
            )
        )

    return response
