from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordBearer

# --- Local imports ---
from app.services.database import Base, engine
from app.models import (
    investment_model,
    document_model,
    profile_model,
    user_model,
)
from app.routers import (
    investments,
    documents,
    profiles,
    auth,
)

# --- Initialize FastAPI app ---
app = FastAPI(
    title="GP Portal API",
    version="1.0",
    description="Backend API for Victory GP Portal (Investments, Documents, Profiles, Auth).",
)

# --- Database setup ---
Base.metadata.create_all(bind=engine)

# --- CORS setup ---
origins = [
    "http://localhost:5173",       # Frontend local dev
    "http://127.0.0.1:5173",       # Alternate localhost reference
    "https://gp-portal.vercel.app" # Deployed frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- OAuth2 (for token-based endpoints) ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# --- Static files ---
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# --- Routers ---
app.include_router(investments.router)
app.include_router(documents.router)
app.include_router(profiles.router)
app.include_router(auth.router)

# --- Root endpoint ---
@app.get("/")
def root():
    return {"message": "✅ GP Portal Backend is running successfully!"}
