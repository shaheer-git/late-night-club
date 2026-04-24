import boto3
import uuid
from fastapi import UploadFile, HTTPException
from ..config import settings


def get_s3_client():
    if not settings.R2_ACCESS_KEY_ID:
        return None
    return boto3.client(
        "s3",
        endpoint_url=f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
        aws_access_key_id=settings.R2_ACCESS_KEY_ID,
        aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
        region_name="auto",
    )


async def upload_file(file: UploadFile) -> str:
    client = get_s3_client()
    if not client:
        raise HTTPException(status_code=503, detail="Storage not configured")

    ext = file.filename.split(".")[-1] if file.filename else "jpg"
    key = f"uploads/{uuid.uuid4()}.{ext}"
    content = await file.read()

    client.put_object(
        Bucket=settings.R2_BUCKET_NAME,
        Key=key,
        Body=content,
        ContentType=file.content_type or "image/jpeg",
    )

    return f"{settings.R2_PUBLIC_URL}/{key}"
