import cloudinary
import cloudinary.uploader
import uuid
from fastapi import UploadFile, HTTPException
from ..config import settings

# Configure Cloudinary if keys are set
if settings.CLOUDINARY_CLOUD_NAME:
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True,
    )


async def upload_file(file: UploadFile) -> str:
    if not settings.CLOUDINARY_CLOUD_NAME:
        # Development fallback: return a placeholder cafe image url for ease of testing
        return "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&auto=format&fit=crop"

    try:
        content = await file.read()
        response = cloudinary.uploader.upload(
            content,
            folder="late_night_club",
            resource_type="auto",
        )
        url = response.get("secure_url")
        if not url:
            raise HTTPException(status_code=500, detail="Cloudinary upload response did not return a secure_url")
        return url
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cloudinary upload failed: {str(e)}")

