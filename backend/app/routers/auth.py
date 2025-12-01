# backend/app/routers/auth.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from jose import jwt, JWTError
import random

from app.utils.auth_utils import (
    verify_password,
    create_access_token,
    get_password_hash,
    SECRET_KEY,
    ALGORITHM,
)

from app.utils.email_utils import send_email_otp
from app.models.user_model import User
from app.services.database import get_db


router = APIRouter(prefix="/api/auth", tags=["Authentication"])
oauth2_scheme = HTTPBearer()


# =========================================================
# SCHEMAS
# =========================================================
class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str


class LoginInitRequest(BaseModel):
    email: EmailStr
    password: str


class LoginVerifyOTP(BaseModel):
    email: EmailStr
    otp: str


# =========================================================
# CORRECT get_current_user — returns FULL USER object
# =========================================================
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:

    token = credentials.credentials

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")

        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid JWT payload",
            )

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    # Load user from DB
    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user


# =========================================================
# ADMIN-ONLY DEPENDENCY
# =========================================================
def get_current_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user


# =========================================================
# REGISTER USER
# =========================================================
@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):

    exists = db.query(User).filter(User.email == user.email).first()
    if exists:
        raise HTTPException(status_code=409, detail="Email already registered")

    hashed_pw = get_password_hash(user.password)

    new_user = User(
        username=f"{user.first_name} {user.last_name}",
        email=user.email,
        password_hash=hashed_pw,
        first_name=user.first_name,
        last_name=user.last_name,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully", "email": new_user.email}


# =========================================================
# STEP 1 → LOGIN INIT (PASSWORD VALIDATION + SEND OTP)
# =========================================================
@router.post("/login-init")
def login_init(request: LoginInitRequest, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Email not found")

    if not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect password")

    otp = str(random.randint(100000, 999999))
    user.email_otp_code = otp
    user.email_otp_expiry = datetime.utcnow() + timedelta(minutes=5)
    db.commit()

    send_email_otp(user.email, otp)

    return {"otp_sent": True, "email": user.email}


# =========================================================
# STEP 2 → VERIFY OTP → ISSUE JWT TOKEN
# =========================================================
@router.post("/login-verify-otp")
def login_verify_otp(request: LoginVerifyOTP, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.email == request.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="Email not found")

    if not user.email_otp_code:
        raise HTTPException(status_code=400, detail="OTP not generated")

    if datetime.utcnow() > user.email_otp_expiry:
        raise HTTPException(status_code=400, detail="OTP expired")

    if request.otp != user.email_otp_code:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    # Clear OTP
    user.email_otp_code = None
    user.email_otp_expiry = None
    db.commit()

    access_token = create_access_token({"sub": user.email})

    return {
        "access_token": access_token,
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.username,
            "role": user.role,
        },
    }
