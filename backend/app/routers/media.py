from fastapi import APIRouter, Depends, UploadFile, File
from ..dependencies import get_current_user
from ..services.storage_service import upload_file
from ..models.user import User

router = APIRouter(prefix="/api/media", tags=["media"])


@router.post("/upload")
async def upload_media(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
):
    url = await upload_file(file)
    return {"url": url}
