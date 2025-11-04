from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import investments  # 👈 import router

app = FastAPI(title="GP Portal API", version="1.0")

origins = [
    "http://localhost:5173",
   ## "https://gp-portal.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include router
app.include_router(investments.router)

@app.get("/")
def root():
    return {"message": "Backend is running successfully!"}
