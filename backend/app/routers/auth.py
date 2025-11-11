from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from app.services.database import get_db
from app.models.user_model import User


# --------------------------------------------------------------------
# Configuration
# --------------------------------------------------------------------
SECRET_KEY = "supersecretkey"  # ⚠️ Move to environment variable later
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


# --------------------------------------------------------------------
# Schemas
# --------------------------------------------------------------------
class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class CheckEmailRequest(BaseModel):
    email: EmailStr


# --------------------------------------------------------------------
# Utility functions
# --------------------------------------------------------------------
def get_password_hash(password: str):
    """Truncate to 72 bytes for bcrypt and hash."""
    return pwd_context.hash(password[:72])


def verify_password(plain_password: str, hashed_password: str):
    """Verify plain password against hashed."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    """Generate a JWT token with expiry."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_current_user(token: str = Depends(oauth2_scheme)):
    """Decode and validate JWT token from Authorization header."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid authentication token")
        return email
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


# --------------------------------------------------------------------
# Routes
# --------------------------------------------------------------------

# ---- Check if email exists ----
@router.post("/check-email")
def check_email(payload: CheckEmailRequest, db: Session = Depends(get_db)):
    """Check if a user email already exists in the database."""
    email = payload.email
    exists = db.query(User).filter(User.email == email).first() is not None
    return {"exists": exists}


# ---- Register new user ----
@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user with first/last name, email, and password."""
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = get_password_hash(user.password)
    db_user = User(
        username=f"{user.first_name} {user.last_name}",
        email=user.email,
        password_hash=hashed_pw,
        first_name=user.first_name,
        last_name=user.last_name,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"message": "User registered successfully", "email": db_user.email}


# ---- Login ----
@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return JWT token."""
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(data={"sub": db_user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "email": db_user.email,
            "name": db_user.username,
        },
    }


# ---- Logout ----
@router.post("/logout")
def logout(request: Request):
    """Stateless logout acknowledgment; client clears session."""
    return {"message": "Logged out successfully"}
