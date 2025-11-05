# backend/app/routers/documents.py

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
    Form
)
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import os

from app.models.document_model import Document
from app.services.database import get_db

router = APIRouter(prefix="/api/documents", tags=["Documents"])

# ----------------------------
# 1️⃣ Pydantic Schema
# ----------------------------
class DocumentSchema(BaseModel):
    id: int
    name: str
    label: Optional[str] = None
    deal_name: Optional[str] = None
    profile_name: Optional[str] = None
    file_path: str
    uploaded_at: Optional[datetime] = None

    class Config:
        from_attributes = True  # replaces orm_mode in Pydantic v2


# ----------------------------
# 2️⃣ GET all documents
# ----------------------------
@router.get("/", response_model=List[DocumentSchema])
def get_documents(db: Session = Depends(get_db)):
    return db.query(Document).all()


# ----------------------------
# 3️⃣ POST add a document (metadata only)
# ----------------------------
@router.post("/", response_model=DocumentSchema)
def add_document(document: DocumentSchema, db: Session = Depends(get_db)):
    existing = db.query(Document).filter(Document.id == document.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Document ID already exists")

    db_document = Document(**document.dict())
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document


# ----------------------------
# 4️⃣ POST upload a PDF file
# ----------------------------
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@router.post("/upload")
def upload_document(
    file: UploadFile = File(...),
    label: str = Form(None),
    deal_name: str = Form(None),
    profile_name: str = Form(None),
    db: Session = Depends(get_db)
):
    """
    Upload a PDF document, save it to local 'uploads' folder,
    and store metadata in the database.
    """
    try:
        # Validate file type
        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")

        # Save file locally
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as f:
            f.write(file.file.read())

        # Save metadata to DB
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

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
