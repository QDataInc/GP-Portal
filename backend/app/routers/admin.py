
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from datetime import datetime
from app.utils.email_utils import send_document_notification
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy import func
from app.services.database import get_db
from app.models.document_model import Document
from app.models.investment_model import Investment
from app.models.profile_model import Profile
from app.models.user_model import User
from app.routers.auth import get_current_admin, get_current_user
from fastapi.responses import StreamingResponse, HTMLResponse
from io import BytesIO
import os
from azure.storage.blob import BlobServiceClient

router = APIRouter(prefix="/api/admin", tags=["Admin"])


router = APIRouter(prefix="/api/admin", tags=["Admin"])

# GET /api/admin/users — returns all users (id, email)
@router.get("/users")
def get_all_users(db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    users = db.query(User).all()
    return [{"id": user.id, "email": user.email} for user in users]

# Azure Blob (same settings as documents router)
AZURE_BLOB_CONNECTION_STRING = (
    "DefaultEndpointsProtocol=https;"
    "AccountName=gpportal;"
    "AccountKey=82owS0tGAvaSaQPzuh7XJc44rWBBnzweNAmnpttM7GIDErQYizl6Ln5BAcXBnFbbwdw86ud5jaY++AStN1t9/Q==;"
    "EndpointSuffix=core.windows.net"
)
AZURE_CONTAINER_NAME = "documents"

# ---------------------------------------------------------
# POST /api/admin/documents/upload-for-user
#  - Admin uploads a document and assigns it to a user
# ---------------------------------------------------------
@router.post("/documents/upload-for-user")
async def admin_upload_for_user(
    recipient_user_id: int = Form(...),
    file: UploadFile = File(...),
    label: str = Form(None),
    deal_name: str = Form(None),
    profile_name: str = Form(None),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    recipient = db.query(User).filter(User.id == recipient_user_id).first()
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")

    blob_service = BlobServiceClient.from_connection_string(AZURE_BLOB_CONNECTION_STRING)
    container = blob_service.get_container_client(AZURE_CONTAINER_NAME)
    try:
        container.create_container()
    except Exception:
        pass

    blob_name = file.filename
    base_name, ext = os.path.splitext(blob_name)
    blob_client = container.get_blob_client(blob_name)
    counter = 1
    while blob_client.exists():
        blob_name = f"{base_name}_{counter}{ext}"
        blob_client = container.get_blob_client(blob_name)
        counter += 1

    contents = await file.read()
    blob_client.upload_blob(contents, overwrite=True)
    blob_url = f"{container.url}/{blob_name}"

    new_doc = Document(
        name=blob_name,
        label=label,
        deal_name=deal_name,
        profile_name=profile_name,
        file_path=blob_url,
        uploaded_at=datetime.utcnow(),
        uploaded_by_id=current_admin.id,
        recipient_user_id=recipient_user_id,
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    # Send notification email
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    send_document_notification(recipient.email, new_doc.name, frontend_url)

    return {"message": "Uploaded", "id": new_doc.id, "file_url": blob_url}

# ---------------------------------------------------------
# GET /api/admin/documents/{doc_id}/user-view
# GET /api/admin/documents/{doc_id}/user-download
#  - Streams the PDF for the assigned user or uploader or admin
# ---------------------------------------------------------
from app.routers.auth import get_current_user

@router.get("/documents/{doc_id}/user-view")
def user_view_document(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rec = db.query(Document).filter(Document.id == doc_id).first()
    if not rec or not rec.file_path:
        raise HTTPException(status_code=404, detail="Document not found")

    # permission check
    if not (
        current_user.role == "Admin"
        or rec.uploaded_by_id == current_user.id
        or rec.recipient_user_id == current_user.id
    ):
        raise HTTPException(status_code=403, detail="Not authorized")

    blob_name = os.path.basename(rec.file_path)
    blob_service = BlobServiceClient.from_connection_string(AZURE_BLOB_CONNECTION_STRING)
    container = blob_service.get_container_client(AZURE_CONTAINER_NAME)
    blob_client = container.get_blob_client(blob_name)
    stream = blob_client.download_blob()
    def iterfile():
        for chunk in stream.chunks():
            yield chunk
    return StreamingResponse(iterfile(), media_type="application/pdf", headers={
        "Content-Disposition": f'inline; filename="{rec.name}"'
    })

@router.get("/documents/{doc_id}/user-download")
def user_download_document(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rec = db.query(Document).filter(Document.id == doc_id).first()
    if not rec or not rec.file_path:
        raise HTTPException(status_code=404, detail="Document not found")

    if not (
        current_user.role == "Admin"
        or rec.uploaded_by_id == current_user.id
        or rec.recipient_user_id == current_user.id
    ):
        raise HTTPException(status_code=403, detail="Not authorized")

    blob_name = os.path.basename(rec.file_path)
    blob_service = BlobServiceClient.from_connection_string(AZURE_BLOB_CONNECTION_STRING)
    container = blob_service.get_container_client(AZURE_CONTAINER_NAME)
    blob_client = container.get_blob_client(blob_name)
    stream = blob_client.download_blob()
    def iterfile():
        for chunk in stream.chunks():
            yield chunk
    return StreamingResponse(iterfile(), media_type="application/pdf", headers={
        "Content-Disposition": f'attachment; filename="{rec.name}"'
    })


# ---------------------------------------------------------
# GET /api/admin/documents
#  - Returns ALL documents (across all users)
#  - Admin-only: protected by get_current_admin
# ---------------------------------------------------------
@router.get("/documents", response_model=List[dict])
def get_all_documents(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    """
    Admin view: list all uploaded documents, not just the current user's.

    - Requires current_admin.role == "Admin"
    - Uses the same Document model as /api/documents, but without filtering
      on uploaded_by_id.
    """

    docs = (
        db.query(Document)
        .order_by(Document.uploaded_at.desc())
        .all()
    )

    results = []
    for d in docs:
        results.append(
            {
                "id": d.id,
                "name": d.name,
                "label": d.label,
                "deal_name": d.deal_name,
                "profile_name": d.profile_name,
                "file_path": d.file_path,
                "uploaded_at": d.uploaded_at,
                "uploaded_by_id": d.uploaded_by_id,
                # if you have relationship set up: documents = relationship("Document", back_populates="uploaded_by")
                "uploaded_by_email": d.uploaded_by.email if getattr(d, "uploaded_by", None) else None,
            }
        )

    return results   


# ---------------------------------------------------------
# GET /api/admin/investments
#  - Returns ALL investments (across all users)
#  - Admin-only
# ---------------------------------------------------------
@router.get("/investments", response_model=List[dict])
def get_all_investments(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    """
    Admin view: list all investments across all users.

    This ignores `uploaded_by_id == current_user.id` and shows everything.
    """

    rows = (
        db.query(Investment)
        .order_by(Investment.id.desc())
        .all()
    )

    return [
        {
            "id": r.id,
            "deal_name": r.deal_name,
            "investment_total": r.investment_total,
            "distribution_total": r.distribution_total,
            "status": r.status,
            "uploaded_by_id": r.uploaded_by_id,
        }
        for r in rows
    ]

# ---------------------------------------------------------
# GET /api/admin/investments/summary
#  - Global summary (all users)
#  - Admin-only
# ---------------------------------------------------------
@router.get("/investments/summary")
def get_all_investments_summary(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    """
    Admin view: aggregated totals for ALL investments.
    """

    total_invested = (
        db.query(func.sum(Investment.investment_total))
        .scalar()
        or 0
    )

    total_distributed = (
        db.query(func.sum(Investment.distribution_total))
        .scalar()
        or 0
    )

    active_count = (
        db.query(func.count(Investment.id))
        .filter(Investment.status == "Active")
        .scalar()
        or 0
    )

    closed_count = (
        db.query(func.count(Investment.id))
        .filter(Investment.status == "Closed")
        .scalar()
        or 0
    )

    return {
        "total_invested": round(total_invested, 2),
        "total_distributed": round(total_distributed, 2),
        "active_count": active_count,
        "closed_count": closed_count,
    }


# ---------------------------------------------------------
# GET /api/admin/profiles
#  - Returns ALL profiles (across all users)
#  - Admin-only
# ---------------------------------------------------------
@router.get("/profiles", response_model=List[dict])
def get_all_profiles(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    """
    Admin view: list all profiles across all users.
    """

    rows = db.query(Profile).order_by(Profile.id.desc()).all()

    return [
        {
            "id": p.id,
            "entity_name": p.entity_name,
            "jurisdiction": p.jurisdiction,
            "tax_classification": p.tax_classification,
            "profile_type": p.profile_type,
            "contact_email": p.contact_email,
            "contact_phone": p.contact_phone,
            "user_id": p.user_id,
        }
        for p in rows
    ]

# ---------------------------------------------------------
# GET /api/admin/profiles/{profile_id}
#  - Fetch a specific profile (no user ownership restriction)
#  - Admin-only
# ---------------------------------------------------------
@router.get("/profiles/{profile_id}", response_model=dict)
def get_profile_by_id_admin(
    profile_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    """
    Admin view: fetch any profile by id (no user_id filter).
    """

    rec = db.query(Profile).filter(Profile.id == profile_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Profile not found")

    return {
        "id": rec.id,
        "entity_name": rec.entity_name,
        "jurisdiction": rec.jurisdiction,
        "tax_classification": rec.tax_classification,
        "profile_type": rec.profile_type,
        "contact_email": rec.contact_email,
        "contact_phone": rec.contact_phone,
        "user_id": rec.user_id,
    }


# ---------------------------------------------------------
# GET /api/admin/documents/{doc_id}/view
# GET /api/admin/documents/{doc_id}/download
#  - Streams the PDF through the backend so private blob containers can be accessed
#  - Admin-only
# ---------------------------------------------------------


@router.get("/documents/{doc_id}/view")
def admin_view_document(
    doc_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    rec = db.query(Document).filter(Document.id == doc_id).first()
    if not rec or not rec.file_path:
        raise HTTPException(status_code=404, detail="Document not found")

    # derive blob name from stored URL
    blob_name = os.path.basename(rec.file_path)

    try:
        blob_service = BlobServiceClient.from_connection_string(AZURE_BLOB_CONNECTION_STRING)
        container = blob_service.get_container_client(AZURE_CONTAINER_NAME)
        blob_client = container.get_blob_client(blob_name)
        stream = blob_client.download_blob()
        data = stream.readall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch blob: {str(e)}")

    return StreamingResponse(BytesIO(data), media_type="application/pdf", headers={
        "Content-Disposition": f'inline; filename="{rec.name}"'
    })


@router.get("/documents/{doc_id}/download")
def admin_download_document(
    doc_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    rec = db.query(Document).filter(Document.id == doc_id).first()
    if not rec or not rec.file_path:
        raise HTTPException(status_code=404, detail="Document not found")

    blob_name = os.path.basename(rec.file_path)

    try:
        blob_service = BlobServiceClient.from_connection_string(AZURE_BLOB_CONNECTION_STRING)
        container = blob_service.get_container_client(AZURE_CONTAINER_NAME)
        blob_client = container.get_blob_client(blob_name)
        stream = blob_client.download_blob()
        data = stream.readall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch blob: {str(e)}")

    return StreamingResponse(BytesIO(data), media_type="application/pdf", headers={
        "Content-Disposition": f'attachment; filename="{rec.name}"'
    })
