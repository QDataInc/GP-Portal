# backend/app/routers/documents.py

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import os

from azure.storage.blob import BlobServiceClient

from app.models.document_model import Document
from app.models.user_model import User
from app.services.database import get_db
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/documents", tags=["Documents"])

# -----------------------------------------------------------
# 🔒 Azure Blob Storage Settings
# -----------------------------------------------------------
AZURE_BLOB_CONNECTION_STRING = (
    "DefaultEndpointsProtocol=https;"
    "AccountName=gpportal;"
    "AccountKey=82owS0tGAvaSaQPzuh7XJc44rWBBnzweNAmnpttM7GIDErQYizl6Ln5BAcXBnFbbwdw86ud5jaY++AStN1t9/Q==;"
    "EndpointSuffix=core.windows.net"
)
AZURE_CONTAINER_NAME = "documents"


# -----------------------------------------------------------
# 📌 GET DOCUMENTS (current user only)
# -----------------------------------------------------------
@router.get("/", response_model=List[dict])
def get_documents(
    db: Session = Depends(get_db),
    current_user_email: str = Depends(get_current_user),
):
    # Resolve email -> User row
    user = db.query(User).filter(User.email == current_user_email).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    docs = (
        db.query(Document)
        .filter(Document.uploaded_by_id == user.id)
        .order_by(Document.uploaded_at.desc())
        .all()
    )

    return [
        {
            "id": d.id,
            "name": d.name,
            "label": d.label,
            "deal_name": d.deal_name,
            "profile_name": d.profile_name,
            "file_path": d.file_path,
            "uploaded_at": d.uploaded_at,
        }
        for d in docs
    ]


# -----------------------------------------------------------
# 📤 UPLOAD DOCUMENT → Azure Blob + SQL
# -----------------------------------------------------------
@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    label: str = Form(None),
    deal_name: str = Form(None),
    profile_name: str = Form(None),
    db: Session = Depends(get_db),
    current_user_email: str = Depends(get_current_user),
):
    # 0️⃣ Resolve email -> User row
    user = db.query(User).filter(User.email == current_user_email).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    # 1️⃣ Validate PDF
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    # 2️⃣ Connect to Azure Blob
    blob_service = BlobServiceClient.from_connection_string(AZURE_BLOB_CONNECTION_STRING)
    container = blob_service.get_container_client(AZURE_CONTAINER_NAME)

    try:
        container.create_container()
    except Exception:
        # ignore if container already exists
        pass

    print("Uploading to container:", container.url)

    # 3️⃣ Generate unique blob name
    blob_name = file.filename
    base_name, ext = os.path.splitext(blob_name)
    blob_client = container.get_blob_client(blob_name)

    counter = 1
    while blob_client.exists():
        blob_name = f"{base_name}_{counter}{ext}"
        blob_client = container.get_blob_client(blob_name)
        counter += 1

    # 4️⃣ Upload file to Azure Blob
    try:
        contents = await file.read()
        blob_client.upload_blob(contents, overwrite=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Blob upload failed: {str(e)}")

    # 5️⃣ Build Blob URL
    blob_url = f"{container.url}/{blob_name}"

    # 6️⃣ Save metadata in SQL with correct uploaded_by_id
    new_doc = Document(
        name=blob_name,
        label=label,
        deal_name=deal_name,
        profile_name=profile_name,
        file_path=blob_url,
        uploaded_at=datetime.utcnow(),
        uploaded_by_id=user.id,  # 👈 now guaranteed NOT NULL
    )

    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    # 7️⃣ Response
    return {
        "message": "File uploaded successfully",
        "id": new_doc.id,
        "file_name": new_doc.name,
        "file_url": new_doc.file_path,
        "uploaded_at": new_doc.uploaded_at,
    }
