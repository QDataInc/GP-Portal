# backend/app/routers/admin.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from sqlalchemy import func
from app.services.database import get_db
from app.models.document_model import Document
from app.models.investment_model import Investment
from app.models.profile_model import Profile
from app.models.user_model import User
from app.routers.auth import get_current_admin

# ---------------------------------------------------------
# Admin router -> all endpoints here are /api/admin/...
# ---------------------------------------------------------
router = APIRouter(prefix="/api/admin", tags=["Admin"])


# ---------------------------------------------------------
# GET /api/admin/documents
#  - Returns ALL documents (across all users)
#  - Admin-only: protected by get_current_admin
# ---------------------------------------------------------
@router.get("/documents", response_model=List[dict])
def get_all_documents(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    """
    Admin view: list all uploaded documents, not just the current user's.

    - Requires current_admin.role == "Admin"
    - Uses the same Document model as /api/documents, but without filtering
      on uploaded_by_id.
    """

    docs = (
        db.query(Document)
        .order_by(Document.uploaded_at.desc())
        .all()
    )

    results = []
    for d in docs:
        results.append(
            {
                "id": d.id,
                "name": d.name,
                "label": d.label,
                "deal_name": d.deal_name,
                "profile_name": d.profile_name,
                "file_path": d.file_path,
                "uploaded_at": d.uploaded_at,
                "uploaded_by_id": d.uploaded_by_id,
                # if you have relationship set up: documents = relationship("Document", back_populates="uploaded_by")
                "uploaded_by_email": d.uploaded_by.email if getattr(d, "uploaded_by", None) else None,
            }
        )

    return results   


# ---------------------------------------------------------
# GET /api/admin/investments
#  - Returns ALL investments (across all users)
#  - Admin-only
# ---------------------------------------------------------
@router.get("/investments", response_model=List[dict])
def get_all_investments(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    """
    Admin view: list all investments across all users.

    This ignores `uploaded_by_id == current_user.id` and shows everything.
    """

    rows = (
        db.query(Investment)
        .order_by(Investment.id.desc())
        .all()
    )

    return [
        {
            "id": r.id,
            "deal_name": r.deal_name,
            "investment_total": r.investment_total,
            "distribution_total": r.distribution_total,
            "status": r.status,
            "uploaded_by_id": r.uploaded_by_id,
        }
        for r in rows
    ]

# ---------------------------------------------------------
# GET /api/admin/investments/summary
#  - Global summary (all users)
#  - Admin-only
# ---------------------------------------------------------
@router.get("/investments/summary")
def get_all_investments_summary(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    """
    Admin view: aggregated totals for ALL investments.
    """

    total_invested = (
        db.query(func.sum(Investment.investment_total))
        .scalar()
        or 0
    )

    total_distributed = (
        db.query(func.sum(Investment.distribution_total))
        .scalar()
        or 0
    )

    active_count = (
        db.query(func.count(Investment.id))
        .filter(Investment.status == "Active")
        .scalar()
        or 0
    )

    closed_count = (
        db.query(func.count(Investment.id))
        .filter(Investment.status == "Closed")
        .scalar()
        or 0
    )

    return {
        "total_invested": round(total_invested, 2),
        "total_distributed": round(total_distributed, 2),
        "active_count": active_count,
        "closed_count": closed_count,
    }


# ---------------------------------------------------------
# GET /api/admin/profiles
#  - Returns ALL profiles (across all users)
#  - Admin-only
# ---------------------------------------------------------
@router.get("/profiles", response_model=List[dict])
def get_all_profiles(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    """
    Admin view: list all profiles across all users.
    """

    rows = db.query(Profile).order_by(Profile.id.desc()).all()

    return [
        {
            "id": p.id,
            "entity_name": p.entity_name,
            "jurisdiction": p.jurisdiction,
            "tax_classification": p.tax_classification,
            "profile_type": p.profile_type,
            "contact_email": p.contact_email,
            "contact_phone": p.contact_phone,
            "user_id": p.user_id,
        }
        for p in rows
    ]

# ---------------------------------------------------------
# GET /api/admin/profiles/{profile_id}
#  - Fetch a specific profile (no user ownership restriction)
#  - Admin-only
# ---------------------------------------------------------
@router.get("/profiles/{profile_id}", response_model=dict)
def get_profile_by_id_admin(
    profile_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    """
    Admin view: fetch any profile by id (no user_id filter).
    """

    rec = db.query(Profile).filter(Profile.id == profile_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Profile not found")

    return {
        "id": rec.id,
        "entity_name": rec.entity_name,
        "jurisdiction": rec.jurisdiction,
        "tax_classification": rec.tax_classification,
        "profile_type": rec.profile_type,
        "contact_email": rec.contact_email,
        "contact_phone": rec.contact_phone,
        "user_id": rec.user_id,
    }
