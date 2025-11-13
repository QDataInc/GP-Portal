# /app/routers/auth.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.services.database import get_db
from app.models.user_model import User
from app.utils import verify_password, create_access_token  # adjust imports
from datetime import timedelta

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

ACCESS_TOKEN_EXPIRE_MINUTES = 60


@router.post("/login")
def login(user_credentials: dict, db: Session = Depends(get_db)):
    """Authenticate user and return JWT token."""
    email = user_credentials.get("email")
    password = user_credentials.get("password")

    db_user = db.query(User).filter(User.email == email).first()

    if not db_user:
        raise HTTPException(status_code=404, detail="Email not found")

    if not verify_password(password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect password")

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.email}, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,  # ✅ required by frontend
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "email": db_user.email,
            "name": db_user.username,
        },
    }
