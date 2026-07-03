from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import httpx
import logging
from ..database import get_db
from ..dependencies import get_current_user
from ..schemas.auth import (
    LoginRequest, RegisterRequest, TokenResponse,
    RefreshRequest, FcmTokenRequest,
    OtpSendRequest, OtpVerifyRequest, OtpVerifyResponse, GoogleAuthRequest
)
from ..schemas.user import UserResponse
from ..services.auth_service import register_user, login_user, make_tokens
from ..services.whatsapp_service import generate_otp, save_otp, verify_otp, send_whatsapp_otp
from ..utils.security import decode_token, hash_password
from ..models.user import User
from ..config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    user = register_user(db, req.name, req.email, req.password, req.primary_city)
    return make_tokens(user)


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = login_user(db, req.email, req.password)
    return make_tokens(user)


@router.post("/otp/send")
async def send_otp(req: OtpSendRequest):
    phone = req.phone.strip()
    if not phone:
        raise HTTPException(status_code=400, detail="Phone number is required")
    
    # Generate and save OTP
    code = generate_otp()
    save_otp(phone, code)
    
    # Send via WhatsApp gateway
    success = await send_whatsapp_otp(phone, code)
    if not success:
        logger.warning(f"Failed to send WhatsApp OTP to {phone}")
    
    return {"message": "OTP sent successfully"}


@router.post("/otp/verify", response_model=OtpVerifyResponse)
def verify_otp_endpoint(req: OtpVerifyRequest, db: Session = Depends(get_db)):
    phone = req.phone.strip()
    code = req.code.strip()
    
    # Verify the code
    if not verify_otp(phone, code):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    # Look up user. Since phone can be formatted differently in mock apps,
    # we normalize it to digits only to search compatibly.
    phone_digits = "".join(c for c in phone if c.isdigit())
    
    # Try multiple common formats
    user = db.query(User).filter(
        (User.email == f"{phone_digits}@lnc.app") | 
        (User.email == f"+{phone_digits}@lnc.app") |
        (User.email == f"{phone}@lnc.app")
    ).first()
    
    if user:
        return OtpVerifyResponse(registered=True, tokens=make_tokens(user))
    else:
        return OtpVerifyResponse(registered=False, tokens=None)


@router.post("/google", response_model=TokenResponse)
async def google_login(req: GoogleAuthRequest, db: Session = Depends(get_db)):
    if not req.id_token and not req.access_token:
        raise HTTPException(status_code=400, detail="id_token or access_token is required")
        
    try:
        async with httpx.AsyncClient() as client:
            if req.id_token:
                # Native app flow — verify via tokeninfo
                response = await client.get(
                    f"https://oauth2.googleapis.com/tokeninfo?id_token={req.id_token}",
                    timeout=5.0
                )
                if response.status_code != 200:
                    raise HTTPException(status_code=401, detail="Invalid Google ID token")
                payload = response.json()
                email = payload.get("email")
                name = payload.get("name", "Google User")
                avatar_url = payload.get("picture")
            else:
                # Web OAuth flow — use access_token to fetch user info
                response = await client.get(
                    "https://www.googleapis.com/oauth2/v2/userinfo",
                    headers={"Authorization": f"Bearer {req.access_token}"},
                    timeout=5.0
                )
                if response.status_code != 200:
                    raise HTTPException(status_code=401, detail="Invalid Google access token")
                payload = response.json()
                email = payload.get("email")
                name = payload.get("name", "Google User")
                avatar_url = payload.get("picture")

        if not email:
            raise HTTPException(status_code=400, detail="Google token does not contain an email address")
            
        # Check if user exists
        user = db.query(User).filter(User.email == email).first()
        is_new_user = False
        if not user:
            # Register user automatically from Google profile
            import secrets
            random_password = secrets.token_urlsafe(16)
            user = User(
                name=name,
                email=email,
                hashed_password=hash_password(random_password),
                avatar_url=avatar_url,
                is_verified=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            is_new_user = True
            logger.info(f"Registered new user {name} ({email}) via Google OAuth")
        else:
            # Update profile fields if they changed
            updated = False
            if avatar_url and user.avatar_url != avatar_url:
                user.avatar_url = avatar_url
                updated = True
            if name and user.name != name:
                user.name = name
                updated = True
            if updated:
                db.commit()
                db.refresh(user)
                
        return make_tokens(user, is_new_user=is_new_user)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Google login failed: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Google authentication failed: {str(e)}")



@router.post("/refresh")
def refresh(req: RefreshRequest, db: Session = Depends(get_db)):
    try:
        payload = decode_token(req.refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid refresh token")
        user_id = payload.get("sub")
        user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        from ..utils.security import create_access_token
        return {"access_token": create_access_token({"sub": str(user.id)})}
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid refresh token")


@router.post("/logout")
def logout(user: User = Depends(get_current_user)):
    return {"message": "Logged out"}


@router.post("/fcm-token")
def save_fcm_token(
    req: FcmTokenRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user.fcm_token = req.fcm_token
    db.commit()
    return {"message": "FCM token saved"}

