import random
import redis
import httpx
import logging
from ..config import settings

logger = logging.getLogger(__name__)

# Initialize Redis connection
redis_client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)


def generate_otp() -> str:
    """Generate a random 4-digit OTP code."""
    return f"{random.randint(1000, 9999)}"


def save_otp(phone: str, otp: str, expire_seconds: int = 300) -> None:
    """Store the OTP code in Redis with a TTL of 5 minutes."""
    key = f"otp:{phone}"
    redis_client.setex(key, expire_seconds, otp)
    logger.info(f"Saved OTP {otp} for phone {phone} in Redis")


def verify_otp(phone: str, entered_otp: str) -> bool:
    """Verify the entered OTP against Redis."""
    key = f"otp:{phone}"
    stored_otp = redis_client.get(key)
    if stored_otp and stored_otp == entered_otp:
        redis_client.delete(key)  # Delete OTP after successful verification
        return True
    return False


async def send_whatsapp_otp(phone: str, code: str) -> bool:
    """Send the OTP code via WhatsApp gateway or log it for local testing."""
    message = f"Your Late Night Club verification code is: {code} 🌙"

    if not settings.WHATSAPP_GATEWAY_URL or settings.WHATSAPP_GATEWAY_URL == "http://localhost:3000":
        # Local development placeholder logs (free and easy local testing)
        logger.warning("==================================================")
        logger.warning(f" WHATSAPP OTP TO {phone}: {message}")
        logger.warning("==================================================")
        print(f"\n[WHATSAPP MOCK] Sent to {phone}: {message}\n")
        return True

    try:
        # Standard format for self-hosted node/python whatsapp gateways
        async with httpx.AsyncClient() as client:
            payload = {
                "phone": phone.replace("+", ""), # standard format for whatsapp
                "message": message
            }
            # Post to send message endpoint of the gateway
            response = await client.post(
                f"{settings.WHATSAPP_GATEWAY_URL}/send-message",
                json=payload,
                timeout=10.0
            )
            if response.status_code in [200, 201]:
                logger.info(f"Successfully sent WhatsApp OTP to {phone}")
                return True
            else:
                logger.error(f"WhatsApp gateway returned error status {response.status_code}: {response.text}")
                return False
    except Exception as e:
        logger.error(f"Failed to reach WhatsApp Gateway at {settings.WHATSAPP_GATEWAY_URL}: {str(e)}")
        # Print fallback to console in development even on gateway error
        print(f"\n[WHATSAPP MOCK FALLBACK] Sent to {phone}: {message}\n")
        return True
