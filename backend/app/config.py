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

    # Cloudflare R2 / S3
    R2_ACCOUNT_ID: Optional[str] = None
    R2_ACCESS_KEY_ID: Optional[str] = None
    R2_SECRET_ACCESS_KEY: Optional[str] = None
    R2_BUCKET_NAME: Optional[str] = "latenightclub-media"
    R2_PUBLIC_URL: Optional[str] = None

    class Config:
        env_file = ".env"


settings = Settings()
