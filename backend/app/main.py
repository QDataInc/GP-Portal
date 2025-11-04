from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Create FastAPI app
app = FastAPI(title="GP Portal API", version="1.0")

# Allow your React frontend to call this backend
origins = [
    "http://localhost:5173",        # local frontend
    "https://gp-portal.vercel.app"  # production (optional for later)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple test route
@app.get("/")
def root():
    return {"message": "Backend is running successfully!"}
