from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://lnc_user:lnc_pass@localhost:5432/latenightclub"
    REDIS_URL: str = "redis://localhost:6379"
    SECRET_KEY: str = "changeme-minimum-32-chars-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    ENVIRONMENT: str = "development"

    # Firebase (optional)
    FIREBASE_CREDENTIALS_PATH: Optional[str] = None

    # Cloudflare R2 / S3 (optional / legacy)
    R2_ACCOUNT_ID: Optional[str] = None
    R2_ACCESS_KEY_ID: Optional[str] = None
    R2_SECRET_ACCESS_KEY: Optional[str] = None
    R2_BUCKET_NAME: Optional[str] = "latenightclub-media"
    R2_PUBLIC_URL: Optional[str] = None

    # Cloudinary configuration
    CLOUDINARY_CLOUD_NAME: Optional[str] = None
    CLOUDINARY_API_KEY: Optional[str] = None
    CLOUDINARY_API_SECRET: Optional[str] = None

    # Google OAuth
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None

    # WhatsApp Gateway
    WHATSAPP_GATEWAY_URL: Optional[str] = None

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()

