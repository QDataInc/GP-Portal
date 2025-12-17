# backend/app/routers/documents.py

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import os

from azure.storage.blob import BlobServiceClient

from app.models.document_model import Document
from app.models.user_model import User
from app.services.database import get_db
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/documents", tags=["Documents"])

# -----------------------------------------------------------
# Azure Blob Storage (hardcoded for now)
# -----------------------------------------------------------
AZURE_BLOB_CONNECTION_STRING = (
    "DefaultEndpointsProtocol=https;"
    "AccountName=gpportal;"
    "AccountKey=82owS0tGAvaSaQPzuh7XJc44rWBBnzweNAmnpttM7GIDErQYizl6Ln5BAcXBnFbbwdw86ud5jaY++AStN1t9/Q==;"
    "EndpointSuffix=core.windows.net"
)

AZURE_CONTAINER_NAME = "documents"
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


# -----------------------------------------------------------
# GET documents (user + admin visibility stays same)
# -----------------------------------------------------------
@router.get("/", response_model=List[dict])
def get_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from sqlalchemy import or_

    docs = (
        db.query(Document)
        .filter(
            or_(
                Document.uploaded_by_id == current_user.id,
                Document.recipient_user_id == current_user.id,
            )
        )
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
            "document_type": d.document_type,
            "requirement_key": d.requirement_key,
            "uploaded_by_role": d.uploaded_by_role,
        }
        for d in docs
    ]


# -----------------------------------------------------------
# Upload document (deal_name based)
# -----------------------------------------------------------
@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),

    # Deal-based fields
    deal_name: Optional[str] = Form(None),

    # Metadata
    label: Optional[str] = Form(None),
    profile_name: Optional[str] = Form(None),
    document_type: Optional[str] = Form(None),
    requirement_key: Optional[str] = Form(None),

    # Admin → user assignment
    recipient_user_id: Optional[int] = Form(None),
    uploaded_by_role: Optional[str] = Form(None),

    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large")

    blob_service = BlobServiceClient.from_connection_string(AZURE_BLOB_CONNECTION_STRING)
    container = blob_service.get_container_client(AZURE_CONTAINER_NAME)

    try:
        container.create_container()
    except Exception:
        pass

    base, ext = os.path.splitext(file.filename)
    blob_name = file.filename
    blob_client = container.get_blob_client(blob_name)

    i = 1
    while blob_client.exists():
        blob_name = f"{base}_{i}{ext}"
        blob_client = container.get_blob_client(blob_name)
        i += 1

    blob_client.upload_blob(contents, overwrite=True)
    blob_url = f"{container.url}/{blob_name}"

    new_doc = Document(
        name=blob_name,
        label=label,
        deal_name=deal_name,
        profile_name=profile_name,
        file_path=blob_url,
        uploaded_at=datetime.utcnow(),
        uploaded_by_id=current_user.id,
        recipient_user_id=recipient_user_id,
        document_type=document_type,
        requirement_key=requirement_key,
        uploaded_by_role=uploaded_by_role or "User",
    )

    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    return {
        "message": "Document uploaded successfully",
        "id": new_doc.id,
        "deal_name": new_doc.deal_name,
        "file_url": new_doc.file_path,
    }
