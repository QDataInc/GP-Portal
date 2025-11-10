from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from app.models.profile_model import Profile
from app.services.database import get_db

router = APIRouter(prefix="/api/profiles", tags=["Profiles"])

# ---------------------------
# Pydantic schema for response
# ---------------------------
class ProfileSchema(BaseModel):
    id: int
    entity_name: str
    jurisdiction: Optional[str] = None
    tax_classification: Optional[str] = None
    profile_type: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None

    class Config:
        from_attributes = True  # replaces orm_mode in Pydantic v2


# ---------------------------
# CRUD API routes
# ---------------------------

# GET all profiles
@router.get("/", response_model=List[ProfileSchema])
def get_profiles(db: Session = Depends(get_db)):
    return db.query(Profile).all()


# GET single profile by ID
@router.get("/{profile_id}", response_model=ProfileSchema)
def get_profile(profile_id: int, db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


# POST create new profile
@router.post("/", response_model=ProfileSchema)
def create_profile(profile: ProfileSchema, db: Session = Depends(get_db)):
    existing = db.query(Profile).filter(Profile.id == profile.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Profile ID already exists")

    db_profile = Profile(**profile.dict())
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile


# PUT update profile
@router.put("/{profile_id}", response_model=ProfileSchema)
def update_profile(profile_id: int, updated: ProfileSchema, db: Session = Depends(get_db)):
    db_profile = db.query(Profile).filter(Profile.id == profile_id).first()
    if not db_profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    for key, value in updated.dict().items():
        setattr(db_profile, key, value)

    db.commit()
    db.refresh(db_profile)
    return db_profile


# DELETE profile
@router.delete("/{profile_id}")
def delete_profile(profile_id: int, db: Session = Depends(get_db)):
    db_profile = db.query(Profile).filter(Profile.id == profile_id).first()
    if not db_profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    db.delete(db_profile)
    db.commit()
    return {"message": "Profile deleted successfully"}
