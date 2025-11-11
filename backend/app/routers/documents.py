from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import os
from app.models.document_model import Document
from app.services.database import get_db
from app.routers.auth import get_current_user  # ✅ Require JWT

router = APIRouter(prefix="/api/documents", tags=["Documents"])
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


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


# ---- GET all documents ----
@router.get("/", response_model=List[DocumentSchema])
def get_documents(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return db.query(Document).all()


# ---- POST add document metadata ----
@router.post("/", response_model=DocumentSchema)
def add_document(
    document: DocumentSchema,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    existing = db.query(Document).filter(Document.id == document.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Document ID already exists")

    db_document = Document(**document.dict())
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document


# ---- POST upload file ----
@router.post("/upload")
def upload_document(
    file: UploadFile = File(...),
    label: str = Form(None),
    deal_name: str = Form(None),
    profile_name: str = Form(None),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as f:
        f.write(file.file.read())

    new_doc = Document(
        name=file.filename,
        label=label,
        deal_name=deal_name,
        profile_name=profile_name,
        file_path=file_path,
        uploaded_at=datetime.utcnow(),
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    return {
        "message": "File uploaded successfully",
        "file_name": file.filename,
        "file_path": file_path,
        "document_id": new_doc.id,
    }
