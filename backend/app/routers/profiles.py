from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from app.models.profile_model import Profile
from app.models.user_model import User  # 👈 we now use the users table
from app.services.database import get_db
from app.routers.auth import get_current_user  # returns the user's email (string)


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


# Small helper to resolve current_user email -> User row
def _get_current_user_obj(db: Session, current_user_email: str) -> User:
    user = db.query(User).filter(User.email == current_user_email).first()
    if not user:
        raise HTTPException(status_code=403, detail="Current user not found in DB")
    return user


# ---------------------------------------------------------
# GET current user's profile  ->  /api/profiles/me
# ---------------------------------------------------------
@router.get("/me", response_model=ProfileSchema)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),  # 👈 this is an email string
):
    """
    Return the profile for the currently authenticated user.

    - Resolve the user from the email returned by get_current_user
    - If a Profile row exists for this user_id, return it.
    - If none exists, auto-create a default Profile for this user and return it.
    """

    user = _get_current_user_obj(db, current_user)

    profile = (
        db.query(Profile)
        .filter(Profile.user_id == user.id)
        .first()
    )

    if profile is None:
        # auto-create a default profile linked to this user_id
        profile = Profile(
            user_id=user.id,
            entity_name="Default GP Entity",
            jurisdiction=None,
            tax_classification=None,
            profile_type=None,
            contact_email=user.email,
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
    current_user: str = Depends(get_current_user),
):
    user = _get_current_user_obj(db, current_user)

    return (
        db.query(Profile)
        .filter(Profile.user_id == user.id)
        .all()
    )


# ---- GET one profile (by id, but still ensure it belongs to current user) ----
@router.get("/{profile_id}", response_model=ProfileSchema)
def get_profile(
    profile_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    user = _get_current_user_obj(db, current_user)

    rec = (
        db.query(Profile)
        .filter(Profile.id == profile_id, Profile.user_id == user.id)
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
    current_user: str = Depends(get_current_user),
):
    """
    Create a new profile for the current user.
    """
    user = _get_current_user_obj(db, current_user)

    rec = Profile(
        user_id=user.id,
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
    current_user: str = Depends(get_current_user),
):
    user = _get_current_user_obj(db, current_user)

    rec = (
        db.query(Profile)
        .filter(Profile.id == profile_id, Profile.user_id == user.id)
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
    current_user: str = Depends(get_current_user),
):
    user = _get_current_user_obj(db, current_user)

    rec = (
        db.query(Profile)
        .filter(Profile.id == profile_id, Profile.user_id == user.id)
        .first()
    )
    if not rec:
        raise HTTPException(status_code=404, detail="Profile not found")

    db.delete(rec)
    db.commit()
    return {"message": "Profile deleted successfully"}
