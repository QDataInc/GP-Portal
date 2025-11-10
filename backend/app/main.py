from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.services.database import Base, engine
from app.models import investment_model
from app.routers import investments
from app.routers import documents
from app.routers import profiles
from app.models import document_model
from app.models import profile_model
from fastapi.staticfiles import StaticFiles
from app.models import user_model
from app.routers import auth

app = FastAPI(title="GP Portal API", version="1.0")

# Serve static files (so frontend can access uploaded PDFs)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

Base.metadata.create_all(bind=engine)

origins = ["http://localhost:5173", "https://gp-portal.vercel.app"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(investments.router)
app.include_router(documents.router)
app.include_router(profiles.router)
app.include_router(auth.router)



@app.get("/")
def root():
    return {"message": "Backend is running successfully!"}
