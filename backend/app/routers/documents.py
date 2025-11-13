# /app/routers/documents.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import os
from app.models.document_model import Document
from app.services.database import get_db
from app.routers.auth import get_current_user  # ✅ Require JWT for auth

router = APIRouter(prefix="/api/documents", tags=["Documents"])

# Directory to store uploaded files
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# --------------------------------------------------------------------
# Pydantic schema for response serialization
# --------------------------------------------------------------------
class DocumentSchema(BaseModel):
    id: int
    name: str
    label: Optional[str] = None
    deal_name: Optional[str] = None
    profile_name: Optional[str] = None
    file_path: str
    uploaded_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --------------------------------------------------------------------
# GET all documents
# --------------------------------------------------------------------
@router.get("/", response_model=List[DocumentSchema])
def get_documents(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    """Return all uploaded documents for the authenticated user."""
    docs = db.query(Document).order_by(Document.uploaded_at.desc()).all()
    return docs


# --------------------------------------------------------------------
# POST - Add document metadata manually (rarely used; upload preferred)
# --------------------------------------------------------------------
@router.post("/", response_model=DocumentSchema)
def add_document(
    document: DocumentSchema,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    """Add a document entry (metadata only)."""
    existing = db.query(Document).filter(Document.id == document.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Document ID already exists")

    db_document = Document(**document.dict())
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document


# --------------------------------------------------------------------
# POST - Upload PDF document
# --------------------------------------------------------------------
@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    label: str = Form(None),
    deal_name: str = Form(None),
    profile_name: str = Form(None),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    """Upload a PDF document, save to uploads/, and create DB record."""

    # ✅ 1. Validate file extension
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    # ✅ 2. Avoid overwriting existing files
    base_name, ext = os.path.splitext(file.filename)
    counter = 1
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    while os.path.exists(file_path):
        file_path = os.path.join(UPLOAD_DIR, f"{base_name}_{counter}{ext}")
        counter += 1

    # ✅ 3. Save the file to disk
    try:
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File saving failed: {e}")

    # ✅ 4. Save metadata to DB
    new_doc = Document(
        name=os.path.basename(file_path),
        label=label,
        deal_name=deal_name,
        profile_name=profile_name,
        file_path=file_path,
        uploaded_at=datetime.utcnow(),
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    # ✅ 5. Return response
    return {
        "message": "File uploaded successfully",
        "document_id": new_doc.id,
        "file_name": new_doc.name,
        "file_path": new_doc.file_path.replace("\\", "/"),
        "uploaded_at": new_doc.uploaded_at,
    }
