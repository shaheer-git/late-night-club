from pydantic import BaseModel
from .user import UserResponse


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse
    is_new_user: bool = False


class RefreshRequest(BaseModel):
    refresh_token: str


class FcmTokenRequest(BaseModel):
    fcm_token: str


class OtpSendRequest(BaseModel):
    phone: str


class OtpVerifyRequest(BaseModel):
    phone: str
    code: str


class OtpVerifyResponse(BaseModel):
    registered: bool
    tokens: TokenResponse | None = None


class GoogleAuthRequest(BaseModel):
    id_token: str = ""
    access_token: str = ""

