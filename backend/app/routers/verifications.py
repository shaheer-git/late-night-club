from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..dependencies import get_current_user
from ..schemas.verification import VerificationCreate, VerificationResult, VerificationResponse
from ..services.verification_service import submit_verification, get_verifications_for_place
from ..models.user import User
from typing import List

router = APIRouter(prefix="/api/verifications", tags=["verifications"])


@router.post("", response_model=VerificationResult)
def verify(
    data: VerificationCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return submit_verification(db, str(data.place_id), user, data.status, data.note)


@router.get("/place/{place_id}", response_model=List[VerificationResponse])
def get_place_verifications(place_id: str, db: Session = Depends(get_db)):
    verifications = get_verifications_for_place(db, place_id)
    return verifications
