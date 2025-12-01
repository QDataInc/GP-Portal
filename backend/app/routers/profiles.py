# backend/app/routers/profiles.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from app.models.profile_model import Profile
from app.models.user_model import User
from app.services.database import get_db
from app.routers.auth import get_current_user  # ✅ returns User object now

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


class ProfileCreate(BaseModel):
    """
    Input model for creating/updating a profile.
    We don't send id or user_id from the client – user_id comes from the token.
    """
    entity_name: str
    jurisdiction: Optional[str] = None
    tax_classification: Optional[str] = None
    profile_type: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None


# ---------------------------------------------------------
# GET current user's profile  ->  /api/profiles/me
# ---------------------------------------------------------
@router.get("/me", response_model=ProfileSchema)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),  # ✅ this is a User object
):
    """
    Return the profile for the currently authenticated user.

    - use current_user.id directly (already resolved from token / session)
    - If a Profile row exists for this user_id, return it.
    - If none exists, auto-create a default Profile for this user and return it.
    """

    profile = (
        db.query(Profile)
        .filter(Profile.user_id == current_user.id)
        .first()
    )

    if profile is None:
        # auto-create a default profile linked to this user_id
        profile = Profile(
            user_id=current_user.id,
            entity_name="Default GP Entity",
            jurisdiction=None,
            tax_classification=None,
            profile_type=None,
            contact_email=current_user.email,
            contact_phone=None,
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return profile


# ---- GET all profiles for current user ----
@router.get("/", response_model=List[ProfileSchema])
def get_profiles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Profile)
        .filter(Profile.user_id == current_user.id)
        .all()
    )


# ---- GET one profile (by id, but still ensure it belongs to current user) ----
@router.get("/{profile_id}", response_model=ProfileSchema)
def get_profile(
    profile_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rec = (
        db.query(Profile)
        .filter(Profile.id == profile_id, Profile.user_id == current_user.id)
        .first()
    )
    if not rec:
        raise HTTPException(status_code=404, detail="Profile not found")
    return rec


# ---- POST add profile ----
@router.post("/", response_model=ProfileSchema)
def create_profile(
    profile: ProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new profile for the current user.
    """

    rec = Profile(
        user_id=current_user.id,
        **profile.dict(),
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec


# ---- PUT update profile ----
@router.put("/{profile_id}", response_model=ProfileSchema)
def update_profile(
    profile_id: int,
    updated: ProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rec = (
        db.query(Profile)
        .filter(Profile.id == profile_id, Profile.user_id == current_user.id)
        .first()
    )
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
    current_user: User = Depends(get_current_user),
):
    rec = (
        db.query(Profile)
        .filter(Profile.id == profile_id, Profile.user_id == current_user.id)
        .first()
    )
    if not rec:
        raise HTTPException(status_code=404, detail="Profile not found")

    db.delete(rec)
    db.commit()
    return {"message": "Profile deleted successfully"}
