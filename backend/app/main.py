from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

from app.services.database import Base, engine
from app.routers import auth, investments, documents, profiles, admin
from app.routers import deals


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="GP Portal API",
    version="1.0"
)

# ---------------------------------------------------------
# CUSTOM OPENAPI → REMOVE OAUTH2 AND FORCE BEARER AUTH
# ---------------------------------------------------------
def custom_openapi():
    openapi_schema = get_openapi(
        title="GP Portal API",
        version="1.0",
        routes=app.routes,
    )

    # Remove OAuth2 if exists
    if "securitySchemes" in openapi_schema.get("components", {}):
        openapi_schema["components"]["securitySchemes"].pop("OAuth2PasswordBearer", None)

    # Add BearerAuth
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }

    # Apply BearerAuth to all endpoints
    for path in openapi_schema["paths"].values():
        for method in path.values():
            method["security"] = [{"BearerAuth": []}]

    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi

# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "https://gp-portal.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# Routers
# ---------------------------------------------------------
app.include_router(auth.router)
app.include_router(investments.router)
app.include_router(documents.router)
app.include_router(profiles.router)
app.include_router(admin.router)
app.include_router(deals.router)
app.include_router(deals.admin_router)


@app.get("/")
def root():
    return {"message": "Backend running successfully!"}