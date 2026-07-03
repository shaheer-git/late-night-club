from fastapi import APIRouter, Depends, Form, UploadFile, File
from sqlalchemy.orm import Session
from ..database import get_db
from ..dependencies import get_current_user
from ..schemas.verification import VerificationResult, VerificationResponse
from ..services.verification_service import submit_verification, get_verifications_for_place
from ..services.storage_service import upload_file
from ..models.user import User
from typing import List

router = APIRouter(prefix="/api/verifications", tags=["verifications"])


@router.post("", response_model=VerificationResult)
async def verify(
    place_id: str = Form(...),
    status: str = Form(...),
    note: str = Form(None),
    image: UploadFile = File(None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    image_url = None
    if image:
        image_url = await upload_file(image)
        
    return submit_verification(db, place_id, user, status, note, image_url)


@router.get("/place/{place_id}", response_model=List[VerificationResponse])
def get_place_verifications(place_id: str, db: Session = Depends(get_db)):
    verifications = get_verifications_for_place(db, place_id)
    return verifications
