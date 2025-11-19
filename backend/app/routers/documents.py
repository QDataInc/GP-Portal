# /app/routers/documents.py

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.models.document_model import Document
from app.services.database import get_db
from app.routers.auth import get_current_user

from azure.storage.blob import BlobServiceClient
import os

router = APIRouter(prefix="/api/documents", tags=["Documents"])

# -----------------------------------------------------------
# 🔒 Azure Blob Storage Settings (USE VALID KEY!)
# -----------------------------------------------------------
AZURE_BLOB_CONNECTION_STRING = (
    "DefaultEndpointsProtocol=https;"
    "AccountName=gpportal;"
    "AccountKey=82owS0tGAvaSaQPzuh7XJc44rWBBnzweNAmnpttM7GIDErQYizl6Ln5BAcXBnFbbwdw86ud5jaY++AStN1t9/Q==;"
    "EndpointSuffix=core.windows.net"
)
AZURE_CONTAINER_NAME = "documents"


# -----------------------------------------------------------
# 📌 GET DOCUMENTS
# -----------------------------------------------------------
@router.get("/", response_model=List[dict])
def get_documents(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    docs = db.query(Document).order_by(Document.uploaded_at.desc()).all()
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
# 📤 UPLOAD DOCUMENT TO AZURE BLOB STORAGE
# -----------------------------------------------------------
@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    label: str = Form(None),
    deal_name: str = Form(None),
    profile_name: str = Form(None),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    # 1️⃣ Validate file type
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    # 2️⃣ Connect to Azure Blob Storage
    blob_service = BlobServiceClient.from_connection_string(AZURE_BLOB_CONNECTION_STRING)
    container = blob_service.get_container_client(AZURE_CONTAINER_NAME)

    # Ensure container exists
    try:
        container.create_container()
    except Exception:
        pass  # ignore if exists

    # Debug print (optional)
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

    # 4️⃣ Upload file → Azure Blob Storage
    try:
        contents = await file.read()
        blob_client.upload_blob(contents, overwrite=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Blob upload failed: {str(e)}")

    # 5️⃣ Create Blob URL
    blob_url = f"{container.url}/{blob_name}"

    # 6️⃣ Save metadata → Azure SQL
    new_doc = Document(
        name=blob_name,
        label=label,
        deal_name=deal_name,
        profile_name=profile_name,
        file_path=blob_url,
        uploaded_at=datetime.utcnow(),
    )

    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    # 7️⃣ Response → Frontend
    return {
        "message": "File uploaded successfully",
        "id": new_doc.id,
        "file_name": new_doc.name,
        "file_url": new_doc.file_path,
        "uploaded_at": new_doc.uploaded_at,
    }
