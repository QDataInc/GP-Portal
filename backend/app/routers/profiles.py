from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from app.models.profile_model import Profile
from app.services.database import get_db
from app.routers.auth import get_current_user  # ✅ Require JWT

router = APIRouter(prefix="/api/profiles", tags=["Profiles"])


class ProfileSchema(BaseModel):
    id: int
    entity_name: str
    jurisdiction: Optional[str] = None
    tax_classification: Optional[str] = None
    profile_type: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None

    class Config:
        from_attributes = True


# ---- GET all profiles ----
@router.get("/", response_model=List[ProfileSchema])
def get_profiles(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return db.query(Profile).all()


# ---- GET one profile ----
@router.get("/{profile_id}", response_model=ProfileSchema)
def get_profile(
    profile_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    rec = db.query(Profile).filter(Profile.id == profile_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Profile not found")
    return rec


# ---- POST add profile ----
@router.post("/", response_model=ProfileSchema)
def create_profile(
    profile: ProfileSchema,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    existing = db.query(Profile).filter(Profile.id == profile.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Profile ID already exists")

    rec = Profile(**profile.dict())
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec


# ---- PUT update profile ----
@router.put("/{profile_id}", response_model=ProfileSchema)
def update_profile(
    profile_id: int,
    updated: ProfileSchema,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    rec = db.query(Profile).filter(Profile.id == profile_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Profile not found")

    for k, v in updated.dict().items():
        setattr(rec, k, v)
    db.commit()
    db.refresh(rec)
    return rec


# ---- DELETE profile ----
@router.delete("/{profile_id}")
def delete_profile(
    profile_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    rec = db.query(Profile).filter(Profile.id == profile_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Profile not found")

    db.delete(rec)
    db.commit()
    return {"message": "Profile deleted successfully"}
